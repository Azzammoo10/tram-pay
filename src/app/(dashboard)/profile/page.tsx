'use client'

import { useEffect, useState } from 'react'
import { User, CreditCard, Shield, Save, Mail, Phone, MapPin, History, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [profile, setProfile] = useState<{ full_name: string; phone: string } | null>(null)
  const [card, setCard] = useState<{ card_token: string; status: string } | null>(null)
  const [stats, setStats] = useState({ totalTrips: 0 })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || '')

      // Load Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone')
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
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-brand-dark">Mon Profil</h1>
          <p className="text-[14px] text-neutral-muted mt-1">Gérez vos informations personnelles et votre compte</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="bg-[#10B981]/15 border border-[#10B981]/25 text-cta font-bold">
            Compte Vérifié
          </Badge>
        </div>
      </header>

      {/* Profile Card / Hero */}
      <div className="card-accent overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cta/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[3px] bg-brand-dark flex items-center justify-center text-[24px] md:text-[28px] font-bold text-white shadow-card border border-white/10">
            {profile?.full_name ? getInitials(profile.full_name) : <User size={30} />}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-[20px] font-bold text-brand-dark leading-tight">
              {profile?.full_name || 'Utilisateur Tram Pay'}
            </h2>
            <div className="flex flex-col md:flex-row flex-wrap justify-center md:justify-start gap-2 md:gap-4 mt-2 text-neutral-muted text-[13px]">
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
              <div className="text-[18px] font-bold text-brand-dark">{stats.totalTrips}</div>
              <div className="text-[9px] uppercase tracking-wider text-neutral-muted font-bold">Trajets</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Forms & Settings */}
        <div className="lg:col-span-3 space-y-8">
          <div className="card-base">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-border">
              <div className="p-2 bg-brand-dark/5 text-brand-dark rounded-[3px]">
                <User size={18} />
              </div>
              <h3 className="text-[16px] font-bold text-brand-dark">Profil Public</h3>
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
                  className={`p-4 rounded-[3px] text-[13px] font-medium flex items-center gap-3 ${
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
                  loading={saving} 
                  className="w-full md:w-auto px-8 flex items-center justify-center gap-2 h-[45px] text-[14px]"
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
            className="card-base"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-dark/5 rounded-[3px] text-brand-dark">
                <Shield size={18} />
              </div>
              <h2 className="text-[16px] font-bold text-brand-dark">Confidentialité & Sécurité</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-[3px] border border-neutral-border hover:border-cta/30 transition-all cursor-pointer group bg-white shadow-card">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[3px] bg-surface-section border border-neutral-border flex items-center justify-center text-brand-purple">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-brand-dark">Email de contact</p>
                    <p className="text-[12px] text-neutral-muted">{userEmail}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-neutral-muted group-hover:text-cta transition-transform duration-200" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-[3px] border border-neutral-border hover:border-cta/30 transition-all cursor-pointer group bg-white shadow-card">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[3px] bg-surface-section border border-neutral-border flex items-center justify-center text-brand-purple">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-brand-dark">Mot de passe</p>
                    <p className="text-[12px] text-neutral-muted">Dernière modification il y a 3 mois</p>
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
            className="card-base border-t-[4px] border-t-brand-purple"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-purple/10 rounded-[3px] text-brand-purple">
                <CreditCard size={18} />
              </div>
              <h2 className="text-[16px] font-bold text-brand-dark">Titre de Transport</h2>
            </div>

            {card ? (
              <div className="space-y-6">
                <div className="relative aspect-[1.586/1] w-full rounded-[3px] bg-gradient-to-br from-[#1A0E03] to-[#55356D] p-6 text-white shadow-premium overflow-hidden group border border-[#AC6899]/20">
                  <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-30 transition-opacity">
                    <CreditCard size={100} />
                  </div>
                  <div className="h-full flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="text-[9px] font-bold tracking-widest uppercase text-[#AC6899]">Tramway Rabat-Salé</div>
                      <Badge variant="success" className="bg-[#10B981]/15 border border-[#10B981]/25 text-white text-[9px] font-bold">ACTIF</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] opacity-60 uppercase tracking-widest text-[#AC6899] font-bold">ID Unique</div>
                      <div className="text-[13px] md:text-[15px] font-mono font-bold tracking-wider break-all text-white">
                        {card.card_token.match(/.{1,4}/g)?.join(' ') || card.card_token}
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-[12px] font-bold uppercase tracking-wide text-white">{profile?.full_name}</div>
                      <div className="w-8 h-6 bg-gradient-to-r from-amber-300 to-amber-100 rounded-[2px] opacity-90 border border-amber-400/20" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-between text-[13px] border-neutral-border rounded-[3px] h-[40px]">
                    <span className="flex items-center gap-2">
                      <History size={16} /> Historique de la carte
                    </span>
                    <ChevronRight size={14} />
                  </Button>
                  <button className="w-full py-3 text-[13px] text-status-error font-medium hover:bg-status-error/5 rounded-[3px] transition-colors border border-transparent hover:border-status-error/10">
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
            className="p-6 rounded-[3px] bg-brand-dark text-white relative overflow-hidden group shadow-premium border border-white/5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cta/15 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-500" />
            
            <h3 className="text-[16px] font-bold mb-2 relative z-10">Assistance 24/7</h3>
            <p className="text-[13px] text-white/60 mb-5 relative z-10 leading-relaxed">
              Une question sur votre abonnement ou un problème technique ? Notre équipe est là pour vous aider.
            </p>
            
            <a 
              href="mailto:support@tram-way.ma"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-brand-dark rounded-[3px] text-[13px] font-bold hover:bg-cta hover:text-white transition-all duration-200 shadow-card"
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
