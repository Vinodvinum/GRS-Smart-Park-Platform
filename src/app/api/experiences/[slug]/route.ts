import { NextResponse } from 'next/server'
import { getExperienceBySlug } from '@/lib/repositories/experience-repository'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const experience = await getExperienceBySlug(slug)
  if (!experience) return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
  return NextResponse.json({ data: experience })
}
