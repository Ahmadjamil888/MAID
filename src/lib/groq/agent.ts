import type { ChatCompletionTool, ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions'
import { groq, DEFAULT_MODEL } from './client'
import type { GroqModelId } from '@/types'
import { searchCompoundByName, getCompoundByCID, getSimilarCompounds } from '@/lib/api/pubchem'
import { searchMoleculeByName, getMoleculeActivities, getDrugMechanism } from '@/lib/api/chembl'
import { searchDrugLabel, getAdverseEventCounts } from '@/lib/api/openfda'
import { searchClinicalTrials } from '@/lib/api/clinicaltrials'
import { getDrugInteractions } from '@/lib/api/rxnorm'
import { searchProtein } from '@/lib/api/uniprot'
import type { DataSource, ToolMode, AgentResponse, ChatMessage } from '@/types'

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are MAID — Medical AI for Intelligent Drug-discovery. You are an expert AI research scientist assistant for pharmacists, pharmaceutical researchers, and drug discovery teams.

CORE PRINCIPLES:
1. You synthesize data from multiple scientific databases (PubChem, ChEMBL, OpenFDA, ClinicalTrials.gov, RxNorm, UniProt) into clear, actionable reports.
2. You ALWAYS cite your data sources explicitly.
3. You are scientifically rigorous. You distinguish between established facts and predictions.
4. For drug design suggestions, you clearly state: "This is a computational hypothesis requiring experimental validation."
5. You never claim a drug is safe or effective without clinical evidence.
6. You present Lipinski's Rule of Five and ADMET properties when analyzing molecules.
7. You format responses with clear sections using markdown.
8. When presenting candidate molecules, you always include a confidence level and disclaimer.

CONVERSATION MEMORY:
- You remember the full conversation history provided to you.
- Refer back to previously discussed drugs, molecules, or topics naturally.
- If a user follows up on something mentioned earlier, use that context.

RESPONSE FORMAT:
- Use markdown with clear headings (##, ###)
- Use tables for comparative data
- Use bullet points for lists
- Always end drug-design responses with: "⚠️ Disclaimer: Computational predictions require wet-lab validation. This is not medical advice."
- Cite sources as: [Source: DATABASE_NAME]

You are assisting with: pharmaceutical research, drug discovery, mechanism of action analysis, drug interaction checking, clinical trial search, molecule analysis, and protein structure analysis.`

// ─── Tool-planning system prompt (phase 1 only) ───────────────────────────────
// Deliberately minimal — just decides which tools to call, nothing else.
const PLANNER_PROMPT = `You are a tool-selection assistant. Your ONLY job is to decide which database tools to call for the user's request. Do NOT write any text response. Only call tools. If no database lookup is needed, call no tools.`

// ─── Tool definitions ────────────────────────────────────────────────────────

const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_pubchem',
      description: 'Search PubChem for a chemical compound by name. Returns CID, molecular formula, weight, SMILES, and physicochemical properties.',
      parameters: {
        type: 'object',
        properties: {
          compound_name: { type: 'string', description: 'Name of the chemical compound or drug' },
        },
        required: ['compound_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_chembl',
      description: 'Search ChEMBL for drug molecules, get bioactivity data, mechanisms of action, and drug-likeness properties.',
      parameters: {
        type: 'object',
        properties: {
          drug_name: { type: 'string', description: 'Name of the drug or molecule' },
        },
        required: ['drug_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_fda',
      description: 'Search FDA database for drug label information, adverse events, and regulatory status.',
      parameters: {
        type: 'object',
        properties: {
          drug_name: { type: 'string', description: 'Brand name or generic name of the drug' },
        },
        required: ['drug_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_clinical_trials',
      description: 'Search ClinicalTrials.gov for ongoing and completed clinical trials by condition or drug.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Disease condition or drug name' },
          status: { type: 'string', description: 'Trial status: RECRUITING, COMPLETED, ACTIVE_NOT_RECRUITING' },
          phase: { type: 'string', description: 'Trial phase: PHASE1, PHASE2, PHASE3, PHASE4' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_drug_interactions',
      description: 'Check for drug-drug interactions using RxNorm. Provide 2-5 drug names.',
      parameters: {
        type: 'object',
        properties: {
          drug_names: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of drug names to check for interactions',
          },
        },
        required: ['drug_names'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_protein',
      description: 'Search UniProt for protein/target information by gene name or protein name.',
      parameters: {
        type: 'object',
        properties: {
          protein_name: { type: 'string', description: 'Protein name, gene symbol, or UniProt accession' },
        },
        required: ['protein_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_similar_molecules',
      description: 'Find structurally similar molecules to a given compound using PubChem fingerprint similarity.',
      parameters: {
        type: 'object',
        properties: {
          compound_name: { type: 'string', description: 'Name of the reference compound' },
          threshold: { type: 'number', description: 'Similarity threshold 70-100 (default: 90)' },
        },
        required: ['compound_name'],
      },
    },
  },
]

// ─── Tool executor ────────────────────────────────────────────────────────────

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ])
}

const TOOL_TIMEOUT_MS = 8000

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  sources: DataSource[]
): Promise<string> {
  try {
    switch (name) {
      case 'search_pubchem': {
        const cids = await withTimeout(searchCompoundByName(args.compound_name as string), TOOL_TIMEOUT_MS, 'PubChem search')
        if (!cids.data || cids.data.length === 0) return 'No compound found in PubChem.'
        const compound = await withTimeout(getCompoundByCID(cids.data[0]), TOOL_TIMEOUT_MS, 'PubChem CID fetch')
        sources.push({ type: 'pubchem', name: 'PubChem', url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cids.data[0]}` })
        return JSON.stringify(compound.data ?? { error: 'Not found' }, null, 2)
      }
      case 'search_chembl': {
        const mols = await withTimeout(searchMoleculeByName(args.drug_name as string), TOOL_TIMEOUT_MS, 'ChEMBL search')
        if (!mols.data || mols.data.length === 0) return 'No molecule found in ChEMBL.'
        const mol = mols.data[0]
        const [activities, mechanisms] = await Promise.all([
          withTimeout(getMoleculeActivities(mol.molecule_chembl_id), TOOL_TIMEOUT_MS, 'ChEMBL activities'),
          withTimeout(getDrugMechanism(mol.molecule_chembl_id), TOOL_TIMEOUT_MS, 'ChEMBL mechanism'),
        ])
        sources.push({ type: 'chembl', name: 'ChEMBL', url: `https://www.ebi.ac.uk/chembl/compound_report_card/${mol.molecule_chembl_id}` })
        return JSON.stringify({ molecule: mol, topActivities: activities.data?.slice(0, 5), mechanisms: mechanisms.data }, null, 2)
      }
      case 'search_fda': {
        const [labels, adverseEvents] = await Promise.all([
          withTimeout(searchDrugLabel(args.drug_name as string), TOOL_TIMEOUT_MS, 'FDA labels'),
          withTimeout(getAdverseEventCounts(args.drug_name as string), TOOL_TIMEOUT_MS, 'FDA adverse events'),
        ])
        sources.push({ type: 'openfda', name: 'OpenFDA', url: 'https://open.fda.gov/' })
        return JSON.stringify({ labels: labels.data?.slice(0, 2), topAdverseEvents: adverseEvents.data?.slice(0, 10) }, null, 2)
      }
      case 'search_clinical_trials': {
        const trials = await withTimeout(
          searchClinicalTrials(args.query as string, args.status as string | undefined, args.phase as string | undefined, 8),
          TOOL_TIMEOUT_MS, 'ClinicalTrials search'
        )
        sources.push({ type: 'clinicaltrials', name: 'ClinicalTrials.gov', url: `https://clinicaltrials.gov/search?query=${encodeURIComponent(args.query as string)}` })
        return JSON.stringify(trials.data ?? [], null, 2)
      }
      case 'check_drug_interactions': {
        const interactions = await withTimeout(getDrugInteractions(args.drug_names as string[]), TOOL_TIMEOUT_MS, 'RxNorm')
        sources.push({ type: 'rxnorm', name: 'RxNorm / NLM', url: 'https://rxnav.nlm.nih.gov/' })
        if (!interactions.data || interactions.data.length === 0) return 'No significant interactions found in RxNorm.'
        return JSON.stringify(interactions.data, null, 2)
      }
      case 'search_protein': {
        const proteins = await withTimeout(searchProtein(args.protein_name as string, 5), TOOL_TIMEOUT_MS, 'UniProt search')
        sources.push({ type: 'uniprot', name: 'UniProt', url: `https://www.uniprot.org/uniprotkb?query=${encodeURIComponent(args.protein_name as string)}` })
        return JSON.stringify(proteins.data?.slice(0, 3) ?? [], null, 2)
      }
      case 'find_similar_molecules': {
        const cids = await withTimeout(searchCompoundByName(args.compound_name as string), TOOL_TIMEOUT_MS, 'PubChem similar search')
        if (!cids.data || cids.data.length === 0) return 'Compound not found.'
        const similar = await withTimeout(getSimilarCompounds(cids.data[0], (args.threshold as number) ?? 90), TOOL_TIMEOUT_MS, 'PubChem similarity')
        sources.push({ type: 'pubchem', name: 'PubChem Similarity', url: 'https://pubchem.ncbi.nlm.nih.gov/' })
        return JSON.stringify(similar.data ?? [], null, 2)
      }
      default:
        return `Unknown tool: ${name}`
    }
  } catch (e) {
    return `Tool error (continuing without this data): ${String(e)}`
  }
}

// ─── Build conversation history for the synthesis phase ──────────────────────
// Keep last 8 messages, truncate each to 800 chars to prevent token overflow.
// Models like llama-3.1-8b have ~8K context — long histories blow it up fast.

function truncateContent(content: string, max = 800): string {
  if (content.length <= max) return content
  return content.slice(0, max) + '… [truncated]'
}

function buildHistory(history: ChatMessage[]): ChatCompletionMessageParam[] {
  return history.slice(-8).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: truncateContent(m.content),
  }))
}

// ─── Phase 1: Tool planning ───────────────────────────────────────────────────
// Uses a minimal planner system prompt + tool_choice:'auto' with very low
// max_tokens so the model ONLY outputs tool calls — no prose.
// If the response has content instead of tool_calls we discard it.

async function runToolPhase(
  userMessage: string,
  history: ChatMessage[],
  modelId: GroqModelId,
  sources: DataSource[],
  toolsUsed: string[]
): Promise<ChatCompletionMessageParam[]> {
  // Messages for the planner — just the last few turns for context + new message
  const plannerMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: PLANNER_PROMPT },
    ...history.slice(-6).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  // Accumulated tool results to pass into synthesis phase
  const toolContext: ChatCompletionMessageParam[] = []

  for (let i = 0; i < 3; i++) {
    let response
    try {
      response = await groq.chat.completions.create({
        model: modelId,
        messages: [...plannerMessages, ...toolContext],
        tools,
        tool_choice: 'auto',
        temperature: 0,
        max_tokens: 512, // low — only enough for JSON tool calls, no prose
      })
    } catch {
      break // any error in planning phase → skip tools, fall through to synthesis
    }

    const msg = response.choices[0].message

    // No tool calls → model decided no tools needed
    if (!msg.tool_calls || msg.tool_calls.length === 0) break

    // If the model also generated text content alongside tool calls, ignore the text.
    // Only keep the tool_calls part to avoid the mixed-content 400 error.
    toolContext.push({
      role: 'assistant',
      content: null, // explicitly null — no prose content
      tool_calls: msg.tool_calls,
    })

    for (const toolCall of msg.tool_calls) {
      toolsUsed.push(toolCall.function.name)
      let args: Record<string, unknown> = {}
      try { args = JSON.parse(toolCall.function.arguments) } catch {}
      const result = await executeTool(toolCall.function.name, args, sources)
      toolContext.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      })
    }
  }

  return toolContext
}

