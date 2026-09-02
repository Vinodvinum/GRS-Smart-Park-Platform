import { requireUser } from '@/lib/auth-helpers'

export default async function PassLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return <>{children}</>
}