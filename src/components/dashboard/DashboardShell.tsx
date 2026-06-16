'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  MessageSquare, Search, Activity, Dna, FileText,
  Settings, LogOut, Menu, X, FlaskConical, Home,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',              icon: Home,          label: 'Home' },
  { href: '/dashboard/chat',         icon: MessageSquare, label: 'Research Chat' },
  { href: '/dashboard/molecules',    icon: FlaskConical,  label: 'Molecules' },
  { href: '/dashboard/interactions', icon: Activity,      label: 'Interactions' },
  { href: '/dashboard/trials',       icon: Search,        label: 'Clinical Trials' },
  { href: '/dashboard/proteins',     icon: Dna,           label: 'Proteins' },
  { href: '/dashboard/reports',      icon: FileText,      label: 'Reports' },
]

// ── Sidebar rendered OUTSIDE of DashboardShell so it never remounts ──
interface SidebarProps {
  pathname: string
  user: User
  onClose?: () => void
  onSignOut: () => void
}

function SidebarContent({ pathname, user, onClose, onSignOut }: SidebarProps) {
  const name   = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Researcher'
  const avatar = user.user_metadata?.avatar_url as string | undefined

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#111', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo row */}
      <div
        className="flex items-center gap-2.5 px-4 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Image
          src="/logo.png"
          alt="MAID"
          width={34}
          height={34}
          className="rounded-lg shrink-0"
          style={{ objectFit: 'contain' }}
        />
        <span className="text-white font-semibold text-sm tracking-tight">MAID</span>
        {onClose && (
          <button
            className="ml-auto"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
              style={{
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color:      active ? '#fff'                  : 'rgba(255,255,255,0.45)',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'
                }
              }}
            >
              <Icon size={15} className="shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div
        className="p-2 space-y-0.5 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
          style={{ color: 'rgba(255,255,255,0.4)', transition: 'background 0.15s, color 0.15s' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          <Settings size={15} />
          <span>Settings</span>
        </Link>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
          style={{ color: 'rgba(255,255,255,0.4)', transition: 'background 0.15s, color 0.15s' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'
            ;(e.currentTarget as HTMLElement).style.color = '#f87171'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>

        {/* User chip */}
        <div
          className="flex items-center gap-2.5 px-3 pt-3 pb-2 mt-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="w-7 h-7 rounded-full shrink-0" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              {name[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{name}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main shell ──────────────────────────────────────────────────────────────
interface Props { children: React.ReactNode; user: User }

export default function DashboardShell({ children, user }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function signOut() {
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d0d0d' }}>

      {/* ── Desktop sidebar (always mounted) ── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0">
        <SidebarContent
          pathname={pathname}
          user={user}
          onSignOut={signOut}
        />
      </aside>

      {/* ── Mobile sidebar: backdrop + slide-in panel ── */}
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'all' : 'none',
          transition: 'opacity 0.25s ease',
        }}
        onClick={() => setMobileOpen(false)}
      />
      {/* Panel */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-56 md:hidden"
        style={{
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.32,0.72,0,1)',
          willChange: 'transform',
        }}
      >
        <SidebarContent
          pathname={pathname}
          user={user}
          onClose={() => setMobileOpen(false)}
          onSignOut={signOut}
        />
      </aside>

      {/* ── Main content area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{ color: 'rgba(255,255,255,0.5)' }}
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          <Image
            src="/logo.png"
            alt="MAID"
            width={28}
            height={28}
            className="rounded-md"
            style={{ objectFit: 'contain' }}
          />
          <span className="text-white text-sm font-semibold">MAID</span>
        </div>

        {/* Page content — full remaining height, scrolling handled per-page */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
