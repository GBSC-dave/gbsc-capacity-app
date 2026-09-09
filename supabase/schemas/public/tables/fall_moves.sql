CREATE TABLE "public"."fall_moves" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "member_id"           text                     NOT NULL,
  "season"              text                     NOT NULL DEFAULT 'fall_2026'::text,
  "move_key"            text                     NOT NULL,
  "dose"                text                     NOT NULL,
  "status"              text                     NOT NULL DEFAULT 'active'::text,
  "candidate_primary"   text,
  "candidate_alternate" text,
  "coach_note"          text,
  "assigned_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "closed_at"           timestamp with time zone,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "weekly_plan_limit"   text,
  "personalized_plan"   text,
  "constraint_id"       uuid,
  CONSTRAINT "fall_moves_constraint_id_fkey" FOREIGN KEY (constraint_id) REFERENCES public.fall_constraints(id),
  CONSTRAINT "fall_moves_dose_check" CHECK ((dose = ANY (ARRAY['anchor'::text, 'builder'::text, 'expansion'::text]))),
  CONSTRAINT "fall_moves_move_key_check"
    CHECK
    ((move_key = ANY (ARRAY['M1'::text, 'M2'::text, 'M3'::text, 'M4'::text, 'M5'::text, 'M6'::text, 'M7'::text, 'M8'::text, 'M9'::text, 'M10'::text, 'M11'::text, 'M12'::text]))),
  CONSTRAINT "fall_moves_personalized_plan_check" CHECK ((char_length(personalized_plan) <= 300)),
  CONSTRAINT "fall_moves_pkey" PRIMARY KEY (id),
  CONSTRAINT "fall_moves_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'graduated'::text, 'replaced'::text, 'integrated'::text]))),
  CONSTRAINT "fall_moves_weekly_plan_limit_check" CHECK ((weekly_plan_limit = ANY (ARRAY['no_limit'::text, 'anchor'::text, 'builder'::text, 'expansion'::text])))
);

CREATE INDEX idx_fall_moves_member ON public.fall_moves USING btree (member_id, season);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fall_moves" TO "anon", "authenticated", "postgres", "service_role";
