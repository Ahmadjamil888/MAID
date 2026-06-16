'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, Plus, Zap, Database, FlaskConical, Activity, Search, Dna } from 'lucide-react'
import ChatMessage from './ChatMessage'
import type { ChatMessage as ChatMsg, ToolMode, DataSource } from '@/types'
import type { GroqModelId } from '@/lib/groq/client'
import { GROQ_MODELS } from '@/lib/groq/client'
import { nanoid } from './nanoid'

const SUGGESTED = [
  { icon: FlaskConical, text: 'Analyze ibuprofen — mechanism, side effects, interactions' },
  { icon: Search,       text: 'Find Phase 3 cancer trials recruiting right now' },
  { icon: Activity,     text: 'Check interactions: warfarin + aspirin + ibuprofen' },
  { icon: Dna,          text: 'Find molecules similar to sildenafil with fewer side effects' },
]

const MODES: { value: ToolMode; label: string }[] = [
  { value: 'general',           label: 'General' },
  { value: 'drug_analysis',     label: 'Drug Analysis' },
  { value: 'molecule_search',   label: 'Molecules' },
  { value: 'interaction_check', label: 'Interactions' },
  { value: 'clinical_trials',   label: 'Trials' },
  { value: 'protein_analysis',  label: 'Proteins' },
  { value: 'drug_design',       label: 'Drug Design' },
]

