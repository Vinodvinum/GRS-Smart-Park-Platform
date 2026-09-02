import { NextResponse } from 'next/server'
import { listActiveOffers } from '@/lib/repositories/offer-repository'

export async function GET() {
  try {
    const offers = await listActiveOffers()
    return NextResponse.json({ data: offers })
  } catch {
    return NextResponse.json({ error: 'Unable to load offers' }, { status: 503 })
  }
}
