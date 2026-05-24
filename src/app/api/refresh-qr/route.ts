import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateQRPayload } from '@/lib/hmac'

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Extract ticket_id from query params
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticket_id')

    if (!ticketId) {
      return Response.json({ error: 'Missing ticket_id parameter' }, { status: 400 })
    }

    // 3. Fetch ticket with admin client to bypass user RLS
    const admin = createAdminClient()
    const { data: ticket, error: ticketError } = await admin
      .from('tickets')
      .select('id, user_id, transaction_id, amount, expires_at, status')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return Response.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // 4. Verify ownership
    if (ticket.user_id !== user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 5. Verify status and expiry
    if (ticket.status !== 'PENDING') {
      return Response.json({ error: 'Ticket is already used or expired' }, { status: 400 })
    }

    if (new Date(ticket.expires_at) < new Date()) {
      return Response.json({ error: 'Ticket has expired' }, { status: 400 })
    }

    // 6. Regenerate and sign new payload with current timestamp
    const newPayload = generateQRPayload(
      ticket.transaction_id,
      ticket.user_id,
      ticket.amount,
      ticket.expires_at,
      new Date().toISOString()
    )

    // 7. Update ticket qr_payload using admin client
    const { error: updateError } = await admin
      .from('tickets')
      .update({ qr_payload: newPayload })
      .eq('id', ticket.id)

    if (updateError) {
      console.error('Failed to update ticket qr_payload:', updateError)
      return Response.json({ error: 'Failed to refresh ticket QR payload' }, { status: 500 })
    }

    return Response.json({ success: true, qr_payload: newPayload })
  } catch (err: any) {
    console.error('refresh-qr API error:', err)
    return Response.json({ error: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}
