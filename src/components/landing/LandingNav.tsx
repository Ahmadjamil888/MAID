'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { PillLogo } from '@/components/dashboard/DashboardShell'

const NAV_ITEMS = [
  { label: 'Features',      href: 'features' },
  { label: 'How it Works',  href: 'how-it-works' },
  { label: 'Databases',     href: 'databases' },
  { label: 'Pricing',       href: 'pricing' },
]

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LandingNav() {
  const [open, setOpen]       = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [active, setActive]   = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Progressive opacity: 0 → 1 over the first 120px of scroll
  const prog    = Math.min(scrollY / 120, 1)
  const bgAlpha = (0.88 * prog).toFixed(3)
  const blur    = Math.round(prog * 18)

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 py-3.5"
        style={{
          background: `rgba(17,17,16,${bgAlpha})`,
          backdropFilter: blur > 0 ? `blur(${blur}px)` : 'none',
          WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : 'none',
          borderBottom: prog > 0.5
            ? `1px solid rgba(255,255,255,${(0.07 * prog).toFixed(3)})`
            : 'none',
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <PillLogo size={36} />
          <span
            className="text-white font-semibold text-lg tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
          >
            MAID
          </span>
        </Link>

        {/* Center pill — desktop only */}
        <div
          className="hidden md:flex items-center gap-0.5 px-1.5 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.label}
              onClick={() => { scrollTo(item.href); setActive(i) }}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: active === i ? '#fff' : 'transparent',
                color:      active === i ? '#111' : 'rgba(255,255,255,0.72)',
              }}
              onMouseEnter={e => {
                if (active !== i) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'
                  ;(e.currentTarget as HTMLElement).style.color = '#fff'
                }
              }}
              onMouseLeave={e => {
                if (active !== i) {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.72)'
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/auth/login"
            className="text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            Get started
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)' }}
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </nav>

      {/* ── Mobile drawer — slides in from RIGHT ── */}
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[110] md:hidden"
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.28s ease',
        }}
        onClick={() => setOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[120] md:hidden flex flex-col"
        style={{
          width: '72vw',
          maxWidth: '300px',
          background: '#18170f',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2.5">
            <PillLogo size={28} />
            <span
              className="text-white font-semibold"
              style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic' }}
            >
              MAID
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)' }}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.label}
              onClick={() => { scrollTo(item.href); setOpen(false); setActive(i) }}
              className="w-full text-left py-3 px-4 text-sm rounded-xl transition-all"
              style={{
                color: active === i ? '#fff' : 'rgba(255,255,255,0.6)',
                background: active === i ? 'rgba(255,255,255,0.08)' : 'transparent',
                fontWeight: active === i ? 600 : 400,
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* CTA buttons at bottom */}
        <div
          className="px-4 py-5 space-y-2.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="block w-full text-center py-3 px-4 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            onClick={() => setOpen(false)}
            className="block w-full text-center py-3 px-4 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </>
  )
}
