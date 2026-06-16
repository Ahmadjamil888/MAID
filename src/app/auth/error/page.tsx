import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-white text-xl font-semibold mb-2">Authentication error</h1>
        <p className="text-white/40 text-sm mb-8">Something went wrong during sign in. Please try again.</p>
        <Link
          href="/auth/login"
          className="inline-block bg-white text-black text-sm font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
