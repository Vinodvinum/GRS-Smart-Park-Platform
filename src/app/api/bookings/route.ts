import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { bookingCode, createOpaqueToken, hashToken, ticketCode } from '@/lib/booking'
import { requireApiUser, isGuardFailure } from '@/lib/auth-helpers'
import { auditLog } from '@/lib/audit'
import { checkRateLimit, rateLimitHeaders, WRITE_RATE_LIMIT } from '@/lib/rate-limit'
import { log } from '@/lib/log'

const schema = z.object({
  experienceId: z.string().min(1),
  visitDate: z.string().datetime(),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(20),
  offerCode: z.string().trim().min(1).max(50).optional(),
})

export async function POST(request: Request) {
  const guard = await requireApiUser()
  if (isGuardFailure(guard)) return guard.response
  const user = guard.user

  const rl = checkRateLimit(`booking:${user.id}`, WRITE_RATE_LIMIT)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  try {
    const input = schema.parse(await request.json())
    const visitDate = new Date(input.visitDate)
    if (visitDate.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Visit date must be current or future.' }, { status: 400 })
    }
    const experience = await prisma.experience.findFirst({ where: { id: input.experienceId, active: true } })
    if (!experience) return NextResponse.json({ error: 'Experience not found.' }, { status: 404 })
    const offer = input.offerCode ? await prisma.offer.findFirst({ where: { code: input.offerCode, status: 'ACTIVE' } }) : null
    const base = input.adults * 799 + input.children * 499
    const total = offer ? Math.max(0, Math.min(base, Number(offer.price))) : base
    const rawToken = createOpaqueToken()
    const code = bookingCode()
    const expiresAt = new Date(visitDate.getTime() + 24 * 60 * 60 * 1000)

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({ data: {
        bookingCode: code, userId: user.id, experienceId: experience.id, offerCode: offer?.code,
        visitDate, adults: input.adults, children: input.children, amount: total,
        status: 'CONFIRMED', qrPayload: hashToken(rawToken),
      }})
      await tx.ticket.createMany({ data: [
        ...Array.from({ length: input.adults }, () => ({ bookingId: created.id, ticketCode: ticketCode('ADULT'), guestType: 'ADULT' })),
        ...Array.from({ length: input.children }, () => ({ bookingId: created.id, ticketCode: ticketCode('CHILD'), guestType: 'CHILD' })),
      ]})
      await tx.digitalPass.create({ data: { bookingId: created.id, tokenHash: hashToken(rawToken), expiresAt } })
      return created
    })
    await auditLog({ actorId: user.id, action: 'BOOKING_CREATED', entityType: 'BOOKING', entityId: booking.bookingCode, metadata: { amount: booking.amount.toString() } })
    return NextResponse.json({
      booking: { id: booking.id, bookingCode: booking.bookingCode, visitDate: booking.visitDate, amount: booking.amount.toString() },
      passToken: rawToken,
      qrValue: `grs://pass/${rawToken}`,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid booking details.', issues: error.issues }, { status: 400 })
    log.errorSafe('booking.create_failed', error, { userId: user.id })
    return NextResponse.json({ error: 'Unable to create booking.' }, { status: 500 })
  }
}
