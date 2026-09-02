import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiUser, isGuardFailure, notFoundResponse } from '@/lib/auth-helpers'

export async function GET(_: Request, { params }: { params: Promise<{ bookingCode: string }> }) {
  const guard = await requireApiUser()
  if (isGuardFailure(guard)) return guard.response
  const user = guard.user

  const { bookingCode } = await params
  const booking = await prisma.booking.findUnique({ where: { bookingCode }, include: { experience: true, tickets: true, digitalPass: true } })
  if (!booking) return notFoundResponse('Booking not found.', 'BOOKING_NOT_FOUND')

  if (user.role === 'GUEST' && booking.userId !== user.id) {
    return notFoundResponse('Booking not found.', 'BOOKING_NOT_FOUND')
  }

  return NextResponse.json({
    id: booking.id, bookingCode: booking.bookingCode, visitDate: booking.visitDate,
    adults: booking.adults, children: booking.children, amount: booking.amount.toString(), status: booking.status,
    experience: { id: booking.experience.id, name: booking.experience.name },
    tickets: booking.tickets.map(t => ({ ticketCode: t.ticketCode, guestType: t.guestType, usedAt: t.usedAt })),
    pass: booking.digitalPass ? { issuedAt: booking.digitalPass.issuedAt, expiresAt: booking.digitalPass.expiresAt, revokedAt: booking.digitalPass.revokedAt } : null,
  })
}