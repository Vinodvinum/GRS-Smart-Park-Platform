import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashToken, normalizePassToken } from '@/lib/booking'
import { requireApiUser, isGuardFailure, notFoundResponse } from '@/lib/auth-helpers'

const schema = z.object({ token: z.string().min(20).max(300) })

export async function POST(request: Request) {
  const guard = await requireApiUser()
  if (isGuardFailure(guard)) return guard.response
  const user = guard.user

  try {
    const { token } = schema.parse(await request.json())
    const pass = await prisma.digitalPass.findUnique({ where: { tokenHash: hashToken(normalizePassToken(token)) }, include: { booking: { include: { experience: true, tickets: true } } } })
    if (!pass || !pass.booking) return notFoundResponse('Pass not found.', 'PASS_NOT_FOUND')

    if (user.role === 'GUEST' && pass.booking.userId !== user.id) {
      return notFoundResponse('Pass not found.', 'PASS_NOT_FOUND')
    }

    const now = new Date()
    if (pass.revokedAt) return NextResponse.json({ valid:false, reason:'PASS_REVOKED' }, { status:409 })
    if (pass.expiresAt < now) return NextResponse.json({ valid:false, reason:'PASS_EXPIRED' }, { status:409 })
    if (pass.booking.status === 'CANCELLED') return NextResponse.json({ valid:false, reason:'BOOKING_CANCELLED' }, { status:409 })
    return NextResponse.json({ valid:true, booking:{ bookingCode:pass.booking.bookingCode, experience:pass.booking.experience.name, visitDate:pass.booking.visitDate, status:pass.booking.status }, tickets:pass.booking.tickets.length })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ valid:false, reason:'INVALID_TOKEN' }, { status:400 })
    console.error('pass.validate_failed')
    return NextResponse.json({ valid:false, reason:'VALIDATION_ERROR' }, { status:500 })
  }
}