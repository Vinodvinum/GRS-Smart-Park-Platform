import { beforeAll, beforeEach, afterAll } from 'vitest'
import { prisma, resetDatabase } from '../helpers/db'

export function useTestDb() {
  beforeAll(async () => {
    await resetDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })
}
