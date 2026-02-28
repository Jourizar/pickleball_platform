# Nell Pickleball Club — Full-Stack Web App Design

**Date:** 2026-02-28
**Status:** Approved

---

## 1. Project Overview

A full-stack web application for **Nell Pickleball Club**, a pickleball club based in the Dominican Republic. The site serves two audiences:

1. **New visitors** — needs to educate about pickleball and convert to members
2. **Existing members** — needs to manage reservations, tournaments, and account

**Primary audience uses phones.** All design decisions are mobile-first.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| Storage | Supabase Storage (media uploads) |
| i18n | next-intl |
| Rich text editor | Tiptap v2 (WYSIWYG) |
| Payments | Stripe Checkout (hosted) |
| AI Help Bot | Anthropic API (`claude-haiku-4-5`) |
| Drag-to-reorder | @dnd-kit/sortable |
| Deployment | Vercel |

---

## 3. Architecture: Integrated App Router Monorepo

Single Next.js 14 codebase. Supabase JS called directly inside Server Components — no separate API layer. Admin co-located at `/[locale]/admin/*`.

### Folder Structure

```
/app
  /[locale]
    /(public)
      /page.tsx              → Home (/)
      /about/page.tsx        → About (/about)
      /guide/page.tsx        → Pickleball Guide (/guide)
    /(auth)
      /login/page.tsx
      /signup/page.tsx
      /account/page.tsx
    /(protected)
      /reservations/page.tsx → requires auth
    /admin
      /page.tsx              → Admin dashboard
      /content/page.tsx      → CMS editor
      /faqs/page.tsx         → FAQ manager
      /plans/page.tsx        → Membership plan manager
      /courts/page.tsx       → Court + time slot manager
      /tournaments/page.tsx  → Tournament manager
      /settings/page.tsx     → WhatsApp, webhook settings
  /api
    /chat/route.ts           → Help Bot (Anthropic streaming)
    /stripe
      /checkout/route.ts     → Create Stripe Checkout session
      /webhook/route.ts      → Stripe webhook handler
/components
  /ui                        → Button, Card, Skeleton, Input, Modal, etc.
  /membership                → MembershipCard, MembershipCardSkeleton
  /admin                     → AdminSidebar, TiptapEditor, DragSortList
  /layout                    → Header, Footer, BottomNav, WhatsAppButton, HelpBot
/lib
  /supabase
    /server.ts               → createServerClient (Server Components)
    /client.ts               → createBrowserClient (Client Components)
    /types.ts                → generated Supabase types
  /stripe
    /server.ts               → Stripe server client
  /i18n
    /config.ts               → next-intl config
    /request.ts              → getRequestConfig
/messages
  /es.json                   → Spanish translations
  /en.json                   → English translations
/middleware.ts               → i18n routing + auth protection
/supabase
  /migrations
    /001_initial.sql
  /seed.ts
/public
  /images                    → placeholder assets
/docs
  /plans                     → design documents
```

---

## 4. i18n & Routing

- **Default locale:** `es` (Spanish)
- **Secondary locale:** `en` (English)
- **Route prefix strategy:** Always prefix — `/es/about`, `/en/about`
- Root `/` redirects to `/es` via `middleware.ts`
- Language switcher in site header (globe icon, two options)
- Admin panel strings also translated
- `lang="es"` or `lang="en"` on `<html>` element

---

## 5. Authentication & Authorization

### Auth Provider
Supabase Auth — email + password.

### Flows
- **Signup** at `/[locale]/signup` → creates Supabase Auth user → DB trigger creates `profiles` row with `role = 'member'`
- **Login** at `/[locale]/login` → redirects to `/[locale]/account`
- **Password reset** via Supabase built-in email flow
- **Session** via cookies using `@supabase/ssr` — `createServerClient` in Server Components, `createBrowserClient` in Client Components

### Route Protection (middleware.ts)
- `/[locale]/(protected)/*` — redirect to `/[locale]/login` if no session
- `/[locale]/admin/*` — redirect to `/[locale]/` if no session OR if `profiles.role !== 'admin'`

