# Nell Pickleball Club — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-stack bilingual (ES/EN) web app for Nell Pickleball Club with membership management, court reservations, admin CMS, Stripe payments, and an AI help bot.

**Architecture:** Single Next.js 14 App Router monorepo. Supabase JS called directly in Server Components. Admin co-located at `/[locale]/admin/*`. next-intl for `/es` (default) and `/en` locale prefixes.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (@supabase/ssr), next-intl, Tiptap v2, @dnd-kit/sortable, Stripe, Anthropic SDK (claude-haiku-4-5), Vercel

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `.env.local.example`
- Create: `.env.local`
- Create: `next.config.ts`

**Step 1: Scaffold Next.js app**

```bash
cd /Users/joseurizar/Desktop/dominican_pickleball
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint
```

Answer prompts: Yes to all defaults.

**Step 2: Install all dependencies**

```bash
npm install \
  next-intl@3 \
  @supabase/supabase-js \
  @supabase/ssr \
  @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-youtube \
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
  stripe @stripe/stripe-js \
  @anthropic-ai/sdk \
  lucide-react \
  clsx tailwind-merge \
  date-fns \
  react-hot-toast
```

Expected: all packages install without peer dependency errors.

**Step 3: Create `.env.local.example`**

```bash
cat > .env.local.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

**Step 4: Copy to `.env.local` and fill in values**

```bash
cp .env.local.example .env.local
```
Fill in real Supabase URL and keys from your Supabase dashboard (Settings → API).

**Step 5: Create `lib/utils.ts`**

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 6: Update `next.config.ts`**

```typescript
// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default withNextIntl(nextConfig)
```

**Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at http://localhost:3000, default Next.js page visible.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 app with all dependencies"
```

---

## Task 2: Supabase Database Migration

**Files:**
- Create: `supabase/migrations/001_initial.sql`
- Create: `supabase/migrations/002_rls.sql`
- Create: `supabase/seed.ts`

**Step 1: Create migration directory**

```bash
mkdir -p supabase/migrations
```

**Step 2: Create `supabase/migrations/001_initial.sql`**

```sql
-- supabase/migrations/001_initial.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- profiles
CREATE TABLE profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name           text,
  phone               text,
  membership_type     text,
  role                text NOT NULL DEFAULT 'member',
  stripe_customer_id  text,
  subscription_status text NOT NULL DEFAULT 'inactive',
  subscription_id     text,
  locale              text NOT NULL DEFAULT 'es',
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- membership_plans
CREATE TABLE membership_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  age_range         text,
  price             numeric NOT NULL,
  benefits          jsonb NOT NULL DEFAULT '[]',
  thumbnail_url     text,
  badge_color       text NOT NULL DEFAULT '#22c55e',
  cta_label         text NOT NULL DEFAULT 'Suscribirse',
  is_active         boolean NOT NULL DEFAULT true,
  display_order     integer NOT NULL DEFAULT 0,
  stripe_price_id   text,
  stripe_product_id text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- courts
CREATE TABLE courts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  photo_url   text,
  is_active   boolean NOT NULL DEFAULT true
);

-- time_slots
CREATE TABLE time_slots (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id       uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date           date NOT NULL,
  start_time     time NOT NULL,
  end_time       time NOT NULL,
  max_capacity   integer NOT NULL DEFAULT 4,
  price_override numeric,
  currency       text NOT NULL DEFAULT 'DOP',
  is_blocked     boolean NOT NULL DEFAULT false
);

-- reservations
CREATE TABLE reservations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  time_slot_id uuid NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'confirmed',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- tournaments
CREATE TABLE tournaments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  date             date,
  description      text,
  max_participants integer,
  entry_fee        numeric NOT NULL DEFAULT 0,
  currency         text NOT NULL DEFAULT 'DOP',
  is_open          boolean NOT NULL DEFAULT true
);

-- tournament_registrations
CREATE TABLE tournament_registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tournament_id)
);

-- faqs
CREATE TABLE faqs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question      text NOT NULL,
  answer        text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true
);

-- site_content (key-value CMS)
CREATE TABLE site_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page       text NOT NULL,
  section    text NOT NULL,
  key        text NOT NULL,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, section, key)
);

-- staff_members (for about page)
CREATE TABLE staff_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  role          text,
  bio           text,
  photo_url     text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true
);

-- gallery_images (for about page)
CREATE TABLE gallery_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url           text NOT NULL,
  alt           text,
  display_order integer NOT NULL DEFAULT 0
);

-- site_settings
CREATE TABLE site_settings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Step 3: Create `supabase/migrations/002_rls.sql`**

```sql
-- supabase/migrations/002_rls.sql

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (is_admin());

-- membership_plans: public read, admin write
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_read_all" ON membership_plans FOR SELECT USING (true);
CREATE POLICY "plans_write_admin" ON membership_plans FOR ALL USING (is_admin());

-- courts: public read, admin write
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courts_read_all" ON courts FOR SELECT USING (true);
CREATE POLICY "courts_write_admin" ON courts FOR ALL USING (is_admin());

-- time_slots: public read, admin write
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slots_read_all" ON time_slots FOR SELECT USING (true);
CREATE POLICY "slots_write_admin" ON time_slots FOR ALL USING (is_admin());

-- reservations: own rows + admin read all
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "res_select_own" ON reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "res_insert_own" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "res_update_own" ON reservations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "res_select_admin" ON reservations FOR SELECT USING (is_admin());
CREATE POLICY "res_update_admin" ON reservations FOR UPDATE USING (is_admin());

-- tournaments: public read, admin write
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournaments_read_all" ON tournaments FOR SELECT USING (true);
CREATE POLICY "tournaments_write_admin" ON tournaments FOR ALL USING (is_admin());

-- tournament_registrations: own rows + admin read all
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treg_select_own" ON tournament_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "treg_insert_own" ON tournament_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "treg_delete_own" ON tournament_registrations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "treg_select_admin" ON tournament_registrations FOR SELECT USING (is_admin());

-- faqs: public read, admin write
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_read_all" ON faqs FOR SELECT USING (true);
CREATE POLICY "faqs_write_admin" ON faqs FOR ALL USING (is_admin());

-- site_content: public read, admin write
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_read_all" ON site_content FOR SELECT USING (true);
CREATE POLICY "content_write_admin" ON site_content FOR ALL USING (is_admin());

