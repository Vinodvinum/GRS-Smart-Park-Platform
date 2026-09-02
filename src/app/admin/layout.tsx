import { requireRole } from '@/lib/auth-helpers'
import { ADMIN_ROLES } from '@/lib/rbac'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(ADMIN_ROLES)
  return <>{children}</>
}