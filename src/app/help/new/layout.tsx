import { requireUser } from '@/lib/auth-helpers'

export default async function NewHelpLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return <>{children}</>
}