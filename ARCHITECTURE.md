# GRS Smart Park Platform — Architecture

## Product
A production-oriented full-stack guest experience + park operations platform. The existing GRS Smart MIS Dashboard remains the analytics/intelligence layer.

```text
GRS SMART PARK PLATFORM
├── Guest Experience
│   ├── Discover / Experiences
│   ├── Plan My Visit
│   ├── Booking
│   ├── Digital QR Pass
│   ├── Park Guide / Facilities
│   ├── Live Queue
│   ├── Offers
│   ├── My Visit
│   ├── Help / Service Requests
│   └── Feedback
├── Operations
│   ├── Operations Dashboard
│   ├── Bookings / QR Validation
│   ├── Zones / Attractions
│   ├── Queue / Capacity
│   ├── Incidents
│   ├── Guest Requests
│   └── Staff Assignment
├── Management
│   ├── KPIs
│   ├── Reports
│   └── Analytics
└── Intelligence
    └── Existing GRS Smart MIS Dashboard
        ├── Revenue
        ├── Visitors
        ├── Forecasting
        ├── Anomalies
        ├── Segmentation
        ├── Churn
        ├── CLV
        └── A/B Testing
```

## Architecture style
Use a **modular monolith** first. One Next.js deployable application with strict domain modules. Do not start with microservices.

## Stack
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- shadcn/ui + Lucide
- PostgreSQL
- Prisma ORM
- Auth.js or equivalent secure session architecture
- Zod validation
- Next.js Server Actions for suitable mutations
- Route Handlers for API/integration boundaries
- Vercel + managed PostgreSQL
- Python/Streamlit/scikit-learn for the existing intelligence layer

## Suggested structure
```text
src/
├── app/
│   ├── (guest)/
│   ├── (staff)/
│   ├── (admin)/
│   └── api/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── experiences/
│   ├── attractions/
│   ├── bookings/
│   ├── passes/
│   ├── queues/
│   ├── requests/
│   ├── incidents/
│   ├── staff/
│   ├── offers/
│   ├── feedback/
│   ├── notifications/
│   ├── analytics/
│   └── admin/
├── components/
│   ├── ui/
│   ├── guest/
│   ├── operations/
│   └── management/
├── db/
└── lib/
prisma/
├── schema.prisma
└── seed.ts
tests/
├── unit/
├── integration/
└── e2e/
```

## Domain entities
User, Role, Experience, Zone, Attraction, Facility, Offer, Booking, BookingItem, Ticket, DigitalPass, Payment, ServiceRequest, ServiceRequestEvent, Incident, IncidentEvent, QueueSnapshot, StaffAssignment, Feedback, Notification, AuditLog.

## Core relationships
```text
User → Bookings / ServiceRequests / Feedback / Notifications
Experience → Zones / BookingItems
Zone → Attractions / QueueSnapshots / Incidents / ServiceRequests
Booking → BookingItems / Tickets / Payment / DigitalPass
```

## Booking lifecycle
```text
DRAFT → PENDING → CONFIRMED → CHECKED_IN → COMPLETED
PENDING → FAILED
CONFIRMED → CANCELLED
CONFIRMED → REFUND_PENDING → REFUNDED
```
Payment state remains separate from booking state.

## QR lifecycle
```text
Confirmed Booking
→ Ticket/Pass ID
→ Signed QR payload
→ Digital Pass
→ Staff Scan
→ Server validation
→ Allow/Reject
→ Audit event
```
Do not put sensitive PII into QR payloads.

## Guest request lifecycle
```text
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
```
Every transition creates an event/audit record.

Categories: Lost & Found, Medical Assistance, Locker Issue, Ride Issue, Food Complaint, Cleaning, General Help.

## Incident lifecycle
```text
REPORTED → ACKNOWLEDGED → ASSIGNED → INVESTIGATING → RESOLVED
```
Severity: LOW / MEDIUM / HIGH / CRITICAL.

## Queue architecture
```text
Operational data
→ Queue service
→ Current queue + prediction adapter
→ Guest UI / Staff UI / MIS
```
The existing Python queue model is an intelligence component. The platform uses an adapter/API contract rather than coupling the UI to Streamlit internals.

## Analytics integration
```text
Next.js Platform
→ PostgreSQL
→ Analytics contract
→ Python / ML
→ MIS Dashboard
```

## API principles
Domain boundaries:
`/api/auth/*`, `/api/experiences/*`, `/api/attractions/*`, `/api/bookings/*`, `/api/tickets/*`, `/api/passes/*`, `/api/queues/*`, `/api/service-requests/*`, `/api/incidents/*`, `/api/feedback/*`, `/api/admin/*`, `/api/health`.

Rules: validate input, authenticate protected routes, authorize every mutation, consistent errors, safe logging, idempotency for critical operations.

## Roles
Minimum: GUEST, STAFF, SUPERVISOR, ADMIN. Future permissions can include OPERATIONS, CUSTOMER_SERVICE, TICKETING, MARKETING, MANAGER, FINANCE.

Authorization is always server-side.

## UI architecture
Three UX modes:
- Guest: visual, simple, mobile-first, premium.
- Staff: fast, dense-but-readable, operational, action-focused.
- Management: KPI/exception/decision focused.

## Visual direction
**Premium resort + modern SaaS + theme-park energy.**
Use strong typography, high-quality imagery, generous spacing, restrained gradients, subtle glass, soft shadows, consistent radius, accessible status colors and purposeful micro-interactions.

Avoid generic SaaS-template appearance, excessive gradients, neon overload, unnecessary animation and card overload.

## Security baseline
Secure sessions, vetted password hashing, server-side RBAC, resource ownership checks, Zod validation, ORM parameterization, secure cookies, environment secrets, audit logs, rate limiting for sensitive actions, no PII in QR/logs, explicit demo-data labeling.

## Reliability
Loading/empty/error states, database transactions, idempotent critical mutations, health endpoint, structured logs, audit events, graceful analytics degradation.

## Testing
Unit + integration + E2E + browser verification.

Critical E2E:
Register → Login → Browse → Plan → Book → Confirm → QR Pass → Staff Validate → Guest Request → Staff Assign → Resolve → Feedback.

## Non-goals for first release
No real GRS internal integration, real payment gateway, real access-control integration, WhatsApp/SMS production integration, microservices, native mobile app, ERP/accounting/payroll.

## Definition of Done
A feature is complete only when:
**UI + domain logic + database + validation + authorization + error handling + tests + browser verification + documentation** all pass.

## Product principle
Guest: “How can I have a better visit?”
Staff: “What needs attention right now?”
Management: “What is happening, why, and what should we do?”


## Data architecture — ZIP 03

```text
Next.js Route Handlers
        ↓
Repository / domain boundary
        ↓
Prisma Client
        ↓
PostgreSQL
```

The UI must not access Prisma directly. Route handlers call repository/domain functions. Future write operations must use explicit transactions where multiple records must remain consistent.

### Core entities
User, Experience, Attraction, Facility, Offer, Booking, ServiceRequest, Zone, QueueSnapshot, Incident, Feedback, AuditLog.
