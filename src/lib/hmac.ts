import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const SECRET = process.env.HMAC_SECRET!

function toBase64Url(buf: Buffer | string): string {
  const b64 = typeof buf === 'string' ? Buffer.from(buf).toString('base64') : buf.toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromBase64Url(str: string): string {
  return str.replace(/-/g, '+').replace(/_/g, '/')
}

export function generateQRPayload(ticketId: number, userId: string, expiresAt: string): string {
  const nonce = randomBytes(8).toString('hex')
  const data = JSON.stringify({ ticketId, userId, expiresAt, nonce })
  const sig = createHmac('sha256', SECRET).update(data).digest('hex')
  const raw = JSON.stringify({ data, sig })
  return toBase64Url(Buffer.from(raw))
}

export function verifyQRPayload(payload: string): {
  valid: boolean
  ticketId?: number
  reason?: string
} {
  try {
    const raw = Buffer.from(fromBase64Url(payload), 'base64').toString('utf-8')
    const { data, sig } = JSON.parse(raw) as { data: string; sig: string }

    const expectedSig = createHmac('sha256', SECRET).update(data).digest('hex')
    const sigMatch = timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))
    if (!sigMatch) return { valid: false, reason: 'invalid_signature' }

    const { ticketId, expiresAt } = JSON.parse(data) as {
      ticketId: number
      userId: string
      expiresAt: string
      nonce: string
    }

    if (new Date(expiresAt) < new Date()) return { valid: false, reason: 'expired' }

    return { valid: true, ticketId }
  } catch {
    return { valid: false, reason: 'malformed' }
  }
}
