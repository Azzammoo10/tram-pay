'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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

import { useReducedMotion, AnimatePresence } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
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
            x: [0, -40, 20, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-brand-purple/10 rounded-full blur-[80px]"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : {
            x: [0, 30, -50, 0],
            y: [0, -40, 40, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cta/8 rounded-full blur-[80px]"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : {
            x: [0, -60, 30, 0],
            y: [0, -30, 50, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[#55356D]/5 rounded-full blur-[70px]"
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
              Créer un Compte
            </h1>
            <p className="text-[14px] text-neutral-muted font-normal leading-[1.4] tracking-[0px] max-w-[65ch] mx-auto">
              Inscrivez-vous pour obtenir votre carte de transport virtuelle Rabat-Salé.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[16px]" noValidate>
            
            <motion.div variants={itemVariants}>
              <Input
                label="Nom complet"
                type="text"
                placeholder="Prénom Nom"
                autoComplete="name"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
            </motion.div>

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
                placeholder="•••••••• (8 caract. min)"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
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
                Créer mon compte
              </Button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="text-center text-[14px] font-normal leading-[1.4] tracking-[0px] text-neutral-muted mt-[32px] pt-[24px] border-t border-neutral-border/50">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-cta hover:underline font-bold">
              Se connecter
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
