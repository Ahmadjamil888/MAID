import type { UniProtProtein, ApiResponse } from '@/types'

const BASE = 'https://rest.uniprot.org'

// Search proteins by name/gene
export async function searchProtein(query: string, limit = 10): Promise<ApiResponse<UniProtProtein[]>> {
  try {
    const res = await fetch(
      `${BASE}/uniprotkb/search?query=${encodeURIComponent(query)}&format=json&size=${limit}&fields=accession,id,protein_name,gene_names,organism_name,length,mass`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `UniProt: ${res.statusText}` }
    const json = await res.json()
    return { data: json.results ?? [], error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get protein by accession
export async function getProteinByAccession(accession: string): Promise<ApiResponse<UniProtProtein>> {
  try {
    const res = await fetch(
      `${BASE}/uniprotkb/${accession}?format=json`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `UniProt: ${res.statusText}` }
    const json = await res.json()
    return { data: json, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get protein sequence
export async function getProteinSequence(accession: string): Promise<ApiResponse<string>> {
  try {
    const res = await fetch(
      `${BASE}/uniprotkb/${accession}.fasta`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: null, error: `UniProt: ${res.statusText}` }
    const text = await res.text()
    // Strip header line
    const sequence = text.split('\n').slice(1).join('')
    return { data: sequence, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// Get PDB structures for a protein (via UniProt cross-ref)
export async function getProteinStructures(accession: string): Promise<ApiResponse<string[]>> {
  try {
    const res = await fetch(
      `${BASE}/uniprotkb/${accession}?format=json&fields=xref_pdb`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { data: [], error: null }
    const json = await res.json()
    const pdbRefs = json.uniProtKBCrossReferences?.filter(
      (x: { database: string }) => x.database === 'PDB'
    ) ?? []
    return { data: pdbRefs.map((x: { id: string }) => x.id), error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}
