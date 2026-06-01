'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Clock, Info, User, CheckCircle2, XCircle, Mail, AlertTriangle } from 'lucide-react'
import Logo from '@/components/ui/Logo'

interface TravelerInfo {
  name: string
  email: string
  avatar: string | null
  emailVerified: boolean
}

interface TicketInfo {
  id: string
  expires_at: string
  current_line?: string
  line_switched?: boolean
}

type VerificationStatus = 'loading' | 'valid' | 'invalid'

function getTramName(ticketId: number | string | undefined): string {
  if (!ticketId) return 'Val-PN532-1'
  const idStr = String(ticketId)
  let hash = 0
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = (Math.abs(hash) % 30) + 1
  return `Val-PN532-${index}`
}

function TicketVerifier() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const payload = searchParams.get('payload')
  const shouldReduceMotion = useReducedMotion()

  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [reason, setReason] = useState<string | null>(null)
  const [traveler, setTraveler] = useState<TravelerInfo | null>(null)
  const [ticket, setTicket] = useState<TicketInfo | null>(null)

  const [formattedTime, setFormattedTime] = useState<string>('')
  useEffect(() => {
    if (ticket?.expires_at) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormattedTime(
          new Date(ticket.expires_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        )
      } catch {
        setFormattedTime('--:--:--')
      }
    } else {
      setFormattedTime('')
    }
  }, [ticket?.expires_at])

  const [countdown, setCountdown] = useState<string>('00:00')
  useEffect(() => {
    if (!ticket) return

    const formatCountdown = (ms: number): string => {
      if (ms <= 0) return '00:00'
      const totalSeconds = Math.floor(ms / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    const initialRemaining = new Date(ticket.expires_at).getTime() - Date.now()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(formatCountdown(initialRemaining))

    const interval = setInterval(() => {
      const remaining = new Date(ticket.expires_at).getTime() - Date.now()
      if (remaining <= 0) {
        setCountdown('00:00')
        clearInterval(interval)
      } else {
        setCountdown(formatCountdown(remaining))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [ticket])

  useEffect(() => {
    if (!payload) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('invalid')
      setReason('missing_payload')
      return
    }

    async function checkTicket() {
      try {
        const res = await fetch('/api/verify-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qr_payload: payload }),
        })

        const data = await res.json()
        if (data.user) {
          setTraveler(data.user)
        }
        if (data.ticket) {
          setTicket(data.ticket)
        }

        if (res.ok && data.valid) {
          setStatus('valid')
        } else {
          setStatus('invalid')
          setReason(data.reason ?? 'unknown_error')
        }
      } catch {
        setStatus('invalid')
        setReason('network_error')
      }
    }

    checkTicket()
  }, [payload])

  const getReasonMessage = (r: string | null): string => {
    switch (r) {
      case 'already_used':
        return 'Titre de transport déjà validé ! Double-validation refusée.'
      case 'expired':
        return 'Titre de transport expiré (limite de 60 minutes dépassée).'
      case 'stale_qr':
        return 'Fraude détectée : Capture d\'écran obsolète ou signature expirée.'
      case 'not_found':
        return 'Code de transport introuvable dans le système central.'
      case 'invalid_signature':
        return 'Sécurité corrompue : Signature cryptographique invalide.'
      case 'missing_payload':
        return 'Aucune donnée de transport à vérifier.'
      case 'network_error':
        return 'Panne de communication : Impossible de joindre le serveur central.'
      default:
        return 'Titre de transport invalide ou non conforme.'
    }
  }

  return (
    <div className="min-h-screen bg-surface-section flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cta/5 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[450px] z-10 space-y-6"
      >
        {/* Main Card Bezel Container */}
        <div className="bg-white border border-neutral-border rounded-[3px] shadow-premium overflow-hidden transition-all">
          
          {/* Header Banner */}
          <div className="bg-brand-dark p-6 border-b border-white/5 flex items-center justify-between">
            <Logo light={true} width={100} height={30} showText={true} />
            <div className="text-[11px] tracking-[0.04em] uppercase font-bold text-[#AC6899]">Contrôle</div>
          </div>

          <AnimatePresence mode="wait">
            {/* 1. LOADING SCREEN STATE */}
            {status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#EA3D8F]/15 rounded-full blur-lg animate-pulse" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="relative w-14 h-14 border-t-2 border-r-2 border-cta rounded-full"
                  />
                </div>
                <div className="space-y-[4px]">
                  <p className="text-[15px] font-normal leading-[1.0] text-brand-dark">Lecture cryptographique...</p>
                  <p className="text-[12px] font-normal leading-[1.4] text-neutral-muted">Vérification de la signature et liaison base de données</p>
                </div>
              </motion.div>
            )}

            {/* 2. VALID / SUCCESS SCREEN STATE */}
            {status === 'valid' && (
              <motion.div
                key="valid"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col"
              >
                {/* Visual Status Indicator Block */}
                <div className="bg-[#10B981]/10 border-b border-[#10B981]/20 p-6 flex flex-col items-center text-center gap-2">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 15, delay: 0.1 }}
                    className="w-12 h-12 bg-[#10B981]/10 border border-[#10B981]/25 rounded-full flex items-center justify-center text-[#10B981]"
                  >
                    <CheckCircle2 size={28} />
                  </motion.div>
                  <h2 className="text-[18px] sm:text-[20px] font-bold text-[#10B981] uppercase tracking-[0.04em] leading-[1.0] mt-1">Voyage en Règle</h2>
                  <p className="text-[12px] font-normal leading-[1.4] text-[#0f2e1a] opacity-80 mt-1">Titre de transport validé avec succès</p>
                </div>

                {/* Traveler Card */}
                <div className="p-6 space-y-6">
                  {traveler && (
                    <div className="p-4 bg-surface-section border border-neutral-border rounded-[3px] flex items-center gap-4">
                      {/* Avatar picture expands from center */}
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.15 }}
                        className="w-14 h-14 rounded-full border border-neutral-border bg-white overflow-hidden flex-shrink-0 flex items-center justify-center shadow-card relative"
                      >
                        {traveler.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={traveler.avatar} alt="Profile photo" className="w-full h-full object-cover" />
                        ) : (
                          <User size={22} className="text-neutral-soft" />
                        )}
                      </motion.div>

                      <div className="flex-1 min-w-0 text-left">
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.25 }}
                          className="text-[11px] uppercase tracking-[0.04em] font-bold text-[#AC6899] block"
                        >
                          Titulaire de la carte
                        </motion.span>
                        <motion.h3 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.31 }}
                          className="text-[15px] font-normal tracking-[0px] leading-[1.0] text-brand-dark truncate mt-[4px]"
                        >
                          {traveler.name}
                        </motion.h3>
                        <motion.p 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.37 }}
                          className="text-[12px] font-normal leading-[1.4] tracking-[0px] text-neutral-muted truncate flex items-center gap-1 mt-[4px]"
                        >
                          <Mail size={11} /> {traveler.email}
                        </motion.p>
                      </div>
                    </div>
                  )}

                  {/* Verification & Traveler badges */}
                  {traveler && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.43 }}
                      className="flex flex-col gap-2.5"
                    >
                      {traveler.emailVerified ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-[#10B981]/5 border border-[#10B981]/15 text-[#10B981] rounded-[3px] text-[11px] font-bold tracking-[0.04em] uppercase">
                          <ShieldCheck size={14} />
                          COMPTE ADHÉRENT TRAM-PAY VÉRIFIÉ (✓)
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-[#F5AB32]/5 border border-[#F5AB32]/15 text-[#F5AB32] rounded-[3px] text-[11px] font-bold tracking-[0.04em] uppercase animate-pulse">
                          <ShieldAlert size={14} />
                          COMPTE NON VÉRIFIÉ — INSCRIPTION PROVISOIRE
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Ticket details */}
                  {ticket && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.49 }}
                      className="border-t border-neutral-border/50 pt-5 space-y-3"
                    >
                      <span className="text-[11px] uppercase tracking-[0.04em] font-bold text-neutral-muted block text-left">Détails de la validation</span>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-surface-section border border-neutral-border rounded-[3px] text-left">
                          <span className="text-[11px] uppercase tracking-[0.04em] font-bold text-neutral-muted block">Tarif Voyage</span>
                          <span className="text-[16px] font-bold text-brand-dark font-mono mt-1 block">7.00 DH</span>
                        </div>
                        <div className="p-3 bg-surface-section border border-neutral-border rounded-[3px] text-left">
                          <span className="text-[11px] uppercase tracking-[0.04em] font-bold text-neutral-muted block">ID Unique</span>
                          <span className="text-[12px] font-mono font-bold text-cta block truncate mt-1" title={String(ticket.id)}>
                            {String(ticket.id).slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-surface-section border border-neutral-border rounded-[3px] text-[12px]">
                        <span className="text-neutral-muted flex items-center gap-1.5"><Clock size={13} /> Ligne active</span>
                        <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-white ${ticket.current_line === 'L2' ? 'bg-[#55356D]' : 'bg-[#EA3D8F]'}`}>
                          {ticket.current_line || 'L1'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-surface-section border border-neutral-border rounded-[3px] text-[12px]">
                        <span className="text-neutral-muted flex items-center gap-1.5"><Clock size={13} /> Véhicule (Rame)</span>
                        <span className="font-bold text-brand-dark font-mono">
                          {getTramName(ticket.id)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-surface-section border border-neutral-border rounded-[3px] text-[12px]">
                        <span className="text-neutral-muted flex items-center gap-1.5"><Clock size={13} /> Correspondance</span>
                        <span className={`text-[11px] font-bold uppercase tracking-[0.02em] ${ticket.line_switched ? 'text-[#F5AB32]' : 'text-[#437A22]'}`}>
                          {ticket.line_switched ? 'Déjà effectuée (Bloquée)' : 'Non utilisée (1 disponible)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-surface-section border border-neutral-border rounded-[3px] text-[12px]">
                        <span className="text-neutral-muted flex items-center gap-1.5"><Clock size={13} /> Temps restant</span>
                        <span className="font-bold text-brand-dark font-mono text-[14px]">
                          {countdown}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-surface-section border border-neutral-border rounded-[3px] text-[12px]">
                        <span className="text-neutral-muted flex items-center gap-1.5"><Clock size={13} /> Fin de validité</span>
                        <span className="font-bold text-brand-dark font-mono">
                          {formattedTime}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. REJECTED / INVALID SCREEN STATE */}
            {status === 'invalid' && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: shouldReduceMotion ? 0 : [0, -10, 10, -10, 10, -5, 5, 0]
                }}
                transition={{ duration: 0.4 }}
                className="flex flex-col"
              >
                {/* Visual Error Block */}
                <div className="bg-[#CF2E2E]/10 border-b border-[#CF2E2E]/20 p-6 flex flex-col items-center text-center gap-2">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 15, delay: 0.1 }}
                    className="w-12 h-12 bg-[#CF2E2E]/10 border border-[#CF2E2E]/25 rounded-full flex items-center justify-center text-[#CF2E2E]"
                  >
                    <XCircle size={28} />
                  </motion.div>
                  <h2 className="text-[18px] sm:text-[20px] font-bold text-[#CF2E2E] uppercase tracking-[0.04em] leading-[1.0] mt-1">Accès Refusé</h2>
                  <p className="text-[12px] font-normal leading-[1.4] text-[#3a0f0f] opacity-80 mt-1">{getReasonMessage(reason)}</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* If traveler exists, render it with warning markers */}
                  {traveler && (
                    <div className="p-4 bg-surface-section border border-neutral-border rounded-[3px] flex items-center gap-4 opacity-75">
                      <div className="w-14 h-14 rounded-full border border-neutral-border bg-white overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                        {traveler.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={traveler.avatar} alt="Profile photo" className="w-full h-full object-cover" />
                        ) : (
                          <User size={22} className="text-neutral-soft" />
                        )}
                        <div className="absolute inset-0 bg-[#CF2E2E]/20 flex items-center justify-center text-status-error">
                          <AlertTriangle size={20} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-[11px] uppercase tracking-[0.04em] font-bold text-status-error block">Titulaire (Rejeté)</span>
                        <h3 className="text-[15px] font-normal leading-[1.0] text-brand-dark truncate mt-[4px]">{traveler.name}</h3>
                        <p className="text-[12px] text-neutral-muted truncate font-mono mt-[4px]">{traveler.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-status-error/5 border border-status-error/15 rounded-[3px] flex gap-3 text-[12px] leading-relaxed text-left">
                    <Info size={16} className="text-status-error flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-status-error uppercase tracking-[0.04em] text-[11px] leading-[1.0] mb-[4px]">Consignes pour le contrôleur :</p>
                      <p className="text-brand-dark/70 font-normal leading-[1.4]">
                        Veuillez demander au voyageur de présenter sa carte de transport physique MIFARE sur l'un des valideurs ou de générer un nouveau titre de transport depuis son espace personnel.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[14px] text-cta hover:underline font-bold tracking-[0px] cursor-pointer"
          >
            ← Retourner au tableau de bord
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyTicketPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-section" />}>
      <TicketVerifier />
    </Suspense>
  )
}
