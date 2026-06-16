import type { ApiResponse } from '@/types'

const BASE = 'https://api.platform.opentargets.org/api/v4/graphql'

async function query<T>(gql: string, variables: Record<string, unknown>): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gql, variables }),
      next: { revalidate: 3600 },
    })
    if (!res.ok) return { data: null, error: `OpenTargets: ${res.statusText}` }
    const json = await res.json()
    if (json.errors) return { data: null, error: json.errors[0]?.message ?? 'GraphQL error' }
    return { data: json.data, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Search drug by name
export async function searchDrug(name: string): Promise<ApiResponse<unknown>> {
  const gql = `
    query SearchDrug($query: String!) {
      search(queryString: $query, entityNames: ["drug"], page: { index: 0, size: 5 }) {
        hits {
          id
          entity
          name
          description
          highlights
        }
      }
    }
  `
  return query(gql, { query: name })
}

// Get drug info
export async function getDrugInfo(chemblId: string): Promise<ApiResponse<unknown>> {
  const gql = `
    query DrugInfo($chemblId: String!) {
      drug(chemblId: $chemblId) {
        id
        name
        synonyms
        tradeNames
        drugType
        isApproved
        maximumClinicalTrialPhase
        mechanismsOfAction {
          rows {
            mechanismOfAction
            targetName
            targets { id approvedName }
          }
        }
        indications {
          rows {
            disease { id name }
            maxPhaseForIndication
          }
        }
        adverseEvents {
          rows {
            name
            count
            logLR
          }
        }
      }
    }
  `
  return query(gql, { chemblId })
}

// Get disease-target associations
export async function getTargetDiseases(ensemblId: string): Promise<ApiResponse<unknown>> {
  const gql = `
    query TargetDiseases($ensemblId: String!) {
      target(ensemblId: $ensemblId) {
        id
        approvedName
        approvedSymbol
        associatedDiseases(page: { index: 0, size: 10 }) {
          rows {
            disease { id name }
            score
          }
        }
      }
    }
  `
  return query(gql, { ensemblId })
}
