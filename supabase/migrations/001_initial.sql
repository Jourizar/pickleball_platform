-- supabase/migrations/001_initial.sql
-- Run this in Supabase SQL Editor FIRST

-- Enable UUID extension (may already exist)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- Auto-created by trigger when user signs up
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name           text,
  phone               text,
  membership_type     text,
  role                text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  stripe_customer_id  text,
  subscription_status text NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled')),
  subscription_id     text,
  locale              text NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'en')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- MEMBERSHIP PLANS (admin-managed)
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  age_range         text,
  price             numeric NOT NULL CHECK (price >= 0),
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

-- ============================================================
-- COURTS
-- ============================================================
CREATE TABLE IF NOT EXISTS courts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  photo_url   text,
  is_active   boolean NOT NULL DEFAULT true
);

-- ============================================================
-- TIME SLOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS time_slots (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id       uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date           date NOT NULL,
  start_time     time NOT NULL,
  end_time       time NOT NULL,
  max_capacity   integer NOT NULL DEFAULT 4 CHECK (max_capacity > 0),
  price_override numeric CHECK (price_override >= 0),
  currency       text NOT NULL DEFAULT 'DOP',
  is_blocked     boolean NOT NULL DEFAULT false,
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  time_slot_id uuid NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'canceled')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_reservation_per_slot UNIQUE (user_id, time_slot_id)
);

-- ============================================================
-- TOURNAMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  date             date,
  description      text,
  max_participants integer CHECK (max_participants > 0),
  entry_fee        numeric NOT NULL DEFAULT 0 CHECK (entry_fee >= 0),
  currency         text NOT NULL DEFAULT 'DOP',
  is_open          boolean NOT NULL DEFAULT true
);

-- ============================================================
-- TOURNAMENT REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tournament_id)
);

-- ============================================================
-- FAQs (admin-managed)
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question      text NOT NULL,
  answer        text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true
);

-- ============================================================
-- SITE CONTENT (key-value CMS)
-- page: 'home' | 'about' | 'guide'
-- section: 'hero' | 'mission' | 'vision' | 'story' | 'body' | 'video'
-- key: 'title' | 'subtitle' | 'body' | 'url' | 'cta_primary' | 'cta_secondary'
-- ============================================================
CREATE TABLE IF NOT EXISTS site_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page       text NOT NULL,
  section    text NOT NULL,
  key        text NOT NULL,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, section, key)
);

-- ============================================================
-- STAFF MEMBERS (about page)
-- ============================================================
CREATE TABLE IF NOT EXISTS staff_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  role          text,
  bio           text,
  photo_url     text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true
);

-- ============================================================
-- GALLERY IMAGES (about page)
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url           text NOT NULL,
  alt           text,
  display_order integer NOT NULL DEFAULT 0
);

-- ============================================================
-- SITE SETTINGS
-- Keys: 'whatsapp_number', 'whatsapp_enabled', 'zapier_webhook_url', 'stripe_enabled'
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
