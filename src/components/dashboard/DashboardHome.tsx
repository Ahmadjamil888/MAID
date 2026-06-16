'use client'

import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { MessageSquare, FlaskConical, Activity, Search, Dna, ArrowRight, Clock } from 'lucide-react'

const TILES = [
  { icon: MessageSquare, label: 'Research Chat',   sub: 'Ask anything',             href: '/dashboard/chat' },
  { icon: FlaskConical,  label: 'Molecules',        sub: 'PubChem search',           href: '/dashboard/molecules' },
  { icon: Activity,      label: 'Interactions',     sub: 'Drug interaction check',   href: '/dashboard/interactions' },
  { icon: Search,        label: 'Clinical Trials',  sub: 'ClinicalTrials.gov',       href: '/dashboard/trials' },
  { icon: Dna,           label: 'Proteins',         sub: 'UniProt + AlphaFold',      href: '/dashboard/proteins' },
]

const PROMPTS = [
  'Analyze the mechanism of action of ibuprofen',
  'Find recruiting Phase 3 trials for lung cancer',
  'Check interactions between metformin, lisinopril, aspirin',
  'What are the Lipinski properties of paclitaxel?',
  'Find proteins associated with Alzheimer\'s disease',
  'Suggest ibuprofen analogs with better GI safety',
]

interface Props {
  user: User
  recentSessions: Array<{ id: string; title: string; tool_mode: string; updated_at: string }>
}

export default function DashboardHome({ user, recentSessions }: Props) {
  const first = user.user_metadata?.full_name?.split(' ')[0] ?? 'Researcher'
  const h = new Date().getHours()
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="h-full overflow-y-auto px-6 py-8" style={{ background: '#0d0d0d' }}>
      <div className="max-w-4xl mx-auto">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-semibold mb-1">{greet}, {first}</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>What would you like to research today?</p>
        </div>

        {/* Quick access tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-8">
          {TILES.map(({ icon: Icon, label, sub, href }) => (
            <Link key={href} href={href}
              className="flex flex-col gap-2 p-4 rounded-xl group transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <Icon size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <div>
                <p className="text-white text-xs font-medium">{label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Suggested prompts */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Try asking MAID</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PROMPTS.map(p => (
              <Link key={p} href={`/dashboard/chat?q=${encodeURIComponent(p)}`}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm transition-all group"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <span>{p}</span>
                <ArrowRight size={13} className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Recent</p>
            <div className="space-y-1.5">
              {recentSessions.map(s => (
                <Link key={s.id} href={`/dashboard/chat?session=${s.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
                >
                  <Clock size={13} className="shrink-0 opacity-40" />
                  <span className="flex-1 truncate">{s.title}</span>
                  <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {new Date(s.updated_at).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