// ─── Streaming agent (used by the API route) ──────────────────────────────────

export async function* runAgentStream(
  userMessage: string,
  history: ChatMessage[],
  modelId: GroqModelId = DEFAULT_MODEL
): AsyncGenerator<string> {
  const sources: DataSource[] = []
  const toolsUsed: string[] = []

  // ── Phase 1: collect tool data ────────────────────────────────────────────
  const toolContext = await runToolPhase(userMessage, history, modelId, sources, toolsUsed)

  // Emit sources metadata before streaming starts
  yield `__SOURCES__${JSON.stringify({ sources, toolsUsed })}__SOURCES__`

  // ── Phase 2: synthesise answer with full conversation context ────────────
  // Tools are NOT passed here — the model cannot call tools, only write prose.
  // This completely prevents the mixed-content 400 error.
  const synthesisMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...buildHistory(history),          // full conversation memory (up to 20 msgs)
    { role: 'user', content: userMessage },
    // Append any tool results as a system note so the model uses them
    ...(toolContext.length > 0
      ? [{
          role: 'system' as const,
          content: `Here is fresh data retrieved from scientific databases for this query:\n\n${
            toolContext
              .filter(m => m.role === 'tool')
              .map(m => typeof m.content === 'string' ? m.content.slice(0, 2000) : '')
              .join('\n\n---\n\n')
          }\n\nSynthesize this data into a comprehensive response. Do not call any tools.`,
        }]
      : []
    ),
  ]

  try {
    const stream = await groq.chat.completions.create({
      model: modelId,
      messages: synthesisMessages,
      stream: true,
      temperature: 0.35,
      max_tokens: 4096,
      // No tools passed → model cannot accidentally try to call one
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  } catch (e) {
    yield `\n\nError generating response: ${String(e)}`
  }
}

// ─── Non-streaming version (kept for completeness) ───────────────────────────

export async function runAgent(
  userMessage: string,
  history: ChatMessage[],
  mode: ToolMode = 'general',
  modelId: GroqModelId = DEFAULT_MODEL
): Promise<AgentResponse> {
  const sources: DataSource[] = []
  const toolsUsed: string[] = []

  const toolContext = await runToolPhase(userMessage, history, modelId, sources, toolsUsed)

  const synthesisMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...buildHistory(history),
    { role: 'user', content: userMessage },
    ...(toolContext.length > 0
      ? [{
          role: 'system' as const,
          content: `Fresh database data:\n\n${
            toolContext.filter(m => m.role === 'tool').map(m => m.content).join('\n\n---\n\n')
          }\n\nSynthesize this into a comprehensive response.`,
        }]
      : []
    ),
  ]

  const response = await groq.chat.completions.create({
    model: modelId,
    messages: synthesisMessages,
    temperature: 0.35,
    max_tokens: 4096,
  })

  return {
    message: response.choices[0].message.content ?? 'No response generated.',
    sources,
    toolsUsed,
  }
}
