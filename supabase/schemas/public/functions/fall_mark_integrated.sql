CREATE OR REPLACE FUNCTION public.fall_mark_integrated (
  p_move_id   uuid,
  p_member_id text
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  update fall_moves set status = 'integrated', updated_at = now() where id = p_move_id;

  insert into fall_move_events (move_id, member_id, event_type)
  values (p_move_id, p_member_id, 'integrated');
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_mark_integrated"(uuid, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
