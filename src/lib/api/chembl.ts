import type { ChEMBLMolecule, ChEMBLActivity, ApiResponse } from '@/types'

const BASE = 'https://www.ebi.ac.uk/chembl/api/data'

// Search molecules by name
export async function searchMoleculeByName(name: string): Promise<ApiResponse<ChEMBLMolecule[]>> {
  try {
    const res = await fetch(
      `${BASE}/molecule/search?q=${encodeURIComponent(name)}&format=json&limit=10`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `ChEMBL: ${res.statusText}` }
    const json = await res.json()
    return { data: json.molecules ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get molecule by ChEMBL ID
export async function getMoleculeByID(chemblId: string): Promise<ApiResponse<ChEMBLMolecule>> {
  try {
    const res = await fetch(
      `${BASE}/molecule/${chemblId}?format=json`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `ChEMBL: ${res.statusText}` }
    const json = await res.json()
    return { data: json, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get bioactivities for a molecule
export async function getMoleculeActivities(chemblId: string): Promise<ApiResponse<ChEMBLActivity[]>> {
  try {
    const res = await fetch(
      `${BASE}/activity?molecule_chembl_id=${chemblId}&format=json&limit=20`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `ChEMBL: ${res.statusText}` }
    const json = await res.json()
    return { data: json.activities ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get drug targets
export async function getTargetByName(name: string): Promise<ApiResponse<unknown[]>> {
  try {
    const res = await fetch(
      `${BASE}/target/search?q=${encodeURIComponent(name)}&format=json&limit=10`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `ChEMBL: ${res.statusText}` }
    const json = await res.json()
    return { data: json.targets ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get mechanisms of action for a drug
export async function getDrugMechanism(chemblId: string): Promise<ApiResponse<unknown[]>> {
  try {
    const res = await fetch(
      `${BASE}/mechanism?molecule_chembl_id=${chemblId}&format=json`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `ChEMBL: ${res.statusText}` }
    const json = await res.json()
    return { data: json.mechanisms ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get drug indications
export async function getDrugIndications(chemblId: string): Promise<ApiResponse<unknown[]>> {
  try {
    const res = await fetch(
      `${BASE}/drug_indication?molecule_chembl_id=${chemblId}&format=json`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `ChEMBL: ${res.statusText}` }
    const json = await res.json()
    return { data: json.drug_indications ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}
