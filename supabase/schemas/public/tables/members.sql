CREATE TABLE "public"."members" (
  "id"         text                     NOT NULL,
  "data"       jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "members_pkey" PRIMARY KEY (id)
);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."members" TO "anon", "authenticated", "postgres", "service_role";
