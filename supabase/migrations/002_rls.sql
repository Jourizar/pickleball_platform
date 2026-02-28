-- supabase/migrations/002_rls.sql
-- Run this AFTER 001_initial.sql
-- Row Level Security policies

-- ============================================================
-- Helper function: check if current user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Service role inserts (trigger-based profile creation)
-- The trigger uses SECURITY DEFINER so it runs as the owner, not the user

-- ============================================================
-- MEMBERSHIP PLANS: public read, admin write
-- ============================================================
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_select_all"
  ON membership_plans FOR SELECT
  USING (true);

CREATE POLICY "plans_insert_admin"
  ON membership_plans FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "plans_update_admin"
  ON membership_plans FOR UPDATE
  USING (is_admin());

CREATE POLICY "plans_delete_admin"
  ON membership_plans FOR DELETE
  USING (is_admin());

-- ============================================================
-- COURTS: public read, admin write
-- ============================================================
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courts_select_all" ON courts FOR SELECT USING (true);
CREATE POLICY "courts_insert_admin" ON courts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "courts_update_admin" ON courts FOR UPDATE USING (is_admin());
CREATE POLICY "courts_delete_admin" ON courts FOR DELETE USING (is_admin());

-- ============================================================
-- TIME SLOTS: public read, admin write
-- ============================================================
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "slots_select_all" ON time_slots FOR SELECT USING (true);
CREATE POLICY "slots_insert_admin" ON time_slots FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "slots_update_admin" ON time_slots FOR UPDATE USING (is_admin());
CREATE POLICY "slots_delete_admin" ON time_slots FOR DELETE USING (is_admin());

-- ============================================================
-- RESERVATIONS: own rows + admin read/update
-- ============================================================
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "res_select_own"
  ON reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "res_insert_own"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "res_update_own"
  ON reservations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "res_select_admin"
  ON reservations FOR SELECT
  USING (is_admin());

CREATE POLICY "res_update_admin"
  ON reservations FOR UPDATE
  USING (is_admin());

-- ============================================================
-- TOURNAMENTS: public read, admin write
-- ============================================================
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tournaments_select_all" ON tournaments FOR SELECT USING (true);
CREATE POLICY "tournaments_insert_admin" ON tournaments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "tournaments_update_admin" ON tournaments FOR UPDATE USING (is_admin());
CREATE POLICY "tournaments_delete_admin" ON tournaments FOR DELETE USING (is_admin());

-- ============================================================
-- TOURNAMENT REGISTRATIONS: own rows + admin read
-- ============================================================
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treg_select_own"
  ON tournament_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "treg_insert_own"
  ON tournament_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "treg_delete_own"
  ON tournament_registrations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "treg_select_admin"
  ON tournament_registrations FOR SELECT
  USING (is_admin());

-- ============================================================
-- FAQs: public read, admin write
-- ============================================================
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs_select_all" ON faqs FOR SELECT USING (true);
CREATE POLICY "faqs_insert_admin" ON faqs FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "faqs_update_admin" ON faqs FOR UPDATE USING (is_admin());
CREATE POLICY "faqs_delete_admin" ON faqs FOR DELETE USING (is_admin());

-- ============================================================
-- SITE CONTENT: public read, admin write
-- ============================================================
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_select_all" ON site_content FOR SELECT USING (true);
CREATE POLICY "content_insert_admin" ON site_content FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "content_update_admin" ON site_content FOR UPDATE USING (is_admin());
CREATE POLICY "content_delete_admin" ON site_content FOR DELETE USING (is_admin());

-- ============================================================
-- STAFF MEMBERS: public read, admin write
-- ============================================================
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_all" ON staff_members FOR SELECT USING (true);
CREATE POLICY "staff_insert_admin" ON staff_members FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "staff_update_admin" ON staff_members FOR UPDATE USING (is_admin());
CREATE POLICY "staff_delete_admin" ON staff_members FOR DELETE USING (is_admin());

-- ============================================================
-- GALLERY IMAGES: public read, admin write
-- ============================================================
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_select_all" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "gallery_insert_admin" ON gallery_images FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "gallery_update_admin" ON gallery_images FOR UPDATE USING (is_admin());
CREATE POLICY "gallery_delete_admin" ON gallery_images FOR DELETE USING (is_admin());

-- ============================================================
-- SITE SETTINGS: public read, admin write
-- ============================================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_all" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_insert_admin" ON site_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "settings_update_admin" ON site_settings FOR UPDATE USING (is_admin());
CREATE POLICY "settings_delete_admin" ON site_settings FOR DELETE USING (is_admin());
