# ZIP 05 — Guest Services

## Guest flow

Help → Category → Location → Description → Submit → Request Code → My Visit → Status/Timeline → Feedback

## Categories
- Lost & Found
- Medical Assistance
- Locker Issue
- Ride Issue
- Food Complaint
- General Help

## Status lifecycle
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED

Cancellation is an explicit terminal path where permitted.

## Priority
LOW / MEDIUM / HIGH / CRITICAL.

Medical assistance is treated as high priority in the demo. Real prioritization rules must come from GRS operational requirements.

## API
- GET `/api/service-requests`
- POST `/api/service-requests`
- GET `/api/service-requests/[id]`
- POST `/api/feedback`

## Production requirements for later
- authenticated requester
- authorization/resource ownership
- persistent database repository
- staff assignment
- notifications
- audit log
- SLA rules
- attachment policy
- abuse/rate limiting
