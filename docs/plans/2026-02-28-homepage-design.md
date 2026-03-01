# Home Page Design — Nell Pickleball Club

**Date:** 2026-02-28
**Status:** Approved
**Approach:** Static-first (placeholder content, no Supabase required)

---

## Sections

### 1. Header/Nav
- Sticky top bar
- Logo left, desktop nav: Home · About · Guide · Reservations
- Language switcher (ES/EN globe icon), Sign In button
- Mobile: hamburger → slide-over drawer

### 2. Hero
- Full-width green gradient + pickleball court photo overlay
- `<h1>` club name, tagline subtitle
- Two CTAs: "Join Now" → `/[locale]/signup`, "Learn More" → `/[locale]/about`
- Centered on mobile, left-aligned on desktop

### 3. Membership Cards
- Three cards: Mini, Individual, Familiar
- Each: badge color, age range, RD$ price, 3–4 benefit bullets, Subscribe CTA → `/[locale]/signup`
- Mobile: horizontal snap-scroll row
- Tablet+: 3-column grid

### 4. Mission / Vision
- Two-column: Mission left, Vision right
- Stacked on mobile

### 5. WhatsApp CTA Banner
- Green background, WhatsApp icon, text, button → `https://wa.me/<placeholder>`

### 6. Footer
- Dark background, club name, nav links, copyright

---

## Files to Create/Modify

- `app/[locale]/page.tsx` — home page (replace boilerplate)
- `components/layout/Header.tsx` — sticky nav with mobile drawer
- `components/layout/Footer.tsx` — dark footer
- `components/membership/MembershipCard.tsx` — reusable card
- `app/[locale]/layout.tsx` — add Header + Footer wrapping children
