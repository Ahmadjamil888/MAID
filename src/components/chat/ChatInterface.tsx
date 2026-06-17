'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMsg, ToolMode, DataSource } from '@/types'
import type { GroqModelId } from '@/lib/groq/models'
import { GROQ_MODELS, DEFAULT_MODEL } from '@/lib/groq/models'
import { nanoid } from './nanoid'
import ReportCard from './ReportCard'
import { PillLogo } from '@/components/dashboard/DashboardShell'

// ── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Plus:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17,display:'block'}}><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Search:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Molecules:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M10 2v6.29a2 2 0 0 1-.5 1.32L4.7 15.7A2 2 0 0 0 6 19h12a2 2 0 0 0 1.3-3.3l-4.8-6.09a2 2 0 0 1-.5-1.32V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>,
  Interact: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Trials:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
  Proteins: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Reports:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Settings: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Logout:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  PanelO:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18,display:'block'}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>,
  PanelC:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18,display:'block'}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9-2 3 2 3"/></svg>,
  ArrowUp:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15,display:'block'}}><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>,
  Chevron:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15,display:'block'}}><path d="m6 9 6 6 6-6"/></svg>,
  Trash:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13,display:'block'}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Menu:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20,display:'block'}}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Copy:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13,display:'block'}}><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Check:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13,display:'block'}}><polyline points="20 6 9 17 4 12"/></svg>,
  Attach:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  Stop:     ()=><svg viewBox="0 0 24 24" fill="currentColor" style={{width:13,height:13,display:'block'}}><rect x="6" y="6" width="12" height="12" rx="2"/></svg>,
  Mic:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/><path d="M8 22h8"/></svg>,
  Home:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,display:'block'}}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Session { id: string; title: string; tool_mode: ToolMode; updated_at: string; messages: ChatMsg[] }
interface AttachedFile { id: string; name: string; type: string; dataUrl: string; text?: string }

// ── Helpers ───────────────────────────────────────────────────────────────────
function AiAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8, background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, boxShadow: '0 0 0 1px rgba(255,255,255,0.12)',
    }}>
      <PillLogo size={22} />
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)',
          display: 'inline-block',
          animation: 'bounce 1.2s infinite ease-in-out',
          animationDelay: `${i * 0.2}s`,
        }}/>
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  )
}

function VoicePulse() {
  return (
    <>
      <style>{`
        @keyframes voicePulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          50%  { transform: scale(1.5); opacity: 0.15; }
          100% { transform: scale(1);   opacity: 0.6; }
        }
        .voice-ring { animation: voicePulse 1.2s ease-in-out infinite; }
        .voice-ring:nth-child(2) { animation-delay: 0.3s; }
        .voice-ring:nth-child(3) { animation-delay: 0.6s; }
      `}</style>
      {[32,44,56].map((s,i) => (
        <span key={i} className="voice-ring" style={{
          position: 'absolute', width: s, height: s, borderRadius: '50%',
          border: '1.5px solid #ef4444', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }}/>
      ))}
    </>
  )
}

const SUGGESTIONS = [
  { icon: '💊', text: 'Analyze aspirin\'s mechanism and side effects' },
  { icon: '🔬', text: 'Compare ibuprofen vs naproxen pharmacokinetics' },
  { icon: '⚗️', text: 'Search for EGFR inhibitor drug candidates' },
  { icon: '🧬', text: 'Find clinical trials for KRAS G12C mutations' },
]

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function sessionTitle(msgs: ChatMsg[]) {
  const first = msgs.find(m => m.role === 'user')
  if (!first) return 'New session'
  return first.content.slice(0, 40) + (first.content.length > 40 ? '…' : '')
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const SIDEBAR_NAV = [
  { label: 'Molecules',    href: '/dashboard/molecules',    Icon: Ic.Molecules },
  { label: 'Interactions', href: '/dashboard/interactions', Icon: Ic.Interact  },
  { label: 'Trials',       href: '/dashboard/trials',       Icon: Ic.Trials    },
  { label: 'Proteins',     href: '/dashboard/proteins',     Icon: Ic.Proteins  },
  { label: 'Reports',      href: '/dashboard/reports',      Icon: Ic.Reports   },
  { label: 'Settings',     href: '/dashboard/settings',     Icon: Ic.Settings  },
]

// ── CopyButton ────────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      title="Copy"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: copied ? '#10b981' : 'rgba(255,255,255,0.3)',
        padding: '2px 4px', borderRadius: 4, display: 'flex',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e=>(e.currentTarget.style.color = copied ? '#10b981' : 'rgba(255,255,255,0.6)')}
      onMouseLeave={e=>(e.currentTarget.style.color = copied ? '#10b981' : 'rgba(255,255,255,0.3)')}
    >
      {copied ? <Ic.Check /> : <Ic.Copy />}
    </button>
  )
}

// ── SourcesBadge ──────────────────────────────────────────────────────────────
function SourcesBadge({ sources }: { sources: DataSource[] }) {
  if (!sources.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {sources.map((s, i) => (
        s.url ? (
          <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20,
            background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
          }}>{s.name}</a>
        ) : (
          <span key={i} style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20,
            background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>{s.name}</span>
        )
      ))}
    </div>
  )
}

// ── Main component (inner, uses useSearchParams) ──────────────────────────────
function ChatInterfaceInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages,    setMessages]    = useState<ChatMsg[]>([])
  const [input,       setInput]       = useState('')
  const [isLoading,   setIsLoading]   = useState(false)
  const [model,       setModel]       = useState<GroqModelId>(DEFAULT_MODEL)
  const [mode,        setMode]        = useState<ToolMode>('general')
  const [sessionId,   setSessionId]   = useState<string|null>(null)
  const [sessions,    setSessions]    = useState<Session[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [attachments, setAttachments] = useState<AttachedFile[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [showModeMenu,  setShowModeMenu]  = useState(false)

  // ── Refs ───────────────────────────────────────────────────────────────────
  const messagesEndRef   = useRef<HTMLDivElement>(null)
  const textareaRef      = useRef<HTMLTextAreaElement>(null)
  const fileInputRef     = useRef<HTMLInputElement>(null)
  const abortRef         = useRef<AbortController|null>(null)
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef        = useRef<Blob[]>([])

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [input])

  // ── Load sessions ──────────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const r = await fetch('/api/sessions')
      if (r.ok) {
        const j = await r.json()
        setSessions(j.sessions ?? [])
      }
    } catch {}
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])

  // ── Handle ?session= param ─────────────────────────────────────────────────
  useEffect(() => {
    const sid = searchParams.get('session')
    if (sid) {
      loadSession(sid)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // ── Session management ─────────────────────────────────────────────────────
  async function loadSession(id: string) {
    const found = sessions.find(s => s.id === id)
    if (found) {
      setSessionId(found.id)
      setMessages(found.messages ?? [])
      setMode(found.tool_mode ?? 'general')
    } else {
      try {
        const r = await fetch(`/api/sessions/${id}`)
        if (r.ok) {
          const j = await r.json()
          setSessionId(j.session.id)
          setMessages(j.session.messages ?? [])
          setMode(j.session.tool_mode ?? 'general')
        }
      } catch {}
    }
    router.push(`/dashboard/chat?session=${id}`, { scroll: false })
  }

  async function newSession() {
    setMessages([])
    setSessionId(null)
    setInput('')
    setAttachments([])
    router.push('/dashboard/chat', { scroll: false })
  }

  async function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await fetch('/api/sessions', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } })
      setSessions(prev => prev.filter(s => s.id !== id))
      if (sessionId === id) newSession()
    } catch {}
  }

  async function saveMessages(sid: string, msgs: ChatMsg[]) {
    try {
      await fetch(`/api/sessions/${sid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs, title: sessionTitle(msgs) }),
      })
    } catch {}
  }

  // ── File attachment ────────────────────────────────────────────────────────
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const dataUrl = ev.target?.result as string
        const attached: AttachedFile = { id: nanoid(), name: file.name, type: file.type, dataUrl }
        if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
          const textReader = new FileReader()
          textReader.onload = te => {
            attached.text = te.target?.result as string
            setAttachments(prev => [...prev, attached])
          }
          textReader.readAsText(file)
        } else {
          setAttachments(prev => [...prev, attached])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  // ── Voice input ────────────────────────────────────────────────────────────
  async function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        // For now we append a note — real transcription would call Whisper API
        const url = URL.createObjectURL(blob)
        setInput(prev => prev + (prev ? ' ' : '') + '[Voice message recorded]')
        // attach the audio
        setAttachments(prev => [...prev, {
          id: nanoid(), name: 'voice-recording.webm', type: 'audio/webm', dataUrl: url,
        }])
      }
      mr.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Mic error:', err)
    }
  }

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content && !attachments.length) return
    if (isLoading) return

    // Build content with attachment context
    let fullContent = content
    const textAttachments = attachments.filter(a => a.text)
    if (textAttachments.length) {
      fullContent += '\n\n' + textAttachments.map(a =>
        `[Attached file: ${a.name}]\n\`\`\`\n${a.text?.slice(0, 4000)}\n\`\`\``
      ).join('\n\n')
    }
    const hasImages = attachments.some(a => a.type.startsWith('image/'))

    const userMsg: ChatMsg = {
      id: nanoid(), role: 'user', content: fullContent,
      timestamp: new Date().toISOString(),
      metadata: hasImages ? { images: attachments.filter(a=>a.type.startsWith('image/')).map(a=>a.dataUrl) } : undefined,
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setAttachments([])
    setIsLoading(true)

    // Ensure session exists
    let sid = sessionId
    if (!sid) {
      try {
        const r = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: sessionTitle(newMessages), tool_mode: mode }),
        })
        if (r.ok) {
          const j = await r.json()
          sid = j.session.id
          setSessionId(sid)
          router.push(`/dashboard/chat?session=${sid}`, { scroll: false })
          loadSessions()
        }
      } catch {}
    }

    // Placeholder for streaming
    const assistantId = nanoid()
    const assistantMsg: ChatMsg = {
      id: assistantId, role: 'assistant', content: '',
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, assistantMsg])

    try {
      abortRef.current = new AbortController()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({ message: fullContent, history: newMessages, mode, modelId: model, sessionId: sid }),
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader   = res.body.getReader()
      const decoder  = new TextDecoder()
      let   buffer   = ''
      let   fullText = ''
      let   sources: DataSource[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            if (evt.type === 'token') {
              fullText += evt.content
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: fullText } : m
              ))
            } else if (evt.type === 'sources') {
              sources = evt.sources ?? []
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, sources } : m
              ))
            } else if (evt.type === 'done') {
              break
            }
          } catch {}
        }
      }

      // Save full conversation
      if (sid) {
        const finalMessages: ChatMsg[] = [
          ...newMessages,
          { id: assistantId, role: 'assistant', content: fullText, timestamp: new Date().toISOString(), sources },
        ]
        await saveMessages(sid, finalMessages)
        setSessions(prev => prev.map(s =>
          s.id === sid ? { ...s, messages: finalMessages, updated_at: new Date().toISOString() } : s
        ))
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'An error occurred. Please try again.' }
            : m
        ))
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [input, attachments, messages, isLoading, sessionId, mode, model, router, loadSessions])

  function stopGeneration() {
    abortRef.current?.abort()
    setIsLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const currentModelInfo = GROQ_MODELS[model]

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0d0d0d', position: 'relative' }}>

      {/* ── Left sidebar (chat history) ── */}
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
        />
      )}

      <aside style={{
        width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#111', borderRight: '1px solid rgba(255,255,255,0.06)',
        // Desktop: respect sidebarOpen
        ...(typeof window !== 'undefined' && window.innerWidth >= 768
          ? (sidebarOpen ? {} : { width: 0, overflow: 'hidden', borderRight: 'none' })
          : {}),
        // Mobile: absolute overlay
        position: (typeof window !== 'undefined' && window.innerWidth < 768) ? 'fixed' : 'relative',
        top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: (typeof window !== 'undefined' && window.innerWidth < 768)
          ? (mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)')
          : undefined,
        transition: 'width 0.25s ease, transform 0.28s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <button
            onClick={newSession}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '7px 10px', color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer', fontSize: 12, fontWeight: 500,
            }}
          >
            <Ic.Plus /> New chat
          </button>
        </div>

        {/* Sessions list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {sessions.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center', padding: '24px 8px' }}>
              No sessions yet
            </p>
          )}
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => { loadSession(s.id); setMobileSidebarOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                background: sessionId === s.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', borderRadius: 7, padding: '7px 8px',
                color: sessionId === s.id ? '#fff' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer', fontSize: 12, textAlign: 'left',
                transition: 'background 0.15s', marginBottom: 1,
              }}
              onMouseEnter={e => { if (sessionId !== s.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (sessionId !== s.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sessionTitle(s.messages)}
              </span>
              <span
                onClick={e => deleteSession(s.id, e)}
                style={{
                  flexShrink: 0, opacity: 0, color: 'rgba(255,100,100,0.6)',
                  display: 'flex', alignItems: 'center',
                }}
                className="session-delete"
              ><Ic.Trash /></span>
            </button>
          ))}
          <style>{`.session-delete{opacity:0!important}.session-delete:hover~.session-delete,.session-delete:hover{opacity:1!important} button:hover .session-delete{opacity:1!important}`}</style>
        </div>

        {/* Nav links */}
        <div style={{ padding: '6px 6px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {SIDEBAR_NAV.map(({ label, href, Icon }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                background: 'transparent', border: 'none', borderRadius: 7,
                padding: '7px 8px', color: 'rgba(255,255,255,0.35)',
                cursor: 'pointer', fontSize: 12, textAlign: 'left',
                transition: 'background 0.15s, color 0.15s', marginBottom: 1,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'
              }}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#0d0d0d', flexShrink: 0,
        }}>
          {/* Toggle sidebar (desktop) */}
          <button
            className="hidden md:flex"
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
            }}
            title={sidebarOpen ? 'Hide history' : 'Show history'}
          >
            {sidebarOpen ? <Ic.PanelC /> : <Ic.PanelO />}
          </button>
          {/* Mobile hamburger */}
          <button
            className="flex md:hidden"
            onClick={() => setMobileSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}
          >
            <Ic.Menu />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PillLogo size={22} />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>Research Chat</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Model picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowModelMenu(o => !o); setShowModeMenu(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '5px 9px', color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', fontSize: 12,
              }}
            >
              <span>{currentModelInfo?.label ?? model}</span>
              <Ic.Chevron />
            </button>
            {showModelMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', zIndex: 100,
                background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: 6, minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                {Object.entries(GROQ_MODELS).map(([id, { label, description }]) => (
                  <button
                    key={id}
                    onClick={() => { setModel(id as GroqModelId); setShowModelMenu(false) }}
                    style={{
                      width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      background: model === id ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none', borderRadius: 7, padding: '7px 10px',
                      cursor: 'pointer', marginBottom: 1,
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowModeMenu(o => !o); setShowModelMenu(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '5px 9px', color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', fontSize: 12,
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{mode.replace(/_/g, ' ')}</span>
              <Ic.Chevron />
            </button>
            {showModeMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', zIndex: 100,
                background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: 6, minWidth: 170,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                {([
                  ['general','General'],['drug_analysis','Drug Analysis'],
                  ['molecule_search','Molecules'],['interaction_check','Interactions'],
                  ['clinical_trials','Trials'],['protein_analysis','Proteins'],
                  ['drug_design','Drug Design'],['literature_review','Literature'],
                ] as [ToolMode, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setMode(val); setShowModeMenu(false) }}
                    style={{
                      width: '100%', textAlign: 'left', background: mode === val ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none', borderRadius: 7, padding: '7px 10px',
                      color: mode === val ? '#fff' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', fontSize: 12, marginBottom: 1,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close menus on outside click */}
        {(showModelMenu || showModeMenu) && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => { setShowModelMenu(false); setShowModeMenu(false) }}
          />
        )}

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px' }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <PillLogo size={48} />
                </div>
                <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>MAID Research Assistant</h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 36, maxWidth: 380, margin: '0 auto 36px' }}>
                  AI-powered pharmaceutical intelligence. Ask about drugs, molecules, interactions, trials, or proteins.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 520, margin: '0 auto' }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.text)}
                      style={{
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                        color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.4,
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
                      }}
                    >
                      <span style={{ fontSize: 16, display: 'block', marginBottom: 6 }}>{s.icon}</span>
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex', gap: 12, marginBottom: 24,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                }}
              >
                {/* Avatar */}
                {msg.role === 'assistant' ? (
                  <AiAvatar />
                ) : (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, color: '#fff',
                  }}>U</div>
                )}

                {/* Bubble */}
                <div style={{ flex: 1, minWidth: 0, maxWidth: msg.role === 'user' ? '80%' : '100%' }}>
                  <div style={{
                    background: msg.role === 'user'
                      ? 'rgba(255,255,255,0.08)'
                      : 'transparent',
                    borderRadius: 12, padding: msg.role === 'user' ? '10px 14px' : '0',
                    border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }}>
                    {msg.role === 'assistant' && msg.content === '' && isLoading ? (
                      <TypingDots />
                    ) : msg.role === 'assistant' ? (
                      <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 1.7 }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                        {msg.content}
                      </p>
                    )}
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <SourcesBadge sources={msg.sources} />
                  )}

                  {/* Report card — only on last assistant message */}
                  {msg.role === 'assistant' && msg.content && msg.id === [...messages].reverse().find(m => m.role === 'assistant')?.id && (
                    <div style={{ marginTop: 12 }}>
                      <ReportCard
                        title={sessionTitle(messages)}
                        sessionId={sessionId}
                        history={messages}
                        modelId={model}
                      />
                    </div>
                  )}

                  {/* Timestamp + copy */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.content && <CopyButton text={msg.content} />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div style={{
          padding: '12px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          background: '#0d0d0d', flexShrink: 0,
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>

            {/* Attachment previews */}
            {attachments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {attachments.map(a => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '4px 8px',
                    }}
                  >
                    {a.type.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.dataUrl} alt={a.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                      <Ic.Attach />
                    )}
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.name}
                    </span>
                    <button
                      onClick={() => removeAttachment(a.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 14, lineHeight: 1, padding: 0 }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Input box */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 0,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '8px 8px 8px 12px',
              transition: 'border-color 0.15s',
            }}
              onFocus={() => {}} // handled by textarea below
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a drug, molecule, interaction, or clinical trial…"
                rows={1}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 14, lineHeight: 1.6, resize: 'none',
                  fontFamily: 'inherit', padding: '2px 0', maxHeight: 160, overflowY: 'auto',
                }}
              />

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, paddingBottom: 1, paddingLeft: 6 }}>
                {/* File attach */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.txt,.csv,.pdf,.docx,.md"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: '6px', borderRadius: 8, display: 'flex',
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'
                    ;(e.currentTarget as HTMLElement).style.background = 'none'
                  }}
                >
                  <Ic.Attach />
                </button>

                {/* Voice */}
                <button
                  onClick={toggleRecording}
                  title={isRecording ? 'Stop recording' : 'Voice input'}
                  style={{
                    position: 'relative', background: isRecording ? 'rgba(239,68,68,0.15)' : 'none',
                    border: 'none', cursor: 'pointer',
                    color: isRecording ? '#ef4444' : 'rgba(255,255,255,0.3)',
                    padding: '6px', borderRadius: 8, display: 'flex',
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isRecording) {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
                      ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isRecording) {
                      ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'
                      ;(e.currentTarget as HTMLElement).style.background = 'none'
                    }
                  }}
                >
                  {isRecording && <VoicePulse />}
                  <Ic.Mic />
                </button>

                {/* Send / Stop */}
                <button
                  onClick={isLoading ? stopGeneration : () => sendMessage()}
                  disabled={!isLoading && !input.trim() && !attachments.length}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: isLoading
                      ? 'rgba(239,68,68,0.8)'
                      : (input.trim() || attachments.length) ? '#fff' : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: isLoading || input.trim() || attachments.length ? 'pointer' : 'default',
                    color: isLoading ? '#fff' : '#000',
                    transition: 'background 0.15s',
                  }}
                >
                  {isLoading ? <Ic.Stop /> : <Ic.ArrowUp />}
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
              MAID provides research assistance only — not medical advice. Always verify with authoritative sources.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Export (wrapped in Suspense for useSearchParams) ──────────────────────────
export default function ChatInterface() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
        Loading…
      </div>
    }>
      <ChatInterfaceInner />
    </Suspense>
  )
}
