import { createClient } from '@/lib/supabase/server'
import DashboardHome from '@/components/dashboard/DashboardHome'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get recent sessions
  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('id, title, tool_mode, updated_at')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(6)

  return <DashboardHome user={user!} recentSessions={sessions ?? []} />
}
