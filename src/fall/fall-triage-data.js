// Fall 2026 — Coach Triage (Section 18)
// "The app should compress 125 members into a small number of people who need judgment today."
//
// Section 18 gives qualitative descriptions (below), not exact numeric thresholds — the
// specific counts/cutoffs below (e.g. "2 of the last 3", "helpfulness >= 4") are my
// interpretation of that language, not text lifted verbatim from the spec. Flagging that
// explicitly, same as the matching-rules module, so it's easy to tune once real weekly data
// shows whether these thresholds feel right in practice.
//
//   GREEN  — At intended dose or better; helpful; manageable. No coaching required.
//   YELLOW — Useful but difficult; one miss; mild concern. Monitor.
//   RED    — Repeated Below Anchor; helpfulness <=2; Need Help; stop/scope concern. Priority review.
//   BLUE   — Strong execution + helpfulness + manageable difficulty. Integration candidate (Section 20: 2-3 weeks).

export const TRIAGE_STATES = {
  RED: "RED",
  YELLOW: "YELLOW",
  GREEN: "GREEN",
  BLUE: "BLUE",
};

// MIGRATION (2026-09-08, caught during a scoring audit, not asked for): this function was
// still written against move_level_reached/helpfulness/difficulty — the ORIGINAL, since-replaced
// weekly Move questions (see fall-schema.sql's "SUPERSEDED (2026-09-03)" columns). Point 3's
// simpler trio (move_used/move_helped/move_constraint_impact, wired into FallWeeklyCheckIn)
// doesn't have those field names or a 1-5 difficulty rating at all, so every real check-in since
// Point 3 shipped was silently missing all of them — every condition below fell through to its
// default, meaning Triage has been showing GREEN for every member regardless of their actual
// data (including members who'd tapped "Need help," since even that read the wrong field name).
// Rebuilt against the real fields, same qualitative intent from the header comment above. These
// thresholds are a fresh interpretation, same as the original ones were — flag to Eric to tune
// once real weekly data shows whether they feel right.
/**
 * @param {{
 *   recentChecks: Array<{ move_used: string, move_helped: string, move_constraint_impact: number, help_requested: boolean }>, // chronological, most recent LAST — real fall_weekly_checks rows
 *   scopeConcernFlag?: boolean, // coach-set manually elsewhere (Section 6.1 SAFE / Section 28 "Safety/scope concern")
 * }} input
 * @returns {{ state: string|null, reason: string }} state is null when there's no data yet to judge.
 */
export function deriveTriageState({ recentChecks = [], scopeConcernFlag = false }) {
  if (scopeConcernFlag) {
    return { state: TRIAGE_STATES.RED, reason: "Safety/scope concern flagged by coach" };
  }
  if (recentChecks.length === 0) {
    return { state: null, reason: "No check-ins yet" };
  }

  const latest = recentChecks[recentChecks.length - 1];

  if (latest.help_requested) {
    return { state: TRIAGE_STATES.RED, reason: "Requested help this week" };
  }
  if (latest.move_helped === "not_really") {
    return { state: TRIAGE_STATES.RED, reason: "Reported the Move isn't helping" };
  }
  const lastThree = recentChecks.slice(-3);
  const neverUsedCount = lastThree.filter((c) => c.move_used === "never").length;
  if (neverUsedCount >= 2) {
    return { state: TRIAGE_STATES.RED, reason: `Move not used in ${neverUsedCount} of the last ${lastThree.length} check-ins` };
  }

  const lastTwo = recentChecks.slice(-2);
  const strongStreak =
    lastTwo.length === 2 &&
    lastTwo.every((c) => c.move_used === "most_of_the_time" && c.move_helped === "definitely");
  if (strongStreak) {
    return { state: TRIAGE_STATES.BLUE, reason: "Used it most of the time and reported it definitely helped, 2 check-ins in a row" };
  }

  if (latest.move_used === "never" || latest.move_used === "sometimes") {
    return { state: TRIAGE_STATES.YELLOW, reason: latest.move_used === "never" ? "Didn't use the Move this week (not yet repeated)" : "Used the Move only sometimes this week" };
  }

  return { state: TRIAGE_STATES.GREEN, reason: "Used the Move most of the time or better, no concerns reported" };
}

/** Convenience — counts + sort order (Priority first) for the dashboard summary row. */
export const TRIAGE_ORDER = [TRIAGE_STATES.RED, TRIAGE_STATES.YELLOW, TRIAGE_STATES.BLUE, TRIAGE_STATES.GREEN];
export const TRIAGE_LABELS = { RED: "Priority", YELLOW: "Watch", BLUE: "Ready", GREEN: "Doing Well" };
export const TRIAGE_COLORS = { RED: "#e05030", YELLOW: "#e0a020", BLUE: "#4a90d9", GREEN: "#4a9e38" };

export function summarizeTriage(states) {
  const counts = { RED: 0, YELLOW: 0, BLUE: 0, GREEN: 0 };
  for (const s of states) if (s && counts[s] !== undefined) counts[s] += 1;
  return counts;
}
