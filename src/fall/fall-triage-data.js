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

const MOVE_LEVEL_RANK = { "Below Anchor": 0, "Anchor": 1, "Builder": 2, "Expansion": 3 };

/**
 * @param {{
 *   recentChecks: Array<{ moveLevelReached: string, helpfulness: string, difficulty: string, helpRequested: boolean }>, // chronological, most recent LAST
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
  const latestHelpfulness = latest.helpfulness ? parseInt(latest.helpfulness, 10) : null;
  const latestDifficulty = latest.difficulty ? parseInt(latest.difficulty, 10) : null;

  if (latest.helpRequested) {
    return { state: TRIAGE_STATES.RED, reason: "Requested help this week" };
  }
  if (latestHelpfulness !== null && latestHelpfulness <= 2) {
    return { state: TRIAGE_STATES.RED, reason: "Helpfulness ≤2 this week" };
  }
  const lastThree = recentChecks.slice(-3);
  const belowAnchorCount = lastThree.filter((c) => c.moveLevelReached === "Below Anchor").length;
  if (belowAnchorCount >= 2) {
    return { state: TRIAGE_STATES.RED, reason: `Below Anchor in ${belowAnchorCount} of the last ${lastThree.length} check-ins` };
  }

  const lastTwo = recentChecks.slice(-2);
  const strongStreak =
    lastTwo.length === 2 &&
    lastTwo.every((c) => {
      const rank = MOVE_LEVEL_RANK[c.moveLevelReached] ?? 0;
      const help = c.helpfulness ? parseInt(c.helpfulness, 10) : 0;
      const diff = c.difficulty ? parseInt(c.difficulty, 10) : 5;
      return rank >= 1 && help >= 4 && diff <= 3;
    });
  if (strongStreak) {
    return { state: TRIAGE_STATES.BLUE, reason: "Strong execution + helpfulness + manageable difficulty across the last 2 check-ins" };
  }

  if (latest.moveLevelReached === "Below Anchor" || (latestDifficulty !== null && latestDifficulty >= 4)) {
    return { state: TRIAGE_STATES.YELLOW, reason: latest.moveLevelReached === "Below Anchor" ? "Below Anchor this week (not yet repeated)" : "Difficult to fit in this week" };
  }

  return { state: TRIAGE_STATES.GREEN, reason: "At intended dose or better, helpful, manageable" };
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
