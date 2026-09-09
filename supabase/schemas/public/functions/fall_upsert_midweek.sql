CREATE OR REPLACE FUNCTION public.fall_upsert_midweek (
  p_member_id       text,
  p_season          text,
  p_week_key        text,
  p_season_week     smallint,
  p_status          text,
  p_shift_to_anchor boolean
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  insert into fall_weekly_checks (member_id, season, week_key, season_week, midweek_status, midweek_shift_to_anchor)
  values (p_member_id, p_season, p_week_key, p_season_week, p_status, p_shift_to_anchor)
  on conflict (member_id, week_key) do update
    set midweek_status = excluded.midweek_status,
        midweek_shift_to_anchor = excluded.midweek_shift_to_anchor,
        updated_at = now();
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."fall_upsert_midweek"(text, text, text, smallint, text, boolean) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
