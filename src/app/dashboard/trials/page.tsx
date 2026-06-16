'use client'

import { useState } from 'react'
import { Search, Loader2, ExternalLink, Calendar, Users, MapPin, FlaskConical } from 'lucide-react'
import type { ClinicalTrial } from '@/types'

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'RECRUITING', label: 'Recruiting' },
  { value: 'ACTIVE_NOT_RECRUITING', label: 'Active (not recruiting)' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'NOT_YET_RECRUITING', label: 'Not yet recruiting' },
]

const PHASE_OPTIONS = [
  { value: '', label: 'Any phase' },
  { value: 'PHASE1', label: 'Phase 1' },
  { value: 'PHASE2', label: 'Phase 2' },
  { value: 'PHASE3', label: 'Phase 3' },
  { value: 'PHASE4', label: 'Phase 4' },
]

const STATUS_COLORS: Record<string, string> = {
  RECRUITING: 'bg-green-500/10 text-green-400 border-green-500/20',
  COMPLETED: 'bg-white/10 text-white/50 border-white/10',
  ACTIVE_NOT_RECRUITING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  NOT_YET_RECRUITING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

export default function TrialsPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'condition' | 'intervention'>('condition')
  const [status, setStatus] = useState('')
  const [phase, setPhase] = useState('')
  const [results, setResults] = useState<ClinicalTrial[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<ClinicalTrial | null>(null)

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setSelected(null)

    try {
      const params = new URLSearchParams({ q: query, type })
      if (status) params.set('status', status)
      if (phase) params.set('phase', phase)
      params.set('limit', '15')

      const res = await fetch(`/api/search/clinicaltrials?${params}`)
      const json = await res.json()
      if (json.error) { setError(json.error); return }
      setResults(json.trials ?? [])
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-black p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-light mb-1" style={{ letterSpacing: '-0.02em' }}>
            <span style={{ fontStyle: 'italic' }}>Clinical</span> Trials
          </h1>
          <p className="text-white/40 text-sm">Search 400,000+ trials on ClinicalTrials.gov</p>
        </div>

        {/* Search form */}
        <form onSubmit={search} className="border border-white/10 rounded-2xl p-5 mb-8">
          <div className="flex gap-2 mb-4">
            {(['condition', 'intervention'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  type === t ? 'bg-white text-black' : 'border border-white/15 text-white/50 hover:text-white'
                }`}
              >
                By {t}
              </button>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={type === 'condition' ? 'e.g. breast cancer, diabetes' : 'e.g. metformin, pembrolizumab'}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white/60 text-sm focus:outline-none focus:border-white/30 appearance-none"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-black">{o.label}</option>)}
            </select>

            <select
              value={phase}
              onChange={e => setPhase(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white/60 text-sm focus:outline-none focus:border-white/30 appearance-none"
            >
              {PHASE_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-black">{o.label}</option>)}
            </select>

            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6">{error}</div>
        )}

        <div className="flex gap-6">
          {/* List */}
          <div className={`${selected ? 'hidden md:block md:w-80 shrink-0' : 'w-full'}`}>
            {results.length === 0 && !loading && query && !error && (
              <div className="text-center py-16 text-white/30">
                <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No trials found</p>
              </div>
            )}
            <div className="space-y-3">
              {results.map(trial => (
                <div
                  key={trial.nctId}
                  onClick={() => setSelected(trial)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:bg-white/5 ${
                    selected?.nctId === trial.nctId ? 'border-white/35 bg-white/5' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${
                      STATUS_COLORS[trial.overallStatus] ?? 'bg-white/5 text-white/30 border-white/10'
                    }`}>
                      {trial.overallStatus?.replace(/_/g, ' ')}
                    </span>
                    {trial.phase.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40 shrink-0 mt-0.5">
                        {trial.phase.join(' / ').replace(/PHASE/g, 'Ph')}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm font-medium leading-snug mb-1 line-clamp-2">{trial.briefTitle}</p>
                  <p className="text-white/40 text-xs">{trial.nctId} · {trial.sponsor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detail */}
          {selected && (
            <div className="flex-1 border border-white/10 rounded-2xl p-6 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[selected.overallStatus] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
                      {selected.overallStatus?.replace(/_/g, ' ')}
                    </span>
                    {selected.phase.length > 0 && (
                      <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-white/40">
                        {selected.phase.join(' / ').replace(/PHASE/g, 'Phase ')}
                      </span>
                    )}
                  </div>
                  <h2 className="text-white font-semibold leading-snug">{selected.briefTitle}</h2>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={`https://clinicaltrials.gov/study/${selected.nctId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {selected.nctId}
                  </a>
                  <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-xs border border-white/10 rounded-lg px-2 py-1.5 transition-colors md:hidden">✕</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: Calendar, label: 'Start', value: selected.startDate || '—' },
                  { icon: Calendar, label: 'End', value: selected.completionDate || '—' },
                  { icon: Users, label: 'Enrollment', value: selected.enrollmentCount ? selected.enrollmentCount.toLocaleString() : '—' },
                  { icon: MapPin, label: 'Locations', value: selected.locations.length ? `${selected.locations.length} sites` : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3 text-white/30" />
                      <p className="text-white/40 text-[10px]">{label}</p>
                    </div>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>

              {selected.conditions.length > 0 && (
                <div className="mb-4">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.conditions.map(c => (
                      <span key={c} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white/60">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.interventions.length > 0 && (
                <div className="mb-4">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Interventions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.interventions.map((i, idx) => (
                      <span key={idx} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white/60">
                        {i.type}: {i.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.primaryOutcomes.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Primary Outcomes</p>
                  <ul className="space-y-2">
                    {selected.primaryOutcomes.slice(0, 3).map((o, i) => (
                      <li key={i} className="text-white/60 text-sm border-l-2 border-white/10 pl-3">
                        {o.measure}
                        {o.timeFrame && <span className="text-white/30 text-xs ml-1">({o.timeFrame})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
