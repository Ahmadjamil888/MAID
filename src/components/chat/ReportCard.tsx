'use client'

import { useState } from 'react'
import type { ChatMessage } from '@/types'
import type { GroqModelId } from '@/lib/groq/models'

interface Props {
  title: string
  sessionId: string | null
  history: ChatMessage[]
  modelId: GroqModelId
}

const steps = [
  'Analyzing research conversation…',
  'Gathering scientific data…',
  'Synthesizing pharmacological findings…',
  'Building report structure…',
  'Writing Executive Summary…',
  'Compiling clinical evidence…',
  'Generating safety analysis…',
  'Formatting tables & references…',
  'Rendering PDF document…',
  'Finalizing report…',
]

export default function ReportCard({ title, sessionId, history, modelId }: Props) {
  const [generating, setGenerating] = useState(false)
  const [step, setStep]             = useState(0)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')
  const [filename, setFilename]     = useState('')

  async function generate() {
    setGenerating(true)
    setDone(false)
    setError('')
    setStep(0)

    // Animate through steps while fetching
    const interval = setInterval(() => {
      setStep(s => Math.min(s + 1, steps.length - 1))
    }, 1800)

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, title, history, modelId }),
      })

      clearInterval(interval)

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      // Stream the blob
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const disp = res.headers.get('Content-Disposition') ?? ''
      const match = disp.match(/filename="([^"]+)"/)
      const fname = match?.[1] ?? `MAID_Report_${Date.now()}.pdf`
      setFilename(fname)

      // Auto-download
      const a = document.createElement('a')
      a.href     = url
      a.download = fname
      a.click()
      URL.revokeObjectURL(url)

      setDone(true)
    } catch (e) {
      clearInterval(interval)
      setError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{
      border: '1px solid rgba(16,185,129,0.3)',
      borderRadius: 16,
      background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(5,150,105,0.03) 100%)',
      padding: '20px 24px',
      maxWidth: 480,
      marginTop: 8,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #059669, #047857)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PdfIcon />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>
            Research Report
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6', lineHeight: 1.3, wordBreak: 'break-word' }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
            ~25–30 pages · Professional PDF · All databases
          </div>
        </div>
      </div>

      {/* Progress / done state */}
      {generating && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Spinner />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{steps[step]}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((step + 1) / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #059669, #10b981)',
              borderRadius: 2,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      )}

      {done && !generating && (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, padding:'8px 12px', background:'rgba(16,185,129,0.12)', borderRadius:8 }}>
          <CheckIcon />
          <span style={{ fontSize:12, color:'#10b981', fontWeight:500 }}>Report downloaded: {filename}</span>
        </div>
      )}

      {error && (
        <div style={{ marginBottom:14, padding:'8px 12px', background:'rgba(239,68,68,0.1)', borderRadius:8, border:'1px solid rgba(239,68,68,0.2)' }}>
          <span style={{ fontSize:11, color:'#f87171' }}>⚠️ {error}</span>
        </div>
      )}

      {/* What's included */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        {['Executive Summary','Pharmacology','ADMET','Clinical Data','Safety Profile','Drug Interactions','Regulatory Status','References'].map(tag => (
          <span key={tag} style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 99,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#9ca3af',
          }}>{tag}</span>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={generating}
        style={{
          width: '100%',
          padding: '11px 20px',
          borderRadius: 10,
          border: 'none',
          cursor: generating ? 'not-allowed' : 'pointer',
          background: generating
            ? 'rgba(255,255,255,0.08)'
            : 'linear-gradient(135deg, #059669, #047857)',
          color: generating ? '#6b7280' : '#fff',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { if (!generating) (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
      >
        {generating ? (
          <><Spinner /><span>Generating report…</span></>
        ) : done ? (
          <><DownloadIcon /><span>Download again</span></>
        ) : (
          <><DownloadIcon /><span>Generate & Download PDF</span></>
        )}
      </button>
    </div>
  )
}

// ── Inline icons ──────────────────────────────────────────────────────────────
function PdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  )
}
