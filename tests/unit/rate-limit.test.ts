import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkRateLimit,
  rateLimitHeaders,
  AUTH_RATE_LIMIT,
  REGISTER_RATE_LIMIT,
  WRITE_RATE_LIMIT,
  type RateLimitConfig,
} from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => vi.useRealTimers())

  it('allows requests below the cap', () => {
    const config: RateLimitConfig = { windowMs: 60_000, max: 3 }
    expect(checkRateLimit('k1', config).allowed).toBe(true)
    expect(checkRateLimit('k1', config).allowed).toBe(true)
    expect(checkRateLimit('k1', config).allowed).toBe(true)
  })

  it('blocks when the cap is exceeded', () => {
    const config: RateLimitConfig = { windowMs: 60_000, max: 2 }
    expect(checkRateLimit('k2', config).allowed).toBe(true)
    expect(checkRateLimit('k2', config).allowed).toBe(true)
    const third = checkRateLimit('k2', config)
    expect(third.allowed).toBe(false)
    expect(third.remaining).toBe(0)
  })

  it('tracks keys independently', () => {
    const config: RateLimitConfig = { windowMs: 60_000, max: 1 }
    expect(checkRateLimit('kA', config).allowed).toBe(true)
    expect(checkRateLimit('kA', config).allowed).toBe(false)
    expect(checkRateLimit('kB', config).allowed).toBe(true)
  })

  it('resets after the window elapses', () => {
    vi.useFakeTimers()
    const config: RateLimitConfig = { windowMs: 60_000, max: 1 }
    checkRateLimit('k3', config)
    checkRateLimit('k3', config)
    expect(checkRateLimit('k3', config).allowed).toBe(false)

    vi.advanceTimersByTime(60_001)
    expect(checkRateLimit('k3', config).allowed).toBe(true)
    vi.useRealTimers()
  })

  it('reports remaining count correctly', () => {
    const config: RateLimitConfig = { windowMs: 60_000, max: 5 }
    expect(checkRateLimit('k4', config).remaining).toBe(4)
    expect(checkRateLimit('k4', config).remaining).toBe(3)
  })
})

describe('rateLimitHeaders', () => {
  it('serializes remaining and reset as strings (unix seconds)', () => {
    const headers = rateLimitHeaders({ allowed: true, remaining: 2, resetAt: 1_700_000_000_000 })
    expect(headers['X-RateLimit-Remaining']).toBe('2')
    expect(headers['X-RateLimit-Reset']).toBe('1700000000')
  })
})

describe('default configurations', () => {
  it('defines expected auth limits', () => {
    expect(AUTH_RATE_LIMIT.max).toBe(20)
    expect(AUTH_RATE_LIMIT.windowMs).toBe(15 * 60 * 1000)
    expect(REGISTER_RATE_LIMIT.max).toBe(5)
    expect(REGISTER_RATE_LIMIT.windowMs).toBe(60 * 60 * 1000)
    expect(WRITE_RATE_LIMIT.max).toBe(30)
    expect(WRITE_RATE_LIMIT.windowMs).toBe(60 * 1000)
  })
})
