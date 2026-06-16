import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer
      className="border-t border-white/[0.06] py-10 px-6"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-white rounded-[5px] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="black" />
            </svg>
          </div>
          <span className="text-white/60 text-sm font-medium">MAID</span>
          <span className="text-white/20 text-xs">· Medical AI for Intelligent Drug-discovery</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-white/30 text-xs">
          <Link href="/auth/login" className="hover:text-white transition-colors">Sign in</Link>
          <Link href="/auth/signup" className="hover:text-white transition-colors">Sign up</Link>
          <span>© 2026 MAID</span>
        </div>
      </div>

      <p className="text-center text-white/15 text-[10px] mt-6 max-w-xl mx-auto">
        MAID is a research tool. Computational predictions require experimental validation. Not a substitute for licensed pharmaceutical or medical advice.
      </p>
    </footer>
  )
}
