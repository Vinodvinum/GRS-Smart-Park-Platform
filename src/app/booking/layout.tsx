import { requireUser } from '@/lib/auth-helpers'

export default async function BookingLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return <>{children}</>
}