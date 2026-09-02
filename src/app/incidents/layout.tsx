import { requireRole } from '@/lib/auth-helpers'
import { STAFF_ROLES } from '@/lib/rbac'

export default async function IncidentsLayout({ children }: { children: React.ReactNode }) {
  await requireRole(STAFF_ROLES)
  return <>{children}</>
}