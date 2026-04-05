-- Run this in your Supabase SQL editor to add the column for calm mind interval settings.
ALTER TABLE public.profiles
ADD COLUMN calm_mind_interval integer DEFAULT 120;
