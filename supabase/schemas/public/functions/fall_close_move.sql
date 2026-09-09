CREATE OR REPLACE FUNCTION public.fall_close_move (
  p_move_id                uuid,
  p_member_id              text,
  p_event_type             text,
  p_structured_reason      text,
  p_coach_note             text,
  p_exit_constraint_impact smallint
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  update fall_moves set status = p_event_type, closed_at = now(), updated_at = now() where id = p_move_id;

  insert into fall_move_events (move_id, member_id, event_type, structured_reason, coach_note, exit_constraint_impact)
  values (p_move_id, p_member_id, p_event_type, p_structured_reason, p_coach_note, p_exit_constraint_impact);

  update fall_member_state set active_move_id = null, dose = null, updated_at = now()
  where active_move_id = p_move_id;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_close_move"(uuid, text, text, text, text, smallint) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
