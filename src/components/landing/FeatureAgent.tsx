import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function FeatureAgent() {
  return (
    <section
      id="features"
      className="py-24 px-6"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — Text */}
        <div>
          <p className="text-white/30 text-xs font-medium uppercase tracking-widest mb-5">Research Agent</p>
          <h2
            className="text-white font-semibold leading-tight mb-5"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.03em' }}
          >
            Agents turn ideas into<br />
            scientific insights
          </h2>
          <p className="text-white/50 leading-relaxed mb-6" style={{ fontSize: '0.95rem' }}>
            Accelerate discovery by handing off research tasks to MAID, while you focus on
            making decisions. MAID queries every relevant database in parallel and synthesizes
            a structured scientific report.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 text-white hover:text-white/70 text-sm font-medium transition-colors group"
          >
            Start your first research session
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Right — UI mockup */}
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: '#0d0d0d',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]" style={{ background: '#111' }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#333' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#333' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#333' }} />
              </div>
              <span className="text-white/25 text-xs ml-2">MAID Research Chat</span>
            </div>

            <div className="flex" style={{ height: '340px' }}>
              {/* Sidebar */}
              <div className="w-44 border-r border-white/[0.06] p-2.5 space-y-0.5 shrink-0" style={{ background: '#0a0a0a' }}>
                <div className="text-white/20 text-[10px] px-2 pt-1 pb-2 uppercase tracking-wider">Sessions</div>
                {[
                  'Ibuprofen analysis',
                  'BRCA1 protein study',
                  'COVID antiviral trial',
                  'Metformin interactions',
                ].map((s, i) => (
                  <div
                    key={s}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] truncate"
                    style={{
                      background: i === 0 ? 'rgba(255,255,255,0.07)' : 'transparent',
                      color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>

              {/* Chat */}
              <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
                {/* Tool call indicator */}
                <div className="flex items-center gap-2 text-[10px] text-white/30 border border-white/[0.06] rounded-lg px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400/60 animate-pulse" />
                  Searching PubChem, ChEMBL, OpenFDA, RxNorm...
                </div>

                {/* AI message */}
                <div className="flex gap-2">
                  <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center shrink-0">
                    <span className="text-black text-[8px] font-bold">M</span>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-1.5 bg-white/10 rounded w-full" />
                    <div className="h-1.5 bg-white/10 rounded w-11/12" />
                    <div className="h-1.5 bg-white/10 rounded w-4/5" />
                    <div className="h-1.5 bg-white/10 rounded w-full" />
                    <div className="h-1.5 bg-white/10 rounded w-3/4" />
                  </div>
                </div>

                {/* Result card */}
                <div className="border border-white/[0.08] rounded-xl p-3 ml-7" style={{ background: '#111' }}>
                  <div className="text-white/50 text-[10px] font-semibold mb-2">## Mechanism of Action</div>
                  <div className="space-y-1">
                    <div className="h-1.5 bg-white/8 rounded w-full" />
                    <div className="h-1.5 bg-white/8 rounded w-5/6" />
                    <div className="h-1.5 bg-white/8 rounded w-full" />
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/[0.06]">
                    <div className="flex gap-1.5">
                      {['PubChem', 'ChEMBL', 'FDA'].map(s => (
                        <span key={s} className="text-[9px] border border-white/10 rounded-full px-1.5 py-0.5 text-white/25">{s}</span>
                      ))}
                    </div>
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
