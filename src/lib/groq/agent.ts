import Groq from 'groq-sdk'
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions'
import { groq, DEFAULT_MODEL } from './client'
import type { GroqModelId } from '@/types'
import { searchCompoundByName, getCompoundByCID, getSimilarCompounds } from '@/lib/api/pubchem'
import { searchMoleculeByName, getMoleculeActivities, getDrugMechanism } from '@/lib/api/chembl'
import { searchDrugLabel, getAdverseEventCounts } from '@/lib/api/openfda'
import { searchClinicalTrials, searchByIntervention } from '@/lib/api/clinicaltrials'
import { getDrugInteractions } from '@/lib/api/rxnorm'
import { searchProtein } from '@/lib/api/uniprot'
import type { DataSource, ToolMode, AgentResponse, ChatMessage } from '@/types'

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

RESPONSE FORMAT:
- Use markdown with clear headings (##, ###)
- Use tables for comparative data
- Use bullet points for lists
- Always end drug-design responses with: "⚠️ Disclaimer: Computational predictions require wet-lab validation. This is not medical advice."
- Cite sources as: [Source: DATABASE_NAME]

You are assisting with: pharmaceutical research, drug discovery, mechanism of action analysis, drug interaction checking, clinical trial search, molecule analysis, and protein structure analysis.`

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

// ─── Tool executor ───────────────────────────────────────────────────────────

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  sources: DataSource[]
): Promise<string> {
  try {
    switch (name) {
      case 'search_pubchem': {
        const cids = await searchCompoundByName(args.compound_name as string)
        if (!cids.data || cids.data.length === 0) return 'No compound found in PubChem.'
        const compound = await getCompoundByCID(cids.data[0])
        sources.push({ type: 'pubchem', name: 'PubChem', url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cids.data[0]}` })
        return JSON.stringify(compound.data ?? { error: 'Not found' }, null, 2)
      }

      case 'search_chembl': {
        const mols = await searchMoleculeByName(args.drug_name as string)
        if (!mols.data || mols.data.length === 0) return 'No molecule found in ChEMBL.'
        const mol = mols.data[0]
        const activities = await getMoleculeActivities(mol.molecule_chembl_id)
        const mechanisms = await getDrugMechanism(mol.molecule_chembl_id)
        sources.push({ type: 'chembl', name: 'ChEMBL', url: `https://www.ebi.ac.uk/chembl/compound_report_card/${mol.molecule_chembl_id}` })
        return JSON.stringify({
          molecule: mol,
          topActivities: activities.data?.slice(0, 5),
          mechanisms: mechanisms.data,
        }, null, 2)
      }

      case 'search_fda': {
        const [labels, adverseEvents] = await Promise.all([
          searchDrugLabel(args.drug_name as string),
          getAdverseEventCounts(args.drug_name as string),
        ])
        sources.push({ type: 'openfda', name: 'OpenFDA', url: `https://open.fda.gov/` })
        return JSON.stringify({
          labels: labels.data?.slice(0, 2),
          topAdverseEvents: adverseEvents.data?.slice(0, 10),
        }, null, 2)
      }

      case 'search_clinical_trials': {
        const trials = await searchClinicalTrials(
          args.query as string,
          args.status as string | undefined,
          args.phase as string | undefined,
          8
        )
        sources.push({ type: 'clinicaltrials', name: 'ClinicalTrials.gov', url: `https://clinicaltrials.gov/search?query=${encodeURIComponent(args.query as string)}` })
        return JSON.stringify(trials.data ?? [], null, 2)
      }

      case 'check_drug_interactions': {
        const interactions = await getDrugInteractions(args.drug_names as string[])
        sources.push({ type: 'rxnorm', name: 'RxNorm / NLM', url: 'https://rxnav.nlm.nih.gov/' })
        if (!interactions.data || interactions.data.length === 0) {
          return 'No significant interactions found between these drugs in the RxNorm database.'
        }
        return JSON.stringify(interactions.data, null, 2)
      }

      case 'search_protein': {
        const proteins = await searchProtein(args.protein_name as string, 5)
        sources.push({ type: 'uniprot', name: 'UniProt', url: `https://www.uniprot.org/uniprotkb?query=${encodeURIComponent(args.protein_name as string)}` })
        return JSON.stringify(proteins.data?.slice(0, 3) ?? [], null, 2)
      }

      case 'find_similar_molecules': {
        const cids = await searchCompoundByName(args.compound_name as string)
        if (!cids.data || cids.data.length === 0) return 'Compound not found.'
        const similar = await getSimilarCompounds(cids.data[0], (args.threshold as number) ?? 90)
        sources.push({ type: 'pubchem', name: 'PubChem Similarity', url: `https://pubchem.ncbi.nlm.nih.gov/` })
        return JSON.stringify(similar.data ?? [], null, 2)
      }

      default:
        return `Unknown tool: ${name}`
    }
  } catch (e) {
    return `Tool error: ${String(e)}`
  }
}

