-- STAGING ONLY — do not run this against production.
--
-- Production's Supabase project already has the real `members` table with real member
-- data. This script exists only to recreate the minimal Spring schema inside a fresh,
-- empty staging Supabase project, so the full app (Spring + Fall) can actually boot and
-- be tested end to end there — not just the Fall pieces in isolation.
--
-- Discovered from gbsc-capacity-app.jsx: members AND pods both live in one table. Pods
-- aren't a separate table — they're stored as a single row with id = "__pods__" whose
-- `data` column holds the full pods array. Regular members are one row each, `data` holds
-- their whole profile + weeklyChecks array.

create table if not exists members (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
