'use client'

import Link from 'next/link'
import { MailOpen } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import Logo from '@/components/ui/Logo'

export default function VerifyPage() {
  const shouldReduceMotion = useReducedMotion()

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

  return (
    <div className="min-h-screen bg-surface-section flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow matching Rabat-Salé style */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cta/5 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[400px] z-10"
      >
        <div className="card-accent bg-white p-8 text-center backdrop-blur-md bg-white/90 border border-neutral-border/40">
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-[24px]">
            <Logo className="mb-4" showText={true} width={130} height={42} />
            <div className="h-[1px] w-12 bg-neutral-border my-2" />
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center mb-[24px]">
            <div className="w-16 h-16 bg-[#55356D]/5 border border-[#55356D]/15 rounded-full flex items-center justify-center text-[#55356D]">
              <MailOpen size={30} />
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="text-[22px] sm:text-[28px] font-bold text-brand-dark leading-[1.2] tracking-[0px] mb-[15px]"
          >
            Vérifiez votre email
          </motion.h1>

          <motion.p 
            variants={itemVariants} 
            className="text-[14px] text-neutral-muted font-normal leading-[1.4] tracking-[0px] max-w-[65ch] mb-[32px] mx-auto"
          >
            Un lien de confirmation sécurisé a été envoyé à votre adresse e-mail. Veuillez cliquer sur ce lien pour activer votre compte.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href="/login"
              className="text-[14px] text-cta hover:underline font-bold tracking-[0px]"
            >
              ← Retour à la connexion
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
