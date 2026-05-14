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
  if (!result.valid || result.ticketId === undefined) {
    return Response.json({ valid: false, reason: result.reason })
  }

  const admin = createAdminClient()

  const { data: ticket, error } = await admin
    .from('tickets')
    .select('id, status, expires_at')
    .eq('id', result.ticketId)
    .single()

  if (error || !ticket) {
    return Response.json({ valid: false, reason: 'not_found' })
  }

  if (ticket.status === 'USED') {
    return Response.json({ valid: false, reason: 'already_used' })
  }

  if (ticket.status === 'EXPIRED' || new Date(ticket.expires_at) < new Date()) {
    return Response.json({ valid: false, reason: 'expired' })
  }

  await admin
    .from('tickets')
    .update({ status: 'USED', used_at: new Date().toISOString() })
    .eq('id', ticket.id)

  return Response.json({ valid: true })
}