function Inner() {
  const params = useSearchParams()
  const supabase = createClient()

  const [messages, setMessages]       = useState<ChatMsg[]>([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [streaming, setStreaming]     = useState(false)
  const [streamText, setStreamText]   = useState('')
  const [sessionId, setSessionId]     = useState<string | null>(null)
  const [mode, setMode]               = useState<ToolMode>('general')
  const [model, setModel]             = useState<GroqModelId>('llama-3.3-70b-versatile')
  const [sources, setSources]         = useState<DataSource[]>([])
  const [tools, setTools]             = useState<string[]>([])

  const bottomRef  = useRef<HTMLDivElement>(null)
  const taRef      = useRef<HTMLTextAreaElement>(null)
  const abortRef   = useRef<AbortController | null>(null)

  useEffect(() => {
    const sid = params.get('session')
    const q   = params.get('q')
    if (sid) loadSession(sid)
    if (q)   setInput(q)
  }, []) // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  useEffect(() => {
    if (!taRef.current) return
    taRef.current.style.height = 'auto'
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 160) + 'px'
  }, [input])

  async function loadSession(id: string) {
    const { data } = await supabase.from('chat_sessions').select('*').eq('id', id).single()
    if (data) { setSessionId(data.id); setMessages(data.messages ?? []); setMode(data.tool_mode ?? 'general') }
  }

  async function mkSession(msg: string) {
    const r = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: msg.slice(0, 60), tool_mode: mode }),
    })
    return (await r.json()).session.id as string
  }

  async function saveMsgs(sid: string, msgs: ChatMsg[]) {
    await supabase.from('chat_sessions').update({ messages: msgs, updated_at: new Date().toISOString() }).eq('id', sid)
  }

  const send = useCallback(async (txt?: string) => {
    const content = (txt ?? input).trim()
    if (!content || loading) return

    setInput(''); setLoading(true); setStreaming(false); setStreamText(''); setSources([]); setTools([])

    const userMsg: ChatMsg = { id: nanoid(), role: 'user', content, timestamp: new Date().toISOString() }
    const nextMsgs = [...messages, userMsg]
    setMessages(nextMsgs)

    let sid = sessionId ?? await mkSession(content)
    if (!sessionId) setSessionId(sid)

    abortRef.current = new AbortController()
    let full = ''; let srcs: DataSource[] = []; let tls: string[] = []

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history: messages.slice(-10), mode, modelId: model, sessionId: sid }),
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (!res.body) throw new Error('No stream')

      setStreaming(true)
      const reader = res.body.getReader()
      const dec    = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value)
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const d = JSON.parse(line.slice(6))
            if (d.type === 'sources') { srcs = d.sources ?? []; tls = d.toolsUsed ?? []; setSources(srcs); setTools(tls) }
            else if (d.type === 'token') { full += d.content; setStreamText(full) }
          } catch { /* partial chunk */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return
      full = `Error: ${String(e)}`
    }

    const aiMsg: ChatMsg = {
      id: nanoid(), role: 'assistant',
      content: full || 'No response generated.',
      timestamp: new Date().toISOString(),
      sources: srcs,
    }
    const final = [...nextMsgs, aiMsg]
    setMessages(final); setStreamText(''); setStreaming(false); setLoading(false)
    saveMsgs(sid, final)
  }, [input, loading, messages, mode, model, sessionId]) // eslint-disable-line

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0d0d' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }}>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">Research Chat</span>
          {/* Mode selector */}
          <select value={mode} onChange={e => setMode(e.target.value as ToolMode)}
            className="text-xs rounded-lg px-2.5 py-1 ml-2 appearance-none cursor-pointer focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
            {MODES.map(m => <option key={m.value} value={m.value} style={{ background: '#111' }}>{m.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {/* Model selector */}
          <div className="flex items-center gap-1.5">
            <Zap size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <select value={model} onChange={e => setModel(e.target.value as GroqModelId)}
              className="text-xs rounded-lg px-2 py-1 appearance-none cursor-pointer focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              {Object.entries(GROQ_MODELS).map(([id, lbl]) => (
                <option key={id} value={id} style={{ background: '#111' }}>{lbl}</option>
              ))}
            </select>
          </div>
          <button onClick={() => { setMessages([]); setSessionId(null); setInput(''); setStreamText('') }}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <Plus size={12} /> New
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !streaming ? (
          /* Empty state — ChatGPT style */
          <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <Database size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </div>
            <h2 className="text-white font-semibold text-xl mb-2">What are you researching?</h2>
            <p className="text-sm mb-10 max-w-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Ask MAID about any drug, molecule, protein, or clinical trial. It searches 8 scientific databases simultaneously.
            </p>
            {/* Suggestion pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {SUGGESTED.map(s => (
                <button key={s.text} onClick={() => send(s.text)}
                  className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-full transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                  <s.icon size={13} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map(m => <ChatMessage key={m.id} message={m} />)}

            {/* streaming */}
            {streaming && streamText && (
              <ChatMessage message={{ id: 'stream', role: 'assistant', content: streamText, timestamp: new Date().toISOString() }} isStreaming />
            )}

            {/* thinking */}
            {loading && !streaming && (
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-black text-[9px] font-bold">M</span>
                </div>
                <div className="flex items-center gap-2 pt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-sm">Searching {tools.length > 0 ? `${tools.length} databases` : 'databases'}…</span>
                </div>
              </div>
            )}

            {/* sources */}
            {sources.length > 0 && !loading && (
              <div className="flex flex-wrap gap-1.5 ml-10">
                {sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1 rounded-full transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="px-4 pb-4 pt-3 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
              placeholder="Ask about any drug, molecule, protein, or trial…"
              rows={1}
              className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none leading-relaxed"
              style={{ color: '#fff', caretColor: '#fff', maxHeight: '160px' }}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
              style={{ background: input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.15)' }}>
              {loading
                ? <Loader2 size={14} className="animate-spin" style={{ color: input.trim() ? '#000' : 'rgba(255,255,255,0.5)' }} />
                : <Send size={14} style={{ color: input.trim() ? '#000' : 'rgba(255,255,255,0.4)' }} />
              }
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.18)' }}>
            MAID uses live scientific databases. Verify results with qualified professionals.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ChatInterface() {
  return (
    <Suspense fallback={<div className="h-full" style={{ background: '#0d0d0d' }} />}>
      <Inner />
    </Suspense>
  )
}
