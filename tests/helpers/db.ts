import { PrismaClient, type UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import type { SessionUser } from '@/lib/auth-types'

export const TEST_DATABASE_URL = process.env.DATABASE_URL as string

export const prisma = new PrismaClient()

const TABLES_TO_TRUNCATE = [
  'AuditLog',
  'Feedback',
  'ServiceRequestUpdate',
  'ServiceRequest',
  'Ticket',
  'DigitalPass',
  'Booking',
  'Incident',
  'QueueSnapshot',
  'Zone',
  'Offer',
  'Attraction',
  'Facility',
  'Experience',
  'User',
]

export async function resetDatabase() {
  for (const table of TABLES_TO_TRUNCATE) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`)
  }
  await seedReferenceDataImpl()
}

export function uniqueEmail(prefix = 'guest') {
  return `${prefix}.${crypto.randomBytes(6).toString('hex')}@test.local`
}

export function strongPassword() {
  return 'TestPass!2026'
}

export async function createUser(opts: {
  name?: string
  email?: string
  role?: UserRole
  password?: string
  isActive?: boolean
}) {
  const password = opts.password ?? strongPassword()
  const hash = await bcrypt.hash(password, 4)
  return prisma.user.create({
    data: {
      name: opts.name ?? 'Test User',
      email: opts.email ?? uniqueEmail(),
      role: opts.role ?? 'GUEST',
      passwordHash: hash,
      isActive: opts.isActive ?? true,
    },
  })
}

export async function createDemoUser(role: UserRole, isActive = true) {
  const email =
    role === 'GUEST'
      ? 'demo.guest@grs.local'
      : role === 'STAFF'
        ? 'demo.staff@grs.local'
        : role === 'SUPERVISOR'
          ? 'demo.supervisor@grs.local'
          : 'demo.admin@grs.local'
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return createUser({ email, name: `Demo ${role}`, role, isActive })
  }
  await prisma.user.update({ where: { id: user.id }, data: { isActive } })
  return user
}

export async function demoUser(role: UserRole) {
  const existing = await prisma.user.findUnique({
    where: { email: `demo.${role.toLowerCase()}@grs.local` },
  })
  if (existing) return existing
  return createUser({ email: `demo.${role.toLowerCase()}@grs.local`, name: `Demo ${role}`, role })
}

export function sessionUser(user: { id: string; name: string; email: string; role: UserRole; isActive: boolean }): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
}

export function seedReferenceData() {
  // Reference data (experiences, offers, zones) is seeded by the global seed.
  // This helper re-runs minimal reference data if truncation removed it.
  return seedReferenceDataImpl()
}

async function seedReferenceDataImpl() {
  const experience = await prisma.experience.upsert({
    where: { slug: 'test-experience' },
    update: {},
    create: {
      slug: 'test-experience',
      name: 'Test Experience',
      description: 'Test description',
      sortOrder: 1,
      active: true,
    },
  })
  await prisma.offer.upsert({
    where: { code: 'TEST-OFFER' },
    update: { status: 'ACTIVE' },
    create: {
      code: 'TEST-OFFER',
      name: 'Test Offer',
      description: 'Test offer',
      price: 1000,
      status: 'ACTIVE',
      experienceId: experience.id,
    },
  })
  const zone = await prisma.zone.upsert({
    where: { name: 'Test Zone' },
    update: { maxCapacity: 1000 },
    create: { name: 'Test Zone', maxCapacity: 1000, active: true },
  })
  return { experience, offer: await prisma.offer.findUnique({ where: { code: 'TEST-OFFER' } }), zone }
}

export async function getFirstExperience() {
  const existing = await prisma.experience.findFirst({ where: { active: true } })
  if (existing) return existing
  return seedReferenceData().then((r) => r.experience)
}

export async function getActiveOffer() {
  const existing = await prisma.offer.findFirst({
    where: { status: 'ACTIVE', experienceId: { not: null } },
  })
  if (existing) return existing
  return seedReferenceData().then((r) => r.offer)
}

export async function createBookingDirect(opts: {
  userId: string
  experienceId: string
  offerCode?: string | null
  visitDate?: Date
  status?: 'PENDING' | 'CONFIRMED' | 'USED' | 'CANCELLED'
  qrPayload?: string
  adults?: number
  children?: number
  amount?: number
}) {
  const date = opts.visitDate ?? new Date(Date.now() + 86400000)
  const expiresAt = new Date(date.getTime() + 86400000)
  const booking = await prisma.booking.create({
    data: {
      bookingCode: `BK${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      userId: opts.userId,
      experienceId: opts.experienceId,
      offerCode: opts.offerCode,
      visitDate: date,
      adults: opts.adults ?? 1,
      children: opts.children ?? 0,
      amount: opts.amount ?? 799,
      status: opts.status ?? 'CONFIRMED',
      qrPayload: opts.qrPayload ?? crypto.randomBytes(16).toString('hex'),
    },
  })
  const rawToken = `tktest_${crypto.randomBytes(18).toString('base64url')}`.slice(0, 40)
  await prisma.digitalPass.create({
    data: {
      bookingId: booking.id,
      tokenHash: hashPassToken(rawToken),
      expiresAt,
    },
  })
  await prisma.ticket.createMany({
    data: Array.from({ length: opts.adults ?? 1 }, () => ({
      bookingId: booking.id,
      ticketCode: `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      guestType: 'ADULT',
    })),
  })
  return { booking, rawToken }
}

export function hashPassToken(token: string) {
  return crypto.createHash('sha256').update(token.trim()).digest('hex')
}

export async function hasCorrectPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) return false
  return bcrypt.compare(password, user.passwordHash)
}
