'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  MessageSquare, FlaskConical, Activity, Dna, Search, Zap,
  Shield, BookOpen, ArrowRight, CheckCircle, Database,
  Microscope, Cpu, BarChart3, Clock, Users, FileSearch,
} from 'lucide-react'

/* ─── shared token ─── */
const BG   = '#111110'       // near-black warm
const CARD = '#1a1918'       // card background
const BORDER = '#2a2927'     // border colour
const TEXT  = '#ffffff'
const MUTED = '#999690'      // readable muted — was too dark before
const DIM   = '#666360'      // secondary labels

/* ─── Stats ─── */
const STATS = [
  { icon: Database,     value: '8',      label: 'scientific databases' },
  { icon: Clock,        value: '<30s',   label: 'avg report time' },
  { icon: Cpu,          value: '5',      label: 'Groq AI models' },
  { icon: BarChart3,    value: '400K+',  label: 'clinical trials' },
  { icon: FlaskConical, value: '100M+',  label: 'compounds' },
  { icon: Users,        value: 'Free',   label: 'to get started' },
]

/* ─── Feature sections (Cursor-style: text + mock side by side) ─── */
const FEATURE_SECTIONS = [
  {
    tag: 'Research Agent',
    headline: 'Agents turn ideas into\nscientific insights',
    sub: 'Accelerate discovery by handing off research tasks to MAID, while you focus on making decisions. MAID queries every relevant database in parallel and synthesises a structured report.',
    cta: 'Start your first session',
    ctaHref: '/auth/signup',
    mockTitle: 'MAID Research Chat',
    mockLines: [
      { role: 'user',  text: 'Analyze ibuprofen — mechanism, side effects, and suggest safer analogs' },
      { role: 'ai',    text: 'Searching PubChem, ChEMBL, OpenFDA, RxNorm…' },
      { role: 'result', text: 'Ibuprofen (CID 3672) — COX-1/COX-2 non-selective NSAID. MW 206.28, LogP 3.97. Top analogs: Celecoxib (COX-2 selective, lower GI risk), Meloxicam (preferential COX-2).' },
    ],
    sources: ['PubChem', 'ChEMBL', 'OpenFDA', 'RxNorm'],
    flip: false,
  },
  {
    tag: 'Molecular Intelligence',
    headline: 'Works autonomously,\nthinks in molecules',
    sub: 'MAID analyses molecular structure, computes Lipinski drug-likeness, predicts ADMET properties, and surfaces structurally similar compounds — then reviews the results with you.',
    cta: 'Explore molecule search',
    ctaHref: '/auth/signup',
    mockTitle: 'MAID Molecule Analysis',
    mockLines: [
      { role: 'user',  text: 'aspirin' },
      { role: 'result', text: 'Acetylsalicylic acid · C₉H₈O₄ · MW 180.16\nLipinski Ro5: ✓ MW ✓ LogP ✓ HBD ✓ HBA\nXLogP: 1.19  TPSA: 63.6 Å²' },
      { role: 'ai',    text: '3 similar compounds found: Salicylic acid, Diflunisal, Salsalate' },
    ],
    sources: ['PubChem', 'ChEMBL'],
    flip: true,
  },
  {
    tag: 'Clinical Intelligence',
    headline: 'In every tool,\nat every step',
    sub: "Whether you're checking drug interactions in the clinic, searching trials for a grant proposal, or designing next-generation candidates — MAID surfaces the right data at the right moment.",
    cta: 'See all MAID features',
    ctaHref: '/auth/signup',
    mockTitle: 'MAID Clinical Trials',
    mockLines: [
      { role: 'user',  text: 'Phase 3 diabetes trials recruiting now' },
      { role: 'ai',    text: 'Searching ClinicalTrials.gov (status: RECRUITING, phase: PHASE3)…' },
      { role: 'result', text: '12 trials found · NCT04539730 · Semaglutide vs Placebo · 2,400 enrolled · 48 sites worldwide' },
    ],
    sources: ['ClinicalTrials.gov', 'OpenFDA'],
    flip: false,
  },
]

/* ─── Databases ─── */
const DATABASES = [
  { name: 'PubChem',        count: '100M+', unit: 'compounds',           desc: 'Chemical structures, SMILES, properties, 2D images.' },
  { name: 'ChEMBL',         count: '2.4M+', unit: 'bioactivity records', desc: 'Drug targets, binding affinities, mechanisms of action.' },
  { name: 'OpenFDA',        count: '10M+',  unit: 'adverse event reports',desc: 'Drug labels, AE data, recalls, NDC directory.' },
  { name: 'ClinicalTrials', count: '400K+', unit: 'global trials',        desc: 'Conditions, interventions, phases, outcomes.' },
  { name: 'RxNorm',         count: '800K+', unit: 'drug–drug pairs',      desc: 'Interaction severity, management, clinical notes.' },
  { name: 'UniProt',        count: '230M+', unit: 'protein sequences',    desc: 'Gene names, accessions, AlphaFold cross-links.' },
  { name: 'OpenTargets',    count: '60K+',  unit: 'target–disease links', desc: 'Evidence-based target–disease association scoring.' },
  { name: 'AlphaFold',      count: '200M+', unit: '3D structures',        desc: 'DeepMind predicted structures per UniProt accession.' },
]

