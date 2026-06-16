import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const ACTIVITY = [
  { user: 'Dr. Aisha K.', action: 'asked MAID about EGFR inhibitors', time: '2m ago', avatar: 'A' },
  { user: 'Prof. Malik R.', action: 'ran interaction check: warfarin + aspirin', time: '5m ago', avatar: 'M' },
  { user: 'Sara T.', action: 'saved 3 Phase 3 trial results', time: '11m ago', avatar: 'S' },
  { user: 'Dr. Chen W.', action: 'generated a research report on metformin', time: '18m ago', avatar: 'C' },
]

export default function FeatureCollaboration() {
  return (
    <section
      className="py-24 px-6 border-t border-white/[0.06]"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — Text */}
        <div>
          <p className="text-white/30 text-xs font-medium uppercase tracking-widest mb-5">In every tool, at every step</p>
          <h2
            className="text-white font-semibold leading-tight mb-5"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.03em' }}
          >
            MAID is present across<br />
            your entire workflow
          </h2>
          <p className="text-white/50 leading-relaxed mb-6" style={{ fontSize: '0.95rem' }}>
            Whether you&apos;re checking drug interactions in the clinic, searching trials for a grant proposal,
            or designing next-generation candidates — MAID surfaces the right data at the right moment.
          </p>
          <div className="flex flex-col gap-4 mb-8">
            {[
              { emoji: '⚗️', title: 'Interaction Checker', desc: 'Instant RxNorm-powered drug interaction checks for 2–8 drugs' },
              { emoji: '🔬', title: 'Trial Intelligence', desc: 'Search 400K+ global trials by condition, phase, or drug name' },
              { emoji: '🧬', title: 'Protein Targets', desc: 'UniProt + AlphaFold integration for target discovery' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{f.emoji}</span>
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 text-white hover:text-white/70 text-sm font-medium transition-colors group"
          >
            See all MAID features
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Right — Activity feed mockup */}
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden border border-white/10"
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
              <span className="text-white/25 text-xs ml-2">MAID · Live Activity</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
                <span className="text-white/20 text-[10px]">4 researchers online</span>
              </div>
            </div>

            <div className="p-4 space-y-0">
              {ACTIVITY.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-b-0"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs">
                      <span className="text-white font-medium">{item.user}</span>
                      {' '}{item.action}
                    </p>
                    <p className="text-white/25 text-[10px] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom: MAID response preview */}
            <div className="border-t border-white/[0.06] p-4" style={{ background: '#0a0a0a' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center">
                  <span className="text-black text-[8px] font-bold">M</span>
                </div>
                <span className="text-white/40 text-[10px]">MAID generated a report for Dr. Chen W.</span>
              </div>
              <div className="border border-white/[0.08] rounded-lg p-2.5" style={{ background: '#111' }}>
                <p className="text-white/50 text-[10px] font-semibold mb-1.5">Metformin — Research Summary</p>
                <div className="space-y-1">
                  <div className="h-1.5 bg-white/8 rounded w-full" />
                  <div className="h-1.5 bg-white/8 rounded w-10/12" />
                  <div className="h-1.5 bg-white/8 rounded w-4/5" />
                </div>
                <div className="mt-2 flex gap-1.5">
                  {['PubChem', 'OpenFDA', 'Trials'].map(s => (
                    <span key={s} className="text-[9px] border border-white/10 rounded-full px-1.5 py-0.5 text-white/25">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
