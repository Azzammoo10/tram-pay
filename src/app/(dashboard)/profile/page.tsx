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
    <div className="max-w-[1000px] mx-auto space-y-8 pb-12">
      {/* Header / Hero Section */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-brand-dark to-brand-purple p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cta/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-[32px] font-bold border border-white/20 backdrop-blur-md shadow-inner">
            {profile?.full_name ? getInitials(profile.full_name) : <User size={40} />}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-[32px] font-bold leading-tight text-white">
              {profile?.full_name || 'Utilisateur Tram Pay'}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-white text-[14px]">
              <span className="flex items-center gap-1.5 opacity-90">
                <Mail size={14} /> {userEmail}
              </span>
              <span className="flex items-center gap-1.5 opacity-90">
                <Phone size={14} /> {profile?.phone || 'Non renseigné'}
              </span>
              <span className="flex items-center gap-1.5 text-cta-light font-bold">
                <Badge variant="success" className="bg-white/10 border-white/20 text-white">
                  Compte Vérifié
                </Badge>
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center px-6 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[20px] font-bold">{stats.totalTrips}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/50">Trajets</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Forms & Settings */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-accent"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cta/10 rounded-lg text-cta">
                  <User size={20} />
                </div>
                <h2 className="text-[18px] font-bold text-brand-dark">Profil Public</h2>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Nom complet"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  placeholder="Ex: Mohamed Azzam"
                  icon={<User size={16} />}
                />
                <Input
                  label="Numéro de téléphone"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="Ex: 0612345678"
                  icon={<Phone size={16} />}
                />
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-[12px] text-[13px] font-medium flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-status-success/10 text-status-success border border-status-success/20' : 'bg-status-error/10 text-status-error border border-status-error/20'
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
                  className="w-full md:w-auto px-10 py-4 h-auto bg-brand-dark hover:bg-brand-purple shadow-lg hover:shadow-brand-purple/20 transition-all duration-300 group"
                >
                  <Save size={18} className="group-hover:scale-110 transition-transform" />
                  Sauvegarder les modifications
                </Button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-dark/5 rounded-lg text-brand-dark">
                <Shield size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-brand-dark">Confidentialité & Sécurité</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-border hover:border-cta/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-soft flex items-center justify-center text-neutral-muted">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-brand-dark">Email de contact</p>
                    <p className="text-[12px] text-neutral-muted">{userEmail}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-neutral-muted group-hover:text-cta transition-transform group-hover:translate-x-1" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-border hover:border-cta/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-soft flex items-center justify-center text-neutral-muted">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-brand-dark">Mot de passe</p>
                    <p className="text-[12px] text-neutral-muted">Dernière modification il y a 3 mois</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-neutral-muted group-hover:text-cta transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Card & Help */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-base border-t-[4px] border-t-brand-purple"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                <CreditCard size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-brand-dark">Titre de Transport</h2>
            </div>

            {card ? (
              <div className="space-y-6">
                <div className="relative aspect-[1.6/1] w-full rounded-2xl bg-gradient-to-br from-[#55356D] to-[#AC6899] p-6 text-white shadow-lg overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <CreditCard size={100} />
                  </div>
                  <div className="h-full flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="text-[12px] font-medium tracking-widest uppercase opacity-70">Tramway Rabat-Salé</div>
                      <Badge variant="success" className="bg-white/20 border-none text-white text-[10px]">ACTIF</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] opacity-60 uppercase tracking-widest">ID Unique</div>
                      <div className="text-[16px] font-mono font-bold tracking-wider truncate">
                        {card.card_token.match(/.{1,4}/g)?.join(' ') || card.card_token}
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-[14px] font-bold">{profile?.full_name}</div>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-between text-[13px] border-neutral-border">
                    <span className="flex items-center gap-2">
                      <History size={16} /> Historique de la carte
                    </span>
                    <ChevronRight size={14} />
                  </Button>
                  <button className="w-full py-3 text-[13px] text-status-error font-medium hover:bg-status-error/5 rounded-xl transition-colors border border-transparent hover:border-status-error/10">
                    Déclarer une perte / vol
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-neutral-soft flex items-center justify-center mx-auto mb-4 text-neutral-muted">
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
            className="p-8 rounded-[20px] bg-brand-dark text-white relative overflow-hidden group shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cta/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <h3 className="text-[18px] font-bold mb-3 relative z-10">Assistance 24/7</h3>
            <p className="text-[13px] text-white/60 mb-6 relative z-10 leading-relaxed">
              Une question sur votre abonnement ou un problème technique ? Notre équipe est là pour vous aider.
            </p>
            
            <a 
              href="mailto:support@tram-way.ma"
              className="flex items-center justify-center gap-2 w-full py-4 bg-white text-brand-dark rounded-xl text-[14px] font-bold hover:bg-cta hover:text-white transition-all duration-300 shadow-lg"
            >
              <Mail size={18} />
              Nous contacter par email
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