/* ─── Use cases ─── */
const USE_CASES = [
  {
    icon: FlaskConical,
    role: 'Drug Discovery Researcher',
    headline: 'Find and rank drug candidates',
    points: [
      'Structurally similar molecules to any lead compound',
      'Lipinski Ro5 and predicted ADMET scoring',
      'Bioactivity cross-reference against ChEMBL targets',
      'Automated candidate comparison report',
    ],
  },
  {
    icon: Activity,
    role: 'Clinical Pharmacist',
    headline: 'Check complex drug regimens',
    points: [
      'Up to 8 drugs, all interaction pairs at once',
      'Severity classification with management guidance',
      'FDA adverse event database signal check',
      'Export findings for patient consultation',
    ],
  },
  {
    icon: Microscope,
    role: 'Pharmaceutical Researcher',
    headline: 'Protein and target analysis',
    points: [
      'UniProt search by gene symbol or accession',
      'Direct link to AlphaFold 3D structure viewer',
      'OpenTargets disease association evidence',
      'Correlate with clinical trial interventions',
    ],
  },
]

/* ─── Mock UI component ─── */
function MockWindow({
  title,
  lines,
  sources,
}: {
  title: string
  lines: { role: string; text: string }[]
  sources: string[]
}) {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        background: '#1c1b19',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: '#222120', borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex gap-1.5">
          {['#444', '#444', '#444'].map((c, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <span className="mx-auto text-xs" style={{ color: DIM }}>{title}</span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3 min-h-[220px]">
        {lines.map((line, i) => (
          <div key={i}>
            {line.role === 'user' && (
              <div className="flex justify-end">
                <div
                  className="max-w-[80%] rounded-xl rounded-tr-sm px-4 py-2.5 text-xs leading-relaxed"
                  style={{ background: '#2a2927', color: '#ccc9c5', border: `1px solid ${BORDER}` }}
                >
                  {line.text}
                </div>
              </div>
            )}
            {line.role === 'ai' && (
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-black font-bold" style={{ fontSize: '8px' }}>M</span>
                </div>
                <div
                  className="text-xs rounded-xl px-3 py-2 italic"
                  style={{ color: DIM, background: '#181816' }}
                >
                  {line.text}
                </div>
              </div>
            )}
            {line.role === 'result' && (
              <div
                className="rounded-xl p-3 text-xs leading-relaxed whitespace-pre-line ml-7"
                style={{ background: '#222120', color: '#b8b4ae', border: `1px solid ${BORDER}` }}
              >
                {line.text}
              </div>
            )}
          </div>
        ))}

        {/* Sources */}
        <div className="flex flex-wrap gap-1.5 pt-1 ml-7">
          {sources.map(s => (
            <span
              key={s}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: '#2a2927', color: DIM, border: `1px solid ${BORDER}` }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Section divider ─── */
function Divider() {
  return <div className="max-w-6xl mx-auto px-6" style={{ height: '1px', background: BORDER }} />
}

export default function LandingSections() {
  return (
    <div style={{ background: BG, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* ─── STATS STRIP ─── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <Icon size={15} style={{ color: DIM }} />
              <span className="font-semibold text-xl" style={{ color: TEXT }}>{value}</span>
              <span className="text-xs" style={{ color: MUTED }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURE SECTIONS (Cursor-style alternating) ─── */}
      {FEATURE_SECTIONS.map((sec, idx) => (
        <section
          key={sec.tag}
          id={idx === 0 ? 'features' : idx === 2 ? 'how-it-works' : undefined}
          className="py-24 px-6"
          style={{ scrollMarginTop: '80px' }}
        >
          <div
            className={`max-w-6xl mx-auto flex flex-col gap-14 items-center ${
              sec.flip ? 'lg:flex-row-reverse' : 'lg:flex-row'
            } lg:gap-16`}
          >
            {/* Text side */}
            <div className="flex-1 min-w-0">
              <p
                className="text-xs uppercase tracking-widest font-semibold mb-5"
                style={{ color: DIM }}
              >
                {sec.tag}
              </p>
              <h2
                className="font-bold leading-tight mb-5 whitespace-pre-line"
                style={{
                  color: TEXT,
                  fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
                  letterSpacing: '-0.03em',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                }}
              >
                {sec.headline}
              </h2>
              <p
                className="leading-relaxed mb-7"
                style={{ color: MUTED, fontSize: '0.98rem', maxWidth: '440px' }}
              >
                {sec.sub}
              </p>
              <Link
                href={sec.ctaHref}
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors group"
                style={{ color: '#e8702a' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f5894a')}
                onMouseLeave={e => (e.currentTarget.style.color = '#e8702a')}
              >
                {sec.cta}
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mock window side */}
            <div className="flex-1 w-full min-w-0">
              <MockWindow title={sec.mockTitle} lines={sec.mockLines} sources={sec.sources} />
            </div>
          </div>

          {idx < FEATURE_SECTIONS.length - 1 && (
            <div className="max-w-6xl mx-auto mt-24" style={{ height: '1px', background: BORDER }} />
          )}
        </section>
      ))}

      <Divider />

      {/* ─── USE CASES ─── */}
      <section className="py-24 px-6" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: DIM }}>Use cases</p>
          <h2
            className="font-bold leading-tight mb-14"
            style={{ color: TEXT, fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)', letterSpacing: '-0.03em' }}
          >
            Built for every role<br />in pharmaceutical research
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {USE_CASES.map(({ icon: Icon, role, headline, points }) => (
              <div
                key={role}
                className="rounded-2xl p-6"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#2a2927' }}
                  >
                    <Icon size={16} style={{ color: '#ccc9c5' }} />
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: DIM }}>{role}</p>
                    <p className="text-sm font-semibold" style={{ color: TEXT }}>{headline}</p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2.5">
                      <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: '#666360' }} />
                      <span className="text-xs leading-relaxed" style={{ color: MUTED }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ─── DATABASES ─── */}
      <section id="databases" className="py-24 px-6" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: DIM }}>Data sources</p>
              <h2
                className="font-bold leading-tight"
                style={{ color: TEXT, fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)', letterSpacing: '-0.03em' }}
              >
                8 databases,<br />searched in parallel
              </h2>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: MUTED }}>
              No tab-switching. MAID retrieves and synthesises data from every source before writing your report.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DATABASES.map(db => (
              <div
                key={db.name}
                className="rounded-xl p-5 transition-colors cursor-default"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3a3836'; (e.currentTarget as HTMLElement).style.background = '#201f1d' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.background = CARD }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="font-semibold text-sm" style={{ color: TEXT }}>{db.name}</span>
                  <Database size={12} style={{ color: DIM }} />
                </div>
                <p className="text-2xl font-light mb-0.5" style={{ color: TEXT }}>{db.count}</p>
                <p className="text-xs mb-3" style={{ color: DIM }}>{db.unit}</p>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{db.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ─── PRICING / CTA ─── */}
      <section id="pricing" className="py-24 px-6" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: DIM }}>Get started</p>
            <h2
              className="font-bold leading-tight mb-5"
              style={{ color: TEXT, fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)', letterSpacing: '-0.03em' }}
            >
              Your AI research<br />scientist awaits
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: MUTED }}>
              Start for free. No credit card required. Query all 8 databases immediately after signing up with Google or email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-full transition-colors"
                style={{ background: '#fff', color: '#111' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                Start for free
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium px-7 py-3.5 rounded-full transition-colors"
                style={{ color: MUTED, border: `1px solid ${BORDER}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4a4846'; (e.currentTarget as HTMLElement).style.color = TEXT }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = MUTED }}
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Right — checklist card */}
          <div
            className="rounded-2xl p-7"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}
          >
            <p className="font-semibold text-sm mb-5" style={{ color: TEXT }}>Everything included</p>
            <ul className="space-y-3">
              {[
                'Research chat with full database access',
                'Molecule search with Lipinski analysis',
                'Drug interaction checker (2–8 drugs)',
                'Clinical trial search & filtering',
                'Protein target search via UniProt',
                'All 5 Groq AI models selectable',
                'Saved sessions & research history',
                'Google OAuth & email sign in',
              ].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle size={14} style={{ color: '#666360', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: MUTED }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: `1px solid ${BORDER}` }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span
              className="font-semibold text-sm"
              style={{ color: TEXT, fontFamily: "'Playfair Display',serif", fontStyle: 'italic' }}
            >
              MAID
            </span>
            <span className="text-xs" style={{ color: MUTED }}>
              Medical AI for Intelligent Drug-discovery
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-xs transition-colors"
              style={{ color: MUTED }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-xs transition-colors"
              style={{ color: MUTED }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              Sign up
            </Link>
            <span className="text-xs" style={{ color: DIM }}>© 2026 MAID</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs mt-6 max-w-2xl mx-auto" style={{ color: MUTED }}>
          Research tool only. Computational predictions require wet-lab validation. Not a substitute for licensed pharmaceutical or medical advice.
        </p>
      </footer>
    </div>
  )
}
