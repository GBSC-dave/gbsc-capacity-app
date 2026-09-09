CREATE OR REPLACE FUNCTION public.fall_complete_reflection (
  p_member_id          text,
  p_season             text,
  p_reflection_answers jsonb,
  p_stop_flagged       boolean,
  p_constraint_key     text,
  p_constraint_label   text,
  p_baseline_rating    smallint
)
  RETURNS uuid
  LANGUAGE plpgsql
  AS $function$
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
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_complete_reflection"(text, text, jsonb, boolean, text, text, smallint) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
