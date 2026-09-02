import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type ExperienceItem = {
  id: string
  name: string
  category: string
  description: string
  image: string
  accent: string
}

export function ExperienceCard({ item }: { item: ExperienceItem }) {
  return <Link href={`/experiences/${item.id}`} className="card experience experience-full">
    <div className="experienceImage" style={{ backgroundImage: `url(${item.image})` }} />
    <div className="experienceBody"><div><b>{item.name}</b><small>{item.category}</small><p>{item.description}</p></div><ArrowRight size={17} /></div>
  </Link>
}
