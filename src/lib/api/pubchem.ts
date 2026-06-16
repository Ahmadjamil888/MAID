import type { PubChemCompound, PubChemSearchResult, ApiResponse } from '@/types'

const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'

// Search compound by name → returns array of CIDs
export async function searchCompoundByName(name: string): Promise<ApiResponse<number[]>> {
  try {
    const res = await fetch(
      `${BASE}/compound/name/${encodeURIComponent(name)}/cids/JSON`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `PubChem: ${res.statusText}` }
    const json = await res.json()
    return { data: json.IdentifierList?.CID ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get compound properties by CID
export async function getCompoundByCID(cid: number): Promise<ApiResponse<PubChemCompound>> {
  try {
    const props = [
      'IUPACName', 'MolecularFormula', 'MolecularWeight',
      'IsomericSMILES', 'CanonicalSMILES', 'InChIKey',
      'XLogP', 'HBondDonorCount', 'HBondAcceptorCount',
      'RotatableBondCount', 'TPSA', 'Complexity', 'Charge',
    ].join(',')
    const res = await fetch(
      `${BASE}/compound/cid/${cid}/property/${props}/JSON`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `PubChem: ${res.statusText}` }
    const json = await res.json()
    const props_data = json.PropertyTable?.Properties?.[0]
    if (!props_data) return { data: null, error: 'No data found' }
    return { data: { CID: cid, ...props_data }, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get synonyms for a CID
export async function getCompoundSynonyms(cid: number): Promise<ApiResponse<string[]>> {
  try {
    const res = await fetch(
      `${BASE}/compound/cid/${cid}/synonyms/JSON`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `PubChem: ${res.statusText}` }
    const json = await res.json()
    return {
      data: json.InformationList?.Information?.[0]?.Synonym?.slice(0, 20) ?? [],
      error: null
    }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Find similar compounds by CID (fingerprint similarity)
export async function getSimilarCompounds(cid: number, threshold = 90): Promise<ApiResponse<PubChemSearchResult[]>> {
  try {
    const res = await fetch(
      `${BASE}/compound/fastsimilarity_2d/cid/${cid}/cids/JSON?Threshold=${threshold}&MaxRecords=10`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()
    const cids: number[] = json.IdentifierList?.CID ?? []

    // Fetch names for top 5
    const results: PubChemSearchResult[] = []
    for (const c of cids.slice(0, 5)) {
      const compound = await getCompoundByCID(c)
      if (compound.data) {
        results.push({
          cid: c,
          name: compound.data.IUPACName ?? `CID ${c}`,
          formula: compound.data.MolecularFormula,
          weight: compound.data.MolecularWeight,
          smiles: compound.data.CanonicalSMILES,
        })
      }
    }
    return { data: results, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Search by SMILES
export async function searchBySMILES(smiles: string): Promise<ApiResponse<number[]>> {
  try {
    const res = await fetch(
      `${BASE}/compound/smiles/${encodeURIComponent(smiles)}/cids/JSON`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `PubChem: ${res.statusText}` }
    const json = await res.json()
    return { data: json.IdentifierList?.CID ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get 2D image URL for a compound
export function getCompoundImageURL(cid: number, size = 300): string {
  return `${BASE}/compound/cid/${cid}/PNG?record_type=2d&image_size=${size}x${size}`
}
