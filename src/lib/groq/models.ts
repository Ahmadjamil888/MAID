// ── Client-safe model definitions (no Node.js imports) ──────────────────────
// This file is safe to import in client components.

export type GroqModelId =
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'deepseek-r1-distill-llama-70b'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it'

export const GROQ_MODELS: Record<GroqModelId, string> = {
  'llama-3.3-70b-versatile':       'Llama 3.3 70B',
  'llama-3.1-8b-instant':          'Llama 3.1 8B (Fast)',
  'deepseek-r1-distill-llama-70b': 'DeepSeek R1 70B',
  'mixtral-8x7b-32768':            'Mixtral 8x7B',
  'gemma2-9b-it':                  'Gemma 2 9B',
}

export const DEFAULT_MODEL: GroqModelId = 'llama-3.3-70b-versatile'
