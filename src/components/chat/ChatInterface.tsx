'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, Plus, Settings2, ChevronDown, Database } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ModelSelector from './ModelSelector'
import ModeSelector from './ModeSelector'
import SourcesBadge from './SourcesBadge'
import type { ChatMessage as ChatMsg, ToolMode, DataSource } from '@/types'
import { GROQ_MODELS, type GroqModelId } from '@/lib/groq/client'
import { nanoid } from './nanoid'

function ChatInterfaceInner() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [mode, setMode] = useState<ToolMode>('general')
  const [modelId, setModelId] = useState<GroqModelId>('llama-3.3-70b-versatile')
  const [showSettings, setShowSettings] = useState(false)
  const [lastSources, setLastSources] = useState<DataSource[]>([])
  const [lastTools, setLastTools] = useState<string[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load session from URL param
  useEffect(() => {
    const sid = searchParams.get('session')
    const q = searchParams.get('q')
    if (sid) loadSession(sid)
    if (q) setInput(q)
  }, []) // eslint-disable-line

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  async function loadSession(id: string) {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      setSessionId(data.id)
      setMessages(data.messages ?? [])
      setMode(data.tool_mode ?? 'general')
    }
  }

  async function createSession(firstMessage: string): Promise<string> {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: firstMessage.slice(0, 60),
        tool_mode: mode,
      }),
    })
    const json = await res.json()
    return json.session.id
  }

  async function saveMessages(sid: string, msgs: ChatMsg[]) {
    await supabase
      .from('chat_sessions')
      .update({ messages: msgs, updated_at: new Date().toISOString() })
      .eq('id', sid)
  }

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    setInput('')
    setLoading(true)
    setIsStreaming(false)
    setStreamingContent('')
    setLastSources([])
    setLastTools([])

    const userMsg: ChatMsg = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)

    // Create session if needed
    let sid = sessionId
    if (!sid) {
      sid = await createSession(content)
      setSessionId(sid)
    }

    // Stream from API
    abortRef.current = new AbortController()
    let fullContent = ''
    let sources: DataSource[] = []
    let tools: string[] = []

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-10),
          mode,
          modelId,
          sessionId: sid,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      if (!res.body) throw new Error('No response body')

      setIsStreaming(true)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'sources') {
              sources = data.sources ?? []
              tools = data.toolsUsed ?? []
              setLastSources(sources)
              setLastTools(tools)
            } else if (data.type === 'token') {
              fullContent += data.content
              setStreamingContent(fullContent)
            } else if (data.type === 'done') {
              break
            } else if (data.type === 'error') {
              throw new Error(data.message)
            }
          } catch {}
        }
      }
    } catch (e: unknown) {
      if ((e as Error)?.name === 'AbortError') return
      fullContent = `Sorry, an error occurred: ${String(e)}`
    }

    const assistantMsg: ChatMsg = {
      id: nanoid(),
      role: 'assistant',
      content: fullContent || 'No response generated.',
      timestamp: new Date().toISOString(),
      sources,
    }

    const finalMessages = [...newMessages, assistantMsg]
    setMessages(finalMessages)
    setStreamingContent('')
    setIsStreaming(false)
    setLoading(false)

    if (sid) saveMessages(sid, finalMessages)
  }, [input, loading, messages, mode, modelId, sessionId]) // eslint-disable-line

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function newChat() {
    setMessages([])
    setSessionId(null)
    setInput('')
    setStreamingContent('')
    setLastSources([])
    setLastTools([])
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={newChat}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New chat
          </button>
          <ModeSelector value={mode} onChange={setMode} />
        </div>

        <div className="flex items-center gap-2">
          {lastTools.length > 0 && (
            <div className="flex items-center gap-1.5 text-white/30 text-xs">
              <Database className="w-3 h-3" />
              <span>{lastTools.length} tools used</span>
            </div>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Settings panel ── */}
      {showSettings && (
        <div className="border-b border-white/10 px-4 py-3 bg-white/5 flex items-center gap-4 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">Model:</span>
            <ModelSelector value={modelId} onChange={setModelId} />
          </div>
          <button onClick={() => setShowSettings(false)} className="ml-auto text-white/30 hover:text-white text-xs">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-white/60" />
            </div>
            <h3 className="text-white font-medium mb-2">Ask MAID anything</h3>
            <p className="text-white/30 text-sm max-w-sm leading-relaxed">
              Search across PubChem, ChEMBL, OpenFDA, ClinicalTrials.gov, RxNorm, and UniProt simultaneously.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-8 w-full max-w-xl">
              {[
                'Analyze aspirin: mechanism, interactions, side effects',
                'Find Phase 3 trials for diabetes drugs recruiting now',
                'Check interactions: warfarin + aspirin + ibuprofen',
                'Find similar molecules to imatinib for cancer treatment',
              ].map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-left text-xs text-white/50 border border-white/10 rounded-lg px-3 py-2.5 hover:border-white/25 hover:text-white hover:bg-white/5 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Streaming bubble */}
        {isStreaming && streamingContent && (
          <ChatMessage
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              timestamp: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {/* Thinking indicator */}
        {loading && !isStreaming && (
          <div className="flex gap-3">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-black text-[10px] font-bold">M</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching databases...</span>
            </div>
          </div>
        )}

        {/* Sources */}
        {lastSources.length > 0 && !loading && (
          <SourcesBadge sources={lastSources} tools={lastTools} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="border-t border-white/10 p-4 shrink-0">
        <div className="relative flex items-end gap-3 bg-white/5 border border-white/15 rounded-2xl px-4 py-3 focus-within:border-white/30 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any drug, molecule, protein, or clinical trial..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/25 text-sm resize-none focus:outline-none leading-relaxed max-h-[200px]"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-black animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-black" />
            )}
          </button>
        </div>
        <p className="text-white/20 text-[10px] text-center mt-2">
          MAID searches live scientific databases. Always verify with qualified professionals.
        </p>
      </div>
    </div>
  )
}

export default function ChatInterface() {
  return (
    <Suspense fallback={<div className="flex-1 bg-black" />}>
      <ChatInterfaceInner />
    </Suspense>
  )
}
