import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string; full_name?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password, full_name } = body

  if (!email || !password || !full_name) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Create user with auto-confirm
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return Response.json({ error: authError?.message ?? 'Failed to create user' }, { status: 500 })
  }

  const userId = authData.user.id

  // Create profile
  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    full_name,
  })

  if (profileError) {
    console.error('Profile creation error:', profileError)
    // We continue even if profile fails, but it's not ideal
  }

  // Create card
  const { error: cardError } = await admin.from('cards').insert({
    user_id: userId,
    card_token: crypto.randomUUID(),
    label: 'Ma carte MIFARE',
    status: 'ACTIVE',
  })

  if (cardError) {
    console.error('Card creation error:', cardError)
  }

  return Response.json({ success: true, userId })
}
