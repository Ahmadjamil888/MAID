import { createClient } from '@/lib/supabase/server'
import ChatInterface from '@/components/chat/ChatInterface'

export const metadata = { title: 'Research Chat' }

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <ChatInterface user={user} />
}