-- staff_members: public read, admin write
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_read_all" ON staff_members FOR SELECT USING (true);
CREATE POLICY "staff_write_admin" ON staff_members FOR ALL USING (is_admin());

-- gallery_images: public read, admin write
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_read_all" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "gallery_write_admin" ON gallery_images FOR ALL USING (is_admin());

-- site_settings: public read, admin write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_read_all" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_write_admin" ON site_settings FOR ALL USING (is_admin());
```

**Step 4: Run migrations in Supabase dashboard**

Go to Supabase dashboard → SQL Editor. Paste and run `001_initial.sql`, then `002_rls.sql`.

Expected: All tables created with no errors. Check Database → Tables to confirm.

**Step 5: Create `supabase/seed.ts`**

```typescript
// supabase/seed.ts
// Run with: npx tsx supabase/seed.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  // Membership plans
  await supabase.from('membership_plans').upsert([
    { name: 'Mini Player', age_range: '5–12 años', price: 30, benefits: ['Acceso a canchas (fines de semana)', 'Clases grupales', 'Torneos juveniles'], badge_color: '#eab308', cta_label: 'Suscribirse', display_order: 1 },
    { name: 'Youth Player', age_range: '13–17 años', price: 50, benefits: ['Acceso a canchas (lun–dom)', 'Sesiones de coaching', 'Liga juvenil'], badge_color: '#22c55e', cta_label: 'Suscribirse', display_order: 2 },
    { name: 'Adult Member', age_range: '18–49 años', price: 50, benefits: ['Acceso completo a canchas', 'Juego abierto', 'Elegible para torneos'], badge_color: '#3b82f6', cta_label: 'Suscribirse', display_order: 3 },
    { name: 'Senior Player', age_range: '50+ años', price: 30, benefits: ['Acceso completo a canchas', 'Liga social sénior', 'Sesiones de bienestar'], badge_color: '#f97316', cta_label: 'Suscribirse', display_order: 4 },
    { name: 'Plan Familiar', age_range: 'Hasta 2 adultos + 2 niños', price: 120, benefits: ['Acceso para toda la familia', 'Reserva prioritaria de canchas', 'Torneos familiares'], badge_color: '#a855f7', cta_label: 'Suscribirse', display_order: 5 },
  ])

  // FAQs
  await supabase.from('faqs').upsert([
    { question: '¿Qué es el pickleball?', answer: 'El pickleball es un deporte de raqueta que combina elementos del tenis, el bádminton y el ping pong. Se juega en una cancha pequeña con paletas sólidas y una pelota de plástico con agujeros.', display_order: 1 },
    { question: '¿Necesito experiencia previa para unirme?', answer: 'No. El Nell Pickleball Club da la bienvenida a principiantes. Ofrecemos clases introductorias para todos los niveles.', display_order: 2 },
    { question: '¿Cuáles son los horarios del club?', answer: 'Estamos abiertos de lunes a viernes de 7:00 AM a 9:00 PM y los fines de semana de 7:00 AM a 8:00 PM.', display_order: 3 },
    { question: '¿Cómo reservo una cancha?', answer: 'Crea una cuenta, inicia sesión y ve a la página de Reservaciones. Selecciona la fecha, la cancha disponible y el horario que prefieras.', display_order: 4 },
    { question: '¿Qué equipamiento necesito?', answer: 'Solo necesitas ropa deportiva cómoda y zapatillas. El club tiene paletas y pelotas disponibles para préstamo para nuevos miembros.', display_order: 5 },
    { question: '¿Los precios están en pesos dominicanos?', answer: 'Sí, todos nuestros precios están en pesos dominicanos (RD$).', display_order: 6 },
    { question: '¿Puedo cancelar mi membresía?', answer: 'Sí, puedes cancelar tu membresía en cualquier momento desde tu página de cuenta. La cancelación se aplica al final del período de facturación actual.', display_order: 7 },
    { question: '¿Hay torneos para principiantes?', answer: 'Sí, organizamos torneos para todos los niveles, incluyendo categorías para principiantes y jugadores recreativos.', display_order: 8 },
  ])

  // Courts
  await supabase.from('courts').upsert([
    { name: 'Cancha 1', description: 'Cancha principal con iluminación LED para juego nocturno.', is_active: true },
  ])

  // Site settings
  await supabase.from('site_settings').upsert([
    { key: 'whatsapp_number', value: '18091234567' },
    { key: 'whatsapp_enabled', value: 'true' },
    { key: 'zapier_webhook_url', value: '' },
    { key: 'stripe_enabled', value: 'false' },
  ], { onConflict: 'key' })

  // Site content defaults
  await supabase.from('site_content').upsert([
    { page: 'home', section: 'hero', key: 'title', value: 'Bienvenido al Nell Pickleball Club' },
    { page: 'home', section: 'hero', key: 'subtitle', value: 'El primer club de pickleball de República Dominicana. Únete a nuestra comunidad y descubre el deporte que está conquistando el mundo.' },
    { page: 'home', section: 'hero', key: 'cta_primary', value: 'Únete Ahora' },
    { page: 'home', section: 'hero', key: 'cta_secondary', value: 'Aprende Más' },
    { page: 'home', section: 'mission', key: 'title', value: 'Nuestra Misión' },
    { page: 'home', section: 'mission', key: 'body', value: 'Promover el pickleball en República Dominicana creando una comunidad inclusiva y apasionada por este deporte.' },
    { page: 'home', section: 'vision', key: 'title', value: 'Nuestra Visión' },
    { page: 'home', section: 'vision', key: 'body', value: 'Ser el club de pickleball de referencia en el Caribe, formando campeones y conectando personas a través del deporte.' },
    { page: 'about', section: 'story', key: 'title', value: 'Nuestra Historia' },
    { page: 'about', section: 'story', key: 'body', value: '<p>El Nell Pickleball Club nació de la pasión por el deporte y el deseo de traer a República Dominicana uno de los deportes de más rápido crecimiento en el mundo.</p>' },
    { page: 'about', section: 'video', key: 'url', value: 'https://www.youtube.com/watch?v=V5TyLYMjQbA' },
    { page: 'guide', section: 'body', key: 'content', value: '<h2>¿Qué es el Pickleball?</h2><p>El pickleball es un deporte de raqueta que combina elementos del tenis, el bádminton y el ping pong...</p>' },
    { page: 'guide', section: 'video', key: 'url', value: 'https://www.youtube.com/watch?v=V5TyLYMjQbA' },
  ], { onConflict: 'page,section,key' })

  console.log('✅ Seed complete')
}

