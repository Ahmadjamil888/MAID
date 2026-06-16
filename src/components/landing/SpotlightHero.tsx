'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const BG_IMAGE_1 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85'
const BG_IMAGE_2 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85'
const SPOTLIGHT_R = 260

function RevealLayer({ image, cursorX, cursorY }: { image: string; cursorX: number; cursorY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)
    return () => window.removeEventListener('resize', setSize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const reveal = revealRef.current
    if (!canvas || !reveal) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const g = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R)
    g.addColorStop(0,    'rgba(255,255,255,1)')
    g.addColorStop(0.4,  'rgba(255,255,255,1)')
    g.addColorStop(0.6,  'rgba(255,255,255,0.75)')
    g.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    g.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    g.addColorStop(1,    'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2)
    ctx.fill()

    const url = canvas.toDataURL()
    reveal.style.maskImage = `url(${url})`
    reveal.style.webkitMaskImage = `url(${url})`
    reveal.style.maskSize = '100% 100%'
  }, [cursorX, cursorY])

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />
      <div
        ref={revealRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url(${image})`, zIndex: 30 }}
      />
    </>
  )
}

export default function SpotlightHero() {
  const mouseRef  = useRef({ x: -999, y: -999 })
  const smoothRef = useRef({ x: -999, y: -999 })
  const rafRef    = useRef<number | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 })

  const animate = useCallback(() => {
    smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1
    smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1
    setCursorPos({ x: smoothRef.current.x, y: smoothRef.current.y })
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>
      {/* Layer 1 — base image z-10 */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat hero-zoom"
        style={{ backgroundImage: `url(${BG_IMAGE_1})`, zIndex: 10 }}
      />

      {/* Layer 2 — reveal spotlight z-30 */}
      <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

      {/* Layer 3 — heading z-50 */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none"
        style={{ top: '14%', zIndex: 50 }}
      >
        <h1 className="text-white" style={{ lineHeight: '0.95' }}>
          <span
            className="block font-playfair font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ fontStyle: 'italic', letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Intelligence for
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            drug discovery
          </span>
        </h1>
      </div>

      {/* Layer 4 — bottom-left text z-50 */}
      <div
        className="hidden sm:block absolute bottom-14 max-w-[260px] hero-anim hero-fade"
        style={{ left: 'clamp(2.5rem, 3.5vw, 3.5rem)', zIndex: 50, animationDelay: '0.7s' }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          MAID reads every published study, understands chemistry, proteins, and clinical evidence — then surfaces what matters for your research.
        </p>
      </div>

      {/* Layer 5 — bottom-right CTA z-50 */}
      <div
        className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto flex flex-col items-start gap-4 sm:gap-5 hero-anim hero-fade"
        style={{ zIndex: 50, animationDelay: '0.85s', right: 'clamp(2.5rem, 3.5vw, 3.5rem)', maxWidth: '260px' }}
      >
        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Search molecules, interactions, proteins, and clinical trials. Get structured research reports in seconds.
        </p>
        <a
          href="/auth/signup"
          className="bg-white hover:bg-white/90 text-black text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95"
          style={{ boxShadow: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
          Start Research
        </a>
      </div>
    </section>
  )
}
