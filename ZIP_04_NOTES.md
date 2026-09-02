# ZIP 04 NOTES

ZIP 04 implements the booking and digital-pass vertical slice.

Flow:
1. Guest opens `/booking`.
2. Experiences are loaded from `/api/experiences`.
3. Guest chooses date and party size.
4. Guest reviews the order.
5. POST `/api/bookings` creates Booking + Ticket records + DigitalPass in one transaction.
6. The raw opaque pass token is returned only to the browser and its SHA-256 hash is persisted.
7. `/pass` renders a real QR code from the opaque token.
8. `/api/passes/validate` validates the token against the database.

Pricing and availability are portfolio rules only. Do not present them as official GRS pricing or inventory.