seed().catch(console.error)
```

**Step 6: Run seed script**

```bash
npx tsx supabase/seed.ts
```

Expected: `✅ Seed complete` printed. Verify data in Supabase Table Editor.

**Step 7: Commit**

```bash
git add supabase/
git commit -m "feat: add database migrations, RLS policies, and seed data"
```

---

## Task 3: Supabase Client + TypeScript Types

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/types.ts`

**Step 1: Create `lib/supabase/server.ts`**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
```

**Step 2: Create `lib/supabase/client.ts`**

```typescript
// lib/supabase/client.ts
'use client'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 3: Create `lib/supabase/types.ts`**

```typescript
// lib/supabase/types.ts
// Auto-generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
// For now, use manual types:

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; user_id: string; full_name: string | null; phone: string | null
          membership_type: string | null; role: string; stripe_customer_id: string | null
          subscription_status: string; subscription_id: string | null; locale: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { user_id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      membership_plans: {
        Row: {
          id: string; name: string; age_range: string | null; price: number
          benefits: string[]; thumbnail_url: string | null; badge_color: string
          cta_label: string; is_active: boolean; display_order: number
          stripe_price_id: string | null; stripe_product_id: string | null; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['membership_plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['membership_plans']['Row']>
      }
      courts: {
        Row: { id: string; name: string; description: string | null; photo_url: string | null; is_active: boolean }
        Insert: Omit<Database['public']['Tables']['courts']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['courts']['Row']>
      }
      time_slots: {
        Row: {
          id: string; court_id: string; date: string; start_time: string; end_time: string
          max_capacity: number; price_override: number | null; currency: string; is_blocked: boolean
        }
        Insert: Omit<Database['public']['Tables']['time_slots']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['time_slots']['Row']>
      }
      reservations: {
        Row: { id: string; user_id: string; time_slot_id: string; status: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['reservations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reservations']['Row']>
      }
      tournaments: {
        Row: { id: string; name: string; date: string | null; description: string | null; max_participants: number | null; entry_fee: number; currency: string; is_open: boolean }
        Insert: Omit<Database['public']['Tables']['tournaments']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['tournaments']['Row']>
      }
      tournament_registrations: {
        Row: { id: string; user_id: string; tournament_id: string; registered_at: string }
        Insert: Omit<Database['public']['Tables']['tournament_registrations']['Row'], 'id' | 'registered_at'>
        Update: Partial<Database['public']['Tables']['tournament_registrations']['Row']>
      }
      faqs: {
        Row: { id: string; question: string; answer: string; display_order: number; is_visible: boolean }
        Insert: Omit<Database['public']['Tables']['faqs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['faqs']['Row']>
      }
      site_content: {
        Row: { id: string; page: string; section: string; key: string; value: string | null; updated_at: string }
        Insert: Omit<Database['public']['Tables']['site_content']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['site_content']['Row']>
      }
      staff_members: {
        Row: { id: string; name: string; role: string | null; bio: string | null; photo_url: string | null; display_order: number; is_visible: boolean }
        Insert: Omit<Database['public']['Tables']['staff_members']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['staff_members']['Row']>
      }
      gallery_images: {
        Row: { id: string; url: string; alt: string | null; display_order: number }
        Insert: Omit<Database['public']['Tables']['gallery_images']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['gallery_images']['Row']>
      }
      site_settings: {
        Row: { id: string; key: string; value: string | null; updated_at: string }
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['site_settings']['Row']>
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
```

**Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase server/client helpers and TypeScript types"
```

---

## Task 4: next-intl Setup + Middleware

**Files:**
- Create: `lib/i18n/config.ts`
- Create: `lib/i18n/request.ts`
- Create: `messages/es.json`
- Create: `messages/en.json`
- Create: `middleware.ts`
- Modify: `app/layout.tsx` → delete (replaced in Task 5)

**Step 1: Create `lib/i18n/config.ts`**

```typescript
// lib/i18n/config.ts
export const locales = ['es', 'en'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'es'
```

**Step 2: Create `lib/i18n/request.ts`**

```typescript
// lib/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales, type Locale } from './config'

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locales.includes(locale as Locale) ? locale : defaultLocale
  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
  }
})
```

**Step 3: Create `messages/es.json`**

```json
{
  "nav": {
    "home": "Inicio",
    "about": "Nosotros",
    "guide": "Guía",
    "reservations": "Reservaciones",
    "account": "Mi Cuenta",
    "login": "Iniciar Sesión",
    "signup": "Registrarse",
    "logout": "Cerrar Sesión",
    "admin": "Administración"
  },
  "home": {
    "hero_title": "Bienvenido al Nell Pickleball Club",
    "hero_subtitle": "El primer club de pickleball de República Dominicana.",
    "cta_join": "Únete Ahora",
    "cta_learn": "Aprende Más",
    "membership_title": "Planes de Membresía",
    "membership_subtitle": "Elige el plan perfecto para ti",
    "mission_title": "Nuestra Misión",
    "vision_title": "Nuestra Visión",
    "whatsapp_cta": "¿Tienes preguntas? Contáctanos en WhatsApp"
  },
  "about": {
    "title": "Sobre Nosotros",
    "story_title": "Nuestra Historia",
    "team_title": "Nuestro Equipo"
  },
  "guide": {
    "title": "Guía de Pickleball",
    "subtitle": "Todo lo que necesitas saber para empezar",
    "faq_title": "Preguntas Frecuentes",
    "whatsapp_cta": "¿Aún tienes dudas? Escríbenos"
  },
  "reservations": {
    "title": "Reservaciones",
    "my_reservations": "Mis Reservaciones",
    "available_courts": "Canchas Disponibles",
    "select_date": "Selecciona una fecha",
    "reserve": "Reservar",
    "cancel": "Cancelar",
    "confirmed": "Confirmada",
    "canceled": "Cancelada",
    "tournaments_title": "Torneos",
    "register": "Inscribirse",
    "registered": "Inscrito"
  },
  "auth": {
    "email": "Correo electrónico",
    "password": "Contraseña",
    "full_name": "Nombre completo",
    "phone": "Teléfono",
    "login_title": "Iniciar Sesión",
    "signup_title": "Crear Cuenta",
    "no_account": "¿No tienes cuenta?",
    "have_account": "¿Ya tienes cuenta?",
    "forgot_password": "¿Olvidaste tu contraseña?",
    "loading": "Cargando..."
  },
  "account": {
    "title": "Mi Cuenta",
    "subscription": "Membresía",
    "status_active": "Activa",
    "status_inactive": "Inactiva",
    "manage_subscription": "Gestionar Suscripción",
    "edit_profile": "Editar Perfil",
    "save": "Guardar"
  },
  "admin": {
    "title": "Panel de Administración",
    "content": "Contenido",
    "faqs": "Preguntas Frecuentes",
    "plans": "Planes",
    "courts": "Canchas",
    "tournaments": "Torneos",
    "settings": "Configuración",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "add": "Agregar",
    "edit": "Editar",
    "preview": "Vista Previa"
  },
  "common": {
    "loading": "Cargando...",
    "error": "Ocurrió un error",
    "success": "Guardado correctamente",
    "confirm_delete": "¿Estás seguro de que deseas eliminar esto?",
    "per_month": "/mes",
    "currency": "RD$"
  },
  "helpbot": {
    "title": "Asistente",
    "placeholder": "Escribe tu pregunta...",
    "send": "Enviar",
    "whatsapp_fallback": "Para más ayuda, contáctanos por WhatsApp"
  }
}
```

**Step 4: Create `messages/en.json`**

```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "guide": "Guide",
    "reservations": "Reservations",
    "account": "My Account",
    "login": "Sign In",
    "signup": "Sign Up",
    "logout": "Sign Out",
    "admin": "Admin"
  },
  "home": {
    "hero_title": "Welcome to Nell Pickleball Club",
    "hero_subtitle": "The Dominican Republic's first pickleball club.",
    "cta_join": "Join Now",
    "cta_learn": "Learn More",
    "membership_title": "Membership Plans",
    "membership_subtitle": "Choose the perfect plan for you",
    "mission_title": "Our Mission",
    "vision_title": "Our Vision",
    "whatsapp_cta": "Have questions? Contact us on WhatsApp"
  },
  "about": {
    "title": "About Us",
    "story_title": "Our Story",
    "team_title": "Our Team"
  },
  "guide": {
    "title": "Pickleball Guide",
    "subtitle": "Everything you need to know to get started",
    "faq_title": "Frequently Asked Questions",
    "whatsapp_cta": "Still have questions? Message us"
  },
  "reservations": {
    "title": "Reservations",
    "my_reservations": "My Reservations",
    "available_courts": "Available Courts",
    "select_date": "Select a date",
    "reserve": "Reserve",
    "cancel": "Cancel",
    "confirmed": "Confirmed",
    "canceled": "Canceled",
    "tournaments_title": "Tournaments",
    "register": "Register",
    "registered": "Registered"
  },
  "auth": {
    "email": "Email address",
    "password": "Password",
    "full_name": "Full name",
    "phone": "Phone",
    "login_title": "Sign In",
    "signup_title": "Create Account",
    "no_account": "Don't have an account?",
    "have_account": "Already have an account?",
    "forgot_password": "Forgot your password?",
    "loading": "Loading..."
  },
  "account": {
    "title": "My Account",
    "subscription": "Membership",
    "status_active": "Active",
    "status_inactive": "Inactive",
    "manage_subscription": "Manage Subscription",
    "edit_profile": "Edit Profile",
    "save": "Save"
  },
  "admin": {
    "title": "Admin Panel",
    "content": "Content",
    "faqs": "FAQs",
    "plans": "Plans",
    "courts": "Courts",
    "tournaments": "Tournaments",
    "settings": "Settings",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "add": "Add",
    "edit": "Edit",
    "preview": "Preview"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Saved successfully",
    "confirm_delete": "Are you sure you want to delete this?",
    "per_month": "/month",
    "currency": "RD$"
  },
  "helpbot": {
    "title": "Assistant",
    "placeholder": "Type your question...",
    "send": "Send",
    "whatsapp_fallback": "For more help, contact us on WhatsApp"
  }
}
```

**Step 5: Create `middleware.ts`**

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale } from './lib/i18n/config'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Run next-intl middleware first
  const response = intlMiddleware(request)

  // Check auth for protected routes
  const isProtectedRoute = /^\/(es|en)\/(reservations|admin)/.test(pathname)
  const isAdminRoute = /^\/(es|en)\/admin/.test(pathname)

  if (isProtectedRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const locale = pathname.startsWith('/en') ? 'en' : 'es'

    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL(`/${locale}`, request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

**Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 7: Commit**

```bash
git add lib/i18n/ messages/ middleware.ts
git commit -m "feat: add next-intl i18n config and auth middleware"
```

---

## Task 5: App Layout + Root Structure

**Files:**
- Create: `app/layout.tsx` (root — minimal, no locale)
- Create: `app/[locale]/layout.tsx` (locale root layout)
- Create: `app/[locale]/(public)/layout.tsx`
- Create: `components/layout/Header.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `components/layout/BottomNav.tsx`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Skeleton.tsx`

**Step 1: Create `app/layout.tsx`**

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

**Step 2: Create `app/[locale]/layout.tsx`**

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as Locale)) notFound()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

**Step 3: Create `components/ui/Button.tsx`**

```typescript
// components/ui/Button.tsx
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]'
    const variants = {
      primary: 'bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-600',
      secondary: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 focus-visible:ring-yellow-400',
      outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus-visible:ring-green-600',
      ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600',
    }
    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[40px]',
      md: 'px-5 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="animate-spin mr-2">⏳</span> : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export { Button }
```

**Step 4: Create `components/ui/Skeleton.tsx`**

```typescript
// components/ui/Skeleton.tsx
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-gray-200', className)} />
  )
}
```

**Step 5: Create `components/layout/Header.tsx`**

```typescript
// components/layout/Header.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { Menu, X, Globe } from 'lucide-react'

