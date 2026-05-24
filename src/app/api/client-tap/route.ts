import { NextRequest } from 'next/server'

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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const tapUrl = new URL('/api/tap', appUrl).toString()

    const res = await fetch(tapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RPi_MACHINE_SECRET}`,
      },
      body: JSON.stringify({ token, amount }),
    })

    const data = await res.json()

    if (!res.ok) {
      return Response.json({ error: data.error || 'Tap failed' }, { status: res.status, headers: CORS_HEADERS })
    }

    return Response.json(data, { headers: CORS_HEADERS })
  } catch (err: any) {
    console.error('Client-tap proxy error:', err)
    return Response.json({ error: 'Failed to proxy request: ' + err.message }, { status: 500, headers: CORS_HEADERS })
  }
}
