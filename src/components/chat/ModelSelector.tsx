'use client'

import { GROQ_MODELS, type GroqModelId } from '@/lib/groq/client'
import { Zap } from 'lucide-react'

interface Props {
  value: GroqModelId
  onChange: (v: GroqModelId) => void
}

export default function ModelSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Zap className="w-3.5 h-3.5 text-white/30" />
      <select
        value={value}
        onChange={e => onChange(e.target.value as GroqModelId)}
        className="bg-transparent text-white/60 text-xs border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-white/25 hover:border-white/20 transition-colors appearance-none cursor-pointer"
      >
        {Object.entries(GROQ_MODELS).map(([id, label]) => (
          <option key={id} value={id} className="bg-black text-white">{label}</option>
        ))}
      </select>
    </div>
  )
}
