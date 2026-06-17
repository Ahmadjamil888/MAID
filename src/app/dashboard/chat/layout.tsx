// Full-screen chat — owns the entire viewport, no extra wrappers.
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {children}
    </div>
  )
}
