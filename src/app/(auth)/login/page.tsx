'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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
  const shouldReduceMotion = useReducedMotion()
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

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: shouldReduceMotion ? 1 : 0.97, 
      y: shouldReduceMotion ? 0 : 16 
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as any,
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 400, damping: 28 }
    }
  }

  const errorVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -4 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.2, ease: 'easeOut' as any } 
    }
  }

  return (
    <div className="min-h-screen bg-surface-section flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic drifting background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={shouldReduceMotion ? {} : {
            x: [0, 40, -20, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-brand-purple/10 rounded-full blur-[80px]"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : {
            x: [0, -30, 50, 0],
            y: [0, 40, -40, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-cta/8 rounded-full blur-[80px]"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : {
            x: [0, 60, -30, 0],
            y: [0, 30, -50, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-[#55356D]/5 rounded-full blur-[70px]"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[400px] z-10"
      >
        <div className="card-accent bg-white p-8 backdrop-blur-md bg-white/90 border border-neutral-border/40">
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-[24px]">
            <Logo className="mb-4" showText={true} width={130} height={42} />
            <div className="h-[1px] w-12 bg-neutral-border my-2" />
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mb-[24px]">
            <h1 className="text-[22px] sm:text-[28px] font-bold text-brand-dark leading-[1.2] tracking-[0px] mb-[15px]">
              Espace Voyageur
            </h1>
            <p className="text-[14px] text-neutral-muted font-normal leading-[1.4] tracking-[0px] max-w-[65ch] mx-auto">
              Connectez-vous pour accéder à vos cartes de transport et tickets virtuels.
            </p>
          </motion.div>

          {registered && (
            <motion.div 
              variants={itemVariants} 
              className="mb-[24px] p-4 bg-[#10B981]/5 border border-[#10B981]/15 rounded-[3px] flex items-start gap-2.5"
            >
              <span className="text-[14px] text-[#10B981] font-bold">✓</span>
              <p className="text-[12.5px] text-[#0f2e1a] font-normal leading-normal">
                Compte créé avec succès ! Vous pouvez maintenant vous connecter.
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[16px]" noValidate>
            <motion.div variants={itemVariants}>
              <Input
                label="Adresse Email"
                type="email"
                placeholder="nom@exemple.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {serverError && (
                <motion.div 
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="p-3 bg-status-error/5 border border-status-error/15 rounded-[3px] text-center"
                >
                  <p className="text-[12px] font-normal leading-[1.4] text-status-error tracking-[0px]">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="mt-[8px]">
              <Button type="submit" loading={isSubmitting} className="w-full">
                Se connecter
              </Button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="text-center text-[14px] font-normal leading-[1.4] tracking-[0px] text-neutral-muted mt-[32px] pt-[24px] border-t border-neutral-border/50">
            Nouveau sur le réseau ?{' '}
            <Link href="/register" className="text-cta hover:underline font-bold">
              Créer un compte
            </Link>
          </motion.p>
        </div>
      </motion.div>
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
