'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, LogOut, Menu, X, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [fullName, setFullName] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      // Avatar gate: if no avatar set, redirect to profile setup.
      // Done client-side to avoid stale-JWT issues in the server proxy.
      if (!user.user_metadata?.avatar) {
        window.location.href = '/setup-profile'
        return
      }

      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setFullName(data?.full_name ?? null))
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = (
    <>
      <Link
        href="/dashboard"
        className={`flex items-center gap-3 px-6 py-4 text-[14px] transition-all duration-200 border-l-[3px] ${
          pathname === '/dashboard'
            ? 'bg-white/10 text-cta border-cta font-bold pl-[21px]'
            : 'text-white/80 border-transparent hover:bg-white/5 hover:text-white'
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </Link>
      <Link
        href="/profile"
        className={`flex items-center gap-3 px-6 py-4 text-[14px] transition-all duration-200 border-l-[3px] ${
          pathname === '/profile'
            ? 'bg-white/10 text-cta border-cta font-bold pl-[21px]'
            : 'text-white/80 border-transparent hover:bg-white/5 hover:text-white'
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <User size={18} />
        Mon Profil
      </Link>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-6 py-4 text-[14px] text-white/80 w-full text-left
                   border-l-[3px] border-transparent hover:bg-white/5 hover:text-white
                   transition-all duration-200 cursor-pointer"
      >
        <LogOut size={18} />
        Déconnexion
      </button>
    </>
  )

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-[240px] bg-[#1A0E03] border-r border-[#E1E8ED]/10 fixed top-0 left-0 h-full z-20">
        <div className="px-6 py-6 border-b border-white/5">
          <Logo light={true} width={110} height={32} showText={true} />
        </div>

        <nav className="flex-1 flex flex-col mt-4">{navItems}</nav>

        {fullName && (
          <div className="px-6 py-4 border-t border-white/5 bg-black/10">
            <p className="text-[11px] text-white/50 uppercase tracking-widest leading-none mb-1.5">Connecté en tant que</p>
            <p className="text-[13px] font-bold text-cta truncate leading-tight">{fullName}</p>
          </div>
        )}
      </aside>

      {/* Header mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#1A0E03] border-b border-white/5 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <Logo light={true} width={100} height={28} showText={true} />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-1 cursor-pointer"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <aside
            className="absolute top-14 left-0 w-[240px] h-[calc(100%-56px)] bg-[#1A0E03] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 flex flex-col mt-4">{navItems}</nav>
            {fullName && (
              <div className="px-6 py-4 border-t border-white/5 bg-black/10">
                <p className="text-[11px] text-white/50 uppercase tracking-widest leading-none mb-1.5">Connecté en tant que</p>
                <p className="text-[13px] font-bold text-cta truncate leading-tight">{fullName}</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-[240px] mt-14 md:mt-0 p-4 md:p-8 bg-surface-section min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
