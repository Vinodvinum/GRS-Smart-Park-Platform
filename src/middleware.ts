import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@prisma/client'
import { ADMIN_ROLES, STAFF_ROLES, ANY_AUTHENTICATED } from '@/lib/rbac'
import { checkRateLimit, rateLimitHeaders, AUTH_RATE_LIMIT, REGISTER_RATE_LIMIT } from '@/lib/rate-limit'

const AUTH_SECRET = process.env.AUTH_SECRET

const PUBLIC_PAGE_PREFIXES = [
  '/login',
  '/register',
  '/experiences',
  '/plan',
  '/guide',
  '/offers',
  '/help',
  '/unauthorized',
]
const GUEST_PAGE_PREFIXES = ['/booking', '/pass', '/my-visit', '/help/new']
const STAFF_PAGE_PREFIXES = ['/operations', '/staff', '/incidents', '/intelligence', '/readiness']
const ADMIN_PAGE_PREFIXES = ['/admin']

const PUBLIC_API_PREFIXES = ['/api/auth', '/api/health', '/api/ready', '/api/experiences', '/api/offers']
const GUEST_API_PREFIXES = [
  '/api/bookings',
  '/api/service-requests',
  '/api/feedback',
  '/api/passes/validate',
]
const STAFF_API_PREFIXES = [
  '/api/operations',
  '/api/staff',
  '/api/incidents',
  '/api/intelligence',
  '/api/db-status',
]
const ADMIN_API_PREFIXES = ['/api/admin']

type RouteClass = 'public' | 'guest' | 'staff' | 'admin' | 'unknown'

function matches(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`)
}

function classify(pathname: string, isApi: boolean): RouteClass {
  if (pathname === '/') return 'public'

  if (isApi) {
    if (GUEST_API_PREFIXES.some((p) => matches(pathname, p))) return 'guest'
    if (STAFF_API_PREFIXES.some((p) => matches(pathname, p))) return 'staff'
    if (ADMIN_API_PREFIXES.some((p) => matches(pathname, p))) return 'admin'
    if (PUBLIC_API_PREFIXES.some((p) => matches(pathname, p))) return 'public'
    return 'unknown'
  }

  if (GUEST_PAGE_PREFIXES.some((p) => matches(pathname, p))) return 'guest'
  if (STAFF_PAGE_PREFIXES.some((p) => matches(pathname, p))) return 'staff'
  if (ADMIN_PAGE_PREFIXES.some((p) => matches(pathname, p))) return 'admin'
  if (PUBLIC_PAGE_PREFIXES.some((p) => matches(pathname, p))) return 'public'
  return 'public'
}

function requiredRoles(pathname: string, isApi: boolean): readonly UserRole[] | null {
  const cls = classify(pathname, isApi)
  switch (cls) {
    case 'public':
    case 'unknown':
      return null
    case 'guest':
      return ANY_AUTHENTICATED
    case 'staff':
      return STAFF_ROLES
    case 'admin':
      return ADMIN_ROLES
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')

  if (isApi && pathname.startsWith('/api/auth/register') && request.method === 'POST') {
    const ip = getClientIp(request)
    const result = checkRateLimit(`register:${ip}`, REGISTER_RATE_LIMIT)
    if (!result.allowed) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'RATE_LIMITED', message: 'Too many registration attempts. Please try again later.', code: 'RATE_LIMITED' },
        { status: 429, headers: rateLimitHeaders(result) },
      ))
    }
  }

  if (isApi && pathname.startsWith('/api/auth/callback') && request.method === 'POST') {
    const ip = getClientIp(request)
    const result = checkRateLimit(`login:${ip}`, AUTH_RATE_LIMIT)
    if (!result.allowed) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'RATE_LIMITED', message: 'Too many login attempts. Please try again later.', code: 'RATE_LIMITED' },
        { status: 429, headers: rateLimitHeaders(result) },
      ))
    }
  }

  const required = requiredRoles(pathname, isApi)
  if (!required) {
    if (isApi) {
      return addSecurityHeaders(NextResponse.next())
    }
    return addSecurityHeaders(NextResponse.next())
  }

  const token = await getToken({ req: request, secret: AUTH_SECRET })
  const role = (token?.role as UserRole | undefined) ?? null
  const hasSession = Boolean(token?.sub)

  if (!hasSession) {
    if (isApi) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'You must be signed in to access this resource.', code: 'UNAUTHENTICATED' },
        { status: 401 },
      ))
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname + request.nextUrl.search)
    return addSecurityHeaders(NextResponse.redirect(loginUrl))
  }

  if (!role || !required.includes(role)) {
    if (isApi) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'FORBIDDEN', message: 'You do not have permission to access this resource.', code: 'FORBIDDEN' },
        { status: 403 },
      ))
    }
    return addSecurityHeaders(NextResponse.redirect(new URL('/unauthorized', request.url)))
  }

  return addSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
