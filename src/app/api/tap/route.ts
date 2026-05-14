import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateQRPayload } from '@/lib/hmac'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.RPi_MACHINE_SECRET}`

  if (!authHeader || authHeader !== expectedToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { token?: string; amount?: number; machine_id?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { token, amount = 7.0 } = body

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: card, error: cardError } = await admin
    .from('cards')
    .select('id, user_id')
    .eq('card_token', token)
    .eq('status', 'ACTIVE')
    .single()

  if (cardError || !card) {
    return Response.json({ error: 'Card not found' }, { status: 404 })
  }

  const transactionId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  const { data: ticket, error: insertError } = await admin
    .from('tickets')
    .insert({
      user_id: card.user_id,
      card_id: card.id,
      transaction_id: transactionId,
      qr_payload: 'pending',
      amount,
      status: 'PENDING',
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()

  if (insertError || !ticket) {
    return Response.json({ error: 'Failed to create ticket' }, { status: 500 })
  }

  const qrPayload = generateQRPayload(ticket.id, card.user_id, expiresAt.toISOString())

  await admin
    .from('tickets')
    .update({ qr_payload: qrPayload })
    .eq('id', ticket.id)

  return Response.json({
    success: true,
    ticket_id: ticket.id,
    expires_at: expiresAt.toISOString(),
  })
}
