import { NextResponse } from 'next/server'
import { listActiveExperiences } from '@/lib/repositories/experience-repository'

export async function GET() {
  try {
    const experiences = await listActiveExperiences()
    return NextResponse.json({ data: experiences })
  } catch {
    return NextResponse.json({ error: 'Unable to load experiences' }, { status: 503 })
  }
}
