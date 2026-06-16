// Server-only — do NOT import this in client components
import Groq from 'groq-sdk'
export type { GroqModelId } from './models'
export { GROQ_MODELS, DEFAULT_MODEL } from './models'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})
