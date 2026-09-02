import { prisma } from '@/lib/prisma'

export async function listActiveOffers() {
  const now = new Date()
  return prisma.offer.findMany({
    where: {
      status: 'ACTIVE',
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    include: { experience: true },
    orderBy: { createdAt: 'desc' },
  })
}
