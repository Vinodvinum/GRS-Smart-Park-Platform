# FINAL ARCHITECTURE

## High level

Guest / Staff / Admin
        ↓
Next.js + TypeScript
        ↓
API / Domain Services
        ↓
Prisma
        ↓
PostgreSQL
        ↓
Analytics Contract
        ↓
MIS / Intelligence
        ↓
Existing Python + Streamlit GRS Smart MIS

## Domain modules
- Guest Experience
- Visit Planner
- Booking
- Digital Pass
- Guest Services
- Operations
- Staff
- Incidents
- Admin
- Intelligence

## Security
Authentication → authorization → validation → business logic → repository → audit/observability.

UI is never the security boundary.

## Deployment concept
Web application → Vercel or equivalent
Database → managed PostgreSQL
MIS → existing Streamlit deployment / authorized production integration

Actual deployment provider and credentials must be configured in the target environment.
