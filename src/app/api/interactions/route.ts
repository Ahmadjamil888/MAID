import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDrugInteractions } from '@/lib/api/rxnorm'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { drugs } = await req.json() as { drugs: string[] }
  if (!drugs || drugs.length < 2) {
    return NextResponse.json({ error: 'At least 2 drugs required' }, { status: 400 })
  }

  const result = await getDrugInteractions(drugs)
  return NextResponse.json({
    interactions: result.data ?? [],
    error: result.error,
  })
}
