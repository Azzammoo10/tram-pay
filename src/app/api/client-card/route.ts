import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
  let body: { card_token?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS })
  }

  const { card_token, status } = body

  if (!card_token || !status) {
    return Response.json({ error: 'Missing required fields' }, { status: 400, headers: CORS_HEADERS })
  }

  const validStatuses = ['ACTIVE', 'BLOCKED', 'EXPIRED']
  if (!validStatuses.includes(status.toUpperCase())) {
    return Response.json({ error: 'Invalid status' }, { status: 400, headers: CORS_HEADERS })
  }

  try {
    const admin = createAdminClient()

    const { error } = await admin
      .from('cards')
      .update({ status: status.toUpperCase() })
      .eq('card_token', card_token)

    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS })
    }

    return Response.json({ success: true }, { headers: CORS_HEADERS })
  } catch (err: any) {
    console.error('Client-card update error:', err)
    return Response.json({ error: 'Failed to update card: ' + err.message }, { status: 500, headers: CORS_HEADERS })
  }
}
