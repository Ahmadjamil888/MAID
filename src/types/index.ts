// ─── User & Auth ───────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'pharmacist' | 'researcher' | 'student' | 'admin'
  created_at: string
}

// ─── Chat ──────────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  sources?: DataSource[]
  metadata?: Record<string, unknown>
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
  tool_mode: ToolMode
}

export type ToolMode =
  | 'general'
  | 'drug_analysis'
  | 'molecule_search'
  | 'interaction_check'
  | 'literature_review'
  | 'clinical_trials'
  | 'drug_design'
  | 'protein_analysis'

// Groq model ID — mirrors the keys in @/lib/groq/models
export type GroqModelId =
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it'

// ─── Data Sources ──────────────────────────────────────────────────────────
export type DataSourceType =
  | 'pubchem'
  | 'chembl'
  | 'openfda'
  | 'clinicaltrials'
  | 'opentargets'
  | 'rxnorm'
  | 'uniprot'
  | 'pdb'

export interface DataSource {
  type: DataSourceType
  name: string
  url?: string
  data?: unknown
}

// ─── PubChem ───────────────────────────────────────────────────────────────
export interface PubChemCompound {
  CID: number
  IUPACName: string
  MolecularFormula: string
  MolecularWeight: number
  IsomericSMILES: string
  CanonicalSMILES: string
  InChIKey: string
  XLogP: number
  HBondDonorCount: number
  HBondAcceptorCount: number
  RotatableBondCount: number
  TPSA: number
  Complexity: number
  Charge: number
}

export interface PubChemSearchResult {
  cid: number
  name: string
  formula: string
  weight: number
  smiles: string
  synonyms?: string[]
}

// ─── ChEMBL ────────────────────────────────────────────────────────────────
export interface ChEMBLMolecule {
  molecule_chembl_id: string
  pref_name: string | null
  max_phase: number
  molecule_type: string
  structure_type: string
  molecule_properties: {
    mw_freebase: number
    alogp: number
    hba: number
    hbd: number
    psa: number
    rtb: number
    ro3_pass: string
    num_ro5_violations: number
    full_mwt: number
    cx_most_apka: number | null
    cx_most_bpka: number | null
    cx_logp: number
    cx_logd: number
    molecular_species: string
  } | null
  molecule_structures: {
    canonical_smiles: string
    standard_inchi: string
    standard_inchi_key: string
  } | null
}

export interface ChEMBLActivity {
  activity_id: number
  molecule_chembl_id: string
  target_chembl_id: string
  target_pref_name: string
  standard_type: string
  standard_value: number
  standard_units: string
  pchembl_value: number | null
}

// ─── OpenFDA ───────────────────────────────────────────────────────────────
export interface FDADrug {
  brand_name: string[]
  generic_name: string[]
  manufacturer_name: string[]
  route: string[]
  substance_name: string[]
  pharm_class_epc?: string[]
  product_type: string[]
}

export interface FDAAdverseEvent {
  safetyreportid: string
  serious: number
  receivedate: string
  patient: {
    reaction: Array<{ reactionmeddrapt: string }>
    drug: Array<{ medicinalproduct: string; drugindication: string }>
  }
}

// ─── Clinical Trials ───────────────────────────────────────────────────────
export interface ClinicalTrial {
  nctId: string
  briefTitle: string
  officialTitle: string
  overallStatus: string
  phase: string[]
  studyType: string
  conditions: string[]
  interventions: Array<{ type: string; name: string }>
  primaryOutcomes: Array<{ measure: string; timeFrame: string }>
  enrollmentCount: number
  startDate: string
  completionDate: string
  sponsor: string
  locations: Array<{ facility: string; country: string }>
}

// ─── Protein / UniProt ─────────────────────────────────────────────────────
export interface UniProtProtein {
  primaryAccession: string
  uniProtkbId: string
  proteinDescription: {
    recommendedName: { fullName: { value: string } }
  }
  genes: Array<{ geneName: { value: string } }>
  organism: { scientificName: string }
  sequence: { length: number; molWeight: number }
  features: Array<{ type: string; description: string }>
}

// ─── Drug Interaction ──────────────────────────────────────────────────────
export interface DrugInteraction {
  drug1: string
  drug2: string
  severity: 'major' | 'moderate' | 'minor'
  description: string
  management: string
}

// ─── Analysis Results ──────────────────────────────────────────────────────
export interface MoleculeAnalysis {
  name: string
  cid?: number
  smiles?: string
  formula?: string
  weight?: number
  lipinski: {
    mw: boolean
    logp: boolean
    hbd: boolean
    hba: boolean
    passes: boolean
  }
  admet: {
    absorption: string
    distribution: string
    metabolism: string
    excretion: string
    toxicity: string
  }
  drugLikeness: number
  similarCompounds: PubChemSearchResult[]
}

export interface ResearchReport {
  title: string
  summary: string
  sections: Array<{
    heading: string
    content: string
  }>
  sources: DataSource[]
  candidates?: MoleculeAnalysis[]
  confidence: 'low' | 'medium' | 'high'
  disclaimer: string
  generatedAt: string
}

// ─── API Responses ─────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  sources?: DataSource[]
}

export interface AgentResponse {
  message: string
  sources: DataSource[]
  report?: ResearchReport
  toolsUsed: string[]
}
