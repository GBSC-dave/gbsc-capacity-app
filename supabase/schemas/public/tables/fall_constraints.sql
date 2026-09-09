CREATE TABLE "public"."fall_constraints" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "member_id"        text                     NOT NULL,
  "season"           text                     NOT NULL DEFAULT 'fall_2026'::text,
  "constraint_key"   text                     NOT NULL,
  "constraint_label" text                     NOT NULL,
  "baseline_rating"  smallint                 NOT NULL,
  "baseline_date"    date                     NOT NULL,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "fall_constraints_baseline_rating_check" CHECK (((baseline_rating >= 1) AND (baseline_rating <= 5))),
  CONSTRAINT "fall_constraints_pkey" PRIMARY KEY (id)
);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fall_constraints" TO "anon", "authenticated", "postgres", "service_role";
