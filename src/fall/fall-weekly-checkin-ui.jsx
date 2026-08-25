// Fall 2026 — Weekly Check-In (Section 13, LOCKED)
// Target: ~45-75 seconds. Tap-based only — "Do not recreate a survey."
// Two parts: the 7 Spring-compatible Capacity Signals (unchanged scoring — feed the
// resulting object straight into the existing, untouched calcWeeklyScore()), plus the
// 3 required Move questions with conditional one-tap friction.
//
// NOTE: v60's downshift scoring/label mismatch (en dash vs hyphen) was fixed directly in
// calcWeeklyScore()/downshiftMap (both variants now accepted). This file stores the hyphen
// value regardless, so it scores correctly either way.

import React, { useState } from "react";
import { Q7_OPTIONS } from "./fall-reflection-data.js";
import { G, DARK, SANS, LIGHT_BG } from "../theme.jsx";

// The 7 Spring-compatible Capacity Signals (Section 13.1). Field names/option strings match
// calcWeeklyScore()'s existing switch exactly — this is what keeps longitudinal Capacity
// Index continuity intact. Do not change these strings without also checking calcWeeklyScore.
const SIGNAL_FIELDS = [
  { label: "Workouts this week", field: "workouts", options: ["0", "1", "2", "3", "4+"], hint: "Classes, runs, lifts, cycling all count" },
  { label: "Challenging strength session", field: "strengthRPE", options: ["Yes", "No"], hint: "At least one session around RPE 7+ (2–3 reps left in reserve)" },
  { label: "Daily movement outside workouts", field: "dailyMovement", options: ["High", "Moderate", "Low"], hint: "High (8k+ steps/day), Moderate (5–8k/day), Low (<5k/day)" },
  { label: "Zone 2 aerobic work this week", field: "zone2", options: ["0–30 min", "30–60 min", "60–90 min", "90+ min"], hint: "Steady effort — breathing elevated but sustainable" },
  { label: "Protein in 3+ meals per day", field: "protein", options: ["Yes (most days)", "Most days", "Some days", "Rarely"], hint: "~20g+ of protein per meal" },
  { label: "Sleep opportunity", field: "sleepOpportunity", options: ["5+ nights", "3–4 nights", "1–2 nights", "Rarely"], hint: "How many nights did you have 7+ hours available for sleep?" },
  // Display label uses an en dash for readability; the stored/scored value uses a regular
  // hyphen to match calcWeeklyScore's actual string check (see bug note above).
  { label: "Intentional downshift (10+ min)", field: "downshift", displayOptions: ["3+ times", "1–2 times", "None"], options: ["3+ times", "1-2 times", "None"], hint: "Breathwork, quiet walk, journaling, meditation, screen-free time" },
];

const MOVE_LEVEL_OPTIONS = ["Below Anchor", "Anchor", "Builder", "Expansion"];

