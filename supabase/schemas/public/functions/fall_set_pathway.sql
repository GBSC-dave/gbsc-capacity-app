CREATE OR REPLACE FUNCTION public.fall_set_pathway (
  p_member_id text,
  p_season    text,
  p_pathway   text
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  insert into fall_member_state (member_id, season, pathway, active_move_id, dose)
  values (p_member_id, p_season, p_pathway, null, null)
  on conflict (member_id, season) do update
    set pathway = p_pathway, active_move_id = null, dose = null, updated_at = now();
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_set_pathway"(text, text, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
