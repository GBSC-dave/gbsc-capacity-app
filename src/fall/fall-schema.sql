-- Fall 2026 — Supabase schema for the four fall_* tables
-- Source: GBSC Fall 2026 Capacity Method — Dave Handoff Source of Truth v4 Final, Section 2
-- (Fall Data Model) + Section 20 (Move Lifecycle) + Section 28 (Structured Reasons) + Section 41
-- (Constraint Impact on early close) + Section 42 (date/week logic).
--
-- ADDITIVE ONLY — does not touch Spring's `members` or `pods` tables in any way.
--
-- IMPORTANT — I do not have live access to your Supabase project in this session, so I could
-- not confirm the exact column name/type of the Spring `members` table's primary key. Every
-- member_id column below is TEXT with no hard FK constraint, specifically so this migration
-- can't fail or corrupt anything if that assumption is wrong. Before running this for real,
-- check `members`' primary key column in the Supabase dashboard and, if you want real
-- referential integrity, add:
--   ALTER TABLE fall_member_state ADD CONSTRAINT fk_fall_member_state_member
--     FOREIGN KEY (member_id) REFERENCES members(id);
-- (repeat for the other three tables) once you've verified the type matches.
--
-- Table creation order below is deliberate: fall_constraints has to exist before fall_moves,
-- which has to exist before fall_member_state / fall_weekly_checks, since both of those
-- reference fall_moves(id) (and fall_member_state also references fall_constraints(id)).

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- ─────────────────────────────────────────────────────────────────────────────
-- fall_constraints — Section 14: "the baseline belongs to the constraint, not the Move."
-- One row per distinct constraint a member's season addresses. Today, nothing in the app lets
-- a coach identify a genuinely different constraint after the one-time Reflection (there's no
-- retake-Reflection flow and Q5 isn't coach-editable), so in practice every member has exactly
-- one row here for the whole season — but modeling it as its own table (rather than more
-- columns on fall_member_state) means a future "this is actually a different issue" flow
-- doesn't need a second migration: it would just insert a new row and repoint
-- fall_member_state.active_constraint_id, leaving this one intact as history. Created before
-- fall_moves/fall_member_state below since both reference it.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists fall_constraints (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  season text not null default 'fall_2026',
  constraint_key text not null,      -- a Q5_OPTIONS id from fall-reflection-data.js, or 'other'
  constraint_label text not null,    -- denormalized display label, stable even if Q5_OPTIONS wording changes later or the answer was "other"
  baseline_rating smallint not null check (baseline_rating between 1 and 5),
  baseline_date date not null,       -- "save the initial rating and date, never replace it with a weekly rating"
  created_at timestamptz not null default now()
);

-- MIGRATION (2026-09-03) — run this against the already-existing staging fall_moves table;
-- the CREATE TABLE below already includes the column for anyone standing up fresh.
alter table fall_moves add column if not exists weekly_plan_limit text
  check (weekly_plan_limit in ('no_limit','anchor','builder','expansion'));

-- MIGRATION (2026-09-03, point 2) — same as above, for the personalized plan field.
alter table fall_moves add column if not exists personalized_plan text
  check (char_length(personalized_plan) <= 300);

-- MIGRATION (2026-09-03, point 3) — the three weekly Move questions' new, simpler columns.
alter table fall_weekly_checks add column if not exists move_used text
  check (move_used in ('never','sometimes','most_of_the_time','no_opportunity'));
alter table fall_weekly_checks add column if not exists move_helped text
  check (move_helped in ('not_really','somewhat','definitely','too_soon_to_tell'));
alter table fall_weekly_checks add column if not exists move_constraint_impact smallint
  check (move_constraint_impact between 1 and 5);

-- MIGRATION (2026-09-03, point 4) — add 'integrated' to both check constraints. Default
-- (unnamed) constraint names from the original CREATE TABLE statements.
alter table fall_moves drop constraint if exists fall_moves_status_check;
alter table fall_moves add constraint fall_moves_status_check
  check (status in ('active','graduated','replaced','integrated'));
alter table fall_move_events drop constraint if exists fall_move_events_event_type_check;
alter table fall_move_events add constraint fall_move_events_event_type_check
  check (event_type in ('assigned','dose_changed','coach_note_added','integration_candidate','integrated','graduated','replaced','reactivated'));

-- MIGRATION (2026-09-03, point 14) — links from fall_member_state/fall_moves to the
-- fall_constraints record above, plus the weekly-check-in snapshot columns.
alter table fall_member_state add column if not exists active_constraint_id uuid references fall_constraints(id);
alter table fall_moves add column if not exists constraint_id uuid references fall_constraints(id);
alter table fall_weekly_checks add column if not exists move_dose_snapshot text;
alter table fall_weekly_checks add column if not exists move_plan_snapshot text;

-- One-time backfill for members who completed Reflection before fall_constraints existed —
-- without this, every existing test member's My Results Constraint Impact card would show
-- nothing until they redid Reflection, which isn't a repeatable flow. Skips anyone who
-- already has an active_constraint_id (safe to re-run). Uses fall_member_state.created_at's
-- date as the best available stand-in for "when Reflection was completed."
do $$
declare
  r record;
  v_constraint_id uuid;
  v_label text;
begin
  for r in
    select * from fall_member_state
    where reflection_answers is not null and active_constraint_id is null and baseline_constraint_impact is not null
  loop
    v_label := case
      when r.reflection_answers->>'q5' = 'other' then coalesce(r.reflection_answers->>'q5Other', 'Something else')
      when r.reflection_answers->>'q5' = 'training_consistency' then 'Training consistency'
      when r.reflection_answers->>'q5' = 'daily_movement' then 'Daily movement'
      when r.reflection_answers->>'q5' = 'meal_structure' then 'Meal structure / nutrition'
      when r.reflection_answers->>'q5' = 'food_availability' then 'Food availability / convenience'
      when r.reflection_answers->>'q5' = 'sleep' then 'Sleep'
      when r.reflection_answers->>'q5' = 'stress_downshift' then 'Stress / downshift'
      when r.reflection_answers->>'q5' = 'weekends' then 'Weekends'
      when r.reflection_answers->>'q5' = 'all_or_nothing' then 'All-or-nothing / plan fragility'
      when r.reflection_answers->>'q5' = 'environment' then 'Environment / defaults'
      when r.reflection_answers->>'q5' = 'overload' then 'Overload / lack of margin'
      when r.reflection_answers->>'q5' = 'support' then 'Support / accountability'
      when r.reflection_answers->>'q5' = 'recovery_depletion' then 'Recovery / unexplained depletion'
      when r.reflection_answers->>'q5' = 'physical' then 'Pain, injury, or physical limitation'
      else coalesce(r.reflection_answers->>'q5', 'Constraint')
    end;

    insert into fall_constraints (member_id, season, constraint_key, constraint_label, baseline_rating, baseline_date)
    values (r.member_id, r.season, coalesce(r.reflection_answers->>'q5', 'other'), v_label, r.baseline_constraint_impact, r.created_at::date)
    returning id into v_constraint_id;

    update fall_member_state set active_constraint_id = v_constraint_id where id = r.id;
    update fall_moves set constraint_id = v_constraint_id where member_id = r.member_id and season = r.season and constraint_id is null;
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- fall_moves — one row per Move assignment episode. Per the original scope doc, only
-- THREE statuses are ever persisted here — everything richer in Section 20's lifecycle
-- language (active_learning, active_building, integration_candidate, reactivated, etc.)
-- is recorded as an EVENT TYPE on fall_move_events instead, never as this column's value.
-- That's what "conceptual lifecycle stage (not DB status)" in Section 20 is telling us.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists fall_moves (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  season text not null default 'fall_2026',
  move_key text not null check (move_key in ('M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12')),
  dose text not null check (dose in ('anchor','builder','expansion')),
  -- 'integrated' added (2026-09-03) per the Fall App Implementation Handoff Section 4 — the
  -- coach-confirmed "Working On" -> "Integrated" transition. Unlike graduated/replaced,
  -- integrating does NOT clear fall_member_state.active_move_id — the Move stays the
  -- member's pointer (My Move shows it as "INTEGRATED ✓" instead of disappearing), and
  -- Working On/Integrated are display labels for 'active'/'integrated' respectively — no
  -- separate status value was added for "Working On".
  status text not null default 'active' check (status in ('active','graduated','replaced','integrated')),

  -- audit trail of what the deterministic matcher suggested at assignment time, so a
  -- later rule-table change doesn't rewrite history for Moves already assigned
  candidate_primary text,
  candidate_alternate text,

  coach_note text,

  -- Fall App Implementation Handoff, Section 2 — the specific agreed-on action, member-visible
  -- by design (distinct from coach_note above; both are shown to the member per David's call —
  -- the handoff's "do not publish existing notes" applied only if coach_note stayed private,
  -- which it doesn't here). Lives on the assignment, never the shared Move template.
  personalized_plan text check (char_length(personalized_plan) <= 300),

  -- Fall App Implementation Handoff, Section 1 — caps the highest weekly A/B/E role the
  -- existing getDeclaredWeek() algorithm may render while this Move is active. Never raises
  -- it. 'no_limit' (or null) means the algorithm's own result stands untouched.
  weekly_plan_limit text check (weekly_plan_limit in ('no_limit','anchor','builder','expansion')),

  -- Section 14 — snapshot of which constraint this assignment addressed, so "if the coach
  -- changes the Move but addresses the same constraint, keep the baseline" is provably true:
  -- a reassignment for the same constraint just stamps the same constraint_id again.
  constraint_id uuid references fall_constraints(id),

  assigned_at timestamptz not null default now(),
  closed_at timestamptz, -- set when status moves to graduated/replaced

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- fall_member_state — one row per member per season. Holds ONLY current state:
-- confirmed pathway, active Move pointer, dose, the raw Reflection answers, and the
-- one-time baseline Constraint Impact. Week 4 / Week 8 / exit Constraint Impact taps
-- live on fall_weekly_checks / fall_move_events instead (see below) — they're each
-- bundled into a specific dated event, not part of "current state."
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists fall_member_state (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  season text not null default 'fall_2026',

  -- Section 7 — Five Valid Pathways. Recomputed live from reflection_answers via
  -- matchCandidateMove() at Coach Snapshot time rather than persisted as a separate
  -- "candidate" column — see the note at the bottom of this file on that tradeoff.
  pathway text check (pathway in ('capacity_move','programming_adjustment','deeper_look_first','refer_evaluate','no_move_needed')),
  active_move_id uuid references fall_moves(id),
  dose text check (dose in ('anchor','builder','expansion')),

  reflection_answers jsonb, -- the { q1..q8, q5Other, baselineImpact } object from fall-reflection-ui.jsx
  stop_flagged boolean not null default false,
  baseline_constraint_impact smallint check (baseline_constraint_impact between 1 and 5), -- kept for compatibility; fall_constraints.baseline_rating (via active_constraint_id) is the source of truth as of Section 14

  -- Section 14 — "the baseline belongs to the constraint, not the Move." Points at the
  -- member's current fall_constraints row; set once at Reflection, unchanged by Move
  -- reassignments that address the same constraint (which is every reassignment today).
  active_constraint_id uuid references fall_constraints(id),

  scope_concern_flag boolean not null default false, -- coach-set manual override feeding fall-triage-data.js

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (member_id, season)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- fall_weekly_checks — one row per member per weekKey (Section 42: "at most one main
-- weekly check-in per weekKey"). Progressively filled in: the midweek reset (Wed) can
-- create/upsert the row with just the midweek_* columns; the main check-in (Sun) fills
-- in the rest. Week 4's reassessment (Section 19) is bundled onto THAT week's row rather
-- than a separate table, matching "no extra workflow."
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists fall_weekly_checks (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  season text not null default 'fall_2026',
  week_key text not null,       -- e.g. "fall_2026_w4" (Section 42)
  season_week smallint not null check (season_week between 1 and 8),
  move_id uuid references fall_moves(id), -- which Move this check-in was against, if any
  -- Data requirements (point 14) — snapshot of the dose/plan text being rated at submission
  -- time, so a later coach edit to the Move can't retroactively change what this feedback
  -- describes. move_id above is still the FK for joins; these two are the point-in-time copy.
  move_dose_snapshot text,
  move_plan_snapshot text,

  -- The 7 Spring-compatible Capacity Signals (Section 13.1) — same field names/option
  -- strings calcWeeklyScore() already expects, so scoring stays untouched.
  signals jsonb,             -- { workouts, zone2, strengthRPE, dailyMovement, protein, downshift, sleepOpportunity }
  habit_score smallint,      -- calcWeeklyScore(signals) result, stored for history like Spring's weeklyChecks[].score

  -- SUPERSEDED (2026-09-03) by the Fall App Implementation Handoff's simpler point-3
  -- questions below — left in place, unused, rather than dropped, since nothing surgical
  -- requires removing them and early staging test data may already reference them.
  move_level_reached text check (move_level_reached in ('Below Anchor','Anchor','Builder','Expansion')),
  helpfulness smallint check (helpfulness between 1 and 5),
  difficulty smallint check (difficulty between 1 and 5),
  friction_reason text,      -- a Q7_OPTIONS id from fall-reflection-data.js

  -- Fall App Implementation Handoff, Section 3 — the three weekly Move questions, all
  -- optional (never block submission; store unanswered as null, not zero/failure).
  move_used text check (move_used in ('never','sometimes','most_of_the_time','no_opportunity')),          -- Q1: Did you use it?
  move_helped text check (move_helped in ('not_really','somewhat','definitely','too_soon_to_tell')),        -- Q2: Did it help? (only asked if Q1 is sometimes/most_of_the_time)
  move_constraint_impact smallint check (move_constraint_impact between 1 and 5),                           -- Q3: same constraint-impact question as Reflection/end-of-season (Section 14)

  -- Section 13.4 — persistent help action; fires a Red flag immediately in the UI,
  -- this column is just the durable record of that tap
  help_requested boolean not null default false,

  -- Section 16 — midweek reset (Wed), independent of whether the main check-in (Sun)
  -- has happened yet for this week_key
  midweek_status text check (midweek_status in ('on_track','adjust','got_away')),
  midweek_shift_to_anchor boolean,

  -- Section 19 — Week-4 reassessment, bundled onto the Week-4 row only
  week4_still_important text check (week4_still_important in ('yes_still_most_important','no_improved','no_wrong_thing','not_sure')),
  week4_constraint_impact smallint check (week4_constraint_impact between 1 and 5),
  -- Same shape reused for Week 8 (Section 15: "Collect at Baseline, Week 4, and Week 8")
  week8_constraint_impact smallint check (week8_constraint_impact between 1 and 5),

  submitted_at timestamptz,  -- set when the main check-in (not just midweek) is filled in
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (member_id, week_key)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- fall_move_events — append-only. Every assignment, dose change, and closure gets a row
-- here; fall_moves.status only ever changes among the 3 locked values, but event_type
-- here can carry the fuller Section 20 vocabulary for history/analytics without violating
-- that constraint.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists fall_move_events (
  id uuid primary key default gen_random_uuid(),
  move_id uuid not null references fall_moves(id),
  member_id text not null, -- denormalized for easy querying without a join

  -- 'integrated' added (2026-09-03, Section 4) — distinct from 'integration_candidate' above,
  -- which was the older, still-unused Section 20 "flagged as a candidate" concept.
  event_type text not null check (event_type in ('assigned','dose_changed','coach_note_added','integration_candidate','integrated','graduated','replaced','reactivated')),

  -- Section 28 — structured reasons, one tap not notes. Required on dose_changed/replaced;
  -- optional elsewhere.
  structured_reason text check (structured_reason in (
    'wrong_constraint','constraint_correct_mechanism_wrong','constraint_mechanism_correct_move_wrong',
    'objective_information_changed','member_clarified','move_not_helping','move_too_difficult',
    'constraint_improved','life_circumstances_changed','programming_issue','safety_scope_concern',
    'no_meaningful_problem','other'
  )),
  coach_note text,

  -- Section 41 — one extra Constraint Impact tap, only when a Move closes BEFORE its next
  -- scheduled Week-4/Week-8 measurement. Populated only on early graduated/replaced events.
  exit_constraint_impact smallint check (exit_constraint_impact between 1 and 5),

  occurred_at timestamptz not null default now()
);

create index if not exists idx_fall_weekly_checks_member on fall_weekly_checks (member_id, season);
create index if not exists idx_fall_moves_member on fall_moves (member_id, season);
create index if not exists idx_fall_move_events_move on fall_move_events (move_id);


-- ═════════════════════════════════════════════════════════════════════════════
-- RPC patch functions — per the architecture decision to prefer targeted patches over
-- whole-row upserts, avoiding races between coach and member edits touching the same row.
-- ═════════════════════════════════════════════════════════════════════════════

-- Reflection complete (Section 14) — creates the member's fall_constraints record and points
-- fall_member_state at it, atomically, so the constraint's baseline/date/label can never exist
-- without a member_state row (or vice versa) pointing at the wrong one mid-write.
create or replace function fall_complete_reflection(
  p_member_id text, p_season text, p_reflection_answers jsonb, p_stop_flagged boolean,
  p_constraint_key text, p_constraint_label text, p_baseline_rating smallint
) returns uuid as $$
declare
  v_constraint_id uuid;
begin
  insert into fall_constraints (member_id, season, constraint_key, constraint_label, baseline_rating, baseline_date)
  values (p_member_id, p_season, p_constraint_key, p_constraint_label, p_baseline_rating, current_date)
  returning id into v_constraint_id;

  insert into fall_member_state (member_id, season, reflection_answers, stop_flagged, baseline_constraint_impact, active_constraint_id)
  values (p_member_id, p_season, p_reflection_answers, p_stop_flagged, p_baseline_rating, v_constraint_id)
  on conflict (member_id, season) do update
    set reflection_answers = excluded.reflection_answers, stop_flagged = excluded.stop_flagged,
        baseline_constraint_impact = excluded.baseline_constraint_impact,
        active_constraint_id = excluded.active_constraint_id, updated_at = now();

  return v_constraint_id;
end;
$$ language plpgsql;

-- Midweek reset (Wed) — creates or patches just the midweek columns on that week's row,
-- never touching signals/move-question columns the main check-in owns.
create or replace function fall_upsert_midweek(
  p_member_id text, p_season text, p_week_key text, p_season_week smallint,
  p_status text, p_shift_to_anchor boolean
) returns void as $$
begin
  insert into fall_weekly_checks (member_id, season, week_key, season_week, midweek_status, midweek_shift_to_anchor)
  values (p_member_id, p_season, p_week_key, p_season_week, p_status, p_shift_to_anchor)
  on conflict (member_id, week_key) do update
    set midweek_status = excluded.midweek_status,
        midweek_shift_to_anchor = excluded.midweek_shift_to_anchor,
        updated_at = now();
end;
$$ language plpgsql;

-- Main weekly check-in (Sun) — patches the check-in columns only, preserving whatever
-- midweek_* values already landed earlier in the week.
-- MIGRATION (2026-09-03, point 3): signature swaps the old p_move_level_reached/p_helpfulness/
-- p_difficulty/p_friction_reason for the new, simpler p_move_used/p_move_helped/
-- p_move_constraint_impact — drop the old 12-arg version first (new arg list = new overload).
-- MIGRATION (2026-09-03, point 14): signature gained p_move_dose_snapshot/p_move_plan_snapshot
-- — drop that 11-arg version too.
drop function if exists fall_submit_weekly_checkin(text, text, text, smallint, uuid, jsonb, smallint, text, smallint, smallint, text, boolean);
drop function if exists fall_submit_weekly_checkin(text, text, text, smallint, uuid, jsonb, smallint, text, text, smallint, boolean);
create or replace function fall_submit_weekly_checkin(
  p_member_id text, p_season text, p_week_key text, p_season_week smallint, p_move_id uuid,
  p_signals jsonb, p_habit_score smallint, p_move_used text, p_move_helped text,
  p_move_constraint_impact smallint, p_help_requested boolean,
  p_move_dose_snapshot text, p_move_plan_snapshot text
) returns void as $$
begin
  insert into fall_weekly_checks (member_id, season, week_key, season_week, move_id, signals, habit_score, move_used, move_helped, move_constraint_impact, help_requested, move_dose_snapshot, move_plan_snapshot, submitted_at)
  values (p_member_id, p_season, p_week_key, p_season_week, p_move_id, p_signals, p_habit_score, p_move_used, p_move_helped, p_move_constraint_impact, p_help_requested, p_move_dose_snapshot, p_move_plan_snapshot, now())
  on conflict (member_id, week_key) do update
    set move_id = excluded.move_id, signals = excluded.signals, habit_score = excluded.habit_score,
        move_used = excluded.move_used, move_helped = excluded.move_helped,
        move_constraint_impact = excluded.move_constraint_impact,
        help_requested = excluded.help_requested,
        move_dose_snapshot = excluded.move_dose_snapshot, move_plan_snapshot = excluded.move_plan_snapshot,
        submitted_at = now(), updated_at = now();
end;
$$ language plpgsql;

-- Coach confirms a Capacity Move (FallCoachSnapshot.onConfirm) — assigns the Move,
-- logs the event, and points fall_member_state at it, atomically.
-- MIGRATION (2026-09-03): signature gained p_weekly_plan_limit, then p_personalized_plan —
-- Postgres treats a changed argument list as a new overload, so drop prior versions first.
-- MIGRATION (2026-09-03, point 14): no new param — constraint_id is looked up server-side
-- from fall_member_state.active_constraint_id rather than passed in, so the link can never
-- drift from whatever the member's actual current constraint record is.
drop function if exists fall_confirm_move(text, text, text, text, text, text, text);
drop function if exists fall_confirm_move(text, text, text, text, text, text, text, text);
create or replace function fall_confirm_move(
  p_member_id text, p_season text, p_move_key text, p_dose text,
  p_candidate_primary text, p_candidate_alternate text, p_coach_note text, p_weekly_plan_limit text,
  p_personalized_plan text
) returns uuid as $$
declare
  v_move_id uuid;
  v_constraint_id uuid;
begin
  select active_constraint_id into v_constraint_id from fall_member_state
  where member_id = p_member_id and season = p_season;

  insert into fall_moves (member_id, season, move_key, dose, status, candidate_primary, candidate_alternate, coach_note, weekly_plan_limit, personalized_plan, constraint_id)
  values (p_member_id, p_season, p_move_key, p_dose, 'active', p_candidate_primary, p_candidate_alternate, p_coach_note, p_weekly_plan_limit, p_personalized_plan, v_constraint_id)
  returning id into v_move_id;

  insert into fall_move_events (move_id, member_id, event_type, coach_note)
  values (v_move_id, p_member_id, 'assigned', p_coach_note);

  insert into fall_member_state (member_id, season, pathway, active_move_id, dose)
  values (p_member_id, p_season, 'capacity_move', v_move_id, p_dose)
  on conflict (member_id, season) do update
    set pathway = 'capacity_move', active_move_id = v_move_id, dose = p_dose, updated_at = now();

  return v_move_id;
end;
$$ language plpgsql;

-- Coach records a non-Move pathway decision (Programming Adjustment / Deeper Look First /
-- Refer-Evaluate / No Move Needed) — no fall_moves row exists for these, per the four-table
-- design; the decision just lives as current state on fall_member_state.
create or replace function fall_set_pathway(
  p_member_id text, p_season text, p_pathway text
) returns void as $$
begin
  insert into fall_member_state (member_id, season, pathway, active_move_id, dose)
  values (p_member_id, p_season, p_pathway, null, null)
  on conflict (member_id, season) do update
    set pathway = p_pathway, active_move_id = null, dose = null, updated_at = now();
end;
$$ language plpgsql;

-- Closes a Move (graduated or replaced) — logs the event (with the Section 28 structured
-- reason and, if this is an early close, the Section 41 exit Constraint Impact tap) and
-- clears fall_member_state's pointer if it was pointing at this Move.
create or replace function fall_close_move(
  p_move_id uuid, p_member_id text, p_event_type text,
  p_structured_reason text, p_coach_note text, p_exit_constraint_impact smallint
) returns void as $$
begin
  update fall_moves set status = p_event_type, closed_at = now(), updated_at = now() where id = p_move_id;

  insert into fall_move_events (move_id, member_id, event_type, structured_reason, coach_note, exit_constraint_impact)
  values (p_move_id, p_member_id, p_event_type, p_structured_reason, p_coach_note, p_exit_constraint_impact);

  update fall_member_state set active_move_id = null, dose = null, updated_at = now()
  where active_move_id = p_move_id;
end;
$$ language plpgsql;

-- Coach marks a Move Integrated (Section 4) — a coach-confirmed transition, not a close.
-- Deliberately does NOT touch fall_member_state.active_move_id/dose: the Move stays the
-- member's pointer so My Move keeps showing it (as "INTEGRATED ✓"). "Working On" has no
-- separate status value — it's just the display label for 'active'.
create or replace function fall_mark_integrated(
  p_move_id uuid, p_member_id text
) returns void as $$
begin
  update fall_moves set status = 'integrated', updated_at = now() where id = p_move_id;

  insert into fall_move_events (move_id, member_id, event_type)
  values (p_move_id, p_member_id, 'integrated');
end;
$$ language plpgsql;

-- Coach adds/edits the note on an already-active Move (Section 5 Coach Snapshot follow-up).
-- Patches fall_moves.coach_note directly (so the member's My Move tab picks it up on next
-- load) and logs a coach_note_added event for the audit trail.
create or replace function fall_add_coach_note(
  p_move_id uuid, p_member_id text, p_coach_note text
) returns void as $$
begin
  update fall_moves set coach_note = p_coach_note, updated_at = now() where id = p_move_id;

  insert into fall_move_events (move_id, member_id, event_type, coach_note)
  values (p_move_id, p_member_id, 'coach_note_added', p_coach_note);
end;
$$ language plpgsql;

-- Coach sets/edits the personalized plan on an already-active Move (Section 2). A plain
-- setting like weekly_plan_limit below — not a lifecycle event, no event log entry.
create or replace function fall_set_personalized_plan(
  p_move_id uuid, p_personalized_plan text
) returns void as $$
begin
  update fall_moves set personalized_plan = p_personalized_plan, updated_at = now() where id = p_move_id;
end;
$$ language plpgsql;

-- Coach changes the A/B/E dose on an already-active Move (Section 12) without closing it.
-- Patches fall_moves.dose and, if this Move is still the member's active one, fall_member_state.dose
-- too, so the member's prescribed dose updates without a full re-assignment.
create or replace function fall_change_dose(
  p_move_id uuid, p_member_id text, p_season text, p_dose text,
  p_structured_reason text, p_coach_note text
) returns void as $$
begin
  update fall_moves set dose = p_dose, updated_at = now() where id = p_move_id;

  insert into fall_move_events (move_id, member_id, event_type, structured_reason, coach_note)
  values (p_move_id, p_member_id, 'dose_changed', p_structured_reason, p_coach_note);

  update fall_member_state set dose = p_dose, updated_at = now()
  where member_id = p_member_id and season = p_season and active_move_id = p_move_id;
end;
$$ language plpgsql;

-- Coach adjusts the weekly plan limit on an already-active Move (Section 1 of the Fall App
-- Implementation Handoff). A plain setting, not a lifecycle decision — no structured reason,
-- no event log entry, unlike dose changes and closures.
create or replace function fall_set_weekly_plan_limit(
  p_move_id uuid, p_weekly_plan_limit text
) returns void as $$
begin
  update fall_moves set weekly_plan_limit = p_weekly_plan_limit, updated_at = now() where id = p_move_id;
end;
$$ language plpgsql;


-- ═════════════════════════════════════════════════════════════════════════════
-- Notes / deliberate tradeoffs
-- ═════════════════════════════════════════════════════════════════════════════
-- 1. Privacy separation (the handoff's "never expose Reflection data in pod views"): this
--    schema does not add Row Level Security policies, because Spring's own tables don't use
--    RLS either — the whole app runs on the anon key with no real auth. Adding RLS here
--    would be a bigger, unrequested security-model change. The actual protection has to be
--    at the query/component layer: never SELECT reflection_answers (or anything from
--    fall_member_state) into a pod component's query. Worth a real RLS pass before Fall
--    goes broad-scale, same as the coach-PIN concern already flagged for Fall.
-- 2. candidate_primary/candidate_alternate on fall_moves are stored for audit history at
--    assignment time. The Coach Snapshot screen itself (fall-coach-snapshot-ui.jsx) should
--    call matchCandidateMove() live against fall_member_state.reflection_answers rather
--    than reading a persisted candidate column — that way a future rule-table refinement
--    applies going forward without a backfill migration. The persisted columns above exist
--    only so a past assignment's original rationale isn't lost if the rules later change.
-- 3. member_id is TEXT everywhere, not a hard FK, until you've confirmed the real
--    `members` primary key column/type in the Supabase dashboard (see the top-of-file note).
