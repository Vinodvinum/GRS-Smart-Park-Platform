# ZIP 03 — Database + Domain Foundation

## Goal
Move the approved UI/product foundation toward a real full-stack architecture by establishing the transactional data model, local PostgreSQL development environment, seed data, repositories, and read APIs.

## Added
- PostgreSQL Docker Compose environment
- Expanded Prisma schema
- Domain models for users, experiences, attractions, facilities, offers, bookings, service requests, zones, queues, incidents, feedback and audit logs
- Seed script with safe demo data
- Repository layer for experiences and offers
- Read APIs for experiences, individual experience, offers and database status
- Typecheck/lint/build scripts
- Updated source-of-truth documents

## Deliberate limits
- No real GRS credentials or private integrations
- No payment processing
- No production authentication yet
- No booking mutation yet
- Demo data only