function Scale5({ value, onChange, lowLabel, highLabel }) {
  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = String(n) === value;
          return (
            <button
              key={n}
              onClick={() => onChange(String(n))}
              style={{
                flex: 1, height: "40px",
                border: `1.5px solid ${selected ? G : "#e0e0e0"}`,
                borderRadius: "10px",
                background: selected ? G : "#fff",
                color: selected ? "#fff" : "#888",
                cursor: "pointer", fontSize: "1rem",
                fontWeight: selected ? "bold" : "normal", transition: "all 0.15s ease",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#aaa" }}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

const QUESTION_BLOCK_STYLE = { paddingTop: "1.3rem", borderTop: "1px solid #efefef", marginBottom: "0.2rem" };
const QUESTION_LABEL_STYLE = { fontWeight: "600", color: DARK, fontSize: "0.95rem", marginBottom: "0.5rem" };

/**
 * @param {{
 *   moveTitle: string,   // e.g. "Protect Your Training" — for the "How did <Move> go?" framing
 *   onSubmit: (payload: { signals: object, moveLevelReached: string, helpfulness: string, difficulty: string, frictionReason: string|null, helpRequested: boolean }) => void,
 *   onRequestHelp: () => void,  // fires immediately on tap (Section 13.4) — creates a Red coach flag right away, not just at submit
 *   onBack?: () => void,
 * }} props
 */
export function FallWeeklyCheckIn({ moveTitle, onSubmit, onRequestHelp, onBack }) {
  const [signals, setSignals] = useState({ workouts: "", zone2: "", strengthRPE: "", dailyMovement: "", protein: "", downshift: "", sleepOpportunity: "" });
  const [moveLevelReached, setMoveLevelReached] = useState(null);
  const [helpfulness, setHelpfulness] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [frictionReason, setFrictionReason] = useState(null);
  const [helpRequested, setHelpRequested] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  const needsFriction =
    moveLevelReached === "Below Anchor" ||
    (difficulty && parseInt(difficulty, 10) >= 4) ||
    (helpfulness && parseInt(helpfulness, 10) <= 2);

  const signalFields = SIGNAL_FIELDS.map((f) => f.field);
  const signalsAnswered = signalFields.filter((f) => signals[f] !== "").length;
  const fields = [...signalFields.map((f) => signals[f]), moveLevelReached, helpfulness, difficulty, needsFriction ? frictionReason : "x"];
  const answeredCount = fields.filter(Boolean).length;
  const allAnswered = answeredCount === fields.length;

  const handleHelpTap = () => {
    if (helpRequested) return;
    setHelpRequested(true);
    onRequestHelp();
  };

  const handleSubmit = () => {
    if (!allAnswered) {
      setValidationMsg("A few answers are still missing above.");
      return;
    }
    onSubmit({ signals, moveLevelReached, helpfulness, difficulty, frictionReason: needsFriction ? frictionReason : null, helpRequested });
  };

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: SANS }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: LIGHT_BG, paddingTop: "1rem", paddingBottom: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: DARK }}>Weekly Check-In</div>
            <div style={{ fontSize: "0.8rem", color: allAnswered ? G : "#888", fontWeight: allAnswered ? "bold" : "normal" }}>
              {allAnswered ? "✓ All done!" : `${answeredCount} of ${fields.length}`}
            </div>
          </div>
          <div style={{ background: "#eee", borderRadius: "999px", height: "5px", marginBottom: "0.3rem" }}>
            <div style={{ background: G, borderRadius: "999px", height: "5px", width: `${Math.round((answeredCount / fields.length) * 100)}%`, transition: "width 0.3s ease" }} />
          </div>
          <div style={{ color: "#666", fontSize: "0.85rem" }}>~60 seconds · First instinct is fine</div>
        </div>

        {SIGNAL_FIELDS.map((q, qi) => (
          <div key={q.field} style={{ ...QUESTION_BLOCK_STYLE, borderTop: qi === 0 ? "none" : "1px solid #efefef" }}>
            <div style={QUESTION_LABEL_STYLE}>{q.label}</div>
            {q.hint && <div style={{ color: "#aaa", fontSize: "0.78rem", marginBottom: "0.5rem" }}>{q.hint}</div>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {q.options.map((opt, i) => {
                const displayLabel = (q.displayOptions || q.options)[i];
                const selected = signals[q.field] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setSignals((s) => ({ ...s, [q.field]: opt }))}
                    style={{
                      padding: "0.5rem 1rem", minHeight: "44px",
                      border: `1.5px solid ${selected ? G : "#e0e0e0"}`, borderRadius: "12px",
                      background: selected ? G : "#fff", color: selected ? "#fff" : DARK,
                      cursor: "pointer", fontSize: "0.88rem", fontWeight: selected ? "600" : "normal",
                      display: "flex", alignItems: "center", transition: "all 0.15s ease",
                    }}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "1.8rem 0 1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
          <div style={{ fontSize: "0.68rem", color: "#aaa", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Your Move{moveTitle ? `: ${moveTitle}` : ""}</div>
          <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
        </div>

        <div style={QUESTION_BLOCK_STYLE}>
          <div style={QUESTION_LABEL_STYLE}>Where did you land?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {MOVE_LEVEL_OPTIONS.map((opt) => {
              const selected = moveLevelReached === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setMoveLevelReached(opt)}
                  style={{
                    padding: "0.5rem 1rem", minHeight: "44px",
                    border: `1.5px solid ${selected ? G : "#e0e0e0"}`, borderRadius: "12px",
                    background: selected ? G : "#fff", color: selected ? "#fff" : DARK,
                    cursor: "pointer", fontSize: "0.88rem", fontWeight: selected ? "600" : "normal",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div style={QUESTION_BLOCK_STYLE}>
          <div style={QUESTION_LABEL_STYLE}>How much did this Move help?</div>
          <Scale5 value={helpfulness} onChange={setHelpfulness} lowLabel="1 — Not at all" highLabel="5 — A lot" />
        </div>

        <div style={QUESTION_BLOCK_STYLE}>
          <div style={QUESTION_LABEL_STYLE}>How difficult was this Move to fit into your life?</div>
          <Scale5 value={difficulty} onChange={setDifficulty} lowLabel="1 — Very easy" highLabel="5 — Very difficult" />
        </div>

        {needsFriction && (
          <div style={QUESTION_BLOCK_STYLE}>
            <div style={QUESTION_LABEL_STYLE}>What got in the way most?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Q7_OPTIONS.map((opt) => {
                const selected = frictionReason === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFrictionReason(opt.id)}
                    style={{
                      padding: "0.5rem 1rem", minHeight: "44px",
                      border: `1.5px solid ${selected ? G : "#e0e0e0"}`, borderRadius: "12px",
                      background: selected ? G : "#fff", color: selected ? "#fff" : DARK,
                      cursor: "pointer", fontSize: "0.88rem", fontWeight: selected ? "600" : "normal",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleHelpTap}
          style={{
            width: "100%", background: helpRequested ? "#f0f7ec" : "none",
            border: `1.5px solid ${helpRequested ? G : "#ddd"}`, borderRadius: "10px",
            color: helpRequested ? G : "#888", cursor: helpRequested ? "default" : "pointer",
            fontSize: "0.85rem", fontWeight: "600", padding: "0.7rem", margin: "1.2rem 0",
          }}
        >
          {helpRequested ? "✓ Help requested — your coach will reach out" : "Need help with your Move?"}
        </button>

        {validationMsg && (
          <div style={{ color: "#e05030", fontSize: "0.82rem", textAlign: "center", marginBottom: "0.7rem", padding: "0.5rem 1rem", background: "#fff4f2", borderRadius: "12px", border: "1px solid #fad0c8" }}>
            {validationMsg}
          </div>
        )}

        <button
          onClick={handleSubmit}
          style={{ width: "100%", background: G, color: "#fff", border: "none", borderRadius: "12px", padding: "1rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}
        >
          Submit Check-In →
        </button>
        {onBack && (
          <button onClick={onBack} style={{ width: "100%", background: "none", border: "none", color: "#888", cursor: "pointer", marginTop: "0.5rem" }}>
            ← Back to Profile
          </button>
        )}
      </div>
    </div>
  );
}
