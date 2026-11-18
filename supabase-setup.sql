-- ══════════════════════════════════════════════════════════════════
-- TSORO JOURNAL — COMPLETE SUPABASE SETUP
-- Run this once in Supabase SQL Editor (supabase.com → SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT everywhere
-- ══════════════════════════════════════════════════════════════════


-- ── 1. PROFILES ────────────────────────────────────────────────────
-- Stores display name + admin flag for each user

CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  is_admin    boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;
CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  ));


-- ── 2. AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 3. MARKET PRICES ───────────────────────────────────────────────
-- Admin-managed shared prices; pushed to all users' portfolios

CREATE TABLE IF NOT EXISTS market_prices (
  id          bigserial PRIMARY KEY,
  symbol      text NOT NULL,
  exchange    text NOT NULL,
  price       decimal(14,4) NOT NULL,
  currency    text NOT NULL DEFAULT 'ZiG',
  price_date  date NOT NULL DEFAULT CURRENT_DATE,
  updated_by  uuid REFERENCES auth.users(id),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (symbol, exchange)
);

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

-- Everyone can read market prices
DROP POLICY IF EXISTS "Public reads market prices" ON market_prices;
CREATE POLICY "Public reads market prices"
  ON market_prices FOR SELECT
  USING (true);

-- Only admins can write market prices
DROP POLICY IF EXISTS "Admins manage market prices" ON market_prices;
CREATE POLICY "Admins manage market prices"
  ON market_prices FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));


-- ── 4. PRICE HISTORY ───────────────────────────────────────────────
-- Full daily price log used by the What If? simulator

CREATE TABLE IF NOT EXISTS price_history (
  id            bigserial PRIMARY KEY,
  symbol        text NOT NULL,
  exchange      text NOT NULL,
  price         decimal(14,6) NOT NULL,
  currency      text NOT NULL DEFAULT 'ZiG',
  recorded_date date NOT NULL,
  recorded_by   uuid REFERENCES auth.users(id),
  created_at    timestamptz DEFAULT now(),
  UNIQUE (symbol, exchange, recorded_date)
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Everyone can read price history (simulator needs it)
DROP POLICY IF EXISTS "Public reads price history" ON price_history;
CREATE POLICY "Public reads price history"
  ON price_history FOR SELECT
  USING (true);

-- Only admins can insert/update price history
DROP POLICY IF EXISTS "Admins manage price history" ON price_history;
CREATE POLICY "Admins manage price history"
  ON price_history FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));


-- ── 5. PULSE POSTS ─────────────────────────────────────────────────
-- Public market commentary feed

CREATE TABLE IF NOT EXISTS pulse_posts (
  id          bigserial PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text NOT NULL,
  author_name text,
  created_at  timestamptz DEFAULT now()
);

-- Add author_name column if upgrading from an earlier version
ALTER TABLE pulse_posts ADD COLUMN IF NOT EXISTS author_name text;

ALTER TABLE pulse_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can read all pulse posts (public feed)
DROP POLICY IF EXISTS "Public reads pulse posts" ON pulse_posts;
CREATE POLICY "Public reads pulse posts"
  ON pulse_posts FOR SELECT
  USING (true);

-- Authenticated users can create posts
DROP POLICY IF EXISTS "Auth users create pulse posts" ON pulse_posts;
CREATE POLICY "Auth users create pulse posts"
  ON pulse_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update/delete their own posts
DROP POLICY IF EXISTS "Users manage own pulse posts" ON pulse_posts;
CREATE POLICY "Users manage own pulse posts"
  ON pulse_posts FOR ALL
  USING (auth.uid() = user_id);


-- ── 6. SET YOURSELF AS ADMIN ───────────────────────────────────────
-- Replace YOUR_EMAIL_HERE with your actual login email
-- (the one you use to sign into the app)

INSERT INTO profiles (id, display_name, is_admin)
SELECT id, email, true
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'
ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- ══════════════════════════════════════════════════════════════════
-- DONE. After running this:
-- 1. Load the historical price data from data-import-kwayisi/ (22 files)
-- 2. Then load data-import/ (9 files) for supplemental data
-- 3. Sign in to the app — you will have admin access
-- ══════════════════════════════════════════════════════════════════
