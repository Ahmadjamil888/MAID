// Chat has its own full-screen UI with sidebar — skip the DashboardShell wrapper.
// Auth is still enforced by the parent dashboard layout.
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
      {children}
    </div>
  )
}
