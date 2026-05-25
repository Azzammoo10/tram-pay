import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateQRPayload } from '@/lib/hmac'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

export async function POST(request: NextRequest) {
  let body: { token?: string; amount?: number }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS })
  }

  const { token, amount = 7.0 } = body

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400, headers: CORS_HEADERS })
  }

  try {
    const admin = createAdminClient()

    // 1. Fetch card status
    const { data: card, error: cardError } = await admin
      .from('cards')
      .select('id, user_id')
      .eq('card_token', token)
      .eq('status', 'ACTIVE')
      .single()

    if (cardError || !card) {
      return Response.json({ error: 'Card not found or inactive' }, { status: 404, headers: CORS_HEADERS })
    }

    const transactionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    const issuedAt = new Date()

    // 2. Insert new ticket
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
      return Response.json({ error: 'Failed to create ticket' }, { status: 500, headers: CORS_HEADERS })
    }

    // 3. Generate HMAC QR signature payload
    const qrPayload = generateQRPayload(
      transactionId,
      card.user_id,
      amount,
      expiresAt.toISOString(),
      issuedAt.toISOString()
    )

    // 4. Update ticket with signed payload
    await admin
      .from('tickets')
      .update({ qr_payload: qrPayload })
      .eq('id', ticket.id)

    return Response.json({
      success: true,
      ticket_id: ticket.id,
      expires_at: expiresAt.toISOString(),
    }, { headers: CORS_HEADERS })
  } catch (err: any) {
    console.error('Client-tap proxy error:', err)
    return Response.json({ error: 'Failed to process tap request: ' + err.message }, { status: 500, headers: CORS_HEADERS })
  }
}

