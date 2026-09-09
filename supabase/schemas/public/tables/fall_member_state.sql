CREATE TABLE "public"."fall_member_state" (
  "id"                         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "member_id"                  text                     NOT NULL,
  "season"                     text                     NOT NULL DEFAULT 'fall_2026'::text,
  "pathway"                    text,
  "active_move_id"             uuid,
  "dose"                       text,
  "reflection_answers"         jsonb,
  "stop_flagged"               boolean                  NOT NULL DEFAULT false,
  "baseline_constraint_impact" smallint,
  "scope_concern_flag"         boolean                  NOT NULL DEFAULT false,
  "created_at"                 timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"                 timestamp with time zone NOT NULL DEFAULT now(),
  "active_constraint_id"       uuid,
  CONSTRAINT "fall_member_state_active_constraint_id_fkey" FOREIGN KEY (active_constraint_id) REFERENCES public.fall_constraints(id),
  CONSTRAINT "fall_member_state_baseline_constraint_impact_check" CHECK (((baseline_constraint_impact >= 1) AND (baseline_constraint_impact <= 5))),
  CONSTRAINT "fall_member_state_dose_check" CHECK ((dose = ANY (ARRAY['anchor'::text, 'builder'::text, 'expansion'::text]))),
  CONSTRAINT "fall_member_state_member_id_season_key" UNIQUE (member_id, season),
  CONSTRAINT "fall_member_state_pathway_check"
    CHECK ((pathway = ANY (ARRAY['capacity_move'::text, 'programming_adjustment'::text, 'deeper_look_first'::text, 'refer_evaluate'::text, 'no_move_needed'::text]))),
  CONSTRAINT "fall_member_state_pkey" PRIMARY KEY (id),
  CONSTRAINT "fall_member_state_active_move_id_fkey" FOREIGN KEY (active_move_id) REFERENCES public.fall_moves(id)
);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fall_member_state" TO "anon", "authenticated", "postgres", "service_role";
