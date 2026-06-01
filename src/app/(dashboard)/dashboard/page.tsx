'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { TramFront, Shield, Copy, Check, Clock, ShieldCheck, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import TransitCard from '@/components/ui/TransitCard'
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
  const [switchingLine, setSwitchingLine] = useState(false)

  const handleSwitchLine = async () => {
    if (!ticket || ticket.line_switched || switchingLine) return
    setSwitchingLine(true)
    setError(null)
    try {
      const res = await fetch('/api/switch-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setTicket(prev => prev ? { 
          ...prev, 
          current_line: data.current_line, 
          line_switched: data.line_switched 
        } : null)
      } else {
        setError(data.error || 'Erreur lors du changement de ligne')
      }
    } catch (err) {
      console.error('Failed to switch line:', err)
      setError('Panne de communication : impossible de changer de ligne')
    } finally {
      setSwitchingLine(false)
    }
  }

  const shouldReduceMotion = useReducedMotion()
  const [isUnderFiveMinutes, setIsUnderFiveMinutes] = useState(false)
  const [qrRotating, setQrRotating] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 350, damping: 25 }
    }
  }

  const computeState = useCallback((t: Ticket | null): DashboardState => {
    if (!t) return 'waiting'
    if (t.status === 'EXPIRED') return 'expired'
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
        .in('status', ['PENDING', 'USED'])
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
    setIsUnderFiveMinutes(initialRemaining > 0 && initialRemaining < 5 * 60 * 1000)
    setCountdown(formatCountdown(initialRemaining))

    const interval = setInterval(() => {
      const remaining = new Date(ticket.expires_at).getTime() - Date.now()
      setIsUnderFiveMinutes(remaining > 0 && remaining < 5 * 60 * 1000)
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
          setQrRotating(true)
          setTimeout(() => setQrRotating(false), 200)
          setTicket(prev => prev ? { ...prev, qr_payload: data.qr_payload } : null)
        }
      } catch (err) {
        console.error('Failed to auto-rotate QR code:', err)
      }
    }, 15000)

    return () => clearInterval(rotateInterval)
  }, [ticket?.id, state])

  // Generate verification URL safely on the client to avoid hydration mismatch
  const [qrValue, setQrValue] = useState<string>('')
  useEffect(() => {
    if (ticket?.qr_payload) {
      setQrValue(`${window.location.origin}/verify-ticket?payload=${encodeURIComponent(ticket.qr_payload)}`)
    } else {
      setQrValue('')
    }
  }, [ticket?.qr_payload])

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <header className="flex flex-col mb-[32px] text-left">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-brand-dark leading-[1.2] tracking-[0px]">
          Mon Tableau de Bord
        </h1>
        <p className="text-[14px] text-neutral-muted mt-1 leading-[1.4]">
          Gérez vos titres de transport et vos validations
        </p>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-5 gap-8"
      >
        <motion.div variants={cardVariants} className="md:col-span-3 space-y-6">
          <div className="card-accent py-10 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              {state === 'waiting' && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                  className="flex flex-col items-center gap-6 py-6 w-full"
                >
                  <motion.div
                    animate={shouldReduceMotion ? {} : {
                      scale: [1, 1.08, 1],
                      opacity: [0.6, 1.0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-[#EA3D8F]/15 rounded-full blur-xl" />
                    <div className="relative w-16 h-16 bg-[#EA3D8F]/5 border border-[#EA3D8F]/20 rounded-full flex items-center justify-center text-cta">
                      <TramFront size={32} />
                    </div>
                  </motion.div>

                  <div className="text-center space-y-[8px]">
                    <h3 className="text-[18px] font-normal leading-[1.0] text-brand-dark">Aucun titre actif</h3>
                    <p className="text-[14px] text-neutral-muted leading-[1.4] max-w-[285px] mx-auto">
                      Présentez votre carte de transport MIFARE sur l&apos;un des valideurs NFC en station pour générer instantanément votre titre de transport virtuel.
                    </p>
                  </div>

                  {/* Pulsating Listening Indicator */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/5 border border-[#10B981]/15 rounded-full shadow-[0_1px_2px_rgba(16,185,129,0.05)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                    </span>
                    <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-[0.04em] leading-[1.0]">
                      Écoute du réseau de validation...
                    </span>
                  </div>

                  {/* Professional Copyable Card Token Widget */}
                  {cardToken && (
                    <div className="flex flex-col gap-[8px] w-full max-w-[280px] border-t border-neutral-border/50 pt-[24px] mt-2">
                      <span className="text-[11px] text-neutral-muted uppercase font-bold tracking-[0.04em] leading-[1.0] text-center">
                        Identifiant de votre carte MIFARE
                      </span>
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
                    className="btn-cta text-[15px] font-normal w-full max-w-[280px] h-[40px] flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                  >
                    Ouvrir la Borne de Validation →
                  </a>

                  {error && (
                    <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-[3px] w-full max-w-[280px] text-center mt-[8px]">
                      <p className="text-[12px] font-normal leading-[1.4] text-status-error">{error}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {state === 'active' && ticket && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="flex flex-col items-center gap-6 w-full py-2"
                >
                  <motion.div
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 15, delay: 0.4 }}
                  >
                    <Badge variant="success">Voyage en cours</Badge>
                  </motion.div>
                  
                  {/* Premium visual framing around the QR with targets and scan lines */}
                  <motion.div 
                    initial={{ clipPath: shouldReduceMotion ? 'inset(0%)' : 'inset(50% 50% 50% 50% rounded 3px)' }}
                    animate={{ clipPath: 'inset(0% 0% 0% 0% rounded 3px)', opacity: qrRotating ? 0.3 : 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                    className="relative p-6 bg-white border border-neutral-border rounded-[3px] shadow-premium group overflow-hidden"
                  >
                    {/* Scanner design corner bracket decors */}
                    <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cta" />
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cta" />
                    <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cta" />
                    <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cta" />
                    

                    <QRCodeSVG
                      value={qrValue || (ticket ? ticket.qr_payload : '')}
                      size={180}
                      level="H"
                      includeMargin={false}
                      className="transition-all duration-300 group-hover:scale-[1.02]"
                    />
                  </motion.div>

                  {/* Pulsating Rotation Indicator */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EA3D8F]/5 border border-[#EA3D8F]/15 rounded-full text-cta text-[11px] font-bold tracking-[0.04em] uppercase">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cta opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cta"></span>
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      <Shield size={11} /> Signature actualisée (Sécurité 15s)
                    </span>
                  </div>

                  <div className="text-center w-full max-w-[280px]">
                    <div className="flex items-center justify-center gap-1.5 text-neutral-muted text-[12px] font-normal leading-[1.4] mb-1">
                      <Clock size={14} /> Temps restant avant expiration
                    </div>
                    <motion.p 
                      animate={isUnderFiveMinutes ? { color: '#CF2E2E', scale: [1, 1.03, 1] } : {}}
                      transition={isUnderFiveMinutes ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                      className={`text-[38px] font-bold tracking-tight leading-none mb-[16px] font-mono ${isUnderFiveMinutes ? 'text-status-error' : 'text-brand-dark'}`}
                    >
                      {countdown}
                    </motion.p>
                    <div className="w-full bg-neutral-border h-1.5 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        className="bg-cta h-full"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 3600, ease: 'linear' }}
                      />
                    </div>
                  </div>

                  {/* Line Switch Button with 1-change limit */}
                  <div className="w-full max-w-[280px] mt-1">
                    <button
                      onClick={handleSwitchLine}
                      disabled={ticket.line_switched || switchingLine}
                      className={`w-full h-[36px] text-[12px] font-bold uppercase tracking-[0.04em] rounded-[3px] flex items-center justify-center gap-2 border transition-all ${
                        ticket.line_switched
                          ? 'bg-[#F5F4F4] text-neutral-muted border-neutral-border cursor-not-allowed'
                          : 'bg-white text-cta hover:bg-[#EA3D8F]/5 border-cta hover:border-[#EA3D8F] active:scale-95 cursor-pointer'
                      }`}
                    >
                      {switchingLine ? (
                        'Traitement...'
                      ) : ticket.line_switched ? (
                        <span>⚠️ Correspondance utilisée</span>
                      ) : (
                        `Changer de ligne vers ${ticket.current_line === 'L2' ? 'L1' : 'L2'}`
                      )}
                    </button>
                    {error && (
                      <p className="text-[11px] text-[#CF2E2E] mt-1 text-center font-normal">{error}</p>
                    )}
                  </div>

                  {/* Transaction Context Meta Table */}
                  <div className="w-full max-w-[280px] border-t border-neutral-border/60 pt-[16px] mt-2 space-y-2 text-left text-[12px] leading-[1.4]">
                    <div className="flex justify-between py-1"><span className="text-neutral-muted">Opérateur</span><span className="font-bold text-brand-dark">Tramway Rabat-Salé</span></div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-muted">Ligne active</span>
                      <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-white ${ticket.current_line === 'L2' ? 'bg-[#55356D]' : 'bg-[#EA3D8F]'}`}>
                        {ticket.current_line || 'L1'}
                      </span>
                    </div>
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
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  >
                    <Badge variant="error">Titre expiré</Badge>
                  </motion.div>
                  
                  {/* Grayscale Subdued QR Code */}
                  <motion.div 
                    initial={{ filter: 'grayscale(0%)', opacity: 0.6 }}
                    animate={{ filter: 'grayscale(100%)', opacity: 0.35 }}
                    transition={{ duration: 0.5 }}
                    className="relative p-6 bg-white border border-neutral-border rounded-[3px] shadow-sm select-none"
                  >
                    <QRCodeSVG
                      value={qrValue || (ticket ? ticket.qr_payload : '')}
                      size={150}
                      level="M"
                      includeMargin={false}
                    />
                    {/* Subtle alert overlay icon */}
                    <div className="absolute inset-0 flex items-center justify-center text-status-error opacity-60">
                      <AlertTriangle size={36} />
                    </div>
                  </motion.div>

                  <p className="text-[14px] font-normal leading-[1.4] text-neutral-muted max-w-[260px] text-center">
                    Votre titre de transport virtuel est expiré ou a déjà été validé par un contrôleur. Veuillez recharger votre carte ou passer sur une borne pour démarrer un nouveau trajet.
                  </p>

                  {/* Visual strong CTA to open Simulator for top-up/validation */}
                  <a
                    href="/scan.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cta text-[15px] font-normal w-full max-w-[240px] h-[40px] flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                  >
                    Valider un nouveau trajet
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="md:col-span-2 space-y-6">
          <div className="card-base border-t-[4px] border-t-brand-purple text-left">
            <h3 className="text-[18px] font-normal leading-[1.0] text-brand-dark mb-[20px]">Informations</h3>
            <p className="text-[14px] font-normal leading-[1.4] text-neutral-muted">
              Votre titre est valable pour une durée de 60 minutes après la première validation sur tout le réseau de Tramway Rabat-Salé.
            </p>
            <div className="mt-[24px] pt-[16px] border-t border-neutral-border">
              <Link 
                href="https://www.tram-way.ma/fr/horaires/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-cta font-medium hover:underline tracking-[0px]"
              >
                Voir les tarifs et zones →
              </Link>
            </div>
          </div>

          {/* Visual Digital MIFARE Card Render */}
          <TransitCard
            cardToken={cardToken}
            userName={userName}
            status="ACTIVE"
          />
        </motion.div>
      </motion.div>

      {userId && (
        <div className="mt-[60px] pt-[40px] border-t border-neutral-border text-center">
          <p className="text-[11px] text-neutral-soft uppercase tracking-[0.04em] font-bold">
            Identifiant Sécurisé : {userId}
          </p>
        </div>
      )}
    </div>
  )
}
