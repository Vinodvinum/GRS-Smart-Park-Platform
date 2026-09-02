import { describe, it, expect } from 'vitest'
import {
  createOpaqueToken,
  hashToken,
  normalizePassToken,
  bookingCode,
  ticketCode,
} from '@/lib/booking'

describe('booking token helpers', () => {
  describe('createOpaqueToken', () => {
    it('produces a long, non-predictable random token', () => {
      const a = createOpaqueToken()
      const b = createOpaqueToken()
      expect(a).not.toBe(b)
      expect(a.length).toBeGreaterThanOrEqual(30)
      expect(b.length).toBeGreaterThanOrEqual(30)
    })
  })

  describe('hashToken', () => {
    it('produces a deterministic sha-256 hex', () => {
      const h1 = hashToken('abc')
      const h2 = hashToken('abc')
      expect(h1).toBe(h2)
      expect(h1).toMatch(/^[0-9a-f]{64}$/)
    })

    it('produces different hashes for different inputs', () => {
      expect(hashToken('abc')).not.toBe(hashToken('abd'))
    })
  })

  describe('normalizePassToken', () => {
    it('strips the grs://pass/ prefix', () => {
      expect(normalizePassToken('grs://pass/abc123')).toBe('abc123')
    })

    it('trims whitespace', () => {
      expect(normalizePassToken('  abc123  ')).toBe('abc123')
    })

    it('returns token unchanged when no prefix', () => {
      expect(normalizePassToken('plain-token')).toBe('plain-token')
    })

    it('normalizes then hashes consistently (raw token lookup works)', () => {
      const raw = createOpaqueToken()
      const withPrefix = `grs://pass/${raw}`
      expect(hashToken(normalizePassToken(withPrefix))).toBe(hashToken(raw))
    })
  })

  describe('bookingCode', () => {
    it('produces unique codes', () => {
      const codes = new Set(Array.from({ length: 50 }, () => bookingCode()))
      expect(codes.size).toBe(50)
    })
  })

  describe('ticketCode', () => {
    it('produces prefixed codes', () => {
      expect(ticketCode('ADULT')).toContain('TKT-ADULT-')
      expect(ticketCode('CHILD')).toContain('TKT-CHILD-')
    })
  })
})
