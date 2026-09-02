import { PrismaClient, AttractionStatus, FacilityType, OfferStatus, QueueRisk, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const BCRYPT_ROUNDS = 12

// Production safety guard: this seed injects DEMO accounts and catalog
// reference data. It must NEVER run against a production database.
// Force name: npm run db:seed -- --force
const args = process.argv.slice(2)
const forced = args.includes('--force')
if (process.env.NODE_ENV === 'production' && !forced) {
  console.warn(
    '[seed] Refusing to seed demo data because NODE_ENV=production. ' +
    'Production demo accounts are NOT desired. Re-run with --force only if ' +
    'you explicitly intend to seed a non-production environment with NODE_ENV ' +
    'temporarily overridden.',
  )
  process.exit(0)
}

const DEMO_HASHES: Record<string, string> = {
  'demo.guest@grs.local': '$2b$12$pcVgFXNC8tNFis6jYZDz2.5Qd4xpVJu2w6TTczMOMseIjN.pfU85y',
  'demo.staff@grs.local': '$2b$12$Fojto0FlcUvOajc6YCc/7OA1alMQmjT0iamjz88vfI4T9UsBOz4G2',
  'demo.supervisor@grs.local': '$2b$12$j870zayXmdH0dZENmspQp.kB81YYxRU5pM8O5DRc9jBTnDxlMPS3i',
  'demo.admin@grs.local': '$2b$12$e.b6QkidWL3kB1i69U6N7..BU.N9Z/BYFuBtcYheLmBcHUb1brZ7y',
}

const DEMO_PASSWORD_ENV: Record<string, string> = {
  'demo.guest@grs.local': 'GRS_DEMO_GUEST_PASSWORD',
  'demo.staff@grs.local': 'GRS_DEMO_STAFF_PASSWORD',
  'demo.supervisor@grs.local': 'GRS_DEMO_SUPERVISOR_PASSWORD',
  'demo.admin@grs.local': 'GRS_DEMO_ADMIN_PASSWORD',
}

async function upsertUser(email: string, name: string, role: UserRole) {
  const override = process.env[DEMO_PASSWORD_ENV[email]]
  const passwordHash = override
    ? await bcrypt.hash(override, BCRYPT_ROUNDS)
    : DEMO_HASHES[email]
  return prisma.user.upsert({
    where: { email },
    update: { name, role, isActive: true, passwordHash },
    create: { name, email, role, passwordHash, isActive: true },
  })
}

async function main() {
  await upsertUser('demo.guest@grs.local', 'Demo Guest', UserRole.GUEST)
  await upsertUser('demo.staff@grs.local', 'Demo Staff', UserRole.STAFF)
  await upsertUser('demo.supervisor@grs.local', 'Demo Supervisor', UserRole.SUPERVISOR)
  const admin = await upsertUser('demo.admin@grs.local', 'Demo Operations Admin', UserRole.ADMIN)

  const experiences = [
    { slug: 'fantasy-park', name: 'GRS Fantasy Park', shortName: 'Fantasy Park', description: 'Water rides, family attractions and adventure.', sortOrder: 1 },
    { slug: 'snow-park', name: 'GRS Snow Park', shortName: 'Snow Park', description: 'Snow-themed indoor entertainment experience.', sortOrder: 2 },
    { slug: 'updown', name: 'GRS UpDown', shortName: 'UpDown', description: 'Action, movement and immersive attractions.', sortOrder: 3 },
    { slug: 'selfie-factory', name: 'Selfie Factory', shortName: 'Selfie Factory', description: 'Photo-friendly themed experiences.', sortOrder: 4 },
  ]

  for (const item of experiences) {
    const experience = await prisma.experience.upsert({ where: { slug: item.slug }, update: item, create: item })
    const attractions = item.slug === 'fantasy-park'
      ? ['Wave Pool', 'Aqua Racer', 'Lazy River', 'Kids Zone']
      : item.slug === 'snow-park' ? ['Snow Play Zone', 'Ice Slide']
      : item.slug === 'updown' ? ['Adventure Arena', 'UpDown Experience']
      : ['Creator Rooms', 'Photo Studio']
    for (const name of attractions) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      await prisma.attraction.upsert({
        where: { experienceId_slug: { experienceId: experience.id, slug } },
        update: { name, status: AttractionStatus.OPEN },
        create: { experienceId: experience.id, name, slug, status: AttractionStatus.OPEN },
      })
    }
  }

  const facilities = [
    ['Main Locker Room', FacilityType.LOCKER, 'Main entrance'],
    ['Medical Aid', FacilityType.MEDICAL, 'Central operations'],
    ['Food Court', FacilityType.FOOD, 'Central plaza'],
    ['Lost & Found', FacilityType.LOST_FOUND, 'Guest services'],
    ['Parking', FacilityType.PARKING, 'Main parking area'],
    ['Information Desk', FacilityType.INFORMATION, 'Main entrance'],
  ] as const
  for (const [name, type, location] of facilities) {
    await prisma.facility.upsert({ where: { id: `seed-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}` }, update: { name, type, location }, create: { id: `seed-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, name, type, location } })
  }

  await prisma.offer.upsert({ where: { code: 'DEMO-FAMILY' }, update: { status: OfferStatus.ACTIVE }, create: { code: 'DEMO-FAMILY', name: 'Family Fun Offer', description: 'Demo family package for the portfolio environment.', price: 1499, status: OfferStatus.ACTIVE } })
  await prisma.offer.upsert({ where: { code: 'DEMO-COMBO' }, update: { status: OfferStatus.ACTIVE }, create: { code: 'DEMO-COMBO', name: 'Park Combo', description: 'Demo multi-experience package.', price: 1999, status: OfferStatus.ACTIVE } })

  const zones = [
    ['Wave Pool', 1200, 18, QueueRisk.LOW],
    ['Adventure Rides', 600, 31, QueueRisk.MEDIUM],
    ['Kids Zone', 450, 22, QueueRisk.LOW],
    ['Snow Park', 350, 46, QueueRisk.HIGH],
  ] as const
  for (const [name, maxCapacity, minutes, riskLevel] of zones) {
    const zone = await prisma.zone.upsert({ where: { name }, update: { maxCapacity }, create: { name, maxCapacity } })
    await prisma.queueSnapshot.create({ data: { zoneId: zone.id, observedAt: new Date(), predictedMinutes: minutes, riskLevel } })
  }

  await prisma.auditLog.create({ data: { actorId: admin.id, action: 'SEED_COMPLETED', entityType: 'SYSTEM', metadata: { phase: 'zip-03-database-foundation' } } })

  const guest = await prisma.user.findUnique({ where: { email: 'demo.guest@grs.local' } })

  const sr1 = await prisma.serviceRequest.upsert({
    where: { requestCode: 'GRS10452' },
    update: {},
    create: {
      requestCode: 'GRS10452',
      userId: guest?.id ?? null,
      category: 'LOST_FOUND',
      location: 'Wave Pool',
      description: 'Black wallet reported near the Wave Pool.',
      status: 'OPEN',
      priority: 'MEDIUM',
    },
  })
  await prisma.serviceRequestUpdate.upsert({
    where: { id: 'seed-sru-1' },
    update: {},
    create: { id: 'seed-sru-1', serviceRequestId: sr1.id, status: 'OPEN', note: 'Request received.', actorName: 'Guest' },
  })

  const sr2 = await prisma.serviceRequest.upsert({
    where: { requestCode: 'GRS10451' },
    update: {},
    create: {
      requestCode: 'GRS10451',
      category: 'LOCKER',
      location: 'Locker Room',
      description: 'Locker does not appear to open.',
      status: 'ASSIGNED',
      priority: 'HIGH',
      assignedTo: 'Operations Team',
    },
  })
  await prisma.serviceRequestUpdate.upsert({
    where: { id: 'seed-sru-2' },
    update: {},
    create: { id: 'seed-sru-2', serviceRequestId: sr2.id, status: 'OPEN', note: 'Request received.', actorName: 'Guest' },
  })
  await prisma.serviceRequestUpdate.upsert({
    where: { id: 'seed-sru-3' },
    update: {},
    create: { id: 'seed-sru-3', serviceRequestId: sr2.id, status: 'ASSIGNED', note: 'Assigned to Operations Team.', actorName: 'Front Desk' },
  })

  await prisma.incident.upsert({
    where: { incidentCode: 'INC-1007' },
    update: {},
    create: { incidentCode: 'INC-1007', title: 'Attraction equipment check', description: 'Routine equipment inspection required.', location: 'Aqua Racer', severity: 'HIGH', status: 'IN_PROGRESS', assignedTo: 'Ravi S.' },
  })
  await prisma.incident.upsert({
    where: { incidentCode: 'INC-1006' },
    update: {},
    create: { incidentCode: 'INC-1006', title: 'Guest assistance escalation', description: 'Guest requires additional support.', location: 'Wave Pool', severity: 'MEDIUM', status: 'OPEN' },
  })
  await prisma.incident.upsert({
    where: { incidentCode: 'INC-1005' },
    update: {},
    create: { incidentCode: 'INC-1005', title: 'Cleaning response', description: 'Area requires immediate cleaning.', location: 'Family Zone', severity: 'LOW', status: 'RESOLVED', assignedTo: 'Anil K.', resolvedAt: new Date() },
  })
}

main().finally(() => prisma.$disconnect())
