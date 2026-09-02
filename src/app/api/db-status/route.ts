import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiRole, isGuardFailure } from '@/lib/auth-helpers'
import { STAFF_ROLES } from '@/lib/rbac'

export async function GET() {
  const guard = await requireApiRole(STAFF_ROLES)
  if (isGuardFailure(guard)) return guard.response

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', database: 'connected' })
  } catch {
    return NextResponse.json({ status: 'degraded', database: 'unavailable' }, { status: 503 })
  }
}
