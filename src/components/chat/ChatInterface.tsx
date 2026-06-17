'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMsg, ToolMode, DataSource } from '@/types'
import type { GroqModelId } from '@/lib/groq/models'
import { GROQ_MODELS } from '@/lib/groq/models'
import { nanoid } from './nanoid'

// ── SVG icons (inline, no external dep) ──────────────────────────────────────
const I = {
  Plus:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Search:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Book:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Grid:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Flask:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M10 2v6.29a2 2 0 0 1-.5 1.32L4.7 15.7A2 2 0 0 0 6 19h12a2 2 0 0 0 1.3-3.3l-4.8-6.09a2 2 0 0 1-.5-1.32V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>,
  More:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  PanelOpen:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>,
  PanelClose:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9-2 3 2 3"/></svg>,
  ArrowUp:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>,
  Chevron:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="m6 9 6 6 6-6"/></svg>,
  Sparkles:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>,
  Pill:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
  FileSearch:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6.5"/><path d="M14 2v6h6"/><circle cx="15.5" cy="17.5" r="2.7"/><path d="m19.5 21.5-1.7-1.7"/></svg>,
  Stethoscope: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3a2 2 0 0 0-2 2v4a6 6 0 0 0 6 6 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-2.5"/><circle cx="20" cy="10.5" r="2"/></svg>,
  Sun:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  Moon:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  Mic:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/><path d="M8 22h8"/></svg>,
}

// ── CSS vars injected via a style tag (mirrors the HTML prototype) ───────────
const CSS_VARS_DARK = `
  --bg:#000000; --sidebar-bg:#000000; --border:rgba(255,255,255,0.10);
  --text-primary:#f3f4f6; --text-secondary:#9ca3af;
  --hover:rgba(255,255,255,0.08); --active:rgba(255,255,255,0.12);
  --input-bg:#1a1a1a; --bubble-user-bg:#2a2a2a;
  --btn-solid-bg:#ffffff; --btn-solid-text:#000000;
  --menu-shadow:0 10px 30px rgba(0,0,0,0.45);
`
const CSS_VARS_LIGHT = `
  --bg:#ffffff; --sidebar-bg:#f7f7f8; --border:#e5e7eb;
  --text-primary:#111827; --text-secondary:#6b7280;
  --hover:rgba(0,0,0,0.06); --active:rgba(0,0,0,0.08);
  --input-bg:#f0f0f1; --bubble-user-bg:#e9e9ea;
  --btn-solid-bg:#111827; --btn-solid-text:#ffffff;
  --menu-shadow:0 10px 30px rgba(0,0,0,0.12);
`

// ── Static recent chats (sidebar preview) ────────────────────────────────────
const RECENT_SAMPLE = [
  'Beta-blocker interaction check',
  'Metformin dosing guidelines',
  'CRISPR gene therapy review',
  'Statin side-effect profiles',
  'Phase II trial summary',
  'Antibiotic resistance mechanisms',
]

// ── Suggestions ───────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: I.Flask,       label: 'Analyze a compound',    prompt: 'Analyze the pharmacokinetics of ' },
  { icon: I.FileSearch,  label: 'Search literature',     prompt: 'Find recent literature on ' },
  { icon: I.Stethoscope, label: 'Summarize a trial',     prompt: 'Summarize the clinical trial results for ' },
]

// ── Typing dots indicator ────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display:'flex', gap:4, paddingTop:14 }}>
      {[0,150,300].map((delay,i) => (
        <span key={i} style={{
          width:6, height:6, borderRadius:'50%', background:'var(--text-secondary)',
          display:'inline-block',
          animation:`maid-bounce 1s ${delay}ms infinite ease-in-out`,
        }} />
      ))}
    </div>
  )
}