### Admin Role
- Stored in `profiles.role` (values: `'member'` | `'admin'`)
- Admin check done server-side (read profile in Server Component or middleware)
- First admin must be set manually in Supabase dashboard

---

## 6. Database Schema

### Tables

```sql
-- User profiles (created by trigger on auth.users INSERT)
CREATE TABLE profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name           text,
  phone               text,
  membership_type     text,            -- e.g. 'adult', 'family', 'mini'
  role                text DEFAULT 'member', -- 'member' | 'admin'
  stripe_customer_id  text,
  subscription_status text DEFAULT 'inactive', -- 'active' | 'inactive' | 'canceled'
  subscription_id     text,
  locale              text DEFAULT 'es',
  created_at          timestamptz DEFAULT now()
);

-- Membership plans (admin-managed)
CREATE TABLE membership_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  age_range        text,
  price            numeric NOT NULL,
  benefits         jsonb DEFAULT '[]',
  thumbnail_url    text,
  badge_color      text,
  cta_label        text DEFAULT 'Suscribirse',
  is_active        boolean DEFAULT true,
  display_order    integer DEFAULT 0,
  stripe_price_id  text,
  stripe_product_id text,
  created_at       timestamptz DEFAULT now()
);

-- Courts
CREATE TABLE courts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  photo_url   text,
  is_active   boolean DEFAULT true
);

-- Time slots
CREATE TABLE time_slots (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id       uuid REFERENCES courts(id) ON DELETE CASCADE,
  date           date NOT NULL,
  start_time     time NOT NULL,
  end_time       time NOT NULL,
  max_capacity   integer DEFAULT 4,
  price_override numeric,
  currency       text DEFAULT 'DOP',
  is_blocked     boolean DEFAULT false
);

-- Reservations
CREATE TABLE reservations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  time_slot_id uuid REFERENCES time_slots(id) ON DELETE CASCADE,
  status       text DEFAULT 'confirmed', -- 'confirmed' | 'canceled'
  created_at   timestamptz DEFAULT now()
);

-- Tournaments
CREATE TABLE tournaments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  date             date,
  description      text,
  max_participants integer,
  entry_fee        numeric DEFAULT 0,
  currency         text DEFAULT 'DOP',
  is_open          boolean DEFAULT true
);

-- Tournament registrations
CREATE TABLE tournament_registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  UNIQUE (user_id, tournament_id)
);

-- FAQs (admin-managed)
CREATE TABLE faqs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question      text NOT NULL,
  answer        text NOT NULL,
  display_order integer DEFAULT 0,
  is_visible    boolean DEFAULT true
);

-- Site content (key-value CMS)
-- page: 'home' | 'about' | 'guide'
-- section: e.g. 'hero', 'mission', 'values', 'story', 'guide_body'
-- key: e.g. 'title', 'subtitle', 'body', 'video_url', 'is_visible'
CREATE TABLE site_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page       text NOT NULL,
  section    text NOT NULL,
  key        text NOT NULL,
  value      text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (page, section, key)
);

-- Site settings (WhatsApp, webhook, etc.)
CREATE TABLE site_settings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  value      text,
  updated_at timestamptz DEFAULT now()
);
-- Keys: 'whatsapp_number', 'whatsapp_enabled', 'zapier_webhook_url', 'stripe_enabled'
```

### RLS Policies

```sql
-- profiles: own row + admin read-all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Public read for plans, courts, time_slots, tournaments, faqs, site_content, site_settings
-- Admin write for same tables
-- reservations, tournament_registrations: own rows only + admin read-all
```

