'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-start pt-32 pb-0 px-6 overflow-hidden"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      {/* Radial glow bg */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Badge */}
      <div
        className="hero-anim hero-reveal mb-6 flex items-center gap-2 border border-white/15 rounded-full px-3.5 py-1.5 text-xs text-white/60"
        style={{ animationDelay: '0.1s' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
        Introducing MAID — Your AI Research Scientist
        <ArrowRight size={12} className="text-white/40" />
      </div>

      {/* Headline */}
      <h1
        className="hero-anim hero-reveal text-center font-semibold leading-[1.05] tracking-tight max-w-3xl"
        style={{
          animationDelay: '0.2s',
          fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
          letterSpacing: '-0.03em',
        }}
      >
        MAID is your AI researcher<br />
        for drug discovery
      </h1>

      {/* Sub */}
      <p
        className="hero-anim hero-reveal text-white/50 text-center mt-5 max-w-lg leading-relaxed"
        style={{ animationDelay: '0.35s', fontSize: '1.05rem' }}
      >
        Accelerate pharmaceutical research by handing off literature reviews,
        molecular analysis, and candidate discovery to MAID — while you focus on decisions.
      </p>

      {/* CTA buttons */}
      <div
        className="hero-anim hero-fade flex flex-col sm:flex-row items-center gap-3 mt-8"
        style={{ animationDelay: '0.5s' }}
      >
        <Link
          href="/auth/signup"
          className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Start researching for free
          <ArrowRight size={15} />
        </Link>
        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm border border-white/15 px-6 py-3 rounded-full hover:border-white/30 transition-all"
        >
          Sign in to MAID
        </Link>
      </div>

      {/* Screenshot window */}
      <div
        className="hero-anim hero-fade relative mt-14 w-full max-w-4xl"
        style={{ animationDelay: '0.65s' }}
      >
        {/* Glow under the window */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />

        {/* Browser chrome */}
        <div
          className="relative rounded-2xl overflow-hidden border border-white/10"
          style={{ background: '#0d0d0d', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]" style={{ background: '#111' }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white/5 border border-white/10 rounded-md px-4 py-1 text-white/25 text-xs w-48 text-center">
                maid.research / chat
              </div>
            </div>
          </div>

          {/* Fake app UI */}
          <div className="flex" style={{ height: '420px' }}>
            {/* Sidebar */}
            <div className="w-52 border-r border-white/[0.06] flex flex-col p-3 gap-1 shrink-0" style={{ background: '#0a0a0a' }}>
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                <div className="w-6 h-6 bg-white rounded-[4px]" />
                <span className="text-white text-xs font-semibold">MAID</span>
              </div>
              {['Research Chat', 'Molecules', 'Interactions', 'Trials', 'Proteins', 'Reports'].map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs"
                  style={{
                    background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: i === 0 ? '#fff' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-sm bg-current opacity-50" />
                  {item}
                </div>
              ))}
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]" style={{ background: '#0d0d0d' }}>
                <span className="text-white/60 text-xs">Research Chat</span>
                <div className="flex items-center gap-2">
                  <div className="text-white/25 text-[10px] border border-white/10 rounded px-2 py-0.5">Llama 3.3 70B</div>
                  <div className="text-white/25 text-[10px] border border-white/10 rounded px-2 py-0.5">General</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden p-4 space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-white/8 border border-white/10 rounded-xl rounded-tr-sm px-3 py-2 max-w-xs">
                    <p className="text-white/80 text-xs">Analyze ibuprofen — mechanism of action, side effects, and suggest analogs with better GI safety</p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-black text-[9px] font-bold">M</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-[10px]">MAID · searched 4 databases</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-white/10 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-4/5" />
                      <div className="h-2 bg-white/10 rounded w-5/6" />
                    </div>
                    <div className="border border-white/[0.06] rounded-lg p-2.5 mt-2" style={{ background: '#111' }}>
                      <p className="text-white/40 text-[10px] mb-1.5 font-medium">Analog Candidates</p>
                      <div className="space-y-1">
                        {['Celecoxib — COX-2 selective, reduced GI risk', 'Meloxicam — preferential COX-2, lower ulcerogenicity'].map(c => (
                          <div key={c} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
                            <span className="text-white/50 text-[10px]">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {['PubChem', 'ChEMBL', 'OpenFDA', 'RxNorm'].map(s => (
                        <span key={s} className="text-[9px] border border-white/10 rounded-full px-2 py-0.5 text-white/30">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-2.5" style={{ background: '#111' }}>
                  <span className="text-white/20 text-xs flex-1">Ask about any drug, molecule, or target...</span>
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <ArrowRight size={12} className="text-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
