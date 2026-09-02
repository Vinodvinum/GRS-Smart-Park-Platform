import { ArrowRight } from 'lucide-react'
import { GuestShell } from '@/components/GuestShell'
import { ExperienceCard } from '@/components/ExperienceCard'
import { guestExperiences } from '@/lib/guest-data'

export default function ExperiencesPage() {
  return <GuestShell><main className="page"><div className="container">
    <div className="pageTitle"><div className="kicker">DISCOVER GRS</div><h1>Choose how you want to spend the day.</h1><p>Explore the park experiences first. In the next phases, these catalogue records will come directly from PostgreSQL and support availability, offers and booking rules.</p></div>
    <div className="experienceGrid experienceCatalogue">{guestExperiences.map(item => <ExperienceCard item={item} key={item.id}/>)}</div>
    <section className="discoverBand card"><div><div className="kicker">NOT SURE WHERE TO START?</div><h2>Let the visit planner build the day.</h2><p>Choose your group, time and interests and we can turn the catalogue into a simple itinerary.</p></div><a href="/plan" className="primary">Plan My Visit <ArrowRight size={16}/></a></section>
  </div></main></GuestShell>
}
