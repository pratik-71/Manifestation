-- =============================================================
-- MANIFESTATION APP — SUPABASE DATABASE SCHEMA
-- Run this in Supabase → SQL Editor
-- =============================================================

-- -------------------------------------------------------
-- 1. PROFILES TABLE
--    One row per authenticated user. Linked to auth.users.
--    Goals are stored inline as a JSONB array — simple & fast.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username              TEXT NOT NULL DEFAULT 'Seeker',
    wake_time             TEXT NOT NULL DEFAULT '07:00',   -- 24h "HH:MM"
    sleep_time            TEXT NOT NULL DEFAULT '23:00',
    manifest_time         TEXT NOT NULL DEFAULT '10:00',
    goals                 JSONB NOT NULL DEFAULT '[]',     -- e.g. ["Grow my business", "Find love"]
    streak_count          INTEGER NOT NULL DEFAULT 0,
    last_manifest_date    DATE,
    daily_message_count   INTEGER NOT NULL DEFAULT 0,
    challenge_day         INTEGER NOT NULL DEFAULT 1,
    challenge_duration    INTEGER NOT NULL DEFAULT 7,
    is_challenge_complete BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_complete   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update `updated_at` on every row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
--    Users can only read/write their own row.
-- -------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- -------------------------------------------------------
-- 3. AUTO-CREATE PROFILE ON SIGN-UP
--    When a user signs up via Google, create a profile row.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            SPLIT_PART(NEW.email, '@', 1),
            'Seeker'
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
