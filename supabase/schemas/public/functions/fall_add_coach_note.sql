CREATE OR REPLACE FUNCTION public.fall_add_coach_note (
  p_move_id    uuid,
  p_member_id  text,
  p_coach_note text
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  update fall_moves set coach_note = p_coach_note, updated_at = now() where id = p_move_id;

  insert into fall_move_events (move_id, member_id, event_type, coach_note)
  values (p_move_id, p_member_id, 'coach_note_added', p_coach_note);
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_add_coach_note"(uuid, text, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
