import { ArrowRight, Sparkles } from 'lucide-react'
import { GuestShell } from '@/components/GuestShell'
import { ExperienceCard } from '@/components/ExperienceCard'
import { guestExperiences } from '@/lib/guest-data'

export default function ExperiencesPage() {
  return <GuestShell><main className="page"><div className="container">
    <div className="pageTitle"><div className="kicker">DISCOVER GRS</div><h1>Choose how you want to spend the day.</h1><p>Explore the signature GRS experiences, then build a visit around the ones that fit your group.</p></div>
    <div className="experienceGrid experienceCatalogue">{guestExperiences.map(item => <ExperienceCard item={item} key={item.id}/>)}</div>
    <section className="discoverBand card"><div><div className="kicker">PLAN WITH CONFIDENCE</div><h2>Not sure what fits together?</h2><p>Tell us your group, preferred pace and experiences. The planner turns that into a simple day plan.</p></div><a href="/plan" className="primary"><Sparkles size={16}/> Plan My Visit <ArrowRight size={16}/></a></section>
  </div></main></GuestShell>
}
