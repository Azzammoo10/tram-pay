import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ authenticated: false })
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Fetch card
    const { data: card } = await supabase
      .from('cards')
      .select('card_token, status')
      .eq('user_id', user.id)
      .single()

    return Response.json({
      authenticated: true,
      name: profile?.full_name || 'Utilisateur',
      card_token: card?.card_token || '',
      status: card?.status || 'ACTIVE'
    })
  } catch (err: any) {
    console.error('active-card session fetch error:', err)
    return Response.json({ authenticated: false, error: err.message }, { status: 500 })
  }
}
