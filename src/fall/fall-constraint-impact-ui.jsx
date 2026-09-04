// Fall 2026 — Constraint Impact tracking (Sections 15, 19, 41)
// "This distinguishes a Move that is merely liked from one that actually reduces the target
// constraint." Collected at Baseline (already in fall-reflection-ui.jsx), Week 4, Week 8, and
// once more immediately if a Move closes early (graduates/replaced) before the next scheduled
// measurement.
//
// Scope note: this file does NOT include the 5 Margin taps that Section 19 also bundles into
// the Week-4 reassessment (Baseline/W4/W8) — Margin wasn't part of this request and its
// composite scoring is separately deferred to v2 per the handoff doc; adding raw Margin
// collection here without being asked would be scope creep in the wrong direction.
//
import React, { useState } from "react";
import { G, DARK, CARD, CARD_SHADOW, SANS } from "../theme.jsx";

export const CONSTRAINT_IMPACT_PROMPT = "How much is this currently getting in the way?";
export const CONSTRAINT_IMPACT_LABELS = { 1: "Barely at all", 5: "A lot" };

function Scale5({ value, onChange }) {
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
        <span>1 — {CONSTRAINT_IMPACT_LABELS[1]}</span>
        <span>5 — {CONSTRAINT_IMPACT_LABELS[5]}</span>
      </div>
    </div>
  );
}

/** Reusable 1-5 Constraint Impact tap — used at Baseline (see fall-reflection-ui.jsx), Week 4, Week 8, and early-exit. */
export function ConstraintImpactTap({ value, onChange }) {
  return (
    <div>
      <div style={{ fontWeight: "600", color: DARK, fontSize: "0.95rem", marginBottom: "0.5rem" }}>{CONSTRAINT_IMPACT_PROMPT}</div>
      <Scale5 value={value} onChange={onChange} />
    </div>
  );
}

const WEEK4_STILL_IMPORTANT_OPTIONS = [
  { id: "yes_still_most_important", label: "Yes — still the most important constraint" },
  { id: "no_improved", label: "No — because it improved" },
  { id: "no_wrong_thing", label: "No — I don't think we identified the right thing" },
  { id: "not_sure", label: "I'm not sure" },
];
// Section 19: only "wrong thing," "not sure," or other concerning data require coach review.
const WEEK4_FLAGS_FOR_REVIEW = new Set(["no_wrong_thing", "not_sure"]);

/**
 * Section 19 — bundled into the Week-4 main check-in, not a separate workflow.
 * @param {{ onComplete: (result: { stillImportant: string, constraintImpact: string, flaggedForReview: boolean }) => void }} props
 */
