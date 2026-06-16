import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function FeatureAutonomous() {
  return (
    <section
      id="research"
      className="py-24 px-6 border-t border-white/[0.06]"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — Molecule UI mockup */}
        <div className="order-2 lg:order-1 relative">
          {/* Subtle glow */}
          <div
            className="absolute inset-0 rounded-2xl blur-2xl pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          />
          <div
            className="relative rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: '#0d0d0d',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]" style={{ background: '#111' }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#333' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#333' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#333' }} />
              </div>
              <span className="text-white/25 text-xs ml-2">MAID Molecule Analysis</span>
            </div>

            <div className="p-5 space-y-4" style={{ height: '340px', overflowY: 'hidden' }}>
              {/* Search bar */}
              <div className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-2.5" style={{ background: '#111' }}>
                <div className="w-3.5 h-3.5 rounded-sm bg-white/15" />
                <span className="text-white/25 text-xs">ibuprofen</span>
              </div>

              {/* Compound card */}
              <div className="border border-white/10 rounded-xl p-4" style={{ background: '#0a0a0a' }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-white text-sm font-medium">Ibuprofen</p>
                    <p className="text-white/35 text-xs">C₁₃H₁₈O₂ · MW 206.28</p>
                  </div>
                  {/* Fake molecule structure */}
                  <div
                    className="w-20 h-16 rounded-lg flex items-center justify-center"
                    style={{ background: '#fff' }}
                  >
                    <svg width="60" height="45" viewBox="0 0 60 45" fill="none">
                      <line x1="10" y1="22" x2="20" y2="10" stroke="#333" strokeWidth="1.5" />
                      <line x1="20" y1="10" x2="32" y2="10" stroke="#333" strokeWidth="1.5" />
                      <line x1="32" y1="10" x2="42" y2="22" stroke="#333" strokeWidth="1.5" />
                      <line x1="42" y1="22" x2="32" y2="34" stroke="#333" strokeWidth="1.5" />
                      <line x1="32" y1="34" x2="20" y2="34" stroke="#333" strokeWidth="1.5" />
                      <line x1="20" y1="34" x2="10" y2="22" stroke="#333" strokeWidth="1.5" />
                      <line x1="42" y1="22" x2="52" y2="22" stroke="#333" strokeWidth="1.5" />
                      <circle cx="52" cy="22" r="3" fill="#e44" />
                      <circle cx="10" cy="22" r="2.5" fill="#44e" />
                    </svg>
                  </div>
                </div>

                {/* Lipinski */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { k: 'MW',   v: '206', pass: true },
                    { k: 'LogP', v: '3.9', pass: true },
                    { k: 'HBD',  v: '1',   pass: true },
                    { k: 'HBA',  v: '2',   pass: true },
                  ].map(item => (
                    <div
                      key={item.k}
                      className="rounded-lg p-1.5 text-center"
                      style={{
                        background: item.pass ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
                        border: `1px solid ${item.pass ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}`,
                      }}
                    >
                      <p className="text-white/30 text-[9px]">{item.k}</p>
                      <p className="text-white/80 text-[10px] font-semibold">{item.v}</p>
                      <p className={`text-[8px] ${item.pass ? 'text-green-400/60' : 'text-red-400/60'}`}>✓</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar compounds */}
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2">Similar Compounds</p>
                <div className="space-y-1.5">
                  {['Naproxen · C₁₄H₁₄O₃', 'Ketoprofen · C₁₆H₁₄O₃', 'Flurbiprofen · C₁₅H₁₃FO₂'].map(c => (
                    <div key={c} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/[0.06]" style={{ background: '#111' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                      <span className="text-white/45 text-[10px]">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Text */}
        <div className="order-1 lg:order-2">
          <p className="text-white/30 text-xs font-medium uppercase tracking-widest mb-5">Molecular Intelligence</p>
          <h2
            className="text-white font-semibold leading-tight mb-5"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.03em' }}
          >
            Works autonomously,<br />
            thinks in molecules
          </h2>
          <p className="text-white/50 leading-relaxed mb-6" style={{ fontSize: '0.95rem' }}>
            MAID can analyze molecular structure, compute Lipinski drug-likeness, predict ADMET properties,
            and surface structurally similar compounds — then review the results with you.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 text-white hover:text-white/70 text-sm font-medium transition-colors group"
          >
            Explore molecule search
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
