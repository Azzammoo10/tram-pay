'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { TramFront } from 'lucide-react'
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
          event: 'INSERT',
          schema: 'public',
          table: 'tickets',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newTicket = payload.new as Ticket
          setTicket(newTicket)
          setState(computeState(newTicket))
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
                  className="flex flex-col items-center gap-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-cta/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 bg-cta/10 rounded-full flex items-center justify-center text-cta">
                      <TramFront size={40} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[20px] font-bold text-brand-dark">Prêt pour validation</p>
                    <p className="text-[14px] text-neutral-muted mt-2 max-w-[240px]">
                      Approchez votre smartphone ou votre carte de la borne de validation
                    </p>
                  </div>
                  {error && (
                    <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-[6px]">
                      <p className="text-[12px] text-status-error">{error}</p>
                    </div>
                  )}
                  <Button onClick={simulateTap} loading={simulating} className="min-w-[200px]">
                    Simuler un passage
                  </Button>
                </motion.div>
              )}

              {state === 'active' && ticket && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-6 w-full"
                >
                  <Badge variant="success">Titre en cours de validité</Badge>
                  <div className="p-4 bg-white border border-neutral-border rounded-[12px] shadow-premium">
                    <QRCodeSVG
                      value={ticket.qr_payload}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] text-neutral-muted font-medium">Temps restant</p>
                    <p className="text-[42px] font-bold text-brand-dark mt-1 tabular-nums tracking-tight">
                      {countdown}
                    </p>
                    <div className="w-full bg-neutral-border h-1.5 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        className="bg-cta h-full"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 3600, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {state === 'expired' && ticket && (
                <motion.div
                  key="expired"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 w-full"
                >
                  <Badge variant="error">Titre expiré</Badge>
                  <div
                    className="p-4 bg-white border border-neutral-border rounded-[12px] opacity-40 grayscale"
                  >
                    <QRCodeSVG
                      value={ticket.qr_payload}
                      size={180}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[14px] text-neutral-muted max-w-[200px]">
                    Votre titre a expiré ou a déjà été utilisé.
                  </p>
                  <Button onClick={simulateTap} loading={simulating} className="min-w-[200px]">
                    Payer un nouveau trajet
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="card-base">
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
