'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  FlaskConical, MessageSquare, Search, Activity, Pill,
  Dna, FileText, Settings, LogOut, Menu, X, ChevronRight, Home,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',            icon: Home,          label: 'Home' },
  { href: '/dashboard/chat',       icon: MessageSquare, label: 'Research Chat' },
  { href: '/dashboard/molecules',  icon: FlaskConical,  label: 'Molecules' },
  { href: '/dashboard/interactions', icon: Activity,    label: 'Interactions' },
  { href: '/dashboard/trials',     icon: Search,        label: 'Clinical Trials' },
  { href: '/dashboard/proteins',   icon: Dna,           label: 'Proteins' },
  { href: '/dashboard/reports',    icon: FileText,      label: 'Reports' },
]

interface Props {
  children: React.ReactNode
  user: User
}

export default function DashboardShell({ children, user }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Researcher'
  const avatar = user.user_metadata?.avatar_url

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-60 bg-black border-r border-white/10
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4 text-black" />
          </div>
          <span className="text-white text-lg font-bold tracking-tight" style={{ fontStyle: 'italic' }}>MAID</span>
          <button className="ml-auto md:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white text-black font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-3 space-y-0.5">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
          <div className="flex items-center gap-3 px-3 pt-3 mt-1 border-t border-white/10">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={displayName} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {displayName[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{displayName}</p>
              <p className="text-white/30 text-[10px] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm" style={{ fontStyle: 'italic' }}>MAID</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
