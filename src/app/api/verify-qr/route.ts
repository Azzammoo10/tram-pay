import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyQRPayload } from '@/lib/hmac'

export async function POST(request: NextRequest) {
  let body: { qr_payload?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ valid: false, reason: 'malformed' }, { status: 400 })
  }

  const { qr_payload } = body

  if (!qr_payload) {
    return Response.json({ valid: false, reason: 'missing_payload' }, { status: 400 })
  }

  const result = verifyQRPayload(qr_payload)
  if (!result.valid || !result.transactionId) {
    return Response.json({ valid: false, reason: result.reason })
  }

  const admin = createAdminClient()

  // Fetch passenger metadata & verification details from Auth + profiles table
  let userDetails = { name: 'Voyageur anonyme', email: '', avatar: null as string | null, emailVerified: false }
  if (result.userId) {
    try {
      const { data: uData } = await admin.auth.admin.getUserById(result.userId)
      if (uData?.user) {
        // Avatar is stored in profiles table (NOT in user_metadata — avoids JWT bloat & HTTP 431)
        const { data: profileData } = await admin
          .from('profiles')
          .select('avatar')
          .eq('id', result.userId)
          .single()

        userDetails = {
          name: uData.user.user_metadata?.full_name || 'Voyageur anonyme',
          email: uData.user.email || '',
          avatar: profileData?.avatar ?? null,
          emailVerified: !!uData.user.email_confirmed_at
        }
      }
    } catch (err) {
      console.error('Failed to retrieve inspector traveler profile:', err)
    }
  }

  const { data: ticket, error } = await admin
    .from('tickets')
    .select('id, status, expires_at, qr_payload')
    .eq('transaction_id', result.transactionId)
    .single()

  if (error || !ticket) {
    return Response.json({ valid: false, reason: 'not_found', user: userDetails })
  }

  // Screenshot check: scanned payload must match current db value
  if (ticket.qr_payload !== qr_payload) {
    return Response.json({ valid: false, reason: 'stale_qr', user: userDetails, ticket })
  }

  if (ticket.status === 'EXPIRED' || new Date(ticket.expires_at) < new Date()) {
    return Response.json({ valid: false, reason: 'expired', user: userDetails, ticket })
  }

  // Update ticket to USED upon first controller validation
  await admin
    .from('tickets')
    .update({ status: 'USED', used_at: new Date().toISOString() })
    .eq('id', ticket.id)

  return Response.json({ 
    valid: true, 
    user: userDetails, 
    ticket: {
      id: ticket.id,
      expires_at: ticket.expires_at
    } 
  })
}
