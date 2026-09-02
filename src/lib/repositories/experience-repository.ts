import { prisma } from '@/lib/prisma'

export async function listActiveExperiences() {
  return prisma.experience.findMany({
    where: { active: true },
    include: { attractions: { where: { active: true }, orderBy: { name: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getExperienceBySlug(slug: string) {
  return prisma.experience.findFirst({
    where: { slug, active: true },
    include: { attractions: { where: { active: true }, orderBy: { name: 'asc' } } },
  })
}