export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/guide`, label: t('guide') },
    { href: `/${locale}/reservations`, label: t('reservations') },
  ]

  const otherLocale = locale === 'es' ? 'en' : 'es'
  // Replace locale prefix to switch language
  const switchPath = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="font-bold text-xl text-green-700 flex items-center gap-2">
          <span className="text-2xl">🏓</span>
          <span className="hidden sm:block">Nell Pickleball</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="text-gray-700 hover:text-green-700 font-medium transition-colors text-sm">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: language + auth */}
        <div className="flex items-center gap-3">
          <Link href={switchPath}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-700 min-h-[48px] px-2">
            <Globe size={16} />
            <span className="uppercase font-medium">{otherLocale}</span>
          </Link>
          <Link href={`/${locale}/login`}
            className="hidden md:inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 border-2 border-green-700 rounded-lg hover:bg-green-50 min-h-[48px]">
            {t('login')}
          </Link>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-3 min-h-[48px] min-w-[48px] flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-gray-700 font-medium text-base border-b border-gray-100 last:border-0">
              {link.label}
            </Link>
          ))}
          <Link href={`/${locale}/login`} onClick={() => setMenuOpen(false)}
            className="mt-2 py-3 text-green-700 font-semibold">
            {t('login')}
          </Link>
        </div>
      )}
    </header>
  )
}
```

**Step 6: Create `components/layout/Footer.tsx`**

```typescript
// components/layout/Footer.tsx
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

export function Footer() {
  const locale = useLocale()
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">🏓 Nell Pickleball Club</h3>
          <p className="text-sm">República Dominicana</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Navegación</h4>
          <ul className="space-y-2 text-sm">
            {[['/', 'Inicio'], ['/about', 'Nosotros'], ['/guide', 'Guía'], ['/reservations', 'Reservaciones']].map(([path, label]) => (
              <li key={path}><Link href={`/${locale}${path}`} className="hover:text-white">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contacto</h4>
          <p className="text-sm">¿Preguntas? Contáctanos por WhatsApp</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Nell Pickleball Club. Todos los derechos reservados.
      </div>
    </footer>
  )
}
```

**Step 7: Create `components/layout/BottomNav.tsx`**

```typescript
// components/layout/BottomNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Home, BookOpen, CalendarDays, User } from 'lucide-react'

export function BottomNav() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('nav')

  const items = [
    { href: `/${locale}`, icon: Home, label: t('home') },
    { href: `/${locale}/guide`, icon: BookOpen, label: t('guide') },
    { href: `/${locale}/reservations`, icon: CalendarDays, label: t('reservations') },
    { href: `/${locale}/account`, icon: User, label: t('account') },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] text-xs font-medium transition-colors ${active ? 'text-green-700' : 'text-gray-500'}`}>
            <Icon size={22} />
            <span className="mt-1">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

**Step 8: Create `app/[locale]/(public)/layout.tsx`**

```typescript
// app/[locale]/(public)/layout.tsx
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  )
}
```

**Step 9: Create placeholder globals.css**

Ensure `app/globals.css` has at minimum:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  @apply text-base text-gray-900;
  font-size: 16px;
}
```

**Step 10: Verify dev server renders without errors**

```bash
npm run dev
```

Visit http://localhost:3000 — should redirect to http://localhost:3000/es.

**Step 11: Commit**

```bash
git add app/ components/layout/ components/ui/ app/globals.css
git commit -m "feat: add locale layout, header, footer, bottom nav, and UI primitives"
```

---

## Task 6: Home Page (Static) + MembershipCard Component

**Files:**
- Create: `app/[locale]/(public)/page.tsx`
- Create: `components/membership/MembershipCard.tsx`
- Create: `components/membership/MembershipCardSkeleton.tsx`
- Create: `components/membership/MembershipGrid.tsx`

**Step 1: Create `components/membership/MembershipCard.tsx`**

```typescript
// components/membership/MembershipCard.tsx
import Image from 'next/image'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface MembershipCardProps {
  id: string
  name: string
  age_range: string
  price: number
  benefits: string[]
  thumbnail_url: string | null
  badge_color: string
  cta_label: string
  stripe_price_id: string | null
  is_active: boolean
}

export function MembershipCard({
  name, age_range, price, benefits, thumbnail_url, badge_color, cta_label, stripe_price_id, is_active
}: MembershipCardProps) {
  if (!is_active) return null

  return (
    <article className="flex-none w-72 md:w-auto snap-center bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
      {/* Badge + Image */}
      <div className="relative h-40 bg-gray-100">
        {thumbnail_url ? (
          <Image src={thumbnail_url} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🏓</div>
        )}
        <span
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold"
          style={{ backgroundColor: badge_color }}>
          {age_range}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
        <div className="text-3xl font-extrabold mb-4" style={{ color: badge_color }}>
          RD${price}<span className="text-base font-normal text-gray-500">/mes</span>
        </div>

        <ul className="space-y-2 mb-6 flex-1">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
              {benefit}
            </li>
          ))}
        </ul>

        <Button
          className="w-full"
          style={{ backgroundColor: badge_color, borderColor: badge_color }}
          disabled={!stripe_price_id}>
          {cta_label}
        </Button>
      </div>
    </article>
  )
}
```

**Step 2: Create `components/membership/MembershipCardSkeleton.tsx`**

```typescript
// components/membership/MembershipCardSkeleton.tsx
import { Skeleton } from '@/components/ui/Skeleton'

export function MembershipCardSkeleton() {
  return (
    <div className="flex-none w-72 md:w-auto snap-center bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    </div>
  )
}
```

**Step 3: Create `components/membership/MembershipGrid.tsx`**

```typescript
// components/membership/MembershipGrid.tsx
import { MembershipCard, type MembershipCardProps } from './MembershipCard'
import { MembershipCardSkeleton } from './MembershipCardSkeleton'

interface MembershipGridProps {
  plans: MembershipCardProps[]
  loading?: boolean
}

export function MembershipGrid({ plans, loading = false }: MembershipGridProps) {
  const items = loading
    ? Array.from({ length: 5 })
    : plans

  return (
    // Mobile: horizontal scroll; tablet+: grid
    <div className="
      flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory
      md:grid md:grid-cols-2 md:overflow-visible md:pb-0
      lg:grid-cols-3
      scrollbar-hide
    ">
      {loading
        ? items.map((_, i) => <MembershipCardSkeleton key={i} />)
        : plans.map(plan => <MembershipCard key={plan.id} {...plan} />)
      }
    </div>
  )
}
```

**Step 4: Create static home page `app/[locale]/(public)/page.tsx`**

```typescript
// app/[locale]/(public)/page.tsx
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/Button'
import { MembershipGrid } from '@/components/membership/MembershipGrid'
import Link from 'next/link'
import type { MembershipCardProps } from '@/components/membership/MembershipCard'

