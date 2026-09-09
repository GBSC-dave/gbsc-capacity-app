CREATE OR REPLACE FUNCTION public.fall_set_scope_concern_flag (
  p_member_id text,
  p_season    text,
  p_flag      boolean
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  update fall_member_state set scope_concern_flag = p_flag, updated_at = now()
  where member_id = p_member_id and season = p_season;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_set_scope_concern_flag"(text, text, boolean) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
