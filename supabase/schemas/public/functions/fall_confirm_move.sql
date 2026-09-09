CREATE OR REPLACE FUNCTION public.fall_confirm_move (
  p_member_id           text,
  p_season              text,
  p_move_key            text,
  p_dose                text,
  p_candidate_primary   text,
  p_candidate_alternate text,
  p_coach_note          text,
  p_weekly_plan_limit   text,
  p_personalized_plan   text,
  p_override_reason     text
)
  RETURNS uuid
  LANGUAGE plpgsql
  AS $function$
declare
  v_move_id uuid;
  v_constraint_id uuid;
begin
  select active_constraint_id into v_constraint_id from fall_member_state
  where member_id = p_member_id and season = p_season;

  insert into fall_moves (member_id, season, move_key, dose, status, candidate_primary, candidate_alternate, coach_note, weekly_plan_limit, personalized_plan, constraint_id)
  values (p_member_id, p_season, p_move_key, p_dose, 'active', p_candidate_primary, p_candidate_alternate, p_coach_note, p_weekly_plan_limit, p_personalized_plan, v_constraint_id)
  returning id into v_move_id;

  insert into fall_move_events (move_id, member_id, event_type, coach_note, structured_reason)
  values (v_move_id, p_member_id, 'assigned', p_coach_note, p_override_reason);

  insert into fall_member_state (member_id, season, pathway, active_move_id, dose)
  values (p_member_id, p_season, 'capacity_move', v_move_id, p_dose)
  on conflict (member_id, season) do update
    set pathway = 'capacity_move', active_move_id = v_move_id, dose = p_dose, updated_at = now();

  return v_move_id;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_confirm_move"(text, text, text, text, text, text, text, text, text, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
