'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Research', href: '#research' },
  { label: 'Databases', href: '#databases' },
  { label: 'Pricing', href: '#pricing' },
]

export default function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      {/* Blur background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md border-b border-white/[0.06]" style={{ zIndex: -1 }} />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 bg-white rounded-[6px] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="black" />
            <path d="M7 1L7 7M7 7L13 4M7 7L1 4M7 7L7 13M7 7L13 10M7 7L1 10" stroke="white" strokeWidth="0.8" />
          </svg>
        </div>
        <span className="text-white font-semibold text-base tracking-tight">MAID</span>
      </Link>

      {/* Center links — desktop */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map(l => (
          <a
            key={l.label}
            href={l.href}
            className="text-white/50 hover:text-white text-sm px-4 py-1.5 rounded-full hover:bg-white/5 transition-all"
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* Right CTA — desktop */}
      <div className="hidden md:flex items-center gap-3 shrink-0">
        <Link
          href="/auth/login"
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/90 transition-colors"
        >
          Get started
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white/60 hover:text-white p-1 transition-colors"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-black border-t border-white/[0.06] p-4 flex flex-col gap-1 md:hidden">
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="text-white/60 text-sm py-2 px-3 rounded-lg hover:bg-white/5 hover:text-white transition-all">
              {l.label}
            </a>
          ))}
          <div className="border-t border-white/[0.06] mt-2 pt-3 flex flex-col gap-2">
            <Link href="/auth/login" className="text-white/60 text-sm py-2 px-3">Sign in</Link>
            <Link href="/auth/signup" className="bg-white text-black text-sm font-semibold py-2.5 px-4 rounded-full text-center">
              Get started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