// Static placeholder plans (replaced with DB data in Task 10)
const STATIC_PLANS: MembershipCardProps[] = [
  { id: '1', name: 'Mini Player', age_range: '5–12 años', price: 30, benefits: ['Acceso a canchas (fines de semana)', 'Clases grupales', 'Torneos juveniles'], thumbnail_url: null, badge_color: '#eab308', cta_label: 'Suscribirse', stripe_price_id: null, is_active: true },
  { id: '2', name: 'Youth Player', age_range: '13–17 años', price: 50, benefits: ['Acceso a canchas (lun–dom)', 'Sesiones de coaching', 'Liga juvenil'], thumbnail_url: null, badge_color: '#22c55e', cta_label: 'Suscribirse', stripe_price_id: null, is_active: true },
  { id: '3', name: 'Adult Member', age_range: '18–49 años', price: 50, benefits: ['Acceso completo a canchas', 'Juego abierto', 'Elegible para torneos'], thumbnail_url: null, badge_color: '#3b82f6', cta_label: 'Suscribirse', stripe_price_id: null, is_active: true },
  { id: '4', name: 'Senior Player', age_range: '50+ años', price: 30, benefits: ['Acceso completo a canchas', 'Liga social sénior', 'Sesiones de bienestar'], thumbnail_url: null, badge_color: '#f97316', cta_label: 'Suscribirse', stripe_price_id: null, is_active: true },
  { id: '5', name: 'Plan Familiar', age_range: 'Hasta 2 adultos + 2 niños', price: 120, benefits: ['Acceso para toda la familia', 'Reserva prioritaria', 'Torneos familiares'], thumbnail_url: null, badge_color: '#a855f7', cta_label: 'Suscribirse', stripe_price_id: null, is_active: true },
]

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'home' })
  return {
    title: 'Nell Pickleball Club — República Dominicana',
    description: t('hero_subtitle'),
    openGraph: { title: 'Nell Pickleball Club', description: t('hero_subtitle'), locale },
  }
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-600 text-white py-20 px-4 text-center min-h-[480px] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🏓</div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 max-w-2xl">
          Nell Pickleball Club
        </h1>
        <p className="text-lg md:text-xl text-green-100 mb-8 max-w-xl">
          El primer club de pickleball de República Dominicana. Únete a nuestra comunidad.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/${locale}/signup`}>
            <Button size="lg" variant="secondary">Únete Ahora</Button>
          </Link>
          <Link href={`/${locale}/guide`}>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Aprende Más
            </Button>
          </Link>
        </div>
      </section>

      {/* Membership Plans */}
      <section id="membership" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Planes de Membresía</h2>
          <p className="text-center text-gray-500 mb-10">Elige el plan perfecto para ti</p>
          <MembershipGrid plans={STATIC_PLANS} />
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-3">Nuestra Misión</h2>
            <p className="text-gray-700 leading-relaxed">
              Promover el pickleball en República Dominicana creando una comunidad inclusiva y apasionada por este deporte.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-3">Nuestra Visión</h2>
            <p className="text-gray-700 leading-relaxed">
              Ser el club de pickleball de referencia en el Caribe, formando campeones y conectando personas a través del deporte.
            </p>
          </div>
        </div>
      </section>

      {/* WhatsApp inline CTA */}
      <section className="bg-green-700 py-12 px-4 text-center text-white">
        <p className="text-xl font-semibold mb-4">¿Tienes preguntas? Contáctanos en WhatsApp</p>
        <a
          href="https://wa.me/18091234567?text=Hola%2C%20me%20interesa%20el%20Nell%20Pickleball%20Club"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-4 rounded-full hover:bg-green-50 transition min-h-[48px]">
          💬 Escríbenos
        </a>
      </section>
    </>
  )
}
```

**Step 5: Verify page renders**

```bash
npm run dev
```

Visit http://localhost:3000/es — hero, membership cards, and mission sections should be visible.

**Step 6: Commit**

```bash
git add app/ components/membership/
git commit -m "feat: add home page with static membership cards"
```

---

## Task 7: About + Guide Pages (Static)

**Files:**
- Create: `app/[locale]/(public)/about/page.tsx`
- Create: `app/[locale]/(public)/guide/page.tsx`
- Create: `components/guide/FaqAccordion.tsx`

**Step 1: Create `components/guide/FaqAccordion.tsx`**

```typescript
// components/guide/FaqAccordion.tsx
'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  id: string
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
      {items.map(item => (
        <div key={item.id}>
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors min-h-[64px]"
            aria-expanded={openId === item.id}>
            <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
            <ChevronDown
              size={20}
              className={`flex-shrink-0 text-green-600 transition-transform ${openId === item.id ? 'rotate-180' : ''}`} />
          </button>
          {openId === item.id && (
            <div className="px-5 pb-5 bg-white text-gray-700 leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Create `app/[locale]/(public)/about/page.tsx`**

```typescript
// app/[locale]/(public)/about/page.tsx
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    title: locale === 'es' ? 'Nosotros — Nell Pickleball Club' : 'About — Nell Pickleball Club',
    description: locale === 'es' ? 'Conoce la historia y el equipo del Nell Pickleball Club.' : 'Meet the team and story behind Nell Pickleball Club.',
  }
}

export default function AboutPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Nuestra Historia</h1>
      <div className="prose prose-lg max-w-none text-gray-700">
        <p>El Nell Pickleball Club nació de la pasión por el deporte y el deseo de traer a República Dominicana uno de los deportes de más rápido crecimiento en el mundo.</p>
        <p>Fundado con la visión de crear una comunidad inclusiva donde personas de todas las edades puedan disfrutar del pickleball, nuestro club ha crecido rápidamente desde sus inicios.</p>
      </div>

      {/* Exhibition video */}
      <div className="mt-10 aspect-video rounded-2xl overflow-hidden bg-gray-100">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/V5TyLYMjQbA"
          title="Pickleball introduction"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen />
      </div>

      {/* Team section placeholder */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Nuestro Equipo</h2>
        <p className="text-gray-500 italic">Próximamente — conoce a nuestro equipo.</p>
      </section>
    </article>
  )
}
```

**Step 3: Create `app/[locale]/(public)/guide/page.tsx`**

```typescript
// app/[locale]/(public)/guide/page.tsx
import { getTranslations } from 'next-intl/server'
import { FaqAccordion } from '@/components/guide/FaqAccordion'

