import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  // Get current authenticated user from session cookie
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { avatar?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { avatar } = body
  if (!avatar || typeof avatar !== 'string') {
    return Response.json({ error: 'Missing avatar field' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Store the actual base64 avatar in profiles table (NOT in JWT/cookies)
  const { error: profileError } = await admin
    .from('profiles')
    .update({ avatar })
    .eq('id', user.id)

  if (profileError) {
    console.error('Profile avatar update error:', profileError)
    return Response.json({ error: 'Failed to save avatar' }, { status: 500 })
  }

  // 2. Store only a tiny boolean flag in user_metadata so the dashboard
  //    client-side gate knows the avatar is configured — no large data in JWT!
  const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      avatar: 'set',   // tiny sentinel value, NOT the base64 image
    }
  })

  if (metaError) {
    console.error('User metadata update error:', metaError)
    return Response.json({ error: 'Failed to update profile metadata' }, { status: 500 })
  }

  return Response.json({ success: true })
}
