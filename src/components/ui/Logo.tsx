'use client'

import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  showText?: boolean
  light?: boolean
  filter?: boolean
}

export default function Logo({ 
  className = '', 
  width = 120, 
  height = 40, 
  showText = true,
  light = false,
  filter = false
}: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 transition-opacity hover:opacity-90 ${className}`}>
      <div 
        className="relative flex-shrink-0" 
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image
          src="/image.png"
          alt="Tram Pay Logo"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-contain ${filter ? 'brightness-0 invert' : ''}`}
          priority
        />
      </div>
      {showText && (
        <span className={`text-[16px] font-bold tracking-tight whitespace-nowrap ${light ? 'text-white' : 'text-brand-dark'}`}>
          Tram Pay
        </span>
      )}
    </Link>
  )
}
