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
      if (error.message?.toLowerCase().includes('confirm') || error.message?.toLowerCase().includes('verified') || error.message?.toLowerCase().includes('verification')) {
        setServerError('Veuillez confirmer votre adresse e-mail. Un lien a été envoyé à votre adresse.')
      } else {
        setServerError('Email ou mot de passe incorrect.')
      }
      return
    }
    router.push('/dashboard')
    router.refresh()
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
              Espace Voyageur
            </h1>
            <p className="text-[13px] text-neutral-muted leading-relaxed max-w-[280px] mx-auto">
              Connectez-vous pour accéder à vos cartes de transport et tickets virtuels.
            </p>
          </div>

          {registered && (
            <div className="mb-6 p-4 bg-[#10B981]/5 border border-[#10B981]/15 rounded-[3px] flex items-start gap-2.5">
              <span className="text-[14px] text-[#10B981] font-bold">✓</span>
              <p className="text-[12.5px] text-[#0f2e1a] font-medium leading-normal">
                Compte créé avec succès ! Vous pouvez maintenant vous connecter.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div className="p-3 bg-status-error/5 border border-status-error/15 rounded-[3px] text-center">
                <p className="text-[12px] text-status-error font-medium">{serverError}</p>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="mt-3">
              Se connecter
            </Button>
          </form>

          <p className="text-center text-[13px] text-neutral-muted mt-8 pt-6 border-t border-neutral-border/50">
            Nouveau sur le réseau ?{' '}
            <Link href="/register" className="text-cta hover:underline font-bold">
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
