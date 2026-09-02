# ZIP 06 — Operations Platform

## Operational surfaces
- KPI overview
- Attraction capacity
- Queue status
- Service request queue
- Assignment
- QR validation
- Fast actions
- MIS integration boundary

## Operational principles
1. Staff should understand park state within seconds.
2. High-priority work must be visually obvious.
3. Actions must be short and reversible where possible.
4. Security belongs on the server; UI visibility is not authorization.
5. Demo integrations must be clearly separated from real integrations.

## Production next steps
- authenticated staff session
- role/permission enforcement
- persistent request repository
- persistent attraction/zone data
- signed/opaque QR validation against database
- audit log for validation and assignment
- concurrency-safe capacity updates
- notification/SLA workflow