export function FallWeek4Reassessment({ onComplete }) {
  const [stillImportant, setStillImportant] = useState(null);
  const [constraintImpact, setConstraintImpact] = useState(null);

  const requiredFilled = !!stillImportant && !!constraintImpact;

  return (
    <div style={{ background: CARD, borderRadius: "16px", boxShadow: CARD_SHADOW, padding: "1.2rem 1.3rem", marginBottom: "1rem", fontFamily: SANS }}>
      <div style={{ fontSize: "0.72rem", fontWeight: "bold", color: "#999", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>WEEK 4 CHECK-IN</div>

      <div style={{ marginBottom: "1.2rem" }}>
        <div style={{ fontWeight: "600", color: DARK, fontSize: "0.95rem", marginBottom: "0.5rem" }}>
          Is this still the most important thing getting in your way?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {WEEK4_STILL_IMPORTANT_OPTIONS.map((opt) => {
            const selected = stillImportant === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setStillImportant(opt.id)}
                style={{
                  textAlign: "left", padding: "0.6rem 0.8rem", minHeight: "44px", borderRadius: "10px",
                  border: `1.5px solid ${selected ? G : "#e0e0e0"}`, background: selected ? G : "#fff",
                  color: selected ? "#fff" : DARK, cursor: "pointer", fontSize: "0.88rem", fontWeight: selected ? "600" : "normal",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <ConstraintImpactTap value={constraintImpact} onChange={setConstraintImpact} />

      <button
        disabled={!requiredFilled}
        onClick={() =>
          onComplete({
            stillImportant,
            constraintImpact,
            flaggedForReview: WEEK4_FLAGS_FOR_REVIEW.has(stillImportant),
          })
        }
        style={{
          width: "100%", marginTop: "1.2rem", background: requiredFilled ? G : "#ccc", color: "#fff",
          border: "none", borderRadius: "12px", padding: "0.9rem", fontSize: "0.95rem", fontWeight: "bold",
          cursor: requiredFilled ? "pointer" : "not-allowed",
        }}
      >
        Continue →
      </button>
    </div>
  );
}

/**
 * Section 15 — same Constraint Impact measurement as Week 4's, without the "still the right
 * constraint" branch question (that diagnostic check is a Week-4-only concept; by Week 8 this
 * is just the final before/after data point alongside Baseline).
 * @param {{ onComplete: (result: { constraintImpact: string }) => void }} props
 */
export function FallWeek8Reassessment({ onComplete }) {
  const [constraintImpact, setConstraintImpact] = useState(null);

  return (
    <div style={{ background: CARD, borderRadius: "16px", boxShadow: CARD_SHADOW, padding: "1.2rem 1.3rem", marginBottom: "1rem", fontFamily: SANS }}>
      <div style={{ fontSize: "0.72rem", fontWeight: "bold", color: "#999", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>WEEK 8 CHECK-IN</div>

      <ConstraintImpactTap value={constraintImpact} onChange={setConstraintImpact} />

      <button
        disabled={!constraintImpact}
        onClick={() => onComplete({ constraintImpact })}
        style={{
          width: "100%", marginTop: "1.2rem", background: constraintImpact ? G : "#ccc", color: "#fff",
          border: "none", borderRadius: "12px", padding: "0.9rem", fontSize: "0.95rem", fontWeight: "bold",
          cursor: constraintImpact ? "pointer" : "not-allowed",
        }}
      >
        Continue →
      </button>
    </div>
  );
}

const EXIT_REASON_OPTIONS = [
  { id: "graduated", label: "Move graduated — behavior is integrated" },
  { id: "replaced", label: "Move replaced — diagnosis/circumstances changed" },
];

/**
 * Section 41 — only shown when a Move closes BEFORE its next scheduled Week-4/Week-8 impact
 * measurement. Stores as exitConstraintImpact for that Move episode; a newly assigned
 * constraint starts its own baseline separately (see fall-reflection-ui.jsx's baselineImpact).
 * @param {{ moveTitle: string, onComplete: (result: { reason: string, exitConstraintImpact: string }) => void }} props
 */
export function FallExitConstraintImpact({ moveTitle, onComplete }) {
  const [reason, setReason] = useState(null);
  const [impact, setImpact] = useState(null);
  const requiredFilled = !!reason && !!impact;

  return (
    <div style={{ background: CARD, borderRadius: "16px", boxShadow: CARD_SHADOW, padding: "1.2rem 1.3rem", fontFamily: SANS }}>
      <div style={{ fontSize: "0.72rem", fontWeight: "bold", color: "#999", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>BEFORE WE CLOSE THIS MOVE</div>
      {moveTitle && <div style={{ fontWeight: "bold", color: DARK, marginBottom: "0.8rem" }}>{moveTitle}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.2rem" }}>
        {EXIT_REASON_OPTIONS.map((opt) => {
          const selected = reason === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setReason(opt.id)}
              style={{
                textAlign: "left", padding: "0.6rem 0.8rem", minHeight: "44px", borderRadius: "10px",
                border: `1.5px solid ${selected ? G : "#e0e0e0"}`, background: selected ? G : "#fff",
                color: selected ? "#fff" : DARK, cursor: "pointer", fontSize: "0.88rem", fontWeight: selected ? "600" : "normal",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <ConstraintImpactTap value={impact} onChange={setImpact} />

      <button
        disabled={!requiredFilled}
        onClick={() => onComplete({ reason, exitConstraintImpact: impact })}
        style={{
          width: "100%", marginTop: "1.2rem", background: requiredFilled ? G : "#ccc", color: "#fff",
          border: "none", borderRadius: "12px", padding: "0.9rem", fontSize: "0.95rem", fontWeight: "bold",
          cursor: requiredFilled ? "pointer" : "not-allowed",
        }}
      >
        Close Move →
      </button>
    </div>
  );
}
