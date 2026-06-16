'use client'

import { useState } from 'react'
import { Plus, X, Activity, Loader2, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import type { DrugInteraction } from '@/types'

const SEVERITY_STYLES = {
  major:    { bg: 'bg-red-500/10',    border: 'border-red-500/25',    text: 'text-red-400',    label: 'Major' },
  moderate: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', text: 'text-yellow-400', label: 'Moderate' },
  minor:    { bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   text: 'text-blue-400',   label: 'Minor' },
}

const SEVERITY_ICON = {
  major:    AlertTriangle,
  moderate: Info,
  minor:    CheckCircle,
}

export default function InteractionsPage() {
  const [drugs, setDrugs] = useState<string[]>(['', ''])
  const [results, setResults] = useState<DrugInteraction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checked, setChecked] = useState(false)

  function updateDrug(i: number, val: string) {
    setDrugs(prev => prev.map((d, idx) => idx === i ? val : d))
  }

  function addDrug() {
    if (drugs.length < 8) setDrugs(prev => [...prev, ''])
  }

  function removeDrug(i: number) {
    if (drugs.length > 2) setDrugs(prev => prev.filter((_, idx) => idx !== i))
  }

  async function check(e: React.FormEvent) {
    e.preventDefault()
    const filled = drugs.filter(d => d.trim())
    if (filled.length < 2) { setError('Enter at least 2 drug names'); return }

    setLoading(true)
    setError('')
    setResults([])
    setChecked(false)

    try {
      const res = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: filled }),
      })
      const json = await res.json()
      if (json.error) { setError(json.error); return }
      setResults(json.interactions ?? [])
      setChecked(true)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const hasMajor = results.some(r => r.severity === 'major')
  const hasModerate = results.some(r => r.severity === 'moderate')

  return (
    <div className="h-full overflow-y-auto bg-black p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-light mb-1" style={{ letterSpacing: '-0.02em' }}>
            <span style={{ fontStyle: 'italic' }}>Drug</span> Interactions
          </h1>
          <p className="text-white/40 text-sm">Check interactions between 2–8 drugs using RxNorm</p>
        </div>

        <form onSubmit={check} className="border border-white/10 rounded-2xl p-6 mb-8">
          <div className="space-y-3 mb-5">
            {drugs.map((drug, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-white/30 text-xs w-5 text-right shrink-0">{i + 1}</span>
                <input
                  value={drug}
                  onChange={e => updateDrug(i, e.target.value)}
                  placeholder={`Drug ${i + 1} name (e.g. warfarin)`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
                {drugs.length > 2 && (
                  <button type="button" onClick={() => removeDrug(i)}
                    className="text-white/30 hover:text-red-400 transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {drugs.length < 8 && (
              <button type="button" onClick={addDrug}
                className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm border border-white/10 hover:border-white/25 rounded-lg px-3 py-2 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add drug
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="ml-auto bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              Check Interactions
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
          )}
        </form>

        {/* Results */}
        {checked && (
          <div>
            {/* Summary banner */}
            <div className={`border rounded-xl px-5 py-4 mb-6 flex items-start gap-3 ${
              hasMajor
                ? 'bg-red-500/10 border-red-500/25'
                : hasModerate
                ? 'bg-yellow-500/10 border-yellow-500/25'
                : 'bg-green-500/10 border-green-500/25'
            }`}>
              {hasMajor
                ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                : hasModerate
                ? <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                : <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              }
              <div>
                <p className={`font-semibold text-sm ${hasMajor ? 'text-red-400' : hasModerate ? 'text-yellow-400' : 'text-green-400'}`}>
                  {results.length === 0
                    ? 'No significant interactions found'
                    : `${results.length} interaction${results.length !== 1 ? 's' : ''} detected`
                  }
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {results.length === 0
                    ? 'No known interactions in RxNorm for these drugs.'
                    : 'Always verify with a licensed pharmacist or physician before clinical use.'
                  }
                </p>
              </div>
            </div>

            {/* Interaction cards */}
            <div className="space-y-4">
              {results.map((r, i) => {
                const sev = r.severity in SEVERITY_STYLES ? r.severity : 'moderate'
                const style = SEVERITY_STYLES[sev as keyof typeof SEVERITY_STYLES]
                const SevIcon = SEVERITY_ICON[sev as keyof typeof SEVERITY_ICON]
                return (
                  <div key={i} className={`border rounded-xl p-5 ${style.bg} ${style.border}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <SevIcon className={`w-4 h-4 shrink-0 mt-0.5 ${style.text}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-white font-semibold text-sm">{r.drug1}</span>
                          <span className="text-white/30">+</span>
                          <span className="text-white font-semibold text-sm">{r.drug2}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style.bg} ${style.border} ${style.text}`}>
                            {style.label}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">{r.description}</p>
                      </div>
                    </div>
                    {r.management && (
                      <div className="ml-7 pt-3 border-t border-white/10">
                        <p className="text-white/40 text-xs font-medium mb-1">Management</p>
                        <p className="text-white/60 text-sm">{r.management}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-white/20 text-xs mt-6 text-center">
              ⚠️ This tool is for research purposes only. Not a substitute for clinical pharmacist review.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
