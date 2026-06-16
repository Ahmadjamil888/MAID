'use client'

import type { ToolMode } from '@/types'
import { FlaskConical, Activity, Search, Dna, FileText, MessageSquare, Pill, Atom } from 'lucide-react'

const MODES: { value: ToolMode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'general',           label: 'General',        icon: MessageSquare, desc: 'General pharmaceutical Q&A' },
  { value: 'drug_analysis',     label: 'Drug Analysis',  icon: Pill,          desc: 'Analyze a specific drug' },
  { value: 'molecule_search',   label: 'Molecules',      icon: FlaskConical,  desc: 'Search & compare molecules' },
  { value: 'interaction_check', label: 'Interactions',   icon: Activity,      desc: 'Check drug interactions' },
  { value: 'clinical_trials',   label: 'Trials',         icon: Search,        desc: 'Search clinical trials' },
  { value: 'protein_analysis',  label: 'Proteins',       icon: Dna,           desc: 'Protein & target analysis' },
  { value: 'drug_design',       label: 'Drug Design',    icon: Atom,          desc: 'Candidate generation' },
  { value: 'literature_review', label: 'Literature',     icon: FileText,      desc: 'Literature synthesis' },
]

interface Props {
  value: ToolMode
  onChange: (v: ToolMode) => void
}

export default function ModeSelector({ value, onChange }: Props) {
  const current = MODES.find(m => m.value === value) ?? MODES[0]
  const Icon = current.icon

  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-white/30" />
      <select
        value={value}
        onChange={e => onChange(e.target.value as ToolMode)}
        className="bg-transparent text-white/60 text-xs border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-white/25 hover:border-white/20 transition-colors appearance-none cursor-pointer"
      >
        {MODES.map(m => (
          <option key={m.value} value={m.value} className="bg-black text-white">{m.label}</option>
        ))}
      </select>
    </div>
  )
}
