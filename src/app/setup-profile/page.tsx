'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, LogOut, CheckCircle2, User, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'

export default function SetupProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const PRESET_AVATARS = [
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%2355356D"/><circle cx="50" cy="40" r="18" fill="%23FFFFFF"/><path d="M22 80c0-15 12-25 28-25s28 10 28 25z" fill="%23FFFFFF"/><rect x="42" y="30" width="16" height="4" fill="%23EA3D8F"/><polygon points="38,32 50,22 62,32 50,42" fill="%23EA3D8F"/></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%231A0E03"/><circle cx="50" cy="40" r="18" fill="%23FFFFFF"/><path d="M22 80c0-15 12-25 28-25s28 10 28 25z" fill="%23FFFFFF"/><polygon points="45,55 50,68 55,55" fill="%23EA3D8F"/><path d="M38 40h24" stroke="%23EA3D8F" stroke-width="2"/></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%23EA3D8F"/><circle cx="50" cy="40" r="18" fill="%23FFFFFF"/><path d="M22 80c0-15 12-25 28-25s28 10 28 25z" fill="%23FFFFFF"/><path d="M30 40a20 20 0 0 1 40 0" fill="none" stroke="%2355356D" stroke-width="4"/><circle cx="28" cy="40" r="5" fill="%2355356D"/><circle cx="72" cy="40" r="5" fill="%2355356D"/></svg>`
  ]

  const [userName, setUserName] = useState<string>('Voyageur')
  const [avatar, setAvatar] = useState<string>(PRESET_AVATARS[0])
  const [avatarType, setAvatarType] = useState<'preset' | 'custom'>('preset')
  const [activePreset, setActivePreset] = useState<number>(0)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.full_name ?? 'Voyageur')
        if (user.user_metadata?.avatar) {
          setAvatar(user.user_metadata.avatar)
          setAvatarType('custom')
          setActivePreset(-1)
        }
      }
    }
    loadUser()
  }, [supabase])

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

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const size = Math.min(img.width, img.height)
        const x = (img.width - size) / 2
        const y = (img.height - size) / 2
        ctx.drawImage(img, x, y, size, size, 0, 0, 256, 256)

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85)
        setAvatar(compressedBase64)
        setAvatarType('custom')
        setActivePreset(-1)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setIsSubmitting(true)
    setImageError(null)

    try {
      // Call server-side API: stores base64 in profiles table, sets tiny flag in JWT
      const res = await fetch('/api/profile/set-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar }),
      })

      const data = await res.json()

      if (!res.ok) {
        setImageError(data.error ?? 'Erreur lors de la mise à jour du profil.')
        setIsSubmitting(false)
        return
      }

      // Refresh client session so the new avatar_set flag is in the local token
      await supabase.auth.refreshSession()

      setSaveSuccess(true)
      // Hard navigation: ensures browser sends fresh session cookies to the server
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1200)
    } catch {
      setImageError('Une erreur inattendue est survenue.')
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-surface-section flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cta/5 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] z-10 space-y-6">
        <div className="card-accent bg-white p-8">
          <div className="flex flex-col items-center mb-6">
            <Logo className="mb-4" showText={true} width={130} height={42} />
            <div className="h-[1px] w-12 bg-neutral-border my-2" />
          </div>

          <AnimatePresence mode="wait">
            {!saveSuccess ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Step badge */}
                <div className="flex items-center justify-between border-b border-neutral-border pb-4 mb-[24px]">
                  <div className="text-[12px] font-bold text-cta tracking-[0.04em] uppercase">
                    Étape 2 sur 2 : Identité Numérique
                  </div>
                  <div className="text-[12px] text-neutral-muted font-bold px-2.5 py-0.5 bg-[#F5F4F4] rounded-[12px] tracking-[0.04em] uppercase">
                    Obligatoire
                  </div>
                </div>

                <div className="text-center mb-[24px]">
                  <h1 className="text-[20px] font-bold text-brand-dark leading-[1.0] tracking-[0px] mb-[15px]">
                    Bonjour, {userName} !
                  </h1>
                  <p className="text-[14px] text-neutral-muted font-normal leading-[1.4] tracking-[0px] max-w-[65ch] mx-auto">
                    Pour finaliser votre inscription, veuillez configurer votre photo d&apos;identité numérique. Elle sera affichée lors des contrôles de titres de transport.
                  </p>
                </div>

                {/* Avatar uploader */}
                <div className="flex flex-col gap-3 mb-[24px]">
                  <div className="flex items-center gap-4 p-4 bg-surface-section border border-neutral-border rounded-[3px]">
                    <div className="relative w-16 h-16 rounded-[3px] overflow-hidden border border-neutral-border flex-shrink-0 bg-white flex items-center justify-center shadow-card">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt="Identity Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={26} className="text-neutral-soft" />
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex gap-2">
                        {PRESET_AVATARS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setAvatar(preset)
                              setAvatarType('preset')
                              setActivePreset(idx)
                              setImageError(null)
                            }}
                            className={`w-9 h-9 rounded-[3px] overflow-hidden border cursor-pointer transition-all ${
                              activePreset === idx ? 'border-cta ring-2 ring-cta/15' : 'border-neutral-border hover:border-brand-purple/50'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preset} alt={`Commuter illustration ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}

                        <label
                          className={`w-9 h-9 rounded-[3px] border border-dashed flex items-center justify-center cursor-pointer transition-all hover:bg-neutral-border/20 text-neutral-muted hover:text-cta ${
                            avatarType === 'custom' ? 'border-cta bg-cta/5 text-cta' : 'border-neutral-border'
                          }`}
                          title="Importer une photo officielle"
                        >
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Upload size={16} />
                        </label>
                      </div>
                      <span className="text-[12px] text-neutral-muted font-normal leading-[1.4] mt-[4px]">
                        Choisissez un avatar ou déposez votre photo (max 1Mo).
                      </span>
                    </div>
                  </div>

                  {imageError && (
                    <div className="text-[12px] text-status-error font-normal leading-[1.4] px-3 py-1.5 bg-status-error/5 border border-status-error/15 rounded-[3px] flex items-center gap-1.5 mt-[4px]">
                      <span>⚠️</span> {imageError}
                    </div>
                  )}
                </div>

                {/* Info card */}
                <div className="p-3.5 bg-brand-purple/[0.03] border border-brand-purple/10 rounded-[3px] flex gap-3 text-[12px] leading-[1.4] mb-[24px]">
                  <ShieldCheck className="text-brand-purple flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-bold text-brand-purple tracking-[0.04em] uppercase text-[11px] leading-[1.0] mb-[4px]">Charte du voyageur Rabat-Salé :</p>
                    <p className="text-neutral-muted mt-[4px] font-normal leading-[1.4]">
                      Votre photo d&apos;identité sera utilisée par les agents contrôleurs pour vérifier votre titre de transport lors des inspections.
                    </p>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} loading={isSubmitting} className="w-full">
                  Valider et accéder à mon tableau de bord
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center justify-center text-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-14 h-14 bg-status-success/10 border border-status-success/20 rounded-full flex items-center justify-center text-status-success"
                >
                  <CheckCircle2 size={32} />
                </motion.div>
                <div className="space-y-1.5">
                  <h2 className="text-[20px] font-bold text-brand-dark leading-[1.0] tracking-[0px]">Profil Validé !</h2>
                  <p className="text-[14px] text-neutral-muted font-normal leading-[1.4] mt-[4px]">
                    Votre identité numérique est configurée. Redirection...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-[24px]">
          <button
            onClick={handleSignOut}
            className="text-[14px] text-neutral-text hover:text-cta flex items-center gap-1.5 font-normal transition-all duration-150 bg-white hover:bg-[#F5F4F4] border border-neutral-border px-4 py-2 rounded-[3px] shadow-card cursor-pointer"
          >
            <LogOut size={13} /> Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
