# MAID — Medical AI for Intelligent Drug-discovery

AI platform for pharmacists, pharmaceutical researchers, and drug discovery teams.

## Stack

- **Frontend/Backend**: Next.js 16 (App Router, TypeScript)
- **AI**: Groq (Llama 3.3 70B, DeepSeek R1, Mixtral) via agentic tool-calling loop
- **Auth**: Supabase (Google OAuth + Email)
- **Database**: Supabase (PostgreSQL + RLS)
- **Styling**: Tailwind CSS v4 — black & white, Helvetica Neue

## Data Sources (all free/public APIs)

| Database | What it provides |
|---|---|
| PubChem | 100M+ compounds, SMILES, properties |
| ChEMBL | Bioactivity, mechanisms of action |
| OpenFDA | Drug labels, adverse events, recalls |
| ClinicalTrials.gov | 400K+ global clinical trials |
| RxNorm / NLM | Drug interaction checking |
| UniProt | Protein sequences and annotations |
| OpenTargets | Target–disease associations |
| PDB | 3D protein structures |

## Setup

### 1. Clone & install

```bash
cd maid-app
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. In **Authentication → Providers**, enable **Google** OAuth
4. Add `http://localhost:3000/api/auth/callback` to allowed redirect URLs

### 3. Environment variables

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GROQ_API_KEY=gsk_...
```

Get your Groq key free at [console.groq.com](https://console.groq.com)

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Landing page** — full-screen cursor-spotlight hero with dual-image reveal effect
- **Research Chat** — streaming multi-tool AI agent, searches all 8 databases per query
- **Molecule Search** — PubChem search with Lipinski Rule of Five analysis and 2D structure images
- **Drug Interactions** — RxNorm interaction checker for 2–8 drugs simultaneously
- **Clinical Trials** — ClinicalTrials.gov search by condition or intervention with full detail view
- **Protein Analysis** — UniProt search with AlphaFold 3D structure links
- **Session History** — all research conversations saved and resumable
- **Model Selector** — choose Groq model per conversation

## Architecture

```
User → Chat UI (streaming SSE)
         ↓
    Next.js API /api/chat
         ↓
    Groq Agent (tool-calling loop, up to 5 iterations)
         ↓
  ┌──────┬──────┬──────┬──────┬──────┬──────┐
  │PubChem│ChEMBL│OpenFDA│Trials│RxNorm│UniProt│
  └──────┴──────┴──────┴──────┴──────┴──────┘
         ↓
    Structured markdown report → streamed to client
         ↓
    Saved to Supabase
```

## Disclaimer

MAID is a research tool. Computational predictions require wet-lab validation. Not a substitute for licensed pharmaceutical or medical advice.
