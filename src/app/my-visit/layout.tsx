import { requireUser } from '@/lib/auth-helpers'

export default async function MyVisitLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return <>{children}</>
}