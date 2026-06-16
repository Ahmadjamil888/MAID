'use client'

import { useState } from 'react'
import type { DataSource } from '@/types'
import { ExternalLink, ChevronDown, ChevronUp, Database } from 'lucide-react'

const SOURCE_COLORS: Record<string, string> = {
  pubchem:       'bg-blue-500/10 text-blue-300 border-blue-500/20',
  chembl:        'bg-purple-500/10 text-purple-300 border-purple-500/20',
  openfda:       'bg-red-500/10 text-red-300 border-red-500/20',
  clinicaltrials:'bg-green-500/10 text-green-300 border-green-500/20',
  rxnorm:        'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  uniprot:       'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  opentargets:   'bg-orange-500/10 text-orange-300 border-orange-500/20',
  pdb:           'bg-pink-500/10 text-pink-300 border-pink-500/20',
}

interface Props {
  sources: DataSource[]
  tools: string[]
}

export default function SourcesBadge({ sources, tools }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!sources.length && !tools.length) return null

  return (
    <div className="ml-10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-white/30 text-xs hover:text-white/60 transition-colors"
      >
        <Database className="w-3 h-3" />
        <span>{sources.length} source{sources.length !== 1 ? 's' : ''} · {tools.length} tool{tools.length !== 1 ? 's' : ''} used</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 flex flex-wrap gap-2">
          {sources.map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs transition-opacity hover:opacity-80 ${
                SOURCE_COLORS[src.type] ?? 'bg-white/5 text-white/40 border-white/10'
              }`}
            >
              {src.name}
              {src.url && <ExternalLink className="w-2.5 h-2.5" />}
            </a>
          ))}
          {tools.map(t => (
            <span key={t} className="inline-flex items-center border border-white/10 rounded-full px-3 py-1 text-xs text-white/30">
              {t.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
