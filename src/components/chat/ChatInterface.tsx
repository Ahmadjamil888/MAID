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

// ── All SVG icons as components (not inline JSX values in objects) ────────────
const IconPlus    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18,display:'block'}}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
const IconSearch  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18,display:'block'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
const IconGrid    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18,display:'block'}}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
const IconFlask   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M10 2v6.29a2 2 0 0 1-.5 1.32L4.7 15.7A2 2 0 0 0 6 19h12a2 2 0 0 0 1.3-3.3l-4.8-6.09a2 2 0 0 1-.5-1.32V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>
const IconMore    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18,display:'block'}}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
const IconPanelO  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18,display:'block'}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
const IconPanelC  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18,display:'block'}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9-2 3 2 3"/></svg>
const IconArrowUp = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
const IconChevron = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="m6 9 6 6 6-6"/></svg>
const IconPill    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15,display:'block'}}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
const IconFileSrc = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6.5"/><path d="M14 2v6h6"/><circle cx="15.5" cy="17.5" r="2.7"/><path d="m19.5 21.5-1.7-1.7"/></svg>
const IconSteth   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3a2 2 0 0 0-2 2v4a6 6 0 0 0 6 6 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-2.5"/><circle cx="20" cy="10.5" r="2"/></svg>
const IconSun     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
const IconMoon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
const IconMic     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/><path d="M8 22h8"/></svg>
const IconTrash   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14,display:'block'}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
const IconMenu    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20,display:'block'}}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>

const SUGGESTIONS = [
  { Icon: IconFlask,   label: 'Analyze a compound',    prompt: 'Analyze the pharmacokinetics of ' },
  { Icon: IconFileSrc, label: 'Search literature',     prompt: 'Find recent literature on ' },
  { Icon: IconSteth,   label: 'Summarize a trial',     prompt: 'Summarize the clinical trial results for ' },
]

function TypingDots() {
  return (
    <div style={{ display:'flex', gap:4, paddingTop:12 }}>
      {[0,150,300].map((delay,i) => (
        <span key={i} style={{
          width:7, height:7, borderRadius:'50%', background:'var(--text-secondary)',
          display:'inline-block',
          animation:`maid-bounce 1s ${delay}ms infinite ease-in-out`,
        }} />
      ))}
    </div>
  )
}

type Session = { id: string; title: string; updated_at: string }

// ── SidebarContent: top-level stable component ───────────────────────────────
interface SidebarProps {
  collapsed: boolean
  sessions: Session[]
  activeId: string | null
  onCollapse: () => void
  onNewChat: () => void
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string, e: React.MouseEvent) => void
  onCloseMobile: () => void
}

