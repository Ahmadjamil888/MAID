'use client'

import { useState } from 'react'
import { Search, Loader2, FlaskConical, ExternalLink, Info } from 'lucide-react'

interface CompoundResult {
  cid: number
  IUPACName?: string
  MolecularFormula?: string
  MolecularWeight?: number
  CanonicalSMILES?: string
  XLogP?: number
  HBondDonorCount?: number
  HBondAcceptorCount?: number
  TPSA?: number
  RotatableBondCount?: number
  imageUrl?: string
}

function lipinskiPass(c: CompoundResult) {
  return {
    mw:  (c.MolecularWeight ?? 999) <= 500,
    logp:(c.XLogP ?? 99) <= 5,
    hbd: (c.HBondDonorCount ?? 99) <= 5,
    hba: (c.HBondAcceptorCount ?? 99) <= 10,
  }
}

export default function MoleculesPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CompoundResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<CompoundResult | null>(null)
  const [total, setTotal] = useState(0)

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setSelected(null)

    try {
      const res = await fetch(`/api/search/pubchem?q=${encodeURIComponent(query)}`)
      const json = await res.json()
      if (json.error && !json.results) { setError(json.error); return }
      setResults(json.results ?? [])
      setTotal(json.total ?? 0)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-black p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-light mb-1" style={{ letterSpacing: '-0.02em' }}>
            <span style={{ fontStyle: 'italic' }}>Molecule</span> Search
          </h1>
          <p className="text-white/40 text-sm">Search PubChem for chemical compounds, drug-likeness, and structure data</p>
        </div>

        {/* Search bar */}
        <form onSubmit={search} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. aspirin, ibuprofen, CCOC(=O)c1ccc..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6">{error}</div>
        )}

        {total > 0 && (
          <p className="text-white/30 text-xs mb-4">{total.toLocaleString()} compounds found — showing top 5</p>
        )}

        {/* Results grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {results.map(c => {
              const lp = lipinskiPass(c)
              const passes = lp.mw && lp.logp && lp.hbd && lp.hba
              return (
                <div
                  key={c.cid}
                  onClick={() => setSelected(c)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:bg-white/5 ${
                    selected?.cid === c.cid ? 'border-white/40 bg-white/5' : 'border-white/10'
                  }`}
                >
                  {/* Structure image */}
                  {c.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt={c.IUPACName ?? `CID ${c.cid}`}
                      className="w-full h-36 object-contain bg-white rounded-lg mb-3 p-2"
                    />
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-white text-sm font-medium truncate">{c.IUPACName ?? `CID ${c.cid}`}</p>
                      <p className="text-white/40 text-xs">{c.MolecularFormula}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${
                      passes
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      Ro5 {passes ? '✓' : '✗'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    {[
                      ['MW', c.MolecularWeight?.toFixed(1) + ' g/mol'],
                      ['LogP', c.XLogP?.toFixed(2)],
                      ['HBD', c.HBondDonorCount],
                      ['HBA', c.HBondAcceptorCount],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="bg-white/5 rounded-lg px-2 py-1">
                        <p className="text-white/30 text-[10px]">{k}</p>
                        <p className="text-white text-xs font-medium">{v ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <div className="border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-white text-lg font-medium mb-1">{selected.IUPACName ?? `CID ${selected.cid}`}</h2>
                <p className="text-white/40 text-sm">{selected.MolecularFormula} · MW {selected.MolecularWeight?.toFixed(2)} g/mol</p>
              </div>
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selected.cid}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                PubChem
              </a>
            </div>

            {/* Lipinski table */}
            <div className="mb-6">
              <h3 className="text-white/50 text-xs font-medium uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Lipinski Rule of Five
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: 'Molecular Weight', value: selected.MolecularWeight?.toFixed(1) + ' g/mol', pass: (selected.MolecularWeight ?? 999) <= 500, rule: '≤ 500' },
                  { label: 'LogP (XLogP)',      value: selected.XLogP?.toFixed(2),                     pass: (selected.XLogP ?? 99) <= 5,             rule: '≤ 5' },
                  { label: 'HB Donors',        value: String(selected.HBondDonorCount ?? '—'),        pass: (selected.HBondDonorCount ?? 99) <= 5,   rule: '≤ 5' },
                  { label: 'HB Acceptors',     value: String(selected.HBondAcceptorCount ?? '—'),     pass: (selected.HBondAcceptorCount ?? 99) <= 10, rule: '≤ 10' },
                ].map(row => (
                  <div key={row.label} className={`border rounded-xl p-3 ${row.pass ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                    <p className="text-white/50 text-[10px] mb-1">{row.label}</p>
                    <p className="text-white text-sm font-semibold">{row.value}</p>
                    <p className={`text-[10px] mt-1 ${row.pass ? 'text-green-400' : 'text-red-400'}`}>
                      Rule: {row.rule} {row.pass ? '✓' : '✗'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SMILES */}
            {selected.CanonicalSMILES && (
              <div>
                <h3 className="text-white/50 text-xs font-medium uppercase tracking-widest mb-2">Canonical SMILES</h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 font-mono text-white/70 text-xs break-all">
                  {selected.CanonicalSMILES}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && results.length === 0 && query && !error && (
          <div className="text-center py-16 text-white/30">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No compounds found for &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}
