'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { TramFront, Shield, Copy, Check, Clock, ShieldCheck, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Ticket } from '@/types'

type DashboardState = 'waiting' | 'active' | 'expired'

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function DashboardPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [state, setState] = useState<DashboardState>('waiting')
  const [countdown, setCountdown] = useState<string>('00:00')
  const [simulating, setSimulating] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [cardToken, setCardToken] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('Voyageur')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const computeState = useCallback((t: Ticket | null): DashboardState => {
    if (!t) return 'waiting'
    if (t.status === 'USED' || t.status === 'EXPIRED') return 'expired'
    if (new Date(t.expires_at) < new Date()) return 'expired'
    return 'active'
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      // Fetch user's card token
      supabase
        .from('cards')
        .select('card_token')
        .eq('user_id', user.id)
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data?.card_token) {
            setCardToken(data.card_token)
          }
        })

      // Fetch user's profile full name
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name) {
            setUserName(data.full_name)
          }
        })

      // Fetch latest active ticket
      supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'PENDING')
        .gt('expires_at', new Date().toISOString())
        .order('generated_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) {
            setTicket(data as Ticket)
            setState(computeState(data as Ticket))
          }
        })
    })
  }, [computeState])

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`tickets-${userId}`) // Unique channel per user
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tickets',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setTicket(null)
            setState('waiting')
          } else {
            const newTicket = payload.new as Ticket
            setTicket(newTicket)
            setState(computeState(newTicket))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, computeState])

  // Countdown timer
  useEffect(() => {
    if (!ticket || state !== 'active') return

    const initialRemaining = new Date(ticket.expires_at).getTime() - Date.now()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(formatCountdown(initialRemaining))

    const interval = setInterval(() => {
      const remaining = new Date(ticket.expires_at).getTime() - Date.now()
      if (remaining <= 0) {
        setCountdown('00:00')
        setState('expired')
        clearInterval(interval)
      } else {
        setCountdown(formatCountdown(remaining))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [ticket, state])

  // QR Rotation Interval (every 15s)
  useEffect(() => {
    if (!ticket || state !== 'active') return

    const rotateInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/refresh-qr?ticket_id=${ticket.id}`)
        const data = await res.json()
        if (data.success && data.qr_payload) {
          setTicket(prev => prev ? { ...prev, qr_payload: data.qr_payload } : null)
        }
      } catch (err) {
        console.error('Failed to auto-rotate QR code:', err)
      }
    }, 15000)

    return () => clearInterval(rotateInterval)
  }, [ticket?.id, state])

  async function simulateTap() {
    setSimulating(true)
    setError(null)
    try {
      const res = await fetch('/api/simulate-tap')
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Erreur lors du paiement simulé.')
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-brand-dark">Mon Tableau de Bord</h1>
          <p className="text-[14px] text-neutral-muted mt-1">Gérez vos titres de transport et vos validations</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <div className="card-accent py-10 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              {state === 'waiting' && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-6 py-6 w-full"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#EA3D8F]/10 rounded-full blur-xl animate-pulse animate-duration-1000" />
                    <div className="relative w-16 h-16 bg-[#EA3D8F]/5 border border-[#EA3D8F]/20 rounded-full flex items-center justify-center text-cta">
                      <TramFront size={32} />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-[18px] font-bold text-brand-dark">Aucun titre actif</h3>
                    <p className="text-[13px] text-neutral-muted max-w-[285px] mx-auto leading-relaxed">
                      Présentez votre carte de transport MIFARE sur l'un des valideurs NFC en station pour générer instantanément votre titre de transport virtuel.
                    </p>
                  </div>

                  {/* Pulsating Listening Indicator */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/5 border border-[#10B981]/15 rounded-full shadow-[0_1px_2px_rgba(16,185,129,0.05)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                    </span>
                    <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
                      Écoute du réseau de validation...
                    </span>
                  </div>

                  {/* Professional Copyable Card Token Widget */}
                  {cardToken && (
                    <div className="flex flex-col gap-2 w-full max-w-[280px] border-t border-neutral-border/50 pt-5 mt-2">
                      <span className="text-[10px] text-neutral-muted uppercase font-bold tracking-wider leading-none text-center">Identifiant de votre carte MIFARE</span>
                      <div className="flex items-center bg-[#F8F8F8] border border-neutral-border rounded-[3px] p-2 pr-1.5 w-full transition-all">
                        <span className="text-[11px] font-mono font-bold text-cta break-all select-all flex-1 text-center truncate pr-2">
                          {cardToken}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cardToken)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-neutral-border/20 text-[10px] font-bold text-cta border border-neutral-border rounded-[2px] cursor-pointer active:scale-95 transition-all flex items-center gap-1 flex-shrink-0"
                          title="Copier le token"
                        >
                          {copied ? (
                            <>
                              <Check size={10} /> Copié
                            </>
                          ) : (
                            <>
                              <Copy size={10} /> Copier
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Visual strong CTA to trigger/open Simulator */}
                  <a
                    href="/scan.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cta text-[13px] font-bold w-full max-w-[280px] h-[40px] flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                  >
                    Ouvrir la Borne de Validation →
                  </a>

                  {error && (
                    <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-[3px] w-full max-w-[280px] text-center">
                      <p className="text-[12px] text-status-error">{error}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {state === 'active' && ticket && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center gap-6 w-full py-2"
                >
                  <Badge variant="success" className="animate-pulse">Voyage en cours</Badge>
                  
                  {/* Premium visual framing around the QR with targets and scan lines */}
                  <div className="relative p-6 bg-white border border-neutral-border rounded-[3px] shadow-premium group">
                    {/* Scanner design corner bracket decors */}
                    <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cta" />
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cta" />
                    <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cta" />
                    <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cta" />
                    
                    {/* Glowing animated scanner line */}
                    <div className="absolute left-6 right-6 top-1/2 h-[2px] bg-cta/40 shadow-[0_0_8px_#EA3D8F] animate-pulse pointer-events-none z-10" />

                    <QRCodeSVG
                      value={typeof window !== 'undefined' ? `${window.location.origin}/verify-ticket?payload=${encodeURIComponent(ticket.qr_payload)}` : ticket.qr_payload}
                      size={180}
                      level="H"
                      includeMargin={false}
                      className="transition-all duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Pulsating Rotation Indicator */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EA3D8F]/5 border border-[#EA3D8F]/15 rounded-full text-cta text-[11px] font-bold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cta opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cta"></span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={11} /> Signature actualisée (Sécurité 15s)
                    </span>
                  </div>

                  <div className="text-center w-full max-w-[280px]">
                    <div className="flex items-center justify-center gap-1.5 text-neutral-muted text-[13px] font-medium mb-1">
                      <Clock size={14} /> Temps restant avant expiration
                    </div>
                    <p className="text-[38px] font-bold text-brand-dark tabular-nums tracking-tight leading-none mb-4">
                      {countdown}
                    </p>
                    <div className="w-full bg-neutral-border h-1.5 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        className="bg-cta h-full"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 3600, ease: 'linear' }}
                      />
                    </div>
                  </div>

                  {/* Transaction Context Meta Table */}
                  <div className="w-full max-w-[280px] border-t border-neutral-border/60 pt-4 mt-1 space-y-2 text-left text-[12.5px] leading-none">
                    <div className="flex justify-between py-1"><span className="text-neutral-muted">Opérateur</span><span className="font-bold text-brand-dark">Tramway Rabat-Salé</span></div>
                    <div className="flex justify-between py-1"><span className="text-neutral-muted">Tarif appliqué</span><span className="font-bold text-brand-dark">7.00 DH</span></div>
                    <div className="flex justify-between py-1"><span className="text-neutral-muted">ID Ticket</span><span className="font-mono font-bold text-[#55356D] truncate max-w-[130px]" title={ticket.transaction_id}>{ticket.transaction_id.slice(-8).toUpperCase()}</span></div>
                  </div>
                </motion.div>
              )}

              {state === 'expired' && ticket && (
                <motion.div
                  key="expired"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 w-full py-4"
                >
                  <Badge variant="error">Titre expiré</Badge>
                  
                  {/* Grayscale Subdued QR Code */}
                  <div className="relative p-6 bg-white border border-neutral-border rounded-[3px] opacity-35 grayscale shadow-sm select-none">
                    <QRCodeSVG
                      value={typeof window !== 'undefined' ? `${window.location.origin}/verify-ticket?payload=${encodeURIComponent(ticket.qr_payload)}` : ticket.qr_payload}
                      size={150}
                      level="M"
                      includeMargin={false}
                    />
                    {/* Subtle alert overlay icon */}
                    <div className="absolute inset-0 flex items-center justify-center text-status-error opacity-60">
                      <AlertTriangle size={36} />
                    </div>
                  </div>

                  <p className="text-[13px] text-neutral-muted max-w-[260px] text-center leading-relaxed">
                    Votre titre de transport virtuel est expiré ou a déjà été validé par un contrôleur. Veuillez recharger votre carte ou passer sur une borne pour démarrer un nouveau trajet.
                  </p>

                  {/* Visual strong CTA to open Simulator for top-up/validation */}
                  <a
                    href="/scan.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cta text-[13px] font-bold w-full max-w-[240px] h-[40px] flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                  >
                    Valider un nouveau trajet
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="card-base border-t-[4px] border-t-brand-purple">
            <h3 className="text-[16px] font-bold text-brand-dark mb-4">Informations</h3>
            <p className="text-[13px] text-neutral-muted leading-relaxed">
              Votre titre est valable pour une durée de 60 minutes après la première validation sur tout le réseau de Tramway Rabat-Salé.
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-border">
              <Link 
                href="https://www.tram-way.ma/fr/horaires/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-cta font-medium hover:underline"
              >
                Voir les tarifs et zones →
              </Link>
            </div>
          </div>

          {/* Visual Digital MIFARE Card Render */}
          <div className="bg-gradient-to-br from-[#1A0E03] to-[#55356D] border border-[#AC6899]/20 rounded-[3px] text-white p-6 relative overflow-hidden shadow-premium aspect-[1.58/1] flex flex-col justify-between select-none">
            {/* Ambient gradients */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#EA3D8F]/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#55356D]/20 rounded-full -ml-8 -mb-8 blur-xl pointer-events-none" />

            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#AC6899] block leading-none">Rabat-Salé Tramway</span>
                <span className="text-[13px] font-bold text-white mt-1 block">Carte MIFARE Classic</span>
              </div>
              {/* Gold Chip representation */}
              <div className="w-8 h-6 bg-gradient-to-r from-amber-300 to-amber-100 rounded-[2px] opacity-90 border border-amber-400/20" />
            </div>

            <div className="my-3 z-10">
              <span className="text-[14px] font-mono tracking-[2.5px] font-bold text-[#AC6899] block">
                {cardToken ? `RS-TR-${cardToken.slice(-4).toUpperCase()}` : 'RS-TR-••••'}
              </span>
            </div>

            <div className="flex justify-between items-end z-10 mt-auto">
              <div>
                <span className="text-[8px] text-white/40 uppercase tracking-wider block">Titulaire</span>
                <span className="text-[11.5px] font-bold uppercase tracking-wide text-white mt-0.5 block truncate max-w-[140px]">
                  {userName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8.5px] font-bold px-2 py-0.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 rounded-full inline-flex items-center gap-1 uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
                  Actif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {userId && (
        <div className="mt-12 pt-8 border-t border-neutral-border text-center">
          <p className="text-[11px] text-neutral-soft uppercase tracking-widest font-bold">
            Identifiant Sécurisé : {userId}
          </p>
        </div>
      )}
    </div>
  )
}
