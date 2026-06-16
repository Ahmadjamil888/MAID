'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Features',  href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Databases', href: '#databases' },
  { label: 'Pricing',   href: '#pricing' },
]

function scrollTo(id: string) {
  const el = document.getElementById(id.replace('#', ''))
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 py-3.5"
      style={{
        background: scrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition: 'background 0.3s, backdrop-filter 0.3s, border-color 0.3s',
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <Image
          src="/logo.png"
          alt="MAID"
          width={48}
          height={48}
          className="rounded-xl"
          style={{ objectFit: 'contain' }}
        />
        <span
          className="text-white font-semibold text-lg tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
        >
          MAID
        </span>
      </Link>

      {/* Center pill — desktop */}
      <div
        className="hidden md:flex items-center gap-0.5 px-1.5 py-1.5 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item.label}
            onClick={() => { scrollTo(item.href); setActive(i) }}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: active === i ? '#fff' : 'transparent',
              color: active === i ? '#111' : 'rgba(255,255,255,0.75)',
            }}
            onMouseEnter={e => {
              if (active !== i) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'
                ;(e.currentTarget as HTMLElement).style.color = '#fff'
              }
            }}
            onMouseLeave={e => {
              if (active !== i) {
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'
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
          style={{ color: 'rgba(255,255,255,0.65)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-full transition-all hover:bg-gray-100"
        >
          Get started
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-1.5 rounded-lg transition-colors"
        style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)' }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="absolute top-full left-4 right-4 rounded-2xl p-4 flex flex-col gap-1 md:hidden mt-2"
          style={{
            background: 'rgba(10,10,10,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.label}
              onClick={() => { scrollTo(item.href); setMobileOpen(false); setActive(i) }}
              className="text-left py-2.5 px-3 text-sm rounded-xl transition-colors"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e => { ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; ;(e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { ;(e.currentTarget as HTMLElement).style.background = 'transparent'; ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)' }}
            >
              {item.label}
            </button>
          ))}
          <div className="h-px my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <Link href="/auth/login" onClick={() => setMobileOpen(false)}
            className="py-2.5 px-3 text-sm rounded-xl transition-colors"
            style={{ color: 'rgba(255,255,255,0.65)' }}>
            Sign in
          </Link>
          <Link href="/auth/signup" onClick={() => setMobileOpen(false)}
            className="bg-white text-black text-sm font-semibold py-2.5 px-4 rounded-xl text-center mt-1">
            Get started
          </Link>
        </div>
      )}
    </nav>
  )
}
