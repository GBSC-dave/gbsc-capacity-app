// Fall 2026 — Capacity Reflection UI flow (Q1-Q8, Section 4)
// Target: ~5 min typical, under 7 min hard ceiling (Section 4 TIME TARGET).
//
// MERGE NOTE: this file is self-contained so it can be reviewed/tested on its own.
// When pasted into gbsc-capacity-app.jsx, DELETE the "duplicated from main app" block
// below and rely on the G / DARK / SANS / PAGE_BG / LIGHT_BG constants and the F
// component that already exist there — only MultiSelect is genuinely new and needs
// adding alongside the existing RadioGroup/ScaleGroup helpers.

import React, { useState } from "react";
import {
  Q1_OPTIONS,
  Q2_PROMPT,
  Q2_EXAMPLES,
  Q3_PROMPT,
  Q3_OPTIONS,
  Q4_PROMPT,
  Q4_OPTIONS,
  Q5_OPTIONS,
  Q6_BRANCHES,
  Q7_PROMPT,
  Q7_OPTIONS,
  Q8_PROMPT,
  Q8_OPTIONS,
  shouldShowQ8,
  isStopFlagged,
  BASELINE_IMPACT_PROMPT,
  BASELINE_IMPACT_LABELS,
  REFLECTION_OPENING,
} from "./fall-reflection-data.js";
import { matchCandidateMove } from "./fall-matching-data.js";

// ─── duplicated from main app — delete on merge, use the real ones instead ───
const G = "#5DC842";
const DARK = "#2D2D2D";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const PAGE_BG = "#f9f7f4";
const LIGHT_BG = "linear-gradient(180deg, #fdfcfb 0%, #c2bfc8 100%)";

function F({ label, children }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.3rem", color: DARK, fontSize: "0.9rem" }}>{label}</label>
      {children}
    </div>
  );
}
// ─── end duplicated block ─────────────────────────────────────────────────

