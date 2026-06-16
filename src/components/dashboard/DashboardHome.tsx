'use client'

import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { MessageSquare, FlaskConical, Activity, Search, Dna, ArrowRight, Clock } from 'lucide-react'

const QUICK_ACTIONS = [
  {
    icon: MessageSquare,
    title: 'Research Chat',
    desc: 'Ask anything about drugs, molecules, or targets',
    href: '/dashboard/chat',
    color: 'bg-white/10',
  },
  {
    icon: FlaskConical,
    title: 'Molecule Search',
    desc: 'Search PubChem & ChEMBL databases',
    href: '/dashboard/molecules',
    color: 'bg-white/10',
  },
  {
    icon: Activity,
    title: 'Interaction Check',
    desc: 'Check drug-drug interactions via RxNorm',
    href: '/dashboard/interactions',
    color: 'bg-white/10',
  },
  {
    icon: Search,
    title: 'Clinical Trials',
    desc: 'Search 400K+ trials on ClinicalTrials.gov',
    href: '/dashboard/trials',
    color: 'bg-white/10',
  },
  {
    icon: Dna,
    title: 'Protein Analysis',
    desc: 'Search UniProt for targets and sequences',
    href: '/dashboard/proteins',
    color: 'bg-white/10',
  },
]

const MODE_PROMPTS = [
  'Analyze the mechanism of action of ibuprofen',
  'Find clinical trials for lung cancer treatment recruiting now',
  'Check interactions between metformin, lisinopril, and aspirin',
  'What are the Lipinski properties of paclitaxel?',
  'Find proteins associated with Alzheimer\'s disease',
  'Suggest analogs of sildenafil with fewer side effects',
]

interface Props {
  user: User
  recentSessions: Array<{ id: string; title: string; tool_mode: string; updated_at: string }>
}

export default function DashboardHome({ user, recentSessions }: Props) {
  const name = user.user_metadata?.full_name?.split(' ')[0] ?? 'Researcher'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="h-full overflow-y-auto bg-black p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-white text-3xl font-light mb-1" style={{ letterSpacing: '-0.02em' }}>
            {greeting}, <span style={{ fontStyle: 'italic' }}>{name}</span>
          </h1>
          <p className="text-white/40 text-sm">What are you researching today?</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-10">
          {QUICK_ACTIONS.map(({ icon: Icon, title, desc, href }) => (
            <Link key={href} href={href} className="group border border-white/10 rounded-xl p-4 hover:border-white/25 hover:bg-white/5 transition-all">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-white text-sm font-medium mb-1">{title}</p>
              <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Suggested prompts */}
        <div className="mb-10">
          <h2 className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">Try asking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MODE_PROMPTS.map(prompt => (
              <Link
                key={prompt}
                href={`/dashboard/chat?q=${encodeURIComponent(prompt)}`}
                className="flex items-center justify-between gap-3 border border-white/10 rounded-xl px-4 py-3 hover:border-white/25 hover:bg-white/5 transition-all group"
              >
                <span className="text-white/60 text-sm group-hover:text-white transition-colors">{prompt}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <div>
            <h2 className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">Recent research</h2>
            <div className="space-y-2">
              {recentSessions.map(session => (
                <Link
                  key={session.id}
                  href={`/dashboard/chat?session=${session.id}`}
                  className="flex items-center gap-3 border border-white/10 rounded-xl px-4 py-3 hover:border-white/25 hover:bg-white/5 transition-all group"
                >
                  <Clock className="w-4 h-4 text-white/20 shrink-0" />
                  <span className="text-white/70 text-sm flex-1 truncate group-hover:text-white transition-colors">
                    {session.title}
                  </span>
                  <span className="text-white/20 text-xs shrink-0">
                    {new Date(session.updated_at).toLocaleDateString()}
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
