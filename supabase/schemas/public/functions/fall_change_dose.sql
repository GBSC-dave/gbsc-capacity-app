CREATE OR REPLACE FUNCTION public.fall_change_dose (
  p_move_id           uuid,
  p_member_id         text,
  p_season            text,
  p_dose              text,
  p_structured_reason text,
  p_coach_note        text
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  update fall_moves set dose = p_dose, updated_at = now() where id = p_move_id;

  insert into fall_move_events (move_id, member_id, event_type, structured_reason, coach_note)
  values (p_move_id, p_member_id, 'dose_changed', p_structured_reason, p_coach_note);

  update fall_member_state set dose = p_dose, updated_at = now()
  where member_id = p_member_id and season = p_season and active_move_id = p_move_id;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_change_dose"(uuid, text, text, text, text, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
