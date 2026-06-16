import Groq from 'groq-sdk'
import type { GroqModelId } from '@/types'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

// Available models – user can choose
export const GROQ_MODELS: Record<GroqModelId, string> = {
  'llama-3.3-70b-versatile':        'Llama 3.3 70B (Versatile)',
  'llama-3.1-8b-instant':           'Llama 3.1 8B (Instant)',
  'deepseek-r1-distill-llama-70b':  'DeepSeek R1 70B (Reasoning)',
  'mixtral-8x7b-32768':             'Mixtral 8x7B (Long context)',
  'gemma2-9b-it':                   'Gemma 2 9B',
}

export type { GroqModelId }

export const DEFAULT_MODEL: GroqModelId = 'llama-3.3-70b-versatile'
