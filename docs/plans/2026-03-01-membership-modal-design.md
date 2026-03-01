# Membership Plan Modal Design

**Date:** 2026-03-01
**Status:** Approved

## Goal
Allow users to click any membership card and read full plan details in a modal overlay, including a subscribe CTA.

## Architecture
- `MembershipSection` (Client Component) — owns `selectedPlan` state, renders card grid + modal
- `MembershipModal` (Client Component) — renders the overlay with full plan details
- `MembershipCard` — receives `onDetails` callback, adds "Ver detalles" secondary button
- `app/[locale]/page.tsx` — extends PLANS data, replaces inline grid with `<MembershipSection>`

## Extended Plan Data Fields
Each plan adds: `description`, `court_hours`, `classes_per_week`, `guests`, `tournaments`, `not_included[]`

## Modal Behaviour
- Full-screen backdrop (`backdrop-blur-sm`, dark overlay)
- Centered card max-w-lg, dark glass style
- Closes on: × button, Escape key, backdrop click
- Body scroll locked while open

## Modal Layout
1. Colored badge header (plan name + age range)
2. Price + description
3. "Lo que incluye" ✓ list
4. Quick-stats row (horario, invitados, torneos)
5. "No incluye" ✗ list (for lower tiers)
6. Sticky subscribe button → `/[locale]/signup`

## Files
- Create: `components/membership/MembershipSection.tsx`
- Create: `components/membership/MembershipModal.tsx`
- Modify: `components/membership/MembershipCard.tsx`
- Modify: `app/[locale]/page.tsx`
