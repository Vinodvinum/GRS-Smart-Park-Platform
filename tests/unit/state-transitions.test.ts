import { describe, it, expect } from 'vitest'
import {
  canTransitionServiceRequest,
  isValidServiceRequestTransition,
  canTransitionIncident,
  isValidIncidentTransition,
  VALID_SERVICE_REQUEST_CATEGORIES,
  VALID_SERVICE_REQUEST_PRIORITIES,
  VALID_SERVICE_REQUEST_STATUSES,
  VALID_INCIDENT_STATUSES,
} from '@/lib/state-transitions'

describe('ServiceRequest state transitions', () => {
  it.each([
    ['OPEN', 'ASSIGNED'],
    ['OPEN', 'IN_PROGRESS'],
    ['OPEN', 'CANCELLED'],
    ['ASSIGNED', 'IN_PROGRESS'],
    ['ASSIGNED', 'OPEN'],
    ['ASSIGNED', 'CANCELLED'],
    ['IN_PROGRESS', 'RESOLVED'],
    ['IN_PROGRESS', 'ASSIGNED'],
    ['RESOLVED', 'CLOSED'],
    ['RESOLVED', 'IN_PROGRESS'],
  ])('accepts valid transition %s -> %s', (from, to) => {
    expect(canTransitionServiceRequest(from, to).valid).toBe(true)
    expect(isValidServiceRequestTransition(from, to)).toBe(true)
  })

  it.each([
    ['OPEN', 'RESOLVED'],
    ['OPEN', 'CLOSED'],
    ['ASSIGNED', 'RESOLVED'],
    ['IN_PROGRESS', 'CLOSED'],
    ['RESOLVED', 'CANCELLED'],
    ['CLOSED', 'OPEN'],
    ['CLOSED', 'IN_PROGRESS'],
    ['CANCELLED', 'OPEN'],
    ['CANCELLED', 'RESOLVED'],
    ['OPEN', 'GARBAGE'],
  ])('rejects invalid transition %s -> %s', (from, to) => {
    const result = canTransitionServiceRequest(from, to)
    expect(result.valid).toBe(false)
    expect(result.reason).toBeTruthy()
    expect(isValidServiceRequestTransition(from, to)).toBe(false)
  })

  it('cannot transition to the same status (no re-open of terminal states)', () => {
    for (const status of VALID_SERVICE_REQUEST_STATUSES) {
      const result = canTransitionServiceRequest(status, status)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('already')
    }
  })

  it('terminal states (CLOSED, CANCELLED) cannot reopen', () => {
    for (const next of ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED']) {
      expect(canTransitionServiceRequest('CLOSED', next).valid).toBe(false)
      expect(canTransitionServiceRequest('CANCELLED', next).valid).toBe(false)
    }
  })

  it('unknown source state returns valid=false', () => {
    expect(isValidServiceRequestTransition('UNKNOWN', 'OPEN')).toBe(false)
    expect(canTransitionServiceRequest('UNKNOWN', 'OPEN').valid).toBe(false)
  })
})

describe('Incident state transitions', () => {
  it.each([
    ['OPEN', 'ASSIGNED'],
    ['OPEN', 'IN_PROGRESS'],
    ['ASSIGNED', 'IN_PROGRESS'],
    ['ASSIGNED', 'OPEN'],
    ['IN_PROGRESS', 'RESOLVED'],
    ['IN_PROGRESS', 'ASSIGNED'],
  ])('accepts valid transition %s -> %s', (from, to) => {
    expect(canTransitionIncident(from, to).valid).toBe(true)
    expect(isValidIncidentTransition(from, to)).toBe(true)
  })

  it.each([
    ['OPEN', 'RESOLVED'],
    ['OPEN', 'CLOSED'],
    ['ASSIGNED', 'RESOLVED'],
    ['IN_PROGRESS', 'CLOSED'],
    ['RESOLVED', 'OPEN'],
    ['CLOSED', 'OPEN'],
    ['OPEN', 'GARBAGE'],
  ])('rejects invalid transition %s -> %s', (from, to) => {
    const result = canTransitionIncident(from, to)
    expect(result.valid).toBe(false)
    expect(result.reason).toBeTruthy()
  })

  it('can never transition to the same status', () => {
    for (const status of VALID_INCIDENT_STATUSES) {
      expect(canTransitionIncident(status, status).valid).toBe(false)
    }
  })

  it('terminal incident states cannot reopen', () => {
    for (const next of ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']) {
      expect(canTransitionIncident('RESOLVED', next).valid).toBe(false)
      expect(canTransitionIncident('CLOSED', next).valid).toBe(false)
    }
  })
})

describe('validation constants', () => {
  it('exposes the allowed categories', () => {
    expect(VALID_SERVICE_REQUEST_CATEGORIES).toEqual([
      'LOST_FOUND',
      'MEDICAL',
      'LOCKER',
      'FOOD',
      'RIDE',
      'CLEANING',
      'GENERAL',
    ])
  })

  it('exposes the allowed priorities', () => {
    expect(VALID_SERVICE_REQUEST_PRIORITIES).toEqual(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  })

  it('exposes the allowed statuses', () => {
    expect(VALID_SERVICE_REQUEST_STATUSES).toContain('CANCELLED')
    expect(VALID_INCIDENT_STATUSES).not.toContain('CANCELLED')
  })
})
