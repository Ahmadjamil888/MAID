// ── Client-safe model definitions (no Node.js/server imports) ───────────────

export type GroqModelId =
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'llama-3.2-90b-vision-preview'
  | 'llama-3.2-11b-vision-preview'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it'
  | 'qwen-qwq-32b'

export const GROQ_MODELS: Record<GroqModelId, { label: string; description: string }> = {
  'llama-3.3-70b-versatile':        { label: 'MAID 1.0',        description: 'Best overall · 70B' },
  'llama-3.1-70b-versatile':        { label: 'MAID 1.0 Pro',    description: 'Fast 70B' },
  'llama-3.1-8b-instant':           { label: 'MAID 1.0 Flash',  description: 'Fastest · 8B' },
  'llama-3.2-90b-vision-preview':   { label: 'MAID Vision 90B', description: 'Multimodal · 90B' },
  'llama-3.2-11b-vision-preview':   { label: 'MAID Vision 11B', description: 'Multimodal · fast' },
  'mixtral-8x7b-32768':             { label: 'MAID Mixtral',    description: 'Long context · 32K' },
  'gemma2-9b-it':                   { label: 'MAID Gemma',      description: 'Efficient · 9B' },
  'qwen-qwq-32b':                   { label: 'MAID Reason',     description: 'Deep reasoning' },
}

export const DEFAULT_MODEL: GroqModelId = 'llama-3.3-70b-versatile'
