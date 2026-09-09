CREATE OR REPLACE FUNCTION public.fall_submit_weekly_checkin (
  p_member_id               text,
  p_season                  text,
  p_week_key                text,
  p_season_week             smallint,
  p_move_id                 uuid,
  p_signals                 jsonb,
  p_habit_score             smallint,
  p_move_used               text,
  p_move_helped             text,
  p_move_constraint_impact  smallint,
  p_help_requested          boolean,
  p_move_dose_snapshot      text,
  p_move_plan_snapshot      text,
  p_week4_still_important   text,
  p_week4_constraint_impact smallint,
  p_week8_constraint_impact smallint
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  insert into fall_weekly_checks (member_id, season, week_key, season_week, move_id, signals, habit_score, move_used, move_helped, move_constraint_impact, help_requested, move_dose_snapshot, move_plan_snapshot, week4_still_important, week4_constraint_impact, week8_constraint_impact, submitted_at)
  values (p_member_id, p_season, p_week_key, p_season_week, p_move_id, p_signals, p_habit_score, p_move_used, p_move_helped, p_move_constraint_impact, p_help_requested, p_move_dose_snapshot, p_move_plan_snapshot, p_week4_still_important, p_week4_constraint_impact, p_week8_constraint_impact, now())
  on conflict (member_id, week_key) do update
    set move_id = excluded.move_id, signals = excluded.signals, habit_score = excluded.habit_score,
        move_used = excluded.move_used, move_helped = excluded.move_helped,
        move_constraint_impact = excluded.move_constraint_impact,
        help_requested = excluded.help_requested,
        move_dose_snapshot = excluded.move_dose_snapshot, move_plan_snapshot = excluded.move_plan_snapshot,
        week4_still_important = excluded.week4_still_important,
        week4_constraint_impact = excluded.week4_constraint_impact,
        week8_constraint_impact = excluded.week8_constraint_impact,
        submitted_at = now(), updated_at = now();
end;
$function$;

GRANT EXECUTE
  ON FUNCTION "public"."fall_submit_weekly_checkin"(text, text, text, smallint, uuid, jsonb, smallint, text, text, smallint, boolean, text, text, text, smallint, smallint)
  TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
