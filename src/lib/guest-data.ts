import type { ExperienceItem } from '@/components/ExperienceCard'

export const guestExperiences: ExperienceItem[] = [
  { id:'fantasy-park', name:'Fantasy Park', category:'Water & Rides', description:'Water attractions, family fun and a full day of movement.', image:'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?auto=format&fit=crop&w=1200&q=85', accent:'#3155e7' },
  { id:'snow-park', name:'Snow Park', category:'Snow & Ice', description:'A cool indoor escape for snow, ice and playful moments.', image:'https://images.unsplash.com/photo-1551524559-8af4e5f1a2b4?auto=format&fit=crop&w=1200&q=85', accent:'#6b73ff' },
  { id:'updown', name:'UpDown', category:'Adventure', description:'A high-energy experience for guests looking for a little more thrill.', image:'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85', accent:'#d65b9d' },
  { id:'selfie-factory', name:'Selfie Factory', category:'Create & Capture', description:'Make memories, capture moments and share the day.', image:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85', accent:'#e2a83a' },
]

export const facilities = [
  ['Food Court','Food & Beverage','Refuel between experiences.'],
  ['Locker Room','Guest Facility','Keep your belongings secure while you explore.'],
  ['Medical Aid','Guest Support','A clearly visible support point for urgent assistance.'],
  ['Lost & Found','Guest Support','Report or recover items through the guest service workflow.'],
  ['Restrooms','Facility','Convenient guest facilities around the park.'],
  ['Parking','Arrival','Plan your arrival and keep your visit moving.'],
]
