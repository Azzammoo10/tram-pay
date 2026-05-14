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
    <div className="min-h-screen bg-surface-section flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="card-accent">
          <Logo className="mb-8" showText={false} width={120} height={40} />

          <h1 className="text-[28px] font-bold text-brand-dark leading-tight mb-1">
            Créer un compte
          </h1>
          <p className="text-[14px] text-neutral-muted mb-8">
            Rejoignez le réseau Tramway Rabat-Salé
          </p>

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
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
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
              <p className="text-[12px] text-status-error">{serverError}</p>
            )}

            <Button type="submit" loading={isSubmitting} className="mt-2">
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-[14px] text-neutral-muted mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-cta hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
