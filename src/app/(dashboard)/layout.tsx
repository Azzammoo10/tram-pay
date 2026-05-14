'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, LogOut, Menu, X, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [fullName, setFullName] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
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
        className="flex items-center gap-3 px-6 py-4 text-[14px] text-white
                   hover:bg-white/10 hover:border-l-[3px] hover:border-cta hover:pl-[21px]
                   transition-all duration-150"
        onClick={() => setMobileOpen(false)}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </Link>
      <Link
        href="/profile"
        className="flex items-center gap-3 px-6 py-4 text-[14px] text-white
                   hover:bg-white/10 hover:border-l-[3px] hover:border-cta hover:pl-[21px]
                   transition-all duration-150"
        onClick={() => setMobileOpen(false)}
      >
        <User size={18} />
        Profil
      </Link>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-6 py-4 text-[14px] text-white w-full text-left
                   hover:bg-white/10 hover:border-l-[3px] hover:border-cta hover:pl-[21px]
                   transition-all duration-150"
      >
        <LogOut size={18} />
        Déconnexion
      </button>
    </>
  )

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-[240px] bg-[#55356D] fixed top-0 left-0 h-full z-20">
        <div className="px-6 py-5 border-b border-white/10">
          <Logo light={true} width={100} height={30} showText={true} />
        </div>

        <nav className="flex-1 flex flex-col mt-2">{navItems}</nav>

        {fullName && (
          <div className="px-6 py-4 border-t border-white/10">
            <p className="text-[12px] text-white/70 truncate">{fullName}</p>
          </div>
        )}
      </aside>

      {/* Header mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#55356D] flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <Logo light={true} width={100} height={28} showText={true} />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-1"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside
            className="absolute top-14 left-0 w-[240px] h-[calc(100%-56px)] bg-[#55356D] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 flex flex-col mt-2">{navItems}</nav>
            {fullName && (
              <div className="px-6 py-4 border-t border-white/10">
                <p className="text-[12px] text-neutral-muted truncate">{fullName}</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-[240px] mt-14 md:mt-0 p-6 bg-surface-section min-h-screen">
        {children}
      </main>
    </div>
  )
}
