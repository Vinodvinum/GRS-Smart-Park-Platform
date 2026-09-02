import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const BCRYPT_ROUNDS = 12

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(190).trim().toLowerCase(),
  password: z.string().min(8).max(200),
  confirm: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please check the details you entered.' }, { status: 400 })
    }
    const { name, email, password, confirm } = parsed.data
    if (password !== confirm) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // GUEST role is always set explicitly server-side. Client-supplied roles are ignored.
    await prisma.user.create({
      data: { name, email, role: 'GUEST', passwordHash, isActive: true },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    console.error('auth.register_failed')
    return NextResponse.json({ error: 'Unable to create your account.' }, { status: 500 })
  }
}