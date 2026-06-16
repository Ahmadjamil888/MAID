import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section
      id="pricing"
      className="py-32 px-6 border-t border-white/[0.06] relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04) 0%, transparent 70%)' }}
      />

      <div className="max-w-3xl mx-auto text-center relative">
        <p className="text-white/30 text-xs font-medium uppercase tracking-widest mb-6">Get started today</p>
        <h2
          className="text-white font-semibold leading-tight mb-5"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.03em' }}
        >
          Your AI research scientist<br />
          is ready to work
        </h2>
        <p className="text-white/45 leading-relaxed mb-10 max-w-lg mx-auto" style={{ fontSize: '1rem' }}>
          Join researchers, pharmacists, and drug discovery teams using MAID to compress
          months of literature review and molecular analysis into a single conversation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/auth/signup"
            className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start for free
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm px-7 py-3.5 rounded-full transition-all"
          >
            Sign in to MAID
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 border-t border-white/[0.06] pt-10">
          {[
            { stat: '8', label: 'databases searched per query' },
            { stat: '< 30s', label: 'average research report time' },
            { stat: '5', label: 'Groq models to choose from' },
          ].map(s => (
            <div key={s.stat} className="text-center">
              <p className="text-white text-2xl font-light mb-1">{s.stat}</p>
              <p className="text-white/30 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
