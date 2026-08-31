// Fall 2026 — Deterministic Capacity Move matching
// Source: GBSC Fall 2026 Capacity Method — Dave Handoff Source of Truth v4 Final,
// Section 6 (Mature Matching Algorithm), Section 7 (Five Valid Pathways), Section 9 (Locked Default Matching Map).
//
// Rule tables only — no LLM calls, per project constraint. Returns at most a primary + alternate
// Move candidate. The coach always confirms (or overrides) before a Move goes active — this module
// never assigns a Move on its own.

import { isStopFlagged } from "./fall-reflection-data.js";

export const PATHWAYS = {
  CAPACITY_MOVE: "capacity_move",
  PROGRAMMING_ADJUSTMENT: "programming_adjustment",
  DEEPER_LOOK: "deeper_look_first",
  REFER_EVALUATE: "refer_evaluate",
  NO_MOVE_NEEDED: "no_move_needed",
};

// Section 28 — "Structured Reasons, One Tap Not Notes." Used whenever a coach changes a
// Move's dose or closes it (graduated/replaced). Values match fall_move_events.structured_reason's
// check constraint in fall-schema.sql exactly — keep both lists in sync.
export const STRUCTURED_REASONS = [
  { id: "wrong_constraint", label: "Wrong constraint" },
  { id: "constraint_correct_mechanism_wrong", label: "Constraint correct, mechanism wrong" },
  { id: "constraint_mechanism_correct_move_wrong", label: "Constraint/mechanism correct, Move wrong" },
  { id: "objective_information_changed", label: "Objective information changed decision" },
  { id: "member_clarified", label: "Member clarified something important" },
  { id: "move_not_helping", label: "Move not helping" },
  { id: "move_too_difficult", label: "Move too difficult" },
  { id: "constraint_improved", label: "Constraint improved" },
  { id: "life_circumstances_changed", label: "Life circumstances changed" },
  { id: "programming_issue", label: "Programming issue" },
  { id: "safety_scope_concern", label: "Safety/scope concern" },
  { id: "no_meaningful_problem", label: "No meaningful problem to solve" },
  { id: "other", label: "Other" },
];

// Terrains with no locked default in Section 9 — the mechanism is genuinely ambiguous by spec
// (Section 6.1 SAFE / Section 7: "Constraint/mechanism remains ambiguous... -> Deeper Look First").
// recovery_depletion mixes several distinct possible root causes (training load, sleep, chronic
// push, or truly unexplained) that Section 9's table does not resolve to one Move.
const NO_DEFAULT_TERRAINS = new Set(["recovery_depletion", "physical"]);

