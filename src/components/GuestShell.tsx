import { GuestNav } from '@/components/GuestNav'
import { DemoBanner } from '@/components/DemoBanner'

export function GuestShell({ children }: { children: React.ReactNode }) {
  return <><DemoBanner /><GuestNav />{children}</>
}