const STATIC_FAQS = [
  { id: '1', question: '¿Qué es el pickleball?', answer: 'El pickleball es un deporte de raqueta que combina elementos del tenis, el bádminton y el ping pong. Se juega en una cancha pequeña con paletas sólidas y una pelota de plástico con agujeros.' },
  { id: '2', question: '¿Necesito experiencia previa para unirme?', answer: 'No. El Nell Pickleball Club da la bienvenida a principiantes. Ofrecemos clases introductorias para todos los niveles.' },
  { id: '3', question: '¿Cuáles son los horarios del club?', answer: 'Estamos abiertos de lunes a viernes de 7:00 AM a 9:00 PM y los fines de semana de 7:00 AM a 8:00 PM.' },
  { id: '4', question: '¿Cómo reservo una cancha?', answer: 'Crea una cuenta, inicia sesión y ve a la página de Reservaciones. Selecciona la fecha, la cancha disponible y el horario que prefieras.' },
]

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    title: locale === 'es' ? 'Guía de Pickleball — Nell Pickleball Club' : 'Pickleball Guide — Nell Pickleball Club',
    description: 'Aprende todo sobre el pickleball: reglas, puntuación, equipamiento y más.',
  }
}

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Guía de Pickleball</h1>
      <p className="text-gray-500 text-lg mb-10">Todo lo que necesitas saber para empezar</p>

      {/* Guide body */}
      <article className="prose prose-lg max-w-none text-gray-700 mb-12">
        <h2>¿Qué es el Pickleball?</h2>
        <p>El pickleball es uno de los deportes de más rápido crecimiento en el mundo. Combina elementos del tenis, el bádminton y el ping pong, y puede ser jugado por personas de todas las edades y niveles de aptitud física.</p>
        <h2>Historia</h2>
        <p>Fue inventado en 1965 en Bainbridge Island, Washington, por Joel Pritchard, Bill Bell y Barney McCallum como entretenimiento familiar. Desde entonces ha crecido hasta convertirse en un fenómeno deportivo global.</p>
        <h2>Reglas Básicas</h2>
        <ul>
          <li>Se juega en una cancha de 6.1m × 13.4m</li>
          <li>La puntuación va de 0 a 11 (hay que ganar por 2 puntos)</li>
          <li>Solo el equipo que sirve puede puntuar</li>
          <li>Existe una zona de "no volea" cerca de la red llamada "la cocina"</li>
        </ul>
      </article>

      {/* Video */}
      <div className="mb-12 aspect-video rounded-2xl overflow-hidden bg-gray-100">
        <iframe className="w-full h-full"
          src="https://www.youtube.com/embed/V5TyLYMjQbA"
          title="Pickleball guide" allowFullScreen />
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Preguntas Frecuentes</h2>
        <FaqAccordion items={STATIC_FAQS} />
      </section>

      {/* WhatsApp CTA */}
      <div className="bg-green-50 rounded-2xl p-8 text-center">
        <p className="text-lg font-semibold text-gray-900 mb-4">¿Aún tienes dudas? Escríbenos por WhatsApp</p>
        <a href="https://wa.me/18091234567?text=Hola%2C%20tengo%20preguntas%20sobre%20el%20pickleball"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-full hover:bg-green-700 min-h-[48px]">
          💬 Contáctanos
        </a>
      </div>
    </div>
  )
}
```

**Step 4: Verify all pages render**

```bash
npm run dev
```

Visit `/es/about` and `/es/guide` — both should render without errors.

**Step 5: Commit**

```bash
git add app/[locale]/\(public\)/about/ app/[locale]/\(public\)/guide/ components/guide/
git commit -m "feat: add about and guide pages with static content and FAQ accordion"
```

---

## Task 8: Auth Pages (Signup / Login / Account)

**Files:**
- Create: `app/[locale]/(auth)/layout.tsx`
- Create: `app/[locale]/(auth)/login/page.tsx`
- Create: `app/[locale]/(auth)/signup/page.tsx`
- Create: `app/[locale]/(auth)/account/page.tsx`
- Create: `app/[locale]/(auth)/login/actions.ts`
- Create: `app/[locale]/(auth)/signup/actions.ts`

**Step 1: Create `app/[locale]/(auth)/layout.tsx`**

```typescript
// app/[locale]/(auth)/layout.tsx
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12 pb-20 md:pb-12">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

**Step 2: Create `app/[locale]/(auth)/signup/actions.ts`**

```typescript
// app/[locale]/(auth)/signup/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData, locale: string) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string

  const { error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name } },
  })

  if (error) return { error: error.message }
  redirect(`/${locale}/account`)
}
```

**Step 3: Create `app/[locale]/(auth)/login/actions.ts`**

```typescript
// app/[locale]/(auth)/login/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData, locale: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect(`/${locale}/account`)
}

export async function signOut(locale: string) {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}/login`)
}
```

**Step 4: Create `app/[locale]/(auth)/login/page.tsx`**

```typescript
// app/[locale]/(auth)/login/page.tsx
'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { signIn } from './actions'

export default function LoginPage() {
  const { locale } = useParams<{ locale: string }>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn(new FormData(e.currentTarget), locale)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🏓</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Iniciar Sesión</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[48px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[48px]" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Iniciar Sesión
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href={`/${locale}/signup`} className="text-green-700 font-semibold hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
```

**Step 5: Create `app/[locale]/(auth)/signup/page.tsx`**

```typescript
// app/[locale]/(auth)/signup/page.tsx
'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { signUp } from './actions'

export default function SignupPage() {
  const { locale } = useParams<{ locale: string }>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signUp(new FormData(e.currentTarget), locale)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🏓</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Crear Cuenta</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'full_name', label: 'Nombre completo', type: 'text', autoComplete: 'name' },
            { id: 'email', label: 'Correo electrónico', type: 'email', autoComplete: 'email' },
            { id: 'password', label: 'Contraseña', type: 'password', autoComplete: 'new-password' },
          ].map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={field.id}>{field.label}</label>
              <input id={field.id} name={field.id} type={field.type} required autoComplete={field.autoComplete}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[48px]" />
            </div>
          ))}
          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Registrarse
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href={`/${locale}/login`} className="text-green-700 font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
```

**Step 6: Create `app/[locale]/(auth)/account/page.tsx`**

```typescript
// app/[locale]/(auth)/account/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '../login/actions'
import { Button } from '@/components/ui/Button'

