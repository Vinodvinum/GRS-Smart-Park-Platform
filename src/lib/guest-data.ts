import type { ExperienceItem } from '@/components/ExperienceCard'

// Real GRS imagery is used for the primary park experiences. Keep these URLs
// replaceable so approved/local assets can be hosted by the platform later.
export const guestExperiences: ExperienceItem[] = [
  {
    id:'fantasy-park',
    name:'Fantasy Park',
    category:'Water & Rides',
    description:'Water attractions, family fun and a full day of movement.',
    image:'https://grsfantasypark.com/wp-content/uploads/2023/11/fantasy-park-mysore-rides-10.jpg',
    accent:'#3155e7'
  },
  {
    id:'snow-park',
    name:'Snow Park',
    category:'Snow & Ice',
    description:'A cool indoor escape for snow, ice and playful moments.',
    image:'https://grsfantasypark.com/wp-content/uploads/elementor/thumbs/GRS-Snow-Park-jpg-ql74xrky2a36ka14r5gjyj78udjr68sil1kqxwjkro.webp',
    accent:'#6b73ff'
  },
  {
    id:'updown',
    name:'UpDown',
    category:'Adventure',
    description:'An upside-down world of immersive exhibits and photo moments.',
    image:'https://grsfantasypark.com/wp-content/uploads/2023/11/updown-mansion-mysore-inverted-exhibits-6-min.jpg',
    accent:'#d65b9d'
  },
  {
    id:'selfie-factory',
    name:'Selfie Factory',
    category:'Create & Capture',
    description:'Make memories, capture moments and share the day.',
    image:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    accent:'#e2a83a'
  },
]

export const facilities = [
  ['Food Court','Food & Beverage','Refuel between experiences.'],
  ['Locker Room','Guest Facility','Keep your belongings secure while you explore.'],
  ['Medical Aid','Guest Support','A clearly visible support point for urgent assistance.'],
  ['Lost & Found','Guest Support','Report or recover items through the guest service workflow.'],
  ['Restrooms','Facility','Convenient guest facilities around the park.'],
  ['Parking','Arrival','Plan your arrival and keep your visit moving.'],
]
