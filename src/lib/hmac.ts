import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const SECRET = process.env.HMAC_SECRET!

function toBase64Url(buf: Buffer | string): string {
  const b64 = typeof buf === 'string' ? Buffer.from(buf).toString('base64') : buf.toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromBase64Url(str: string): string {
  return str.replace(/-/g, '+').replace(/_/g, '/')
}

export function generateQRPayload(
  transactionId: string,
  userId: string,
  amount: number,
  expiresAt: string,
  issuedAt: string
): string {
  const data = JSON.stringify({ transactionId, userId, amount, expiresAt, issuedAt })
  const sig = createHmac('sha256', SECRET).update(data).digest('hex')
  const raw = JSON.stringify({ data, sig })
  return toBase64Url(Buffer.from(raw))
}

export function verifyQRPayload(payload: string): {
  valid: boolean
  transactionId?: string
  userId?: string
  amount?: number
  expiresAt?: string
  issuedAt?: string
  reason?: string
} {
  try {
    const raw = Buffer.from(fromBase64Url(payload), 'base64').toString('utf-8')
    const { data, sig } = JSON.parse(raw) as { data: string; sig: string }

    const expectedSig = createHmac('sha256', SECRET).update(data).digest('hex')
    const sigMatch = timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))
    if (!sigMatch) return { valid: false, reason: 'invalid_signature' }

    const parsed = JSON.parse(data) as {
      transactionId: string
      userId: string
      amount: number
      expiresAt: string
      issuedAt: string
    }

    if (new Date(parsed.expiresAt) < new Date()) {
      return { valid: false, reason: 'expired' }
    }

    return {
      valid: true,
      transactionId: parsed.transactionId,
      userId: parsed.userId,
      amount: parsed.amount,
      expiresAt: parsed.expiresAt,
      issuedAt: parsed.issuedAt,
    }
  } catch {
    return { valid: false, reason: 'malformed' }
  }
}