export default async function AccountPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Cuenta</h1>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Nombre</span>
            <span className="font-medium">{profile?.full_name || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Correo</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Membresía</span>
            <span className={`font-semibold px-3 py-1 rounded-full text-sm ${profile?.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {profile?.subscription_status === 'active' ? `✅ ${profile.membership_type || 'Activa'}` : 'Sin membresía activa'}
            </span>
          </div>
        </div>

        <form action={async () => { 'use server'; await signOut(locale) }}>
          <Button type="submit" variant="outline" className="w-full">
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </div>
  )
}
```

**Step 7: Verify auth flow**

```bash
npm run dev
```

1. Visit `/es/signup` — create an account
2. Check Supabase dashboard → Authentication → Users — user should appear
3. Check profiles table — row should be auto-created by trigger
4. Visit `/es/account` — should show profile data

**Step 8: Commit**

```bash
git add "app/[locale]/(auth)/"
git commit -m "feat: add signup, login, and account pages with Supabase Auth"
```

---

## Task 9: Connect MembershipCards + FAQs to Database

**Files:**
- Modify: `app/[locale]/(public)/page.tsx` → fetch plans from Supabase
- Modify: `app/[locale]/(public)/guide/page.tsx` → fetch FAQs from Supabase
- Modify: `components/membership/MembershipCard.tsx` → add Stripe Checkout action

**Step 1: Update home page to fetch plans from DB**

Replace the static `STATIC_PLANS` array in `app/[locale]/(public)/page.tsx` with a server-side fetch:

```typescript
// At top of page.tsx, remove STATIC_PLANS array, add:
import { createClient } from '@/lib/supabase/server'

// Inside the component, replace plans prop:
export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: plans } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  // Also fetch site_content for hero/mission/vision
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .eq('page', 'home')

  const getContent = (section: string, key: string) =>
    content?.find(c => c.section === section && c.key === key)?.value ?? ''

  // Use plans ?? [] where STATIC_PLANS was
```

**Step 2: Update guide page to fetch FAQs from DB**

```typescript
// app/[locale]/(public)/guide/page.tsx
// Replace static FAQs with server fetch:
import { createClient } from '@/lib/supabase/server'

export default async function GuidePage() {
  const supabase = createClient()
  const [{ data: faqs }, { data: content }] = await Promise.all([
    supabase.from('faqs').select('*').eq('is_visible', true).order('display_order'),
    supabase.from('site_content').select('*').eq('page', 'guide'),
  ])

  const guideBody = content?.find(c => c.section === 'body' && c.key === 'content')?.value ?? ''
  const videoUrl = content?.find(c => c.section === 'video' && c.key === 'url')?.value ?? ''

  // Convert YouTube watch URL to embed URL
  const embedUrl = videoUrl.replace('watch?v=', 'embed/')
  // ...rest of component using faqs ?? [] and guideBody
```

**Step 3: Verify DB-connected pages render**

```bash
npm run dev
```

Visit `/es` — membership cards should show the 5 seeded plans from DB. Visit `/es/guide` — 8 FAQ items should render from DB.

**Step 4: Commit**

```bash
git add "app/[locale]/(public)/page.tsx" "app/[locale]/(public)/guide/page.tsx"
git commit -m "feat: connect membership cards and FAQs to Supabase database"
```

---

## Task 10: Admin Panel Layout

**Files:**
- Create: `app/[locale]/admin/layout.tsx`
- Create: `app/[locale]/admin/page.tsx`
- Create: `components/admin/AdminSidebar.tsx`

**Step 1: Create `components/admin/AdminSidebar.tsx`**

```typescript
// components/admin/AdminSidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { FileText, HelpCircle, CreditCard, MapPin, Trophy, Settings } from 'lucide-react'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navItems = [
  { key: 'content', icon: FileText, path: '/admin/content' },
  { key: 'faqs', icon: HelpCircle, path: '/admin/faqs' },
  { key: 'plans', icon: CreditCard, path: '/admin/plans' },
  { key: 'courts', icon: MapPin, path: '/admin/courts' },
  { key: 'tournaments', icon: Trophy, path: '/admin/tournaments' },
  { key: 'settings', icon: Settings, path: '/admin/settings' },
] as const

export function AdminSidebar() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('admin')
  const [open, setOpen] = useState(false)

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Admin</p>
      {navItems.map(({ key, icon: Icon, path }) => {
        const href = `/${locale}${path}`
        const active = pathname.startsWith(href)
        return (
          <Link key={key} href={href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${active ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Icon size={18} />
            {t(key)}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)}
        className="md:hidden fixed top-20 left-4 z-50 p-3 bg-white rounded-lg shadow-md border border-gray-200 min-h-[48px] min-w-[48px]">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 flex-shrink-0 bg-white border-r border-gray-200 min-h-screen">
        <SidebarContent />
      </aside>
    </>
  )
}
```

**Step 2: Create `app/[locale]/admin/layout.tsx`**

```typescript
// app/[locale]/admin/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Header } from '@/components/layout/Header'

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') redirect(`/${locale}`)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-gray-50 pl-16 md:pl-6">{children}</main>
      </div>
    </div>
  )
}
```

**Step 3: Create `app/[locale]/admin/page.tsx`**

```typescript
// app/[locale]/admin/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createClient()
  const [{ count: memberCount }, { count: reservationCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Miembros registrados', value: memberCount ?? 0, icon: '👥' },
          { label: 'Reservaciones activas', value: reservationCount ?? 0, icon: '📅' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Set yourself as admin in Supabase**

In Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE user_id = 'YOUR_USER_UUID';
```

**Step 5: Verify admin panel is accessible**

```bash
npm run dev
```

Visit `/es/admin` — should show the admin dashboard with stats. Non-admin users should be redirected home.

**Step 6: Commit**

```bash
git add "app/[locale]/admin/" "components/admin/AdminSidebar.tsx"
git commit -m "feat: add admin panel layout, sidebar, and dashboard"
```
