'use client'

import { useState } from 'react'
import { Search, Loader2, Dna, ExternalLink } from 'lucide-react'

interface Protein {
  primaryAccession?: string
  uniProtkbId?: string
  proteinDescription?: { recommendedName?: { fullName?: { value?: string } } }
  genes?: Array<{ geneName?: { value?: string } }>
  organism?: { scientificName?: string }
  sequence?: { length?: number; molWeight?: number }
}

export default function ProteinsPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Protein[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Protein | null>(null)

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setSelected(null)

    try {
      const res = await fetch(`https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&format=json&size=10&fields=accession,id,protein_name,gene_names,organism_name,length,mass`, {
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) throw new Error(`UniProt error: ${res.status}`)
      const json = await res.json()
      setResults(json.results ?? [])
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function getName(p: Protein) {
    return p.proteinDescription?.recommendedName?.fullName?.value ?? p.uniProtkbId ?? p.primaryAccession ?? 'Unknown'
  }

  function getGene(p: Protein) {
    return p.genes?.[0]?.geneName?.value ?? '—'
  }

  return (
    <div className="h-full overflow-y-auto bg-black p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-light mb-1" style={{ letterSpacing: '-0.02em' }}>
            <span style={{ fontStyle: 'italic' }}>Protein</span> Analysis
          </h1>
          <p className="text-white/40 text-sm">Search UniProt for drug targets, sequences, and structural data</p>
        </div>

        <form onSubmit={search} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. BRCA1, EGFR, insulin receptor, P53..."
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

        {results.length === 0 && !loading && query && !error && (
          <div className="text-center py-16 text-white/30">
            <Dna className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No proteins found</p>
          </div>
        )}

        <div className="flex gap-6">
          {/* List */}
          <div className={`${selected ? 'hidden md:block md:w-72 shrink-0' : 'w-full'}`}>
            <div className="space-y-2">
              {results.map((p, i) => (
                <div
                  key={p.primaryAccession ?? i}
                  onClick={() => setSelected(p)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:bg-white/5 ${
                    selected?.primaryAccession === p.primaryAccession ? 'border-white/35 bg-white/5' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/50 text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded">
                      {p.primaryAccession}
                    </span>
                    <span className="text-white/30 text-[10px]">
                      {p.organism?.scientificName?.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium leading-snug mb-0.5">{getName(p)}</p>
                  <p className="text-white/40 text-xs">Gene: {getGene(p)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detail */}
          {selected && (
            <div className="flex-1 border border-white/10 rounded-2xl p-6 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-white/40 text-xs font-mono mb-1">{selected.primaryAccession}</p>
                  <h2 className="text-white font-semibold text-lg leading-snug mb-1">{getName(selected)}</h2>
                  <p className="text-white/40 text-sm">
                    Gene: <span className="text-white/70">{getGene(selected)}</span>
                    {selected.organism?.scientificName && (
                      <> · <span className="italic">{selected.organism.scientificName}</span></>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={`https://www.uniprot.org/uniprotkb/${selected.primaryAccession}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    UniProt
                  </a>
                  {selected.primaryAccession && (
                    <a
                      href={`https://alphafold.ebi.ac.uk/entry/${selected.primaryAccession}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <Dna className="w-3.5 h-3.5" />
                      AlphaFold
                    </a>
                  )}
                  <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-xs border border-white/10 rounded-lg px-2 py-1.5 transition-colors md:hidden">✕</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">Sequence Length</p>
                  <p className="text-white text-xl font-light">
                    {selected.sequence?.length ? selected.sequence.length.toLocaleString() : '—'}
                    <span className="text-white/30 text-sm ml-1">aa</span>
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">Molecular Weight</p>
                  <p className="text-white text-xl font-light">
                    {selected.sequence?.molWeight ? (selected.sequence.molWeight / 1000).toFixed(1) : '—'}
                    <span className="text-white/30 text-sm ml-1">kDa</span>
                  </p>
                </div>
              </div>

              <div className="border border-white/10 rounded-xl p-4 text-center">
                <Dna className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm mb-3">View 3D protein structure in AlphaFold</p>
                <a
                  href={`https://alphafold.ebi.ac.uk/entry/${selected.primaryAccession}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-5 py-2 rounded-full hover:bg-white/90 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in AlphaFold
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
