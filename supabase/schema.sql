-- ============================================================
-- MAID — Supabase Database Schema
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- ── Enable UUID extension ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'researcher' CHECK (role IN ('pharmacist','researcher','student','admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'researcher')
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Chat Sessions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'New Research Session',
  tool_mode   TEXT DEFAULT 'general',
  messages    JSONB DEFAULT '[]'::JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx ON public.chat_sessions(updated_at DESC);

-- ── Search History ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.search_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query       TEXT NOT NULL,
  source      TEXT,           -- pubchem, chembl, clinicaltrials, etc.
  result_cid  TEXT,           -- optional result identifier
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS search_history_user_id_idx ON public.search_history(user_id);

-- ── Saved Molecules ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_molecules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cid         INTEGER,
  chembl_id   TEXT,
  name        TEXT NOT NULL,
  formula     TEXT,
  smiles      TEXT,
  weight      NUMERIC,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_molecules_user_id_idx ON public.saved_molecules(user_id);

-- ── Saved Trials ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_trials (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nct_id      TEXT NOT NULL,
  title       TEXT,
  status      TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_trials_user_id_idx ON public.saved_trials(user_id);

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_molecules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_trials   ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- chat_sessions
CREATE POLICY "Users can view own sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- search_history
CREATE POLICY "Users can view own search history"
  ON public.search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON public.search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- saved_molecules
CREATE POLICY "Users can manage own molecules"
  ON public.saved_molecules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- saved_trials
CREATE POLICY "Users can manage own trials"
  ON public.saved_trials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Updated-at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
