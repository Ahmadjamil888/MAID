'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Loader2, Check, LogOut } from 'lucide-react'
import { GROQ_MODELS, type GroqModelId } from '@/lib/groq/models'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, string> } | null>(null)
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [defaultModel, setDefaultModel] = useState<GroqModelId>('llama-3.3-70b-versatile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      setFullName(user.user_metadata?.full_name ?? '')
      setRole(user.user_metadata?.role ?? 'researcher')
    })
  }, []) // eslint-disable-line

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.auth.updateUser({
      data: { full_name: fullName, role, default_model: defaultModel },
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="h-full overflow-y-auto bg-black p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-light mb-1" style={{ letterSpacing: '-0.02em' }}>
            <span style={{ fontStyle: 'italic' }}>Account</span> Settings
          </h1>
          <p className="text-white/40 text-sm">Manage your profile and preferences</p>
        </div>

        <form onSubmit={save} className="space-y-6">
          {/* Profile */}
          <div className="border border-white/10 rounded-2xl p-6">
            <h2 className="text-white text-sm font-semibold mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-white/40" />
              Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Email</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl py-3 px-4">
                  <Mail className="w-4 h-4 text-white/20" />
                  <span className="text-white/50 text-sm">{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1.5">Full name</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1.5">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-white/30 appearance-none"
                >
                  <option value="pharmacist" className="bg-black">Pharmacist</option>
                  <option value="researcher" className="bg-black">Researcher</option>
                  <option value="student" className="bg-black">Student</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Preferences */}
          <div className="border border-white/10 rounded-2xl p-6">
            <h2 className="text-white text-sm font-semibold mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-white/40" />
              AI Preferences
            </h2>

            <div>
              <label className="block text-white/50 text-xs mb-1.5">Default Model</label>
              <select
                value={defaultModel}
                onChange={e => setDefaultModel(e.target.value as GroqModelId)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-white/30 appearance-none"
              >
                {Object.entries(GROQ_MODELS).map(([id, { label }]) => (
                  <option key={id} value={id} className="bg-black">{label}</option>
                ))}
              </select>
              <p className="text-white/30 text-xs mt-2">Can be overridden per conversation in the chat interface.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-green-600" /> : null}
              {saved ? 'Saved!' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 text-white/40 hover:text-red-400 text-sm border border-white/10 hover:border-red-500/20 px-6 py-3 rounded-xl transition-colors ml-auto"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
