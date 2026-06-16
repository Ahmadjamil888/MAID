import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchCompoundByName, getCompoundByCID, getSimilarCompounds, getCompoundSynonyms, getCompoundImageURL } from '@/lib/api/pubchem'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const cid = searchParams.get('cid')

  if (cid) {
    const compound = await getCompoundByCID(Number(cid))
    const synonyms = await getCompoundSynonyms(Number(cid))
    const similar = await getSimilarCompounds(Number(cid))
    return NextResponse.json({
      compound: compound.data,
      synonyms: synonyms.data,
      similar: similar.data,
      imageUrl: getCompoundImageURL(Number(cid)),
    })
  }

  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  const cids = await searchCompoundByName(query)
  if (!cids.data || cids.data.length === 0) {
    return NextResponse.json({ results: [], error: 'No compounds found' })
  }

  // Fetch details for top 5
  const results = await Promise.all(
    cids.data.slice(0, 5).map(async (c) => {
      const compound = await getCompoundByCID(c)
      return {
        cid: c,
        ...compound.data,
        imageUrl: getCompoundImageURL(c),
      }
    })
  )

  return NextResponse.json({ results, total: cids.data.length })
}
