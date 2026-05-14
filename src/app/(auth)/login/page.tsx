'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import Logo from '@/components/ui/Logo'

const schema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(6, '6 caractères minimum'),
})

type FormData = z.infer<typeof schema>

import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)
  const registered = searchParams.get('registered') === 'true'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setServerError('Email ou mot de passe incorrect.')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-surface-section flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="card-accent">
          <Logo className="mb-8" showText={false} width={120} height={40} />

          <h1 className="text-[28px] font-bold text-brand-dark leading-tight mb-1">
            Connexion
          </h1>
          <p className="text-[14px] text-neutral-muted mb-8">
            Accédez à vos titres de transport
          </p>

          {registered && (
            <div className="mb-6 p-3 bg-status-success/10 border border-status-success/20 rounded-[3px]">
              <p className="text-[13px] text-status-success font-medium">
                Compte créé avec succès ! Vous pouvez maintenant vous connecter.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <p className="text-[12px] text-status-error">{serverError}</p>
            )}

            <Button type="submit" loading={isSubmitting} className="mt-2">
              Se connecter
            </Button>
          </form>

          <p className="text-center text-[14px] text-neutral-muted mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-cta hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-section" />}>
      <LoginForm />
    </Suspense>
  )
}