// ── Main inner component ──────────────────────────────────────────────────────
function Inner() {
  const params  = useSearchParams()
  const router  = useRouter()
  const supabase = createClient()

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages]     = useState<ChatMsg[]>([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [streaming, setStreaming]   = useState(false)
  const [streamText, setStreamText] = useState('')
  const [sessionId, setSessionId]   = useState<string | null>(null)
  const [mode]                      = useState<ToolMode>('general')
  const [model, setModel]           = useState<GroqModelId>('llama-3.3-70b-versatile')
  const [sources, setSources]       = useState<DataSource[]>([])
  const [tools, setTools]           = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dark, setDark]             = useState(true)
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [recentSessions, setRecentSessions] = useState<Array<{id:string,title:string}>>([])
  const [activeSessionId, setActiveSessionId] = useState<string|null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const taRef     = useRef<HTMLTextAreaElement>(null)
  const abortRef  = useRef<AbortController | null>(null)
  const convRef   = useRef<HTMLDivElement>(null)

  const hasConversation = messages.length > 0 || streaming

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadRecentSessions()
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
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 200) + 'px'
  }, [input])

  // Close model menu on outside click
  useEffect(() => {
    const handler = () => setModelMenuOpen(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // ── Data loaders ───────────────────────────────────────────────────────────
  async function loadRecentSessions() {
    const { data } = await supabase
      .from('chat_sessions').select('id,title').order('updated_at',{ascending:false}).limit(8)
    if (data) setRecentSessions(data)
  }

  async function loadSession(id: string) {
    const { data } = await supabase.from('chat_sessions').select('*').eq('id', id).single()
    if (data) {
      setSessionId(data.id)
      setActiveSessionId(data.id)
      setMessages(data.messages ?? [])
    }
  }

  async function mkSession(msg: string) {
    const r = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: msg.slice(0, 60), tool_mode: mode }),
    })
    const json = await r.json()
    await loadRecentSessions()
    return json.session.id as string
  }

  async function saveMsgs(sid: string, msgs: ChatMsg[]) {
    await supabase.from('chat_sessions')
      .update({ messages: msgs, updated_at: new Date().toISOString() })
      .eq('id', sid)
  }

  // ── Send handler ───────────────────────────────────────────────────────────
  const send = useCallback(async (txt?: string) => {
    const content = (txt ?? input).trim()
    if (!content || loading) return

    setInput('')
    setLoading(true)
    setStreaming(false)
    setStreamText('')
    setSources([])
    setTools([])

    const userMsg: ChatMsg = { id: nanoid(), role: 'user', content, timestamp: new Date().toISOString() }
    const nextMsgs = [...messages, userMsg]
    setMessages(nextMsgs)

    let sid = sessionId ?? await mkSession(content)
    if (!sessionId) { setSessionId(sid); setActiveSessionId(sid) }

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
            if (d.type === 'sources') {
              srcs = d.sources ?? []; tls = d.toolsUsed ?? []
              setSources(srcs); setTools(tls)
            } else if (d.type === 'token') {
              full += d.content; setStreamText(full)
            } else if (d.type === 'error') {
              full = `Error: ${d.message ?? 'Unknown error'}`
            }
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
    setMessages(final)
    setStreamText('')
    setStreaming(false)
    setLoading(false)
    saveMsgs(sid, final)
  }, [input, loading, messages, mode, model, sessionId]) // eslint-disable-line

  function startNewChat() {
    abortRef.current?.abort()
    setMessages([])
    setSessionId(null)
    setActiveSessionId(null)
    setInput('')
    setStreamText('')
    setStreaming(false)
    setLoading(false)
    setSources([])
    setTools([])
    router.replace('/dashboard/chat')
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // ── Derived styles ─────────────────────────────────────────────────────────
  const cssVars = dark ? CSS_VARS_DARK : CSS_VARS_LIGHT
  const accent = '#10b981'

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inject keyframes + css vars */}
      <style>{`
        @keyframes maid-bounce {
          0%,80%,100%{transform:translateY(0);opacity:.45;}
          40%{transform:translateY(-5px);opacity:1;}
        }
        .maid-app { ${cssVars} }
        .maid-nav-item:hover { background:var(--hover) !important; }
        .maid-recent-item:hover { background:var(--hover) !important; }
        .maid-model-btn:hover { background:var(--hover) !important; }
        .maid-icon-btn:hover { background:var(--hover) !important; }
        .maid-suggestion:hover { background:var(--hover) !important; }
        .maid-send-btn:disabled { opacity:.4; cursor:default; }
      `}</style>

      <div className="maid-app" style={{
        display:'flex', height:'100%', width:'100%',
        background:'var(--bg)', color:'var(--text-primary)',
        fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
        overflow:'hidden',
        transition:'background .15s ease,color .15s ease',
      }}>

        {/* ══════════════════ SIDEBAR ══════════════════ */}
        <aside style={{
          width: sidebarCollapsed ? 68 : 280,
          flexShrink:0, display:'flex', flexDirection:'column',
          background:'var(--sidebar-bg)', borderRight:'1px solid var(--border)',
          transition:'width .18s ease', overflow:'hidden',
        }}>
          {/* Top row */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8,overflow:'hidden',minWidth:0}}>
              <div style={{
                width:28,height:28,borderRadius:'50%',background:accent,
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#000',
              }}>
                {I.Pill}
              </div>
              {!sidebarCollapsed && <span style={{fontWeight:600,fontSize:15,whiteSpace:'nowrap'}}>MAID</span>}
            </div>
            <button className="maid-icon-btn" onClick={() => setSidebarCollapsed(c => !c)}
              style={{display:'flex',alignItems:'center',justifyContent:'center',width:36,height:36,borderRadius:8,background:'transparent',border:'none',cursor:'pointer',color:'var(--text-secondary)',flexShrink:0}}>
              {sidebarCollapsed ? I.PanelOpen : I.PanelClose}
            </button>
          </div>

          {/* New chat */}
          <div style={{padding:'0 8px'}}>
            <button className="maid-nav-item" onClick={startNewChat}
              style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:'10px 12px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',color:'var(--text-primary)',fontSize:14,fontWeight:500}}>
              {I.Plus}
              {!sidebarCollapsed && <span>New chat</span>}
            </button>
          </div>

          {/* Nav items */}
          <nav style={{padding:'0 8px'}}>
            {[
              {icon:I.Search, label:'Search chats'},
              {icon:I.Book,   label:'Library'},
              {icon:I.Grid,   label:'Tools'},
              {icon:I.Flask,  label:'Literature'},
              {icon:I.More,   label:'More'},
            ].map(({icon, label}) => (
              <button key={label} className="maid-nav-item"
                style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:'10px 12px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',color:'var(--text-secondary)',fontSize:14,textAlign:'left'}}>
                {icon}
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            ))}
          </nav>

          {/* Recents */}
          {!sidebarCollapsed && (
            <div style={{marginTop:14,flex:1,overflowY:'auto',padding:'0 8px 8px'}}>
              <div style={{padding:'6px 12px 4px',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-secondary)'}}>Recents</div>
              {recentSessions.map(s => (
                <button key={s.id} className="maid-recent-item"
                  onClick={() => { setActiveSessionId(s.id); loadSession(s.id) }}
                  style={{
                    display:'block',width:'100%',textAlign:'left',padding:'8px 12px',borderRadius:8,
                    background: activeSessionId === s.id ? 'var(--active)' : 'transparent',
                    border:'none',cursor:'pointer',
                    color: activeSessionId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize:14,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                  }}>
                  {s.title}
                </button>
              ))}
              {/* Sample recents when no real sessions */}
              {recentSessions.length === 0 && RECENT_SAMPLE.map(t => (
                <button key={t} className="maid-recent-item"
                  style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',color:'var(--text-secondary)',fontSize:14,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {t}
                </button>
              ))}
            </div>
          )}
          {sidebarCollapsed && <div style={{flex:1}}/>}

          {/* Bottom user row */}
          <div style={{borderTop:'1px solid var(--border)',padding:'12px 8px',flexShrink:0}}>
            {!sidebarCollapsed && (
              <>
                <div style={{display:'flex',alignItems:'center',gap:10,padding:8,borderRadius:8,cursor:'pointer'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'#059669',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,flexShrink:0}}>R</div>
                  <div style={{overflow:'hidden',minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Researcher</div>
                    <div style={{fontSize:12,color:'var(--text-secondary)',whiteSpace:'nowrap'}}>Researcher plan</div>
                  </div>
                </div>
                <button style={{marginTop:8,width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'9px 12px',borderRadius:999,border:'1px solid var(--border)',background:'transparent',color:'var(--text-primary)',fontSize:14,fontWeight:500,cursor:'pointer'}}>
                  {I.Sparkles} Upgrade to Pro
                </button>
              </>
            )}
          </div>
        </aside>

        {/* ══════════════════ MAIN AREA ══════════════════ */}
        <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,position:'relative'}}>

          {/* Topbar */}
          <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',flexShrink:0}}>
            {/* Model dropdown */}
            <div style={{position:'relative'}}>
              <button className="maid-model-btn"
                onClick={e => { e.stopPropagation(); setModelMenuOpen(o => !o) }}
                style={{display:'flex',alignItems:'center',gap:6,padding:'7px 10px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',fontSize:16,fontWeight:600,color:'var(--text-primary)'}}>
                {GROQ_MODELS[model]}
                {I.Chevron}
              </button>
              {modelMenuOpen && (
                <div style={{position:'absolute',left:0,top:'calc(100% + 4px)',width:240,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:12,padding:4,boxShadow:'var(--menu-shadow)',zIndex:30}}>
                  {(Object.keys(GROQ_MODELS) as GroqModelId[]).map(id => (
                    <button key={id}
                      onClick={() => { setModel(id); setModelMenuOpen(false) }}
                      style={{display:'block',width:'100%',textAlign:'left',padding:'9px 12px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',color:'var(--text-primary)',fontSize:14,fontWeight: id === model ? 600 : 400}}>
                      {GROQ_MODELS[id]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right side */}
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:999,border:'1px solid rgba(16,185,129,.35)',background:'transparent',color:'#10b981',fontSize:13,fontWeight:500,cursor:'pointer'}}>
                {I.Sparkles} Free offer
              </button>
              <button className="maid-icon-btn" onClick={() => setDark(d => !d)}
                style={{display:'flex',alignItems:'center',justifyContent:'center',width:36,height:36,borderRadius:'50%',background:'transparent',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                {dark ? I.Sun : I.Moon}
              </button>
            </div>
          </header>

          {/* Body area */}
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>

            {/* ── EMPTY STATE ── */}
            {!hasConversation && (
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:16}}>
                <h1 style={{fontSize:32,fontWeight:600,letterSpacing:'-0.02em',margin:'0 0 26px',textAlign:'center',color:'var(--text-primary)'}}>
                  What should we research today?
                </h1>

                {/* Home input */}
                <div style={{width:'100%',maxWidth:680}}>
                  <div style={{display:'flex',alignItems:'flex-end',gap:6,border:'1px solid var(--border)',background:'var(--input-bg)',borderRadius:26,padding:'8px 10px'}}>
                    <button style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',color:'var(--text-secondary)',flexShrink:0}}>
                      {I.Plus}
                    </button>
                    <textarea
                      ref={taRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={onKey}
                      placeholder="Ask about a drug, mechanism, or study"
                      rows={1}
                      style={{flex:1,resize:'none',background:'transparent',border:'none',outline:'none',color:'var(--text-primary)',fontSize:15,fontFamily:'inherit',maxHeight:200,minHeight:24,padding:'8px 6px',lineHeight:1.45}}
                    />
                    {input.trim() ? (
                      <button onClick={() => send()} disabled={loading}
                        className="maid-send-btn"
                        style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--btn-solid-bg)',color:'var(--btn-solid-text)',border:'none',cursor:'pointer',flexShrink:0}}>
                        {I.ArrowUp}
                      </button>
                    ) : (
                      <div style={{display:'flex',alignItems:'center',gap:2}}>
                        <button style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer',background:'transparent',color:'var(--text-secondary)',flexShrink:0}}>
                          {I.Mic}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestion chips */}
                <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:10,marginTop:22,maxWidth:680}}>
                  {SUGGESTIONS.map(s => (
                    <button key={s.label} className="maid-suggestion"
                      onClick={() => setInput(s.prompt)}
                      style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',borderRadius:999,border:'1px solid var(--border)',background:'transparent',color:'var(--text-primary)',fontSize:14,cursor:'pointer'}}>
                      <span style={{color:'var(--text-secondary)',display:'flex'}}>{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── CONVERSATION ── */}
            {hasConversation && (
              <div ref={convRef} style={{flex:1,overflowY:'auto',minHeight:0}}>
                <div style={{maxWidth:768,margin:'0 auto',padding:'24px 16px 8px',display:'flex',flexDirection:'column',gap:22}}>
                  {messages.map(m => (
                    <div key={m.id} style={{display:'flex',justifyContent: m.role==='user' ? 'flex-end' : 'flex-start',gap: m.role==='assistant' ? 12 : 0,alignItems:'flex-start'}}>
                      {m.role === 'assistant' && (
                        <div style={{width:28,height:28,borderRadius:'50%',background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2,color:'#000'}}>
                          {I.Pill}
                        </div>
                      )}
                      {m.role === 'user' ? (
                        <div style={{maxWidth:'80%',background:'var(--bubble-user-bg)',color:'var(--text-primary)',padding:'10px 16px',borderRadius:22,fontSize:15,lineHeight:1.5}}>
                          {m.content}
                        </div>
                      ) : (
                        <div className="maid-prose" style={{maxWidth:'80%',fontSize:15,lineHeight:1.55,paddingTop:4,color:'var(--text-primary)'}}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming */}
                  {streaming && streamText && (
                    <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2,color:'#000'}}>{I.Pill}</div>
                      <div className="maid-prose" style={{maxWidth:'80%',fontSize:15,lineHeight:1.55,paddingTop:4,color:'var(--text-primary)'}}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamText}</ReactMarkdown>
                        <span style={{display:'inline-block',width:6,height:16,background:'var(--text-secondary)',marginLeft:2,borderRadius:2,animation:'maid-bounce 1s infinite ease-in-out'}} />
                      </div>
                    </div>
                  )}

                  {/* Typing dots */}
                  {loading && !streaming && (
                    <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#000'}}>{I.Pill}</div>
                      <TypingDots />
                    </div>
                  )}

                  {/* Sources */}
                  {sources.length > 0 && !loading && (
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginLeft:40}}>
                      {sources.map((s,i) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                          style={{fontSize:12,padding:'4px 10px',borderRadius:999,border:'1px solid var(--border)',color:'var(--text-secondary)',textDecoration:'none'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='var(--text-primary)'}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='var(--text-secondary)'}>
                          {s.name}
                        </a>
                      ))}
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              </div>
            )}
          </div>

          {/* ── BOTTOM INPUT (shown only in conversation view) ── */}
          {hasConversation && (
            <div style={{padding:'4px 16px 12px',flexShrink:0}}>
              <div style={{maxWidth:768,margin:'0 auto'}}>
                <div style={{display:'flex',alignItems:'flex-end',gap:6,border:'1px solid var(--border)',background:'var(--input-bg)',borderRadius:26,padding:'8px 10px'}}>
                  <button style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',color:'var(--text-secondary)',flexShrink:0}}>
                    {I.Plus}
                  </button>
                  <textarea
                    ref={taRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Ask about a drug, mechanism, or study"
                    rows={1}
                    style={{flex:1,resize:'none',background:'transparent',border:'none',outline:'none',color:'var(--text-primary)',fontSize:15,fontFamily:'inherit',maxHeight:200,minHeight:24,padding:'8px 6px',lineHeight:1.45}}
                  />
                  {input.trim() ? (
                    <button onClick={() => send()} disabled={loading}
                      className="maid-send-btn"
                      style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--btn-solid-bg)',color:'var(--btn-solid-text)',border:'none',cursor:'pointer',flexShrink:0}}>
                      {I.ArrowUp}
                    </button>
                  ) : (
                    <button style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer',background:'transparent',color:'var(--text-secondary)',flexShrink:0}}>
                      {I.Mic}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p style={{textAlign:'center',fontSize:12,color:'var(--text-secondary)',paddingBottom:14,margin:0,flexShrink:0}}>
            MAID can make mistakes. Always verify critical drug and clinical information independently.
          </p>
        </div>
      </div>
    </>
  )
}

export default function ChatInterface() {
  return (
    <Suspense fallback={<div style={{height:'100%',background:'#000'}} />}>
      <Inner />
    </Suspense>
  )
}
