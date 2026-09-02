# ZIP 02 — Guest Experience

This ZIP is built directly on ZIP 01.

## What is real
- Next.js routes and UI interactions.
- Responsive layouts.
- Catalogue/detail navigation.
- Planner state and demo itinerary generation.

## What is intentionally not real yet
- PostgreSQL persistence.
- Real ticket inventory.
- Real pricing/offer eligibility.
- Payment.
- Real QR validation.
- Private GRS integrations.
- GPS/map provider integration.

## Verification
Run:

```bash
npm install
npm run db:generate
npm run dev
```

Then visit `/`, `/experiences`, `/experiences/fantasy-park`, `/guide`, `/offers`, `/plan`, and `/operations`.
