import type { ClinicalTrial, ApiResponse } from '@/types'

const BASE = 'https://clinicaltrials.gov/api/v2'

interface RawStudy {
  protocolSection?: {
    identificationModule?: {
      nctId?: string
      briefTitle?: string
      officialTitle?: string
    }
    statusModule?: {
      overallStatus?: string
      startDateStruct?: { date?: string }
      completionDateStruct?: { date?: string }
    }
    designModule?: {
      studyType?: string
      phases?: string[]
      enrollmentInfo?: { count?: number }
    }
    conditionsModule?: { conditions?: string[] }
    armsInterventionsModule?: {
      interventions?: Array<{ type?: string; name?: string }>
    }
    outcomesModule?: {
      primaryOutcomes?: Array<{ measure?: string; timeFrame?: string }>
    }
    sponsorCollaboratorsModule?: {
      leadSponsor?: { name?: string }
    }
    contactsLocationsModule?: {
      locations?: Array<{ facility?: string; country?: string }>
    }
  }
}

function transformTrial(study: RawStudy): ClinicalTrial {
  const p = study.protocolSection ?? {}
  return {
    nctId: p.identificationModule?.nctId ?? '',
    briefTitle: p.identificationModule?.briefTitle ?? '',
    officialTitle: p.identificationModule?.officialTitle ?? '',
    overallStatus: p.statusModule?.overallStatus ?? '',
    phase: p.designModule?.phases ?? [],
    studyType: p.designModule?.studyType ?? '',
    conditions: p.conditionsModule?.conditions ?? [],
    interventions: (p.armsInterventionsModule?.interventions ?? []).map(i => ({
      type: i.type ?? '',
      name: i.name ?? '',
    })),
    primaryOutcomes: (p.outcomesModule?.primaryOutcomes ?? []).map(o => ({
      measure: o.measure ?? '',
      timeFrame: o.timeFrame ?? '',
    })),
    enrollmentCount: p.designModule?.enrollmentInfo?.count ?? 0,
    startDate: p.statusModule?.startDateStruct?.date ?? '',
    completionDate: p.statusModule?.completionDateStruct?.date ?? '',
    sponsor: p.sponsorCollaboratorsModule?.leadSponsor?.name ?? '',
    locations: (p.contactsLocationsModule?.locations ?? []).slice(0, 5).map(l => ({
      facility: l.facility ?? '',
      country: l.country ?? '',
    })),
  }
}

// Search clinical trials by condition or intervention
export async function searchClinicalTrials(
  query: string,
  status?: string,
  phase?: string,
  limit = 10
): Promise<ApiResponse<ClinicalTrial[]>> {
  try {
    const params = new URLSearchParams({
      'query.cond': query,
      'pageSize': String(limit),
      'format': 'json',
    })
    if (status) params.set('filter.overallStatus', status)
    if (phase) params.set('filter.phase', phase)

    const res = await fetch(`${BASE}/studies?${params}`, { next: { revalidate: 3600 } })
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()
    return { data: (json.studies ?? []).map(transformTrial), error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get a specific trial by NCT ID
export async function getTrialByNCT(nctId: string): Promise<ApiResponse<ClinicalTrial>> {
  try {
    const res = await fetch(
      `${BASE}/studies/${nctId}?format=json`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `ClinicalTrials: ${res.statusText}` }
    const json = await res.json()
    return { data: transformTrial(json), error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Search by intervention (drug name)
export async function searchByIntervention(drugName: string, limit = 10): Promise<ApiResponse<ClinicalTrial[]>> {
  try {
    const params = new URLSearchParams({
      'query.intr': drugName,
      'pageSize': String(limit),
      'format': 'json',
    })
    const res = await fetch(`${BASE}/studies?${params}`, { next: { revalidate: 3600 } })
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()
    return { data: (json.studies ?? []).map(transformTrial), error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}
