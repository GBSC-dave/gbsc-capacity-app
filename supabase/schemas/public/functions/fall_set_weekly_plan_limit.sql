CREATE OR REPLACE FUNCTION public.fall_set_weekly_plan_limit (
  p_move_id           uuid,
  p_weekly_plan_limit text
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  update fall_moves set weekly_plan_limit = p_weekly_plan_limit, updated_at = now() where id = p_move_id;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_set_weekly_plan_limit"(uuid, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
