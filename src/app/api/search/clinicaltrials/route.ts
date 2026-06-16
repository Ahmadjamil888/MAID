import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchClinicalTrials, searchByIntervention } from '@/lib/api/clinicaltrials'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') ?? ''
  const type = searchParams.get('type') ?? 'condition'
  const status = searchParams.get('status') ?? undefined
  const phase = searchParams.get('phase') ?? undefined
  const limit = Number(searchParams.get('limit') ?? 10)

  const results = type === 'intervention'
    ? await searchByIntervention(query, limit)
    : await searchClinicalTrials(query, status, phase, limit)

  return NextResponse.json({ trials: results.data ?? [], error: results.error })
}
