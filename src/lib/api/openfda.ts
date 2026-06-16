import type { FDADrug, FDAAdverseEvent, ApiResponse } from '@/types'

const BASE = 'https://api.fda.gov/drug'

// Search drug label info
export async function searchDrugLabel(query: string): Promise<ApiResponse<FDADrug[]>> {
  try {
    const res = await fetch(
      `${BASE}/label.json?search=openfda.brand_name:"${encodeURIComponent(query)}"+openfda.generic_name:"${encodeURIComponent(query)}"&limit=5`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) {
      // Try generic name only
      const res2 = await fetch(
        `${BASE}/label.json?search=openfda.generic_name:"${encodeURIComponent(query)}"&limit=5`,
        { next: { revalidate: 3600 } }
      )
      if (!res2.ok) return { data: [], error: null }
      const json2 = await res2.json()
      return { data: (json2.results ?? []).map((r: { openfda?: FDADrug }) => r.openfda).filter(Boolean), error: null }
    }
    const json = await res.json()
    return { data: (json.results ?? []).map((r: { openfda?: FDADrug }) => r.openfda).filter(Boolean), error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get adverse events for a drug
export async function getAdverseEvents(drugName: string, limit = 10): Promise<ApiResponse<FDAAdverseEvent[]>> {
  try {
    const res = await fetch(
      `${BASE}/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(drugName)}"&limit=${limit}&sort=receivedate:desc`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()
    return { data: json.results ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get adverse event counts by reaction
export async function getAdverseEventCounts(drugName: string): Promise<ApiResponse<Array<{ term: string; count: number }>>> {
  try {
    const res = await fetch(
      `${BASE}/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(drugName)}"&count=patient.reaction.reactionmeddrapt.exact&limit=20`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()
    return { data: json.results ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get drug recalls
export async function getDrugRecalls(drugName: string): Promise<ApiResponse<unknown[]>> {
  try {
    const res = await fetch(
      `${BASE}/enforcement.json?search=product_description:"${encodeURIComponent(drugName)}"&limit=5&sort=recall_initiation_date:desc`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()
    return { data: json.results ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get NDC directory info
export async function getNDCInfo(drugName: string): Promise<ApiResponse<unknown[]>> {
  try {
    const res = await fetch(
      `${BASE}/ndc.json?search=generic_name:"${encodeURIComponent(drugName)}"&limit=5`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()
    return { data: json.results ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}