function SidebarContent({
  collapsed, sessions, activeId,
  onCollapse, onNewChat, onSelectSession, onDeleteSession, onCloseMobile,
}: SidebarProps) {
  const accent = '#10b981'
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'var(--sb)',borderRight:'1px solid var(--bdr)',overflow:'hidden'}}>
      {/* Logo row */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,overflow:'hidden',minWidth:0}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#000'}}>
            <IconPill />
          </div>
          {!collapsed && <span style={{fontWeight:600,fontSize:15,whiteSpace:'nowrap',color:'var(--tp)'}}>MAID</span>}
        </div>
        <button onClick={onCollapse}
          style={{display:'flex',alignItems:'center',justifyContent:'center',width:34,height:34,borderRadius:8,background:'transparent',border:'none',cursor:'pointer',color:'var(--ts)',flexShrink:0}}>
          {collapsed ? <IconPanelO /> : <IconPanelC />}
        </button>
      </div>

      {/* New chat */}
      <div style={{padding:'0 8px',flexShrink:0}}>
        <button onClick={onNewChat}
          style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:'10px 12px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',color:'var(--tp)',fontSize:14,fontWeight:500}}>
          <IconPlus />
          {!collapsed && <span>New chat</span>}
        </button>
      </div>

      {/* Nav */}
      <nav style={{padding:'0 8px',flexShrink:0}}>
        {([
          { Icon: IconSearch, label:'Search chats' },
          { Icon: IconGrid,   label:'Tools' },
          { Icon: IconFlask,  label:'Literature' },
          { Icon: IconMore,   label:'More' },
        ] as const).map(({Icon,label}) => (
          <button key={label}
            style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:'10px 12px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',color:'var(--ts)',fontSize:14,textAlign:'left'}}>
            <Icon />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Recents */}
      {!collapsed && (
        <div style={{flex:1,overflowY:'auto',padding:'8px 8px 4px',marginTop:8}}>
          {sessions.length > 0 && (
            <div style={{padding:'4px 12px 4px',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',color:'var(--ts)'}}>Recents</div>
          )}
          {sessions.map(s => (
            <div key={s.id}
              style={{display:'flex',alignItems:'center',borderRadius:8,background:activeId===s.id?'var(--act)':'transparent',overflow:'hidden'}}
              onMouseEnter={e => { if (activeId!==s.id) (e.currentTarget as HTMLElement).style.background='var(--hov)' }}
              onMouseLeave={e => { if (activeId!==s.id) (e.currentTarget as HTMLElement).style.background='transparent' }}>
              <button
                onClick={() => { onSelectSession(s.id); onCloseMobile() }}
                style={{flex:1,textAlign:'left',padding:'8px 12px',background:'transparent',border:'none',cursor:'pointer',color:activeId===s.id?'var(--tp)':'var(--ts)',fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',minWidth:0}}>
                {s.title}
              </button>
              <button onClick={e => onDeleteSession(s.id, e)}
                style={{padding:'8px 8px',background:'transparent',border:'none',cursor:'pointer',color:'var(--ts)',flexShrink:0,opacity:0.5,display:'flex',alignItems:'center'}}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#f87171'; (e.currentTarget as HTMLElement).style.opacity='1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='var(--ts)'; (e.currentTarget as HTMLElement).style.opacity='0.5' }}>
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      )}
      {collapsed && <div style={{flex:1}}/>}

      {/* Bottom */}
      <div style={{borderTop:'1px solid var(--bdr)',padding:'12px 8px',flexShrink:0}}>
        {!collapsed && (
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 4px',borderRadius:8}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'#059669',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,flexShrink:0}}>R</div>
            <div style={{overflow:'hidden',minWidth:0}}>
              <div style={{fontSize:14,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:'var(--tp)'}}>Researcher</div>
              <div style={{fontSize:11,color:'var(--ts)',whiteSpace:'nowrap'}}>MAID plan</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── InputBox: top-level stable component — never defined inside Inner ─────────
// Defining it inside Inner causes a new component type every render → unmount/
// remount on every keystroke → mobile keyboard dismisses on every character.
interface InputBoxProps {
  taRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  loading: boolean
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void
}

function InputBox({ taRef, value, loading, onChange, onKeyDown, onSend }: InputBoxProps) {
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:6,border:'1px solid var(--bdr)',background:'var(--inp)',borderRadius:26,padding:'8px 10px'}}>
      <button style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',color:'var(--ts)',flexShrink:0}}>
        <IconPlus />
      </button>
      <textarea
        ref={taRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask about a drug, mechanism, or study"
        rows={1}
        style={{flex:1,resize:'none',background:'transparent',border:'none',outline:'none',color:'var(--tp)',fontSize:15,fontFamily:'inherit',maxHeight:200,minHeight:24,padding:'8px 6px',lineHeight:1.45}}
      />
      {value.trim() ? (
        <button onClick={onSend} disabled={loading}
          style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--btn)',color:'var(--btnT)',border:'none',cursor:'pointer',flexShrink:0,opacity:loading?0.4:1}}>
          <IconArrowUp />
        </button>
      ) : (
        <button style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer',background:'transparent',color:'var(--ts)',flexShrink:0}}>
          <IconMic />
        </button>
      )}
    </div>
  )
}

// ── Main inner component (needs Suspense for useSearchParams) ─────────────────
function Inner() {
  const params   = useSearchParams()
  const router   = useRouter()
  const supabase = createClient()

  const [messages, setMessages]     = useState<ChatMsg[]>([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [streaming, setStreaming]   = useState(false)
  const [streamText, setStreamText] = useState('')
  const [sessionId, setSessionId]   = useState<string | null>(null)
  const [mode]                      = useState<ToolMode>('general')
  const [model, setModel]           = useState<GroqModelId>('llama-3.3-70b-versatile')
  const [sources, setSources]       = useState<DataSource[]>([])
  const [dark, setDark]             = useState(true)
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [sessions, setSessions]     = useState<Session[]>([])
  const [activeId, setActiveId]     = useState<string|null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)   // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // desktop

  const bottomRef = useRef<HTMLDivElement>(null)
  const taHomeRef = useRef<HTMLTextAreaElement>(null)
  const taConvRef = useRef<HTMLTextAreaElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  const hasConvo = messages.length > 0 || streaming
  const activeTa = hasConvo ? taConvRef : taHomeRef

  // ── Theme CSS vars ──────────────────────────────────────────────────────────
  const vars = dark
    ? `--bg:#000;--sb:#000;--bdr:rgba(255,255,255,0.10);--tp:#f3f4f6;--ts:#9ca3af;
       --hov:rgba(255,255,255,0.08);--act:rgba(255,255,255,0.12);--inp:#1a1a1a;
       --bub:#2a2a2a;--btn:#fff;--btnT:#000;--mshadow:0 10px 30px rgba(0,0,0,.45);`
    : `--bg:#fff;--sb:#f7f7f8;--bdr:#e5e7eb;--tp:#111827;--ts:#6b7280;
       --hov:rgba(0,0,0,0.06);--act:rgba(0,0,0,0.08);--inp:#f0f0f1;
       --bub:#e9e9ea;--btn:#111827;--btnT:#fff;--mshadow:0 10px 30px rgba(0,0,0,.12);`

  const accent = '#10b981'

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadSessions()
    const sid = params.get('session')
    const q   = params.get('q')
    if (sid) loadSession(sid)
    else if (q) setInput(q)
  }, []) // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, streamText])

  useEffect(() => {
    const ta = activeTa.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [input, hasConvo]) // eslint-disable-line

  useEffect(() => {
    const h = () => setModelMenuOpen(false)
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  // ── Supabase helpers ────────────────────────────────────────────────────────
  async function loadSessions() {
    try {
      const res = await fetch('/api/sessions')
      if (!res.ok) return
      const json = await res.json()
      setSessions(json.sessions ?? [])
    } catch { /* ignore */ }
  }

  async function loadSession(id: string) {
    try {
      const res = await fetch(`/api/sessions/${id}`)
      if (!res.ok) return
      const json = await res.json()
      const s = json.session
      if (s) {
        setSessionId(s.id)
        setActiveId(s.id)
        setMessages(s.messages ?? [])
      }
    } catch { /* ignore */ }
  }

  async function mkSession(title: string): Promise<string | null> {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ title, tool_mode: mode }),
      })
      if (!res.ok) return null
      const json = await res.json()
      return json.session?.id ?? null
    } catch { return null }
  }

  async function saveMsgs(sid: string, msgs: ChatMsg[]) {
    try {
      await fetch(`/api/sessions/${sid}`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ messages: msgs }),
      })
    } catch { /* ignore */ }
  }

  async function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await fetch('/api/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ id }),
      })
      setSessions(prev => prev.filter(s => s.id !== id))
      if (activeId === id) startNewChat()
    } catch { /* ignore */ }
  }

  // ── Send message ────────────────────────────────────────────────────────────
  const send = useCallback(async (txt?: string) => {
    const content = (txt ?? input).trim()
    if (!content || loading) return

    setInput('')
    setLoading(true)
    setStreaming(false)
    setStreamText('')
    setSources([])

    const userMsg: ChatMsg = { id: nanoid(), role:'user', content, timestamp: new Date().toISOString() }
    const nextMsgs = [...messages, userMsg]
    setMessages(nextMsgs)

    // Create session if needed
    let sid = sessionId
    if (!sid) {
      sid = await mkSession(content.slice(0, 60))
      if (sid) {
        setSessionId(sid)
        setActiveId(sid)
        // Optimistically add to sidebar
        setSessions(prev => [{ id: sid!, title: content.slice(0, 60), updated_at: new Date().toISOString() }, ...prev])
      }
    }

    abortRef.current = new AbortController()
    let full = ''
    let srcs: DataSource[] = []

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ message: content, history: messages.slice(-10), mode, modelId: model, sessionId: sid }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => `HTTP ${res.status}`)
        throw new Error(errText)
      }
      if (!res.body) throw new Error('No stream body')

      setStreaming(true)
      const reader = res.body.getReader()
      const dec = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value)
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const d = JSON.parse(line.slice(6))
            if (d.type === 'sources') {
              srcs = d.sources ?? []
              setSources(srcs)
            } else if (d.type === 'token') {
              full += d.content
              setStreamText(full)
            } else if (d.type === 'error') {
              full = `⚠️ ${d.message ?? 'Unknown error from AI'}`
            }
          } catch { /* partial */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return
      full = `⚠️ ${String(e)}`
    }

    const aiMsg: ChatMsg = {
      id: nanoid(), role:'assistant',
      content: full || 'No response generated.',
      timestamp: new Date().toISOString(),
      sources: srcs,
    }
    const final = [...nextMsgs, aiMsg]
    setMessages(final)
    setStreamText('')
    setStreaming(false)
    setLoading(false)

    if (sid) {
      saveMsgs(sid, final)
      // Refresh sidebar to show updated timestamp
      loadSessions()
    }
  }, [input, loading, messages, mode, model, sessionId]) // eslint-disable-line

  function startNewChat() {
    abortRef.current?.abort()
    setMessages([])
    setSessionId(null)
    setActiveId(null)
    setInput('')
    setStreamText('')
    setStreaming(false)
    setLoading(false)
    setSources([])
    router.replace('/dashboard/chat')
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes maid-bounce{0%,80%,100%{transform:translateY(0);opacity:.45;}40%{transform:translateY(-5px);opacity:1;}}
        .maid-root{${vars}}
        .maid-root *{box-sizing:border-box;}
        .maid-prose p{color:var(--tp);line-height:1.75;margin:.5em 0;}
        .maid-prose h1,.maid-prose h2,.maid-prose h3{color:var(--tp);font-weight:600;margin:.9em 0 .4em;line-height:1.3;}
        .maid-prose ul,.maid-prose ol{color:var(--tp);padding-left:1.4em;}
        .maid-prose li{margin:.25em 0;}
        .maid-prose code{background:var(--hov);color:var(--tp);padding:2px 5px;border-radius:4px;font-size:.82em;}
        .maid-prose pre{background:var(--inp);border:1px solid var(--bdr);border-radius:8px;padding:1em;overflow-x:auto;margin:.8em 0;}
        .maid-prose pre code{background:none;padding:0;}
        .maid-prose strong{color:var(--tp);}
        .maid-prose table{width:100%;border-collapse:collapse;font-size:.88em;}
        .maid-prose th{background:var(--inp);color:var(--tp);padding:.45em .9em;border:1px solid var(--bdr);}
        .maid-prose td{color:var(--ts);padding:.45em .9em;border:1px solid var(--bdr);}
        .maid-root ::-webkit-scrollbar{width:6px;}
        .maid-root ::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:6px;}
        .maid-root ::-webkit-scrollbar-track{background:transparent;}
        /* Mobile overlay */
        .maid-mobile-overlay{display:none;}
        @media(max-width:768px){.maid-mobile-overlay{display:block;}}
        @media(max-width:768px){.maid-desktop-sidebar{display:none!important;}}
        @media(min-width:769px){.maid-mobile-topbar{display:none!important;}}
      `}</style>

      <div className="maid-root" style={{display:'flex',height:'100%',width:'100%',background:'var(--bg)',color:'var(--tp)',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',overflow:'hidden'}}>

        {/* ── Desktop sidebar ── */}
        <aside className="maid-desktop-sidebar" style={{
          width: sidebarCollapsed ? 68 : 280,
          flexShrink:0, display:'flex', flexDirection:'column',
          transition:'width .18s ease', overflow:'hidden',
        }}>
          <SidebarContent
            collapsed={sidebarCollapsed}
            sessions={sessions}
            activeId={activeId}
            onCollapse={() => setSidebarCollapsed(c => !c)}
            onNewChat={startNewChat}
            onSelectSession={id => { setActiveId(id); loadSession(id) }}
            onDeleteSession={deleteSession}
            onCloseMobile={() => {}}
          />
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div style={{position:'fixed',inset:0,zIndex:50,display:'flex'}}>
            <div onClick={() => setSidebarOpen(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.6)'}}/>
            <aside style={{position:'relative',width:280,flexShrink:0,zIndex:51,height:'100%',overflow:'hidden'}}>
              <SidebarContent
                collapsed={false}
                sessions={sessions}
                activeId={activeId}
                onCollapse={() => setSidebarCollapsed(c => !c)}
                onNewChat={startNewChat}
                onSelectSession={id => { setActiveId(id); loadSession(id) }}
                onDeleteSession={deleteSession}
                onCloseMobile={() => setSidebarOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* ── Main ── */}
        <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden'}}>

          {/* Mobile topbar */}
          <div className="maid-mobile-topbar" style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderBottom:'1px solid var(--bdr)',flexShrink:0,background:'var(--bg)'}}>
            <button onClick={() => setSidebarOpen(true)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--ts)',display:'flex',padding:4}}>
              <IconMenu />
            </button>
            <div style={{display:'flex',alignItems:'center',gap:8,flex:1}}>
              <div style={{width:24,height:24,borderRadius:'50%',background:accent,display:'flex',alignItems:'center',justifyContent:'center',color:'#000',flexShrink:0}}><IconPill /></div>
              <span style={{fontWeight:600,fontSize:15,color:'var(--tp)'}}>MAID</span>
            </div>
            <button onClick={() => setDark(d => !d)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--ts)',display:'flex',padding:4}}>
              {dark ? <IconSun /> : <IconMoon />}
            </button>
          </div>

          {/* Desktop topbar */}
          <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',flexShrink:0}}>
            {/* Model picker */}
            <div style={{position:'relative'}}>
              <button onClick={e => { e.stopPropagation(); setModelMenuOpen(o => !o) }}
                style={{display:'flex',alignItems:'center',gap:6,padding:'7px 10px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',fontSize:16,fontWeight:600,color:'var(--tp)'}}>
                {GROQ_MODELS[model]}
                <IconChevron />
              </button>
              {modelMenuOpen && (
                <div style={{position:'absolute',left:0,top:'calc(100% + 4px)',width:260,background:'var(--inp)',border:'1px solid var(--bdr)',borderRadius:12,padding:4,boxShadow:'var(--mshadow)',zIndex:30}}>
                  {(Object.keys(GROQ_MODELS) as GroqModelId[]).map(id => (
                    <button key={id} onClick={() => { setModel(id); setModelMenuOpen(false) }}
                      style={{display:'block',width:'100%',textAlign:'left',padding:'9px 12px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',color:'var(--tp)',fontSize:14,fontWeight: id===model ? 600 : 400}}>
                      {GROQ_MODELS[id]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button onClick={() => setDark(d => !d)}
                style={{display:'flex',alignItems:'center',justifyContent:'center',width:36,height:36,borderRadius:'50%',background:'transparent',border:'none',cursor:'pointer',color:'var(--ts)'}}>
                {dark ? <IconSun /> : <IconMoon />}
              </button>
            </div>
          </header>

          {/* ── Body ── */}
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>

            {/* EMPTY STATE */}
            {!hasConvo && (
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px 16px 0'}}>
                <h1 style={{fontSize:'clamp(22px,4vw,32px)',fontWeight:600,letterSpacing:'-0.02em',margin:'0 0 26px',textAlign:'center',color:'var(--tp)'}}>
                  What should we research today?
                </h1>
                <div style={{width:'100%',maxWidth:680}}>
                  <InputBox taRef={taHomeRef} value={input} loading={loading} onChange={setInput} onKeyDown={onKey} onSend={() => send()} />
                </div>
                <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:10,marginTop:22,maxWidth:680}}>
                  {SUGGESTIONS.map(({Icon,label,prompt}) => (
                    <button key={label} onClick={() => setInput(prompt)}
                      style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',borderRadius:999,border:'1px solid var(--bdr)',background:'transparent',color:'var(--tp)',fontSize:14,cursor:'pointer'}}>
                      <span style={{color:'var(--ts)',display:'flex'}}><Icon /></span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CONVERSATION */}
            {hasConvo && (
              <div style={{flex:1,overflowY:'auto',minHeight:0}}>
                <div style={{maxWidth:768,margin:'0 auto',padding:'24px 16px 8px',display:'flex',flexDirection:'column',gap:22}}>
                  {messages.map(m => (
                    <div key={m.id} style={{display:'flex',justifyContent: m.role==='user' ? 'flex-end' : 'flex-start',gap: m.role==='assistant' ? 12 : 0,alignItems:'flex-start'}}>
                      {m.role === 'assistant' && (
                        <div style={{width:28,height:28,borderRadius:'50%',background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2,color:'#000'}}>
                          <IconPill />
                        </div>
                      )}
                      {m.role === 'user' ? (
                        <div style={{maxWidth:'80%',background:'var(--bub)',color:'var(--tp)',padding:'10px 16px',borderRadius:22,fontSize:15,lineHeight:1.5,wordBreak:'break-word'}}>
                          {m.content}
                        </div>
                      ) : (
                        <div className="maid-prose" style={{flex:1,minWidth:0,fontSize:15,lineHeight:1.55,paddingTop:2,color:'var(--tp)'}}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming */}
                  {streaming && streamText && (
                    <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2,color:'#000'}}>
                        <IconPill />
                      </div>
                      <div className="maid-prose" style={{flex:1,minWidth:0,fontSize:15,lineHeight:1.55,paddingTop:2,color:'var(--tp)'}}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamText}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Typing dots */}
                  {loading && !streaming && (
                    <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#000'}}>
                        <IconPill />
                      </div>
                      <TypingDots />
                    </div>
                  )}

                  {/* Sources */}
                  {sources.length > 0 && !loading && (
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginLeft:40}}>
                      {sources.map((s,i) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                          style={{fontSize:12,padding:'4px 10px',borderRadius:999,border:'1px solid var(--bdr)',color:'var(--ts)',textDecoration:'none'}}>
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

          {/* Bottom input (conversation view) */}
          {hasConvo && (
            <div style={{padding:'4px 16px 12px',flexShrink:0}}>
              <div style={{maxWidth:768,margin:'0 auto'}}>
                <InputBox taRef={taConvRef} value={input} loading={loading} onChange={setInput} onKeyDown={onKey} onSend={() => send()} />
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p style={{textAlign:'center',fontSize:11,color:'var(--ts)',paddingBottom:12,margin:0,flexShrink:0,padding:'0 16px 12px'}}>
            MAID can make mistakes. Always verify critical drug and clinical information independently.
          </p>
        </div>
      </div>
    </>
  )
}

export default function ChatInterface() {
  return (
    <Suspense fallback={<div style={{height:'100%',background:'#000'}}/>}>
      <Inner />
    </Suspense>
  )
}
