'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { LayoutDashboard, LogOut, Menu, X, User, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'

function maskEmail(emailStr: string | null): string {
  if (!emailStr) return ''
  const [local, domain] = emailStr.split('@')
  if (!domain) return emailStr
  if (local.length <= 3) return `***@${domain}`
  return `${local.slice(0, 1)}***${local.slice(-1)}@${domain}`
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  
  const [fullName, setFullName] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      // Avatar gate: if no avatar set, redirect to profile setup.
      if (!user.user_metadata?.avatar) {
        window.location.href = '/setup-profile'
        return
      }

      setEmail(user.email ?? null)

      supabase
        .from('profiles')
        .select('full_name, avatar')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setFullName(data?.full_name ?? null)
          setAvatar(data?.avatar ?? null)
        })
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const renderNavGroup = (title: string, items: { href: string; label: string; icon: any; action?: boolean }[]) => {
    return (
      <div className="space-y-[8px] mb-[20px]">
        {/* Section Label */}
        {!isCollapsed && (
          <p className="text-[11px] font-bold tracking-[0.04em] uppercase text-white/35 px-6 leading-[1.0] mb-[12px]">
            {title}
          </p>
        )}
        <div className="flex flex-col">
          {items.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            const linkClass = `relative flex items-center transition-all duration-200 border-l-[3px] py-3.5 ${
              isCollapsed ? 'justify-center px-0' : 'px-6'
            } ${
              isActive
                ? 'bg-cta/10 text-cta border-cta font-bold'
                : 'text-white/75 border-transparent hover:bg-white/5 hover:text-white'
            }`

            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={handleSignOut}
                  className={`${linkClass} w-full text-left cursor-pointer focus:outline-none`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-[14px] font-normal leading-[1.0] pl-[15px] tracking-[0px]">
                      {item.label}
                    </span>
                  )}
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active indicator sliding animation */}
                {isActive && !shouldReduceMotion && (
                  <motion.div
                    layoutId="activeBorder"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-cta"
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  />
                )}
                <Icon size={18} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-[14px] leading-[1.0] pl-[15px] tracking-[0px]">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  const voyageurItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/profile', label: 'Profil Voyageur', icon: User },
  ]

  const sessionItems = [
    { href: '#', label: 'Déconnexion', icon: LogOut, action: true },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop/tablet */}
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="hidden md:flex flex-col bg-[#1A0E03] border-r border-[#E1E8ED]/10 fixed top-0 left-0 h-full z-20 overflow-x-hidden"
      >
        {/* Brand identity block */}
        <div className={`px-6 py-[24px] border-b border-white/10 flex items-center justify-between min-h-[85px]`}>
          {!isCollapsed ? (
            <div className="flex flex-col gap-2 justify-center">
              <Logo light={true} width={110} height={32} showText={true} />
              <span className="text-[9px] uppercase font-bold tracking-[0.04em] text-white/35 block leading-[1.0]">
                Système de Billetterie Numérique
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Logo light={true} width={32} height={32} showText={false} />
            </div>
          )}
        </div>

        {/* Navigation panel */}
        <nav className="flex-1 flex flex-col pt-[24px]">
          {renderNavGroup('Voyageur', voyageurItems)}
          {renderNavGroup('Session', sessionItems)}
        </nav>

        {/* Collapsible toggle trigger for tablet/desktop */}
        <div className="px-4 py-2 border-t border-white/5 flex justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-white/50 hover:text-cta bg-white/5 hover:bg-white/10 rounded-[3px] transition-all cursor-pointer focus:outline-none"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Bottom Profile card panel */}
        {fullName && (
          <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner relative">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Profile avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={14} className="text-white/40" />
                )}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[13px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-white/40 font-mono truncate leading-none mt-1">
                    {maskEmail(email)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.aside>

      {/* Header mobile layout */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-[56px] bg-[#1A0E03] border-b border-white/10 flex items-center justify-between px-4 z-20">
        <Logo light={true} width={100} height={28} showText={true} />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-1 cursor-pointer focus:outline-none"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile drawer layout */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-30">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute top-0 left-0 w-[245px] h-full bg-[#1A0E03] flex flex-col shadow-2xl z-40 border-r border-white/10"
            >
              {/* Header */}
              <div className="px-6 py-[24px] border-b border-white/10 flex items-center justify-between min-h-[85px]">
                <div className="flex flex-col gap-2 justify-center">
                  <Logo light={true} width={110} height={32} showText={true} />
                  <span className="text-[9px] uppercase font-bold tracking-[0.04em] text-white/35 block leading-[1.0]">
                    Système de Billetterie Numérique
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-white p-1 cursor-pointer focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Group list */}
              <nav className="flex-1 flex flex-col pt-[24px] overflow-y-auto">
                {renderNavGroup('Voyageur', voyageurItems)}
                {renderNavGroup('Session', sessionItems)}
              </nav>

              {/* Bottom profile display */}
              {fullName && (
                <div className="p-4 border-t border-white/10 bg-black/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt="Profile avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-white/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[13px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                      {fullName}
                    </p>
                    <p className="text-[11px] text-white/40 font-mono truncate leading-none mt-1">
                      {maskEmail(email)}
                    </p>
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main viewport area */}
      <main className="flex-1 md:pl-[240px] mt-[56px] md:mt-0 p-4 md:p-8 bg-surface-section min-h-screen overflow-x-hidden transition-all duration-300 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
