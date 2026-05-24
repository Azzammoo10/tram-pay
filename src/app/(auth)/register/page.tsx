'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Logo from '@/components/ui/Logo'

const schema = z
  .object({
    full_name: z.string().min(2, '2 caractères minimum'),
    email: z.string().min(1, 'Email requis').email('Email invalide'),
    password: z.string().min(8, '8 caractères minimum'),
    confirmPassword: z.string().min(1, 'Confirmez votre mot de passe'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
        }),
      })

      const result = await res.json()
      
      if (!res.ok) {
        setServerError(result.error ?? 'Erreur lors de la création du compte.')
        return
      }

      router.push('/login?registered=true')
    } catch {
      setServerError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen bg-surface-section flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow matching Rabat-Salé style */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cta/5 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] z-10">
        <div className="card-accent bg-white p-8">
          <div className="flex flex-col items-center mb-6">
            <Logo className="mb-4" showText={true} width={130} height={42} />
            <div className="h-[1px] w-12 bg-neutral-border my-2" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-[20px] font-bold text-brand-dark leading-tight mb-2">
              Créer un Compte
            </h1>
            <p className="text-[13px] text-neutral-muted leading-relaxed max-w-[280px] mx-auto">
              Inscrivez-vous pour obtenir votre carte de transport virtuelle Rabat-Salé.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            
            <Input
              label="Nom complet"
              type="text"
              placeholder="Prénom Nom"
              autoComplete="name"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Adresse Email"
              type="email"
              placeholder="nom@exemple.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="•••••••• (8 caract. min)"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {serverError && (
              <div className="p-3 bg-status-error/5 border border-status-error/15 rounded-[3px] text-center">
                <p className="text-[12px] text-status-error font-medium">{serverError}</p>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="mt-3">
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-[13px] text-neutral-muted mt-8 pt-6 border-t border-neutral-border/50">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-cta hover:underline font-bold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
