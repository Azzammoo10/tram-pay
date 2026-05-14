import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateQRPayload } from '@/lib/hmac'

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: card, error: cardError } = await admin
    .from('cards')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .single()

  if (cardError || !card) {
    return Response.json({ error: 'No active card found' }, { status: 404 })
  }

  const transactionId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  const { data: ticket, error: insertError } = await admin
    .from('tickets')
    .insert({
      user_id: user.id,
      card_id: card.id,
      transaction_id: transactionId,
      qr_payload: 'pending',
      amount: 7.0,
      status: 'PENDING',
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()

  if (insertError || !ticket) {
    return Response.json({ error: 'Failed to create ticket' }, { status: 500 })
  }

  const qrPayload = generateQRPayload(ticket.id, user.id, expiresAt.toISOString())

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
