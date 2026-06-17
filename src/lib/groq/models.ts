// ── Client-safe model definitions (no Node.js imports) ──────────────────────
// This file is safe to import in client components.

export type GroqModelId =
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it'

// NOTE: deepseek-r1 is intentionally excluded — Groq rejects tool_use with it.
export const GROQ_MODELS: Record<GroqModelId, string> = {
  'llama-3.3-70b-versatile': 'MAID 1.0 (Llama 3.3 70B)',
  'llama-3.1-8b-instant':    'MAID 1.0 Fast (Llama 3.1 8B)',
  'mixtral-8x7b-32768':      'MAID Mixtral (8x7B)',
  'gemma2-9b-it':            'MAID Gemma (9B)',
}

export const DEFAULT_MODEL: GroqModelId = 'llama-3.3-70b-versatile'