// ─── Main agent function ─────────────────────────────────────────────────────

export async function runAgent(
  userMessage: string,
  history: ChatMessage[],
  mode: ToolMode = 'general',
  modelId: GroqModelId = DEFAULT_MODEL
): Promise<AgentResponse> {
  const sources: DataSource[] = []
  const toolsUsed: string[] = []

  // Build message history
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  // Agentic loop — up to 5 tool calls
  let iterations = 0
  const MAX_ITERATIONS = 5

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await groq.chat.completions.create({
      model: modelId,
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 4096,
    })

    const choice = response.choices[0]
    const msg = choice.message

    // No more tool calls — we have the final answer
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return {
        message: msg.content ?? 'No response generated.',
        sources,
        toolsUsed,
      }
    }

    // Process tool calls
    messages.push({ role: 'assistant', content: msg.content, tool_calls: msg.tool_calls })

    for (const toolCall of msg.tool_calls) {
      const toolName = toolCall.function.name
      toolsUsed.push(toolName)

      let args: Record<string, unknown> = {}
      try {
        args = JSON.parse(toolCall.function.arguments)
      } catch {}

      const result = await executeTool(toolName, args, sources)

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      })
    }
  }

  // Max iterations reached — ask for final answer without tools
  const finalResponse = await groq.chat.completions.create({
    model: modelId,
    messages: [
      ...messages,
      {
        role: 'user',
        content: 'Based on all the data you have gathered, please provide your complete analysis and recommendations now.',
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  })

  return {
    message: finalResponse.choices[0].message.content ?? 'Analysis complete.',
    sources,
    toolsUsed,
  }
}

// ─── Streaming version ───────────────────────────────────────────────────────

export async function* runAgentStream(
  userMessage: string,
  history: ChatMessage[],
  modelId: GroqModelId = DEFAULT_MODEL
): AsyncGenerator<string> {
  // First run tools (non-streaming), then stream the final answer
  const sources: DataSource[] = []
  const toolsUsed: string[] = []

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  // Tool collection phase
  let iterations = 0
  let needsTools = true

  while (needsTools && iterations < 5) {
    iterations++
    const check = await groq.chat.completions.create({
      model: modelId,
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 1024,
    })

    const msg = check.choices[0].message
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      needsTools = false
      break
    }

    messages.push({ role: 'assistant', content: msg.content, tool_calls: msg.tool_calls })

    for (const toolCall of msg.tool_calls) {
      toolsUsed.push(toolCall.function.name)
      let args: Record<string, unknown> = {}
      try { args = JSON.parse(toolCall.function.arguments) } catch {}
      const result = await executeTool(toolCall.function.name, args, sources)
      messages.push({ role: 'tool', tool_call_id: toolCall.id, content: result })
    }
  }

  // Yield sources metadata as first chunk
  yield `__SOURCES__${JSON.stringify({ sources, toolsUsed })}__SOURCES__`

  // Stream final answer
  const stream = await groq.chat.completions.create({
    model: modelId,
    messages,
    stream: true,
    temperature: 0.3,
    max_tokens: 4096,
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}
