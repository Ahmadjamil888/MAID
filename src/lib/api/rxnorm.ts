import type { DrugInteraction, ApiResponse } from '@/types'

const BASE = 'https://rxnav.nlm.nih.gov/REST'

// Get RxNorm ID (RxCUI) for a drug name
export async function getRxCUI(drugName: string): Promise<ApiResponse<string>> {
  try {
    const res = await fetch(
      `${BASE}/rxcui.json?name=${encodeURIComponent(drugName)}&search=2`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `RxNorm: ${res.statusText}` }
    const json = await res.json()
    const rxcui = json.idGroup?.rxnormId?.[0]
    return { data: rxcui ?? null, error: rxcui ? null : 'Drug not found in RxNorm' }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get drug interactions for a list of drug names
export async function getDrugInteractions(drugNames: string[]): Promise<ApiResponse<DrugInteraction[]>> {
  try {
    // Get RxCUIs for all drugs
    const rxcuiResults = await Promise.all(drugNames.map(getRxCUI))
    const rxcuis = rxcuiResults
      .map(r => r.data)
      .filter((id): id is string => id !== null)

    if (rxcuis.length < 2) {
      return { data: [], error: 'Could not identify one or more drugs in RxNorm' }
    }

    const res = await fetch(
      `${BASE}/interaction/list.json?rxcuis=${rxcuis.join('+')}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()

    const interactions: DrugInteraction[] = []
    const pairs = json.fullInteractionTypeGroup ?? []
    for (const group of pairs) {
      for (const type of group.fullInteractionType ?? []) {
        for (const pair of type.interactionPair ?? []) {
          interactions.push({
            drug1: pair.interactionConcept?.[0]?.minConceptItem?.name ?? drugNames[0],
            drug2: pair.interactionConcept?.[1]?.minConceptItem?.name ?? drugNames[1],
            severity: pair.severity?.toLowerCase() as 'major' | 'moderate' | 'minor' ?? 'moderate',
            description: pair.description ?? '',
            management: type.comment ?? 'Consult a healthcare provider.',
          })
        }
      }
    }
    return { data: interactions, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get drug info by RxCUI
export async function getDrugInfo(rxcui: string): Promise<ApiResponse<unknown>> {
  try {
    const res = await fetch(
      `${BASE}/rxcui/${rxcui}/allProperties.json?prop=all`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `RxNorm: ${res.statusText}` }
    const json = await res.json()
    return { data: json.propConceptGroup?.propConcept ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get related drugs (same class)
export async function getRelatedDrugs(rxcui: string): Promise<ApiResponse<Array<{ rxcui: string; name: string }>>> {
  try {
    const res = await fetch(
      `${BASE}/rxcui/${rxcui}/related.json?tty=IN+BN`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()
    const concepts = json.relatedGroup?.conceptGroup?.flatMap(
      (g: { conceptProperties?: Array<{ rxcui: string; name: string }> }) =>
        g.conceptProperties ?? []
    ) ?? []
    return { data: concepts, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}
