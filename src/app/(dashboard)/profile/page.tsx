'use client'

import { useEffect, useState } from 'react'
import { User, CreditCard, Shield, Save, Mail, Phone, MapPin, History, ChevronRight, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import TransitCard from '@/components/ui/TransitCard'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [profile, setProfile] = useState<{ full_name: string; phone: string; avatar: string | null } | null>(null)
  const [card, setCard] = useState<{ card_token: string; status: string } | null>(null)
  const [stats, setStats] = useState({ totalTrips: 0 })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || '')

      // Load Profile (including avatar column)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)

      // Load Card
      const { data: cardData } = await supabase
        .from('cards')
        .select('card_token, status')
        .eq('user_id', user.id)
        .single()
      
      setCard(cardData)

      // Load Stats
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      setStats({ totalTrips: count || 0 })
      
      setLoading(false)
    }

    loadData()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Centering Square Center Crop & 256x256 Quality Compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setImageError('Format supporté : PNG, JPG, WEBP.')
      return
    }

    if (file.size > 1024 * 1024) {
      setImageError('Taille max dépassée (limite 1 Mo).')
      return
    }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setUploading(false)
          return
        }

        const size = Math.min(img.width, img.height)
        const x = (img.width - size) / 2
        const y = (img.height - size) / 2
        ctx.drawImage(img, x, y, size, size, 0, 0, 256, 256)

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85)

        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            setImageError('Non connecté.')
            setUploading(false)
            return
          }

          // POST to backend API (saves to profiles.avatar & sets auth sentinel flag)
          const res = await fetch('/api/profile/set-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: compressedBase64 }),
          })

          const data = await res.json()

          if (!res.ok) {
            setImageError(data.error ?? 'Erreur de sauvegarde.')
            setUploading(false)
            return
          }

          // Sync auth session cookies
          await supabase.auth.refreshSession()

          // Update local state instantly with zero reloads!
          setProfile(prev => prev ? { ...prev, avatar: compressedBase64 } : null)
          setSuccessToast('Photo de profil mise à jour !')
          setTimeout(() => setSuccessToast(null), 3000)
        } catch (err: any) {
          setImageError('Erreur lors de la sauvegarde : ' + err.message)
        } finally {
          setUploading(false)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile?.full_name,
        phone: profile?.phone,
      })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: "Erreur lors de la mise à jour." })
    } else {
      setMessage({ type: 'success', text: "Profil mis à jour avec succès !" })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 border-b-2 border-cta rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#10B981] border border-[#10B981]/20 text-white rounded-[3px] shadow-[0_10px_20px_rgba(16,185,129,0.2)] text-[13px] font-bold flex items-center gap-2"
          >
            <span>✓</span> {successToast}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-[32px] text-left">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-brand-dark leading-[1.2] tracking-[0px]">Mon Profil</h1>
          <p className="text-[14px] text-neutral-muted mt-1 leading-[1.4] tracking-[0px]">Gérez vos informations personnelles et votre compte</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="bg-[#10B981]/15 border border-[#10B981]/25 text-cta font-bold tracking-[0.04em] uppercase">
            Compte Vérifié
          </Badge>
        </div>
      </header>

      {imageError && (
        <div className="p-4 bg-status-error/5 border border-status-error/15 rounded-[3px] text-[12px] font-normal leading-[1.4] tracking-[0px] flex items-center gap-3 text-status-error animate-pulse mb-[24px]">
          <AlertTriangle size={16} />
          {imageError}
        </div>
      )}

      {/* Profile Card / Hero */}
      <div className="card-accent overflow-hidden relative mb-[32px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cta/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
          {/* Interactive Avatar Upload Box */}
          <div className="relative group w-16 h-16 md:w-20 md:h-20 rounded-[3px] overflow-hidden border border-white/10 bg-brand-dark flex items-center justify-center shadow-card cursor-pointer flex-shrink-0">
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="Photo de profil" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <span className="text-[20px] md:text-[24px] font-bold text-white tracking-wide">
                {profile?.full_name ? getInitials(profile.full_name) : <User size={24} />}
              </span>
            )}
            
            {/* Sleek Camera Hover Overlay */}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer text-white">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <span className="text-[11px] uppercase tracking-[0.04em] font-bold mt-1 scale-90 md:scale-100">Modifier</span>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                onChange={handleImageUpload} 
                className="hidden" 
                disabled={uploading}
              />
            </label>

            {/* Spinner when uploading */}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-t-transparent border-white rounded-full"
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-brand-dark leading-[1.0] tracking-[0px]">
              {profile?.full_name || 'Utilisateur Tram Pay'}
            </h2>
            <div className="flex flex-col md:flex-row flex-wrap justify-center md:justify-start gap-2 md:gap-4 mt-[12px] text-neutral-muted text-[12px] font-normal leading-[1.4] tracking-[0px]">
              <span className="flex items-center justify-center md:justify-start gap-1.5">
                <Mail size={13} className="text-cta" /> {userEmail}
              </span>
              <span className="flex items-center justify-center md:justify-start gap-1.5">
                <Phone size={13} className="text-cta" /> {profile?.phone || 'Non renseigné'}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center px-5 py-2.5 rounded-[3px] bg-surface-section border border-neutral-border shadow-card">
              <div className="text-[18px] font-bold text-brand-dark leading-[1.0]">{stats.totalTrips}</div>
              <div className="text-[11px] uppercase tracking-[0.04em] text-neutral-muted font-bold mt-[4px]">Trajets</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Forms & Settings */}
        <div className="lg:col-span-3 space-y-8">
          <div className="card-base text-left">
            <div className="flex items-center gap-3 mb-[20px] pb-4 border-b border-neutral-border">
              <div className="p-2 bg-brand-dark/5 text-brand-dark rounded-[3px]">
                <User size={18} />
              </div>
              <h3 className="text-[18px] sm:text-[20px] font-bold text-brand-dark leading-[1.0] tracking-[0px]">Profil Public</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Nom complet"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  placeholder="Ex: Mohamed Azzam"
                  icon={<User size={14} />}
                />
                <Input
                  label="Numéro de téléphone"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="Ex: 0612345678"
                  icon={<Phone size={14} />}
                />
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-[3px] text-[12px] font-normal leading-[1.4] tracking-[0px] flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-status-success/10 text-status-success border border-status-success/20' 
                      : 'bg-status-error/10 text-status-error border border-status-error/20'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-status-success' : 'bg-status-error'}`} />
                  {message.text}
                </motion.div>
              )}

              <div className="pt-4 border-t border-neutral-border flex justify-end">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto px-8 flex items-center justify-center gap-2 h-[45px]"
                >
                  <Save size={16} />
                  Sauvegarder les modifications
                </Button>
              </div>
            </form>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base text-left"
          >
            <div className="flex items-center gap-3 mb-[20px] pb-4 border-b border-neutral-border">
              <div className="p-2 bg-brand-dark/5 rounded-[3px] text-brand-dark">
                <Shield size={18} />
              </div>
              <h2 className="text-[18px] sm:text-[20px] font-bold text-brand-dark leading-[1.0] tracking-[0px]">Confidentialité & Sécurité</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-[3px] border border-neutral-border hover:border-cta/30 transition-all cursor-pointer group bg-white shadow-card">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[3px] bg-surface-section border border-neutral-border flex items-center justify-center text-brand-purple">
                    <Mail size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-brand-dark leading-[1.0] tracking-[0px] mb-[4px]">Email de contact</p>
                    <p className="text-[12px] text-neutral-muted font-normal leading-[1.4] tracking-[0px]">{userEmail}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-neutral-muted group-hover:text-cta transition-transform duration-200" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-[3px] border border-neutral-border hover:border-cta/30 transition-all cursor-pointer group bg-white shadow-card">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[3px] bg-surface-section border border-neutral-border flex items-center justify-center text-brand-purple">
                    <Shield size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-brand-dark leading-[1.0] tracking-[0px] mb-[4px]">Mot de passe</p>
                    <p className="text-[12px] text-neutral-muted font-normal leading-[1.4] tracking-[0px]">Dernière modification il y a 3 mois</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-neutral-muted group-hover:text-cta transition-transform duration-200" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Card & Help */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-base border-t-[4px] border-t-brand-purple text-left"
          >
            <div className="flex items-center gap-3 mb-[20px] pb-4 border-b border-neutral-border">
              <div className="p-2 bg-brand-purple/10 rounded-[3px] text-brand-purple">
                <CreditCard size={18} />
              </div>
              <h2 className="text-[18px] sm:text-[20px] font-bold text-brand-dark leading-[1.0] tracking-[0px]">Titre de Transport</h2>
            </div>

            {card ? (
              <div className="space-y-6">
                <TransitCard
                  cardToken={card.card_token}
                  userName={profile?.full_name || 'Utilisateur'}
                  status={card.status}
                />

                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-between text-[14px] font-normal leading-[1.0] border-neutral-border rounded-[3px] h-[40px]">
                    <span className="flex items-center gap-2">
                      <History size={16} /> Historique de la carte
                    </span>
                    <ChevronRight size={14} />
                  </Button>
                  <button className="w-full py-3 text-[14px] text-status-error font-medium hover:bg-status-error/5 rounded-[3px] transition-colors border border-transparent hover:border-status-error/10 cursor-pointer">
                    Déclarer une perte / vol
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-[3px] bg-neutral-soft flex items-center justify-center mx-auto mb-4 text-neutral-muted">
                  <CreditCard size={32} />
                </div>
                <p className="text-[14px] text-neutral-muted">Aucune carte liée.</p>
                <Button variant="ghost" className="mt-4">Lier une carte</Button>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-[3px] bg-brand-dark text-white relative overflow-hidden group shadow-premium border border-white/5 text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cta/15 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-500" />
            
            <h3 className="text-[18px] sm:text-[20px] font-bold text-white leading-[1.0] tracking-[0px] mb-[15px] relative z-10">Assistance 24/7</h3>
            <p className="text-[14px] text-white/60 mb-5 relative z-10 leading-relaxed font-normal">
              Une question sur votre abonnement ou un problème technique ? Notre équipe est là pour vous aider.
            </p>
            
            <a 
              href="mailto:support@tram-way.ma"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-brand-dark rounded-[3px] text-[14px] font-bold hover:bg-cta hover:text-white transition-all duration-200 shadow-card"
            >
              <Mail size={16} />
              Nous contacter par email
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
