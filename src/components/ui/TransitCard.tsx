'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard } from 'lucide-react'
import Badge from './Badge'

interface TransitCardProps {
  cardToken: string | null
  userName: string
  status?: string
}

export default function TransitCard({
  cardToken,
  userName,
  status = 'ACTIVE',
}: TransitCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const xc = rect.width / 2
    const yc = rect.height / 2

    // Calculates tilt (max 10 degrees)
    const rotateX = -(y - yc) / 12
    const rotateY = (x - xc) / 12

    const shineX = (x / rect.width) * 100
    const shineY = (y / rect.height) * 100

    setTilt({ x: rotateX, y: rotateY, shineX, shineY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 50 })
    setIsHovered(false)
  }

  // Format Card Number (RS TR XXXX XXXX)
  const formattedToken = cardToken 
    ? `RS TR ${cardToken.replace(/[^a-zA-Z0-9]/g, '').slice(-8).match(/.{1,4}/g)?.join(' ') || '••••'}`
    : 'RS TR •••• ••••'

  return (
    <div 
      className="w-full flex justify-center py-2"
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className="relative aspect-[1.586/1] w-full max-w-[320px] rounded-[3px] bg-gradient-to-br from-[#1A0E03] via-[#3B1F4F] to-[#55356D] p-5 text-white overflow-hidden select-none border border-[#EA3D8F]/25 shadow-[0_12px_28px_rgba(26,14,3,0.3)] cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Real-time gloss reflection overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-color-dodge transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255,255,255,0.7) 0%, transparent 60%)`
          }}
        />

        {/* Geometric curve backgrounds */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        {/* Glowing holographic ambient blur */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-[#EA3D8F]/15 to-[#55356D]/15 rounded-full filter blur-xl pointer-events-none" />

        <div className="h-full flex flex-col justify-between relative z-10" style={{ transform: 'translateZ(25px)' }}>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="text-left">
              <span className="text-[8px] uppercase font-bold tracking-widest text-[#AC6899] block leading-none">Rabat-Salé Tramway</span>
              <span className="text-[12px] font-bold text-white/95 mt-1 block">Carte MIFARE Classic</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Status Badge */}
              {status.toUpperCase() === 'ACTIVE' ? (
                <Badge variant="success" className="bg-[#10B981]/15 border border-[#10B981]/25 text-[#10B981] text-[8px] font-bold tracking-wider px-2 py-0.5">ACTIF</Badge>
              ) : status.toUpperCase() === 'BLOCKED' ? (
                <Badge variant="error" className="bg-[#CF2E2E]/15 border border-[#CF2E2E]/25 text-[#CF2E2E] text-[8px] font-bold tracking-wider px-2 py-0.5">BLOQUÉE</Badge>
              ) : (
                <Badge variant="warning" className="bg-[#F5AB32]/15 border border-[#F5AB32]/25 text-[#F5AB32] text-[8px] font-bold tracking-wider px-2 py-0.5">EXPIRÉE</Badge>
              )}
            </div>
          </div>

          {/* Golden Smart Chip & NFC Symbol */}
          <div className="flex items-center justify-between my-1">
            {/* Highly detailed golden-plated chip */}
            <div className="w-8.5 h-6.5 bg-gradient-to-br from-[#FCD34D] via-[#F59E0B] to-[#D97706] rounded-[3px] border border-[#F59E0B]/50 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.15)] flex-shrink-0">
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px] opacity-40 p-[1px]">
                <div className="border-r border-b border-black/30" />
                <div className="border-r border-b border-black/30" />
                <div className="border-b border-black/30" />
                <div className="border-r border-b border-black/30" />
                <div className="border-r border-b border-black/30" />
                <div className="border-b border-black/30" />
                <div className="border-r border-black/30" />
                <div className="border-r border-black/30" />
                <div className="border-transparent" />
              </div>
            </div>

            {/* Standard NFC waves logo */}
            <div className="text-white/40 flex items-center justify-center pr-1 flex-shrink-0">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 8a9 9 0 0 1 0 8M8 5a13 13 0 0 1 0 14M11 2a17 17 0 0 1 0 20M2 11h.01"/>
              </svg>
            </div>
          </div>

          {/* Stamped Embossed Card Number */}
          <div className="text-left my-1">
            <span 
              className="text-[14px] font-mono tracking-[2px] font-bold text-white block select-all drop-shadow-[0.5px_0.5px_0.2px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: 'monospace' }}
            >
              {formattedToken}
            </span>
          </div>

          {/* Footer: Card holder name & operators */}
          <div className="flex justify-between items-end mt-1">
            <div className="text-left max-w-[160px] min-w-0">
              <span className="text-[7px] text-[#AC6899] uppercase tracking-widest font-bold block mb-0.5 leading-none">Titulaire</span>
              <span 
                className="text-[11px] font-bold uppercase tracking-wider text-white/90 truncate block drop-shadow-[0.5px_0.5px_0.2px_rgba(0,0,0,0.85)] leading-tight"
                title={userName}
              >
                {userName}
              </span>
            </div>
            
            {/* Holographic Security Overlay circle */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EA3D8F]/20 via-white/10 to-[#55356D]/20 border border-white/10 flex items-center justify-center relative shadow-inner overflow-hidden flex-shrink-0">
              <CreditCard size={13} className="text-white/20 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
