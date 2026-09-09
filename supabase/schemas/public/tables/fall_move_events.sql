CREATE TABLE "public"."fall_move_events" (
  "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "move_id"                uuid                     NOT NULL,
  "member_id"              text                     NOT NULL,
  "event_type"             text                     NOT NULL,
  "structured_reason"      text,
  "coach_note"             text,
  "exit_constraint_impact" smallint,
  "occurred_at"            timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "fall_move_events_event_type_check"
    CHECK
    ((event_type = ANY (ARRAY['assigned'::text, 'dose_changed'::text, 'coach_note_added'::text, 'integration_candidate'::text, 'integrated'::text, 'graduated'::text,
    'replaced'::text, 'reactivated'::text]))),
  CONSTRAINT "fall_move_events_exit_constraint_impact_check" CHECK (((exit_constraint_impact >= 1) AND (exit_constraint_impact <= 5))),
  CONSTRAINT "fall_move_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "fall_move_events_structured_reason_check"
    CHECK
    ((structured_reason = ANY (ARRAY['wrong_constraint'::text, 'constraint_correct_mechanism_wrong'::text, 'constraint_mechanism_correct_move_wrong'::text,
    'objective_information_changed'::text,
    'member_clarified'::text,
    'move_not_helping'::text,
    'move_too_difficult'::text,
    'constraint_improved'::text,
    'life_circumstances_changed'::text,
    'programming_issue'::text,
    'safety_scope_concern'::text,
    'no_meaningful_problem'::text,
    'other'::text,
    'different_mechanism_identified'::text, 'better_fit_for_member'::text, 'easier_to_execute'::text, 'structural_overload'::text, 'new_information_from_conversation'::text]))),
  CONSTRAINT "fall_move_events_move_id_fkey" FOREIGN KEY (move_id) REFERENCES public.fall_moves(id)
);

CREATE INDEX idx_fall_move_events_move ON public.fall_move_events USING btree (move_id);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fall_move_events" TO "anon", "authenticated", "postgres", "service_role";
