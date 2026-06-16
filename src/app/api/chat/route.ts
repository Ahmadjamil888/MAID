import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runAgentStream } from '@/lib/groq/agent'
import type { ChatMessage, ToolMode } from '@/types'
import type { GroqModelId } from '@/lib/groq/models'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, history, mode, modelId, sessionId } = await req.json() as {
      message: string
      history: ChatMessage[]
      mode: ToolMode
      modelId: GroqModelId
      sessionId?: string
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Stream response
    const encoder = new TextEncoder()
    let sourcesData = { sources: [], toolsUsed: [] as string[] }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = runAgentStream(message, history ?? [], modelId)

          for await (const chunk of generator) {
            // Extract sources metadata from first chunk
            if (chunk.startsWith('__SOURCES__')) {
              const match = chunk.match(/__SOURCES__(.*?)__SOURCES__/)
              if (match) {
                try { sourcesData = JSON.parse(match[1]) } catch {}
                // Send sources as a special SSE event
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'sources', ...sourcesData })}\n\n`)
                )
              }
              continue
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`)
            )
          }

          // Save to DB
          if (sessionId) {
            await supabase.from('chat_sessions').update({
              updated_at: new Date().toISOString(),
            }).eq('id', sessionId)
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        } catch (e) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(e) })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
