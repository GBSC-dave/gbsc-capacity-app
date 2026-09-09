CREATE OR REPLACE FUNCTION public.fall_set_personalized_plan (
  p_move_id           uuid,
  p_personalized_plan text
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  update fall_moves set personalized_plan = p_personalized_plan, updated_at = now() where id = p_move_id;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_set_personalized_plan"(uuid, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
