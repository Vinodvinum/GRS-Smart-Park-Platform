# GRS Smart Park Platform — UI System

## Design Goal
Premium theme-park experience + modern operational SaaS.

Keywords:
premium, energetic, clean, trustworthy, family-friendly, modern, operationally clear.

## Guest
Visual discovery, fast navigation, mobile usability, clear booking, clear status, helpful guidance.

## Staff
Actionability, status visibility, search/filter, quick actions, alerts, readable density.

## Management
KPI clarity, trends, exceptions, recommendations, drill-down.

## Core Components
Button, Input, Select, DatePicker, Dialog, Drawer, Tabs, Card, Badge, Table, Timeline, Stat, Alert, Toast, EmptyState, Skeleton, QRPass, StatusPill.

## Rules
- Restrained accent palette.
- Consistent status colors.
- Intentional imagery.
- Whitespace over decoration.
- Motion for feedback, not decoration.
- Accessible contrast.
- Comfortable mobile touch targets.

## Dialog / modal pattern (accessibility)
When showing an overlay (e.g., the operations QR dialog), follow the WAI-ARIA dialog pattern:
- `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the dialog title.
- Close button gets `aria-label="Close"`; labelled inputs use `htmlFor`/`id`; live result areas use `role="status"`.
- Move focus into the dialog on open; close on Escape; restore focus to the trigger button on close.
- Support close on backdrop click.

This applies to the current plain-CSS `.modalBack`/`.modal` overlay. A shared `Dialog` primitive may be introduced if/when more dialogs appear; no dialog library is used today.

## Avoid
Generic SaaS template, excessive cards, neon overload, decorative animations, excessive gradients, fake 3D.
