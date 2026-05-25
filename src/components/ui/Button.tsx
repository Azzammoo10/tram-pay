'use client'

import { motion, HTMLMotionProps, useReducedMotion } from 'framer-motion'

interface ButtonProps extends HTMLMotionProps<'button'> {
  loading?: boolean
  variant?: 'primary' | 'ghost'
}

export default function Button({
  loading = false,
  variant = 'primary',
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const shouldReduceMotion = useReducedMotion()
  const base = variant === 'primary' ? 'btn-cta' : 'btn-ghost'
  
  return (
    <motion.button
      whileHover={shouldReduceMotion ? {} : { scale: 1.015 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
      className={`${base} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </span>
      ) : children}
    </motion.button>
  )
}