// One row per Section 9 terrain. `primary`/`alternate` are the locked default pair.
// `flipWhen` is only used for the handful of cases where a specific Q6 mechanism ID or Q8 function
// answer unambiguously matches the override text — everything else is left as coach judgment
// during the five-minute conversation (Section 8), consistent with "coach always confirms."
export const MATCHING_RULES = {
  training_consistency: {
    primary: "M1",
    alternate: "M9",
    overrideNote: "Plan fragility/temporary chaos -> M9 (Section 9).",
    flipWhen: (a) => a.q6 === "plan_fragile",
  },
  daily_movement: {
    primary: "M2",
    alternate: null,
    overrideNote: "Physical limitation -> coach review, not an alternate Move (Section 9). Handled via stop flag.",
  },
  meal_structure: {
    primary: "M3",
    alternate: "M4",
    overrideNote: "If availability (not structure) turns out to be the actual issue, use M4 instead (Section 9). No single Reflection answer unambiguously signals this — coach judgment call during the conversation.",
  },
  food_availability: {
    primary: "M4",
    alternate: "M10",
    overrideNote: "If a single environmental default can solve it, Change the Environment may be the higher-leverage Move (Section 9).",
  },
  sleep: {
    // Section 9 has two default rows for this terrain, split by mechanism.
    byMechanism: {
      too_little_opportunity: {
        primary: "M6",
        alternate: "M11",
        overrideNote: "Chronic structural overload -> M11 (Section 9). No single answer unambiguously signals chronic vs. temporary — coach judgment call.",
      },
      personal_time: { primary: "M5", alternate: "M7", overrideNote: "Escape/regulation function -> M7 (Section 6.4)." },
      screens: { primary: "M5", alternate: "M7", overrideNote: "Escape/regulation function -> M7 (Section 6.4)." },
      work_tasks: { primary: "M5", alternate: "M7", overrideNote: "Escape/regulation function -> M7 (Section 6.4)." },
      family_schedule: { primary: "M5", alternate: "M7", overrideNote: "Escape/regulation function -> M7 (Section 6.4)." },
    },
    flipWhen: (a) => a.q8 === "relaxation_escape",
  },
  stress_downshift: {
    primary: "M7",
    alternate: "M11",
    overrideNote: "Structural overload -> M11 (Section 9).",
    flipWhen: (a) => a.q6 === "life_too_full",
  },
  weekends: {
    primary: "M8",
    alternate: "M7",
    overrideNote: "Escape/regulation function -> M7 (Section 6.4).",
    flipWhen: (a) => a.q8 === "relaxation_escape",
  },
  all_or_nothing: {
    primary: "M9",
    alternate: "M1",
    overrideNote: "If this is simple scheduling only, M1 may be the better fit (Section 9). No single answer unambiguously signals this — coach judgment call.",
  },
  environment: {
    primary: "M10",
    alternate: null,
    overrideNote: "Use only when environment is truly the upstream driver, not a proxy for something else (Section 9).",
  },
  overload: {
    primary: "M11",
    alternate: "M9",
    overrideNote: "Temporary (not chronic) overload -> M9 (Section 9).",
    flipWhen: (a) => a.q6 === "temporary",
  },
  support: {
    primary: "M12",
    alternate: null,
    overrideNote: "If the same logistical barrier remains underneath, solve that upstream barrier instead of just adding support (Section 9).",
  },
};

/**
 * Deterministic candidate match for one Reflection submission.
 * @param {{ q5: string, q6: string, q8?: string }} answers
 * @returns {{ pathway: string|null, primary: string|null, alternate: string|null, requiresCoachReview: boolean, note: string|null }}
 */
export function matchCandidateMove({ q5, q6, q8 }) {
  if (isStopFlagged({ q5, q6 })) {
    return {
      pathway: null,
      primary: null,
      alternate: null,
      requiresCoachReview: true,
      note: "Stop flag triggered (Section 6.1 SAFE) — coach selects Programming Adjustment / Deeper Look First / Refer-Evaluate / No Move Needed manually.",
    };
  }

  if (NO_DEFAULT_TERRAINS.has(q5)) {
    return {
      pathway: PATHWAYS.DEEPER_LOOK,
      primary: null,
      alternate: null,
      requiresCoachReview: true,
      note: "No locked default for this terrain — mechanism is ambiguous by spec (Section 7: Deeper Look First).",
    };
  }

  const rule = MATCHING_RULES[q5];
  if (!rule) {
    return {
      pathway: PATHWAYS.DEEPER_LOOK,
      primary: null,
      alternate: null,
      requiresCoachReview: true,
      note: `Unrecognized terrain "${q5}" — route to Deeper Look First.`,
    };
  }

  const row = rule.byMechanism ? rule.byMechanism[q6] : rule;
  if (!row) {
    return {
      pathway: PATHWAYS.DEEPER_LOOK,
      primary: null,
      alternate: null,
      requiresCoachReview: true,
      note: `Unrecognized mechanism "${q6}" for terrain "${q5}" — route to Deeper Look First.`,
    };
  }

  const flipped = rule.flipWhen ? rule.flipWhen({ q5, q6, q8 }) : false;
  return {
    pathway: PATHWAYS.CAPACITY_MOVE,
    primary: flipped ? row.alternate : row.primary,
    alternate: flipped ? row.primary : row.alternate,
    requiresCoachReview: false,
    note: row.overrideNote || null,
  };
}