// New — single-select over {id, label} option objects (existing RadioGroup only takes plain strings).
function SingleSelect({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: "0.5rem 1rem", minHeight: "44px",
            border: `1.5px solid ${value === opt.id ? G : "#e0e0e0"}`,
            borderRadius: "12px",
            background: value === opt.id ? G : "#fff",
            color: value === opt.id ? "#fff" : DARK,
            cursor: "pointer", fontSize: "0.88rem",
            fontWeight: value === opt.id ? "600" : "normal",
            display: "flex", alignItems: "center", transition: "all 0.15s ease",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// New — multi-select up to `max` items over {id, label} option objects.
function MultiSelect({ options, value, onChange, max = 2 }) {
  const toggle = (id) => {
    const has = value.includes(id);
    if (has) return onChange(value.filter((v) => v !== id));
    if (value.length >= max) return; // silently ignore past the cap — no error, no complexity
    onChange([...value, id]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {options.map((opt) => {
        const selected = value.includes(opt.id);
        const disabled = !selected && value.length >= max;
        return (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            style={{
              padding: "0.5rem 1rem", minHeight: "44px",
              border: `1.5px solid ${selected ? G : "#e0e0e0"}`,
              borderRadius: "12px",
              background: selected ? G : "#fff",
              color: selected ? "#fff" : disabled ? "#ccc" : DARK,
              cursor: disabled ? "default" : "pointer",
              fontSize: "0.88rem", fontWeight: selected ? "600" : "normal",
              display: "flex", alignItems: "center", transition: "all 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// New — 1-5 tap scale with only endpoint labels (matches BASELINE_IMPACT_LABELS' shape).
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
 * Fall Capacity Reflection — pre-season, ~5 min, mostly tap/select.
 * @param {{ onComplete: (result: object) => void, onBack: () => void }} props
 * onComplete receives { answers, stopFlagged, match } — match is null when stopFlagged.
 */
export function FallReflection({ onComplete, onBack }) {
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState([]);
  const [q4, setQ4] = useState(null);
  const [q5, setQ5] = useState(null);
  const [q5Other, setQ5Other] = useState("");
  const [q6, setQ6] = useState(null);
  const [q7, setQ7] = useState([]);
  const [q8, setQ8] = useState(null);
  const [baselineImpact, setBaselineImpact] = useState(null);
  const [validationMsg, setValidationMsg] = useState("");

  const q6Options = q5 ? Q6_BRANCHES[q5] || [] : [];
  const q5IsOther = q5 === "other";
  const showQ8 = q5 && q6 ? shouldShowQ8({ q4, q5, q6, q7 }) : false;

  // Reset downstream answers when an upstream branch point changes, so a stale
  // mechanism/function answer from a previous Q5 choice can't linger unseen.
  const handleQ5Change = (id) => {
    setQ5(id);
    setQ6(null);
    setQ5Other("");
  };

  const requiredFilled =
    !!q1 &&
    q2.trim().length > 0 &&
    q3.length > 0 &&
    !!q4 &&
    !!q5 &&
    (!q5IsOther || q5Other.trim().length > 0) &&
    (q5IsOther || !!q6) &&
    q7.length > 0 &&
    (!showQ8 || !!q8) &&
    !!baselineImpact;

  const fields = [q1, q2.trim(), q3.length ? "x" : "", q4, q5, q5IsOther ? q5Other.trim() : q6, q7.length ? "x" : "", showQ8 ? q8 : "x", baselineImpact];
  const answeredCount = fields.filter(Boolean).length;
  const pct = Math.round((answeredCount / fields.length) * 100);

  const handleSubmit = () => {
    if (!requiredFilled) {
      setValidationMsg("A few answers are still missing above.");
      return;
    }
    const answers = { q1, q2: q2.trim(), q3, q4, q5, q5Other: q5IsOther ? q5Other.trim() : null, q6, q7, q8, baselineImpact };
    const stopFlagged = q5IsOther ? true : isStopFlagged({ q5, q6 });
    const match = stopFlagged ? null : matchCandidateMove({ q5, q6, q8 });
    onComplete({ answers, stopFlagged, match });
  };

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: SANS }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: LIGHT_BG, paddingTop: "1rem", paddingBottom: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: DARK }}>Capacity Reflection</div>
            <div style={{ fontSize: "0.8rem", color: answeredCount === fields.length ? G : "#888", fontWeight: answeredCount === fields.length ? "bold" : "normal" }}>
              {answeredCount === fields.length ? "✓ All done!" : `${answeredCount} of ${fields.length}`}
            </div>
          </div>
          <div style={{ background: "#eee", borderRadius: "999px", height: "5px", marginBottom: "0.3rem" }}>
            <div style={{ background: G, borderRadius: "999px", height: "5px", width: `${pct}%`, transition: "width 0.3s ease" }} />
          </div>
          <div style={{ color: "#666", fontSize: "0.85rem" }}>~5 minutes · First instinct is fine</div>
        </div>

        <div style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6, margin: "0.8rem 0 1.2rem" }}>{REFLECTION_OPENING}</div>

        <div style={{ ...QUESTION_BLOCK_STYLE, borderTop: "none" }}>
          <div style={QUESTION_LABEL_STYLE}>What do you want your health to make possible?</div>
          <SingleSelect options={Q1_OPTIONS} value={q1} onChange={setQ1} />
        </div>

        <div style={QUESTION_BLOCK_STYLE}>
          <F label={Q2_PROMPT}>
            <textarea
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              rows={2}
              style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #e0e0e0", borderRadius: "10px", fontSize: "0.9rem", fontFamily: SANS, resize: "vertical", boxSizing: "border-box" }}
              placeholder="more easily, consistently, or confidently…"
            />
          </F>
          <div style={{ color: "#aaa", fontSize: "0.78rem", lineHeight: 1.6 }}>
            For example: {Q2_EXAMPLES.slice(0, 5).join(" · ")}
          </div>
        </div>

        <div style={QUESTION_BLOCK_STYLE}>
          <div style={QUESTION_LABEL_STYLE}>{Q3_PROMPT} (choose up to 2)</div>
          <MultiSelect options={Q3_OPTIONS} value={q3} onChange={setQ3} max={2} />
        </div>

        <div style={QUESTION_BLOCK_STYLE}>
          <div style={QUESTION_LABEL_STYLE}>{Q4_PROMPT}</div>
          <SingleSelect options={Q4_OPTIONS} value={q4} onChange={setQ4} />
        </div>

        <div style={QUESTION_BLOCK_STYLE}>
          <div style={QUESTION_LABEL_STYLE}>What is most getting in the way?</div>
          <SingleSelect options={Q5_OPTIONS} value={q5} onChange={handleQ5Change} />
          {q5IsOther && (
            <div style={{ marginTop: "0.8rem" }}>
              <F label="Briefly, what's getting in the way?">
                <input
                  type="text"
                  value={q5Other}
                  onChange={(e) => setQ5Other(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #e0e0e0", borderRadius: "10px", fontSize: "0.9rem", fontFamily: SANS, boxSizing: "border-box" }}
                />
              </F>
              <div style={{ color: "#888", fontSize: "0.8rem" }}>Your coach will follow up on this one directly.</div>
            </div>
          )}
        </div>

        {q5 && !q5IsOther && (
          <div style={QUESTION_BLOCK_STYLE}>
            <div style={QUESTION_LABEL_STYLE}>Which sounds most like you?</div>
            <SingleSelect options={q6Options} value={q6} onChange={setQ6} />
          </div>
        )}

        <div style={QUESTION_BLOCK_STYLE}>
          <div style={QUESTION_LABEL_STYLE}>{Q7_PROMPT} (choose up to 2)</div>
          <MultiSelect options={Q7_OPTIONS} value={q7} onChange={setQ7} max={2} />
        </div>

        {showQ8 && (
          <div style={QUESTION_BLOCK_STYLE}>
            <div style={QUESTION_LABEL_STYLE}>{Q8_PROMPT}</div>
            <SingleSelect options={Q8_OPTIONS} value={q8} onChange={setQ8} />
          </div>
        )}

        <div style={QUESTION_BLOCK_STYLE}>
          <div style={QUESTION_LABEL_STYLE}>{BASELINE_IMPACT_PROMPT}</div>
          <Scale5
            value={baselineImpact}
            onChange={setBaselineImpact}
            lowLabel={`1 — ${BASELINE_IMPACT_LABELS[1]}`}
            highLabel={`5 — ${BASELINE_IMPACT_LABELS[5]}`}
          />
        </div>

        {validationMsg && (
          <div style={{ color: "#e05030", fontSize: "0.82rem", textAlign: "center", margin: "1rem 0", padding: "0.5rem 1rem", background: "#fff4f2", borderRadius: "12px", border: "1px solid #fad0c8" }}>
            {validationMsg}
          </div>
        )}

        <button
          onClick={handleSubmit}
          style={{ width: "100%", background: G, color: "#fff", border: "none", borderRadius: "12px", padding: "1rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "1.2rem" }}
        >
          Submit Reflection →
        </button>
        {onBack && (
          <button onClick={onBack} style={{ width: "100%", background: "none", border: "none", color: "#888", cursor: "pointer", marginTop: "0.5rem" }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
