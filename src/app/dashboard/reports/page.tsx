'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Clock, Trash2, ArrowRight } from 'lucide-react'

interface Session {
  id: string
  title: string
  tool_mode: string
  updated_at: string
  messages: Array<{ role: string; content: string }>
}

export default function ReportsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, []) // eslint-disable-line

  async function loadSessions() {
    setLoading(true)
    try {
      const res = await fetch('/api/sessions')
      if (!res.ok) { setLoading(false); return }
      const json = await res.json()
      setSessions(json.sessions ?? [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function deleteSession(id: string) {
    setDeleting(id)
    try {
      await fetch('/api/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setSessions(prev => prev.filter(s => s.id !== id))
    } catch { /* ignore */ }
    setDeleting(null)
  }

  const MODE_LABELS: Record<string, string> = {
    general: 'General',
    drug_analysis: 'Drug Analysis',
    molecule_search: 'Molecules',
    interaction_check: 'Interactions',
    clinical_trials: 'Trials',
    protein_analysis: 'Proteins',
    drug_design: 'Drug Design',
    literature_review: 'Literature',
  }

  return (
    <div className="h-full overflow-y-auto bg-black p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-light mb-1" style={{ letterSpacing: '-0.02em' }}>
              <span style={{ fontStyle: 'italic' }}>Research</span> Sessions
            </h1>
            <p className="text-white/40 text-sm">All your saved research conversations</p>
          </div>
          <Link
            href="/dashboard/chat"
            className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Research
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-shimmer" />
            ))}
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="text-center py-24">
            <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm mb-6">No research sessions yet</p>
            <Link href="/dashboard/chat" className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-6 py-3 rounded-full hover:bg-white/90 transition-colors">
              <Plus className="w-4 h-4" />
              Start your first session
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {sessions.map(s => {
            const msgCount = s.messages?.length ?? 0
            const lastMsg = s.messages?.filter(m => m.role === 'assistant').pop()
            return (
              <div key={s.id} className="group border border-white/10 rounded-xl px-5 py-4 hover:border-white/20 hover:bg-white/5 transition-all flex items-center gap-4">
                <FileText className="w-4 h-4 text-white/20 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white text-sm font-medium truncate">{s.title}</p>
                    <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                      {MODE_LABELS[s.tool_mode] ?? s.tool_mode}
                    </span>
                  </div>
                  {lastMsg && (
                    <p className="text-white/30 text-xs truncate">{lastMsg.content.slice(0, 100)}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-white/20 text-[10px] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(s.updated_at).toLocaleDateString()}
                    </span>
                    <span className="text-white/20 text-[10px]">{msgCount} messages</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteSession(s.id)}
                    disabled={deleting === s.id}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/dashboard/chat?session=${s.id}`}
                    className="flex items-center gap-1 text-white/40 hover:text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    Open
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
