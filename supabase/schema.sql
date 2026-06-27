-- ============================================================
-- Rodamos — Supabase Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users (extends Supabase auth.users) ────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  name        TEXT,
  avatar_url  TEXT,
  default_motorcycle_id UUID,
  preferred_ai_model    TEXT DEFAULT 'claude-sonnet-4-6',
  units       TEXT DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  language    TEXT DEFAULT 'es',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- ─── Motorcycles ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS motorcycles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nickname      TEXT NOT NULL,
  brand         TEXT NOT NULL,
  model         TEXT NOT NULL,
  year          INTEGER,
  engine_cc     INTEGER,
  color         TEXT DEFAULT '#0066cc',
  plate_number  TEXT,
  vin           TEXT,
  image_url     TEXT,
  fuel_capacity NUMERIC(5,2) DEFAULT 18,
  consumption   NUMERIC(4,2) DEFAULT 5.5,
  tyre_front    JSONB DEFAULT '{"size":"120/70 ZR17","km":0,"pressureCold":2.5}'::jsonb,
  tyre_rear     JSONB DEFAULT '{"size":"180/55 ZR17","km":0,"pressureCold":2.9}'::jsonb,
  insurance_expiry TIMESTAMPTZ,
  itv_expiry    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE motorcycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own motorcycles" ON motorcycles FOR ALL USING (auth.uid() = user_id);

-- ─── Service Records ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS service_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  motorcycle_id  UUID REFERENCES motorcycles(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date           TIMESTAMPTZ NOT NULL,
  km             INTEGER NOT NULL,
  type           TEXT NOT NULL,
  description    TEXT,
  cost           NUMERIC(10,2),
  workshop       TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own service records" ON service_records FOR ALL USING (auth.uid() = user_id);

-- ─── Saved Routes ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_routes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT,
  route       JSONB NOT NULL,
  analysis    JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags        TEXT[] DEFAULT '{}',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own routes" ON saved_routes FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_saved_routes_user_id   ON saved_routes (user_id);
CREATE INDEX idx_saved_routes_favorite  ON saved_routes (user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_saved_routes_created   ON saved_routes (user_id, created_at DESC);

-- ─── Analysis Cache ───────────────────────────────────────────
-- Cache AI analyses to avoid repeated API calls for same route+date

CREATE TABLE IF NOT EXISTS analysis_cache (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key     TEXT UNIQUE NOT NULL,  -- hash(destination + date_day)
  analysis      JSONB NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_cache_key     ON analysis_cache (cache_key);
CREATE INDEX idx_analysis_cache_expiry  ON analysis_cache (expires_at);

-- Auto-delete expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS VOID AS $$
BEGIN
  DELETE FROM analysis_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ─── Triggers: updated_at ────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_motorcycles_updated_at
  BEFORE UPDATE ON motorcycles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_saved_routes_updated_at
  BEFORE UPDATE ON saved_routes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Function: new user profile ──────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