### Supabase Trigger
```sql
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Supabase Webhook
- Trigger: `profiles` table INSERT + UPDATE events
- Destination: `site_settings.value` where `key = 'zapier_webhook_url'`
- Payload includes: `id`, `user_id`, `full_name`, `membership_type`, `subscription_status`, `created_at`
- README documents Make.com → Google Sheets setup

---

## 7. Pages & Features

### Home (`/[locale]`)
- Hero: full-width image/video, club name, tagline, CTA buttons (Join / Learn More)
- Membership section: MembershipCard grid (snap-scroll on mobile)
- Mission/Vision/Values: fetched from `site_content`
- WhatsApp CTA inline section

### About (`/[locale]/about`)
- Club story (Tiptap HTML from `site_content`)
- Team/staff grid: photo, name, bio (from dedicated staff table or `site_content`)
- Gallery: image grid + embedded video from `site_content`

### Guide (`/[locale]/guide`)
- Rich text body from `site_content` (rendered as HTML)
- Embedded YouTube videos
- FAQ accordion (from `faqs` table, filtered `is_visible = true`)
- WhatsApp CTA at bottom

### Reservations (`/[locale]/reservations`) — auth required
- Date picker → shows available courts for that date
- Select time slot → confirm reservation
- "My Reservations" tab: list with cancel button (status → 'canceled')
- Tournament signup section

### Auth Pages
- `/signup`, `/login` — Supabase Auth UI or custom forms
- `/account` — profile, subscription status, membership badge, Stripe portal link

### Admin Panel (`/[locale]/admin/*`)
- Route group protected by middleware (admin role check)
- Sidebar with 6 sections: Content, FAQs, Plans, Courts, Tournaments, Settings
- Collapsible on mobile

---

## 8. Component Architecture

### MembershipCard
```ts
interface MembershipCardProps {
  name: string;
  age_range: string;
  price: number;
  benefits: string[];
  thumbnail_url: string;
  badge_color: string; // Tailwind color name or hex
  cta_label: string;
  stripe_price_id: string;
  is_active: boolean;
}
```
- Responsive grid: mobile snap-scroll row → 2-col tablet → 3-col desktop
- Skeleton: animated pulse placeholder matching card dimensions

### TiptapEditor (admin only)
- Toolbar: Bold, Italic, H1, H2, H3, Bullet List, Ordered List, Link, YouTube embed
- Auto-saves to `site_content` on blur (debounced 500ms)
- Used in: guide body, about story, hero text sections

### DragSortList (@dnd-kit/sortable)
- Used for: FAQ reordering, membership plan reordering
- On drag end: updates `display_order` for all items in batch

### HelpBot
- Floating button (bottom-right, above WhatsApp button)
- Opens as drawer on mobile, popover on desktop
- Streams responses from `/api/chat`
- In-memory message history (React state)
- Typing indicator (animated dots)
- Shows WhatsApp link when bot is uncertain

### Global floating buttons (z-index stacking)
```
z-50: WhatsApp button (bottom: 1.5rem, right: 1.5rem)
z-51: HelpBot button (bottom: 5.5rem, right: 1.5rem)
```

---

## 9. Stripe Integration

### Checkout Flow
1. User clicks "Subscribe" on MembershipCard
2. If not logged in → redirect to `/[locale]/login?redirect=/[locale]/#membership`
3. POST `/api/stripe/checkout` with `{ price_id, locale }`
4. Server creates Checkout Session: mode `subscription`, success/cancel URLs
5. Client redirects to Stripe-hosted page
6. Stripe fires `checkout.session.completed` → `/api/stripe/webhook`
7. Webhook updates `profiles`: `subscription_status = 'active'`, `membership_type`, `stripe_customer_id`, `subscription_id`

### Webhook Events Handled
- `checkout.session.completed` — activate subscription
- `customer.subscription.updated` — sync status changes
- `customer.subscription.deleted` — deactivate subscription

### Admin Setup
- Admin manually creates Stripe Products and Prices, pastes `stripe_price_id` into the Membership Plan Manager
- No Stripe API write calls from admin panel

---

## 10. Help Bot (`/api/chat`)

### System Prompt Template (injected at runtime)
```
Eres el asistente virtual del Nell Pickleball Club en República Dominicana.
Responde SIEMPRE en el idioma del usuario (español o inglés).

INFORMACIÓN DEL CLUB:
[FAQs from DB injected here]

PLANES DE MEMBRESÍA:
[Membership plans from DB injected here]

Si no sabes la respuesta, di: "Para más información, contáctanos directamente por WhatsApp" y muestra el enlace.
```

### API Route
- `POST /api/chat` — accepts `{ messages: Message[], locale: string }`
- Fetches FAQs + plans from Supabase at request time
- Streams response using Anthropic SDK
- Rate limit: 20 requests per IP per minute (via simple in-memory counter or Upstash)

---

## 11. Mobile-First Design Rules

- Base styles: 375px viewport
- Tap targets: minimum 48×48px
- Bottom navigation bar: fixed, mobile-only — Home, Guide, Reservations, Account
- Sticky header: hamburger menu on mobile (< 768px)
- Forms: large inputs (min height 48px), min 16px font
- Membership cards: horizontal snap-scroll on mobile (`scroll-snap-type: x mandatory`)
- Font sizes: min 16px body, 14px labels
- No hover-only interactions

---

## 12. SEO

- `next-intl` sets `lang` attribute on `<html>` per locale
- Each page exports `generateMetadata()` with title, description, OG tags
- Spanish content is primary; English is secondary
- `/sitemap.xml` — Next.js `app/sitemap.ts` dynamic sitemap
- `/robots.txt` — Next.js `app/robots.ts`
- Semantic HTML: `<main>`, `<nav>`, `<article>`, `<section>`, proper heading hierarchy (one `<h1>` per page)

---

## 13. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 14. Build Order

1. **Project scaffold** — Next.js 14 + Tailwind + TypeScript + next-intl + Supabase setup + DB migration
2. **Home page + MembershipCard** — static data first, responsive grid + snap scroll
3. **Guide page + FAQ section** — static content, accordion component
4. **Auth** — signup/login/account with Supabase Auth
5. **Connect MembershipCards + FAQs to DB** — Server Components fetching from Supabase
6. **Admin panel** — sidebar layout, Content/FAQ/Plan managers, Tiptap editor, drag-sort
7. **Court availability + Reservations page** — date picker, time slots, reservation CRUD
8. **Tournament manager + registration** — admin CRUD + user signup on reservations page
9. **Stripe integration** — Checkout session + webhook + account portal link
10. **Help Bot** — `/api/chat` route + HelpBot component + streaming
11. **WhatsApp button + settings** — floating button, admin settings page
12. **Mobile polish** — bottom nav, snap scroll audit, tap targets, 375px testing
13. **SEO** — metadata, sitemap, robots.txt, OG tags

---

## 15. Deliverables

1. Full SQL migration file (`supabase/migrations/001_initial.sql`)
2. Seed data script (`supabase/seed.ts`) with 5 membership plans, 8 FAQs, 1 court, sample site_content
3. `.env.local.example` with all required variables
4. `README.md` with:
   - Local development setup
   - Supabase project setup steps
   - How to set the first admin user
   - Stripe setup (create products, paste price IDs)
   - Supabase webhook → Make.com → Google Sheets setup guide

---

## 16. Make.com / Google Sheets Webhook Setup (README excerpt)

**Supabase → Make.com → Google Sheets**

1. In Make.com, create a new scenario
2. Add trigger: **Webhooks → Custom Webhook** → copy the webhook URL
3. In Supabase dashboard → Database → Webhooks → Create new webhook:
   - Table: `profiles`
   - Events: INSERT, UPDATE
   - HTTP method: POST
   - URL: paste Make.com webhook URL
4. In Make.com, add a **Google Sheets → Add/Update Row** module:
   - On INSERT: append new row with columns: `user_id`, `full_name`, `membership_type`, `subscription_status`, `created_at`
   - On UPDATE: use "Update Row" with `user_id` as lookup key to sync status changes
5. Store the Make.com webhook URL in Supabase: `site_settings` table, `key = 'zapier_webhook_url'`
