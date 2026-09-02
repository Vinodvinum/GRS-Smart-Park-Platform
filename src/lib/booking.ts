import crypto from 'node:crypto'

export function createOpaqueToken() {
  return crypto.randomBytes(24).toString('base64url')
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function normalizePassToken(value: string) {
  const trimmed = value.trim()
  const prefix = 'grs://pass/'
  return trimmed.startsWith(prefix) ? trimmed.slice(prefix.length) : trimmed
}

export function bookingCode() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `GRS${ts}${rand}`
}

export function ticketCode(prefix = 'ADULT') {
  return `TKT-${prefix}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`
}
