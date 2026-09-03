// Fall 2026 — Coach Snapshot (Section 5) + coach confirmation (Sections 7, 8, 12)
// Goal: coach reviews this in ~20-30 seconds and enters the 5-minute conversation with
// a hypothesis, not a blank slate. The algorithm never assigns a Move on its own — this
// screen is where the coach confirms (or overrides) the pathway, Move, and A/B/E dose.
//
import React, { useState, useEffect } from "react";
import { Q1_OPTIONS, Q3_OPTIONS, Q4_OPTIONS, Q5_OPTIONS, Q6_BRANCHES, Q7_OPTIONS, Q8_OPTIONS, BASELINE_IMPACT_LABELS } from "./fall-reflection-data.js";
import { FALL_CAPACITY_MOVES, FALL_MOVE_IDS } from "./fall-moves-data.js";
import { PATHWAYS } from "./fall-matching-data.js";
import { G, DARK, CARD, CARD_SHADOW, SANS } from "../theme.jsx";

function labelFor(options, id) {
  if (!id) return null;
  const opt = (options || []).find((o) => o.id === id);
  return opt ? opt.label : id;
}
function labelsFor(options, ids) {
  return (ids || []).map((id) => labelFor(options, id)).join("; ");
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background: CARD, borderRadius: "16px", boxShadow: CARD_SHADOW, padding: "1.1rem 1.3rem", marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: "bold", color: "#999", letterSpacing: "0.06em", marginBottom: "0.6rem" }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}
function Row({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: "0.85rem", padding: "0.35rem 0", borderBottom: "1px solid #eee" }}>
      <span style={{ color: "#888", flexShrink: 0 }}>{label}</span>
      <span style={{ color: DARK, fontWeight: "600", textAlign: "right" }}>{value}</span>
    </div>
  );
}

const PATHWAY_OPTIONS = [
  { id: PATHWAYS.CAPACITY_MOVE, label: "Capacity Move", hint: "A clear modifiable behavioral mechanism maps to one of the 12 Moves." },
  { id: PATHWAYS.PROGRAMMING_ADJUSTMENT, label: "Programming Adjustment", hint: "Training dose/exercise selection/plan structure is the main issue." },
  { id: PATHWAYS.DEEPER_LOOK, label: "Deeper Look First", hint: "Constraint/mechanism is ambiguous, multiple factors compete, or a simple Move repeatedly fails." },
  { id: PATHWAYS.REFER_EVALUATE, label: "Refer / Evaluate", hint: "Outside coaching scope or warrants professional evaluation." },
  { id: PATHWAYS.NO_MOVE_NEEDED, label: "No Move Needed", hint: "Member is functioning well; no meaningful lifestyle constraint to manufacture." },
];

const DOSE_OPTIONS = [
  { id: "anchor", label: "Anchor" },
  { id: "builder", label: "Builder" },
  { id: "expansion", label: "Expansion" },
];

const WEEKLY_LIMIT_OPTIONS = [
  { id: "no_limit", label: "No limit" },
  { id: "anchor", label: "Anchor" },
  { id: "builder", label: "Builder" },
  { id: "expansion", label: "Expansion" },
];

// Fall App Implementation Handoff, Section 1 — default weekly plan limit per assigned Move.
// "Currently displayed weekly level" means snapshot the member's live getDeclaredWeek() role
// at assignment time (currentDeclaredRole, passed down by the caller); falls back to Anchor
// when there's no weekly history yet to snapshot. The coach can always override the default.
function defaultWeeklyPlanLimit(moveKey, currentDeclaredRole) {
  if (moveKey === "M9") return "anchor"; // Win the Minimum Week
  if (moveKey === "M6" || moveKey === "M11") return currentDeclaredRole || "anchor"; // Protect Sleep Opportunity / Create Margin
  return "no_limit";
}

/**
 * @param {{
 *   member: { name: string },
 *   reflection: { answers: object, stopFlagged: boolean, match: { pathway: string|null, primary: string|null, alternate: string|null, note: string|null } },
 *   objectiveContext?: string,  // e.g. attendance/testing/history — Spring-side data, not part of the Reflection itself
 *   currentDeclaredRole?: "anchor"|"builder"|"expansion"|null,  // member's live getDeclaredWeek() role, for the weekly plan limit's default
 *   onConfirm: (decision: { pathway: string, moveId: string|null, dose: string|null, coachNote: string, weeklyPlanLimit: string|null, personalizedPlan: string|null }) => void,
 *   onBack?: () => void,
 * }} props
 */
export function FallCoachSnapshot({ member, reflection, objectiveContext, currentDeclaredRole, onConfirm, onBack }) {
  const { answers, stopFlagged, match } = reflection;
  const q6Options = answers.q5 ? Q6_BRANCHES[answers.q5] || [] : [];

  const [pathway, setPathway] = useState(match?.pathway || null);
  const [moveId, setMoveId] = useState(match?.primary || null);
  const [dose, setDose] = useState(null);
  const [weeklyPlanLimit, setWeeklyPlanLimit] = useState(() => (match?.primary ? defaultWeeklyPlanLimit(match.primary, currentDeclaredRole) : "no_limit"));
  const [personalizedPlan, setPersonalizedPlan] = useState("");
  const [coachNote, setCoachNote] = useState("");
  const [validationMsg, setValidationMsg] = useState("");

  useEffect(() => {
    if (moveId) setWeeklyPlanLimit(defaultWeeklyPlanLimit(moveId, currentDeclaredRole));
  }, [moveId]);

  const isCapacityMove = pathway === PATHWAYS.CAPACITY_MOVE;
  const canConfirm = isCapacityMove ? !!moveId && !!dose : !!pathway;

  const handleConfirm = () => {
    if (!canConfirm) {
      setValidationMsg(isCapacityMove ? "Pick a Move and a dose before confirming." : "Pick a pathway before confirming.");
      return;
    }
    onConfirm({
      pathway, moveId: isCapacityMove ? moveId : null, dose: isCapacityMove ? dose : null,
      coachNote: coachNote.trim(), weeklyPlanLimit: isCapacityMove ? weeklyPlanLimit : null,
      personalizedPlan: isCapacityMove ? (personalizedPlan.trim() || null) : null,
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: SANS }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: G, cursor: "pointer", marginBottom: "1rem", fontWeight: "bold" }}>
            ← All Members
          </button>
        )}

        <div style={{ background: DARK, borderRadius: "16px", padding: "1.5rem", color: "#fff", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{member?.name || "Member"}</div>
          <div style={{ color: "#aaa", fontSize: "0.85rem" }}>Capacity Reflection Snapshot</div>
          <div style={{ color: "#777", fontSize: "0.75rem", marginTop: "0.4rem" }}>Review target: ~20–30 seconds</div>
        </div>

        {stopFlagged && (
          <div style={{ background: "#fff4f2", border: "1.5px solid #f0a898", borderRadius: "12px", padding: "0.9rem 1.1rem", marginBottom: "1rem" }}>
            <div style={{ color: "#c0402a", fontWeight: "bold", fontSize: "0.85rem", marginBottom: "0.2rem" }}>⚑ Stop flag — coach review required</div>
            <div style={{ color: "#a04030", fontSize: "0.8rem" }}>
              Automatic matching was skipped (Section 6.1 SAFE). Choose the pathway manually below.
            </div>
          </div>
        )}

        <SectionCard title="Capacity Direction">
          <Row label="Wants health to make possible" value={labelFor(Q1_OPTIONS, answers.q1)} />
          <div style={{ fontSize: "0.85rem", color: DARK, fontStyle: "italic", marginTop: "0.5rem" }}>"{answers.q2}"</div>
          <Row label="Why it matters" value={labelsFor(Q3_OPTIONS, answers.q3)} />
        </SectionCard>

        <SectionCard title="Constraint">
          <Row label="Member hypothesis" value={labelFor(Q4_OPTIONS, answers.q4)} />
          <Row label="Selected constraint" value={labelFor(Q5_OPTIONS, answers.q5)} />
          {answers.q5 === "other" ? (
            <Row label="Member's own words" value={answers.q5Other} />
          ) : (
            <Row label="Mechanism" value={labelFor(q6Options, answers.q6)} />
          )}
          <Row label="Friction" value={labelsFor(Q7_OPTIONS, answers.q7)} />
          {answers.q8 && <Row label="Function" value={labelFor(Q8_OPTIONS, answers.q8)} />}
          <Row label="Baseline Constraint Impact" value={answers.baselineImpact ? `${answers.baselineImpact} / 5` : null} />
        </SectionCard>

        <SectionCard title="Relevant objective reality">
          <div style={{ fontSize: "0.85rem", color: objectiveContext ? DARK : "#aaa" }}>
            {objectiveContext || "No attendance/testing/history context supplied yet — pull from Spring history before the conversation."}
          </div>
        </SectionCard>

        {match?.note && (
          <SectionCard title="Suggested discriminator / note">
            <div style={{ fontSize: "0.85rem", color: DARK }}>{match.note}</div>
          </SectionCard>
        )}

        <SectionCard title="Pathway (Section 7)">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {PATHWAY_OPTIONS.map((opt) => {
              const selected = pathway === opt.id;
              const isSuggested = match?.pathway === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPathway(opt.id)}
                  style={{
                    textAlign: "left", padding: "0.7rem 0.9rem", borderRadius: "10px",
                    border: `1.5px solid ${selected ? G : "#e0e0e0"}`,
                    background: selected ? `${G}12` : "#fff", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: DARK, fontSize: "0.88rem" }}>{opt.label}</span>
                    {isSuggested && <span style={{ fontSize: "0.68rem", color: G, fontWeight: "bold" }}>SUGGESTED</span>}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#888", marginTop: "0.15rem" }}>{opt.hint}</div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {isCapacityMove && (
          <>
            <SectionCard title="Move (Section 6.6 — primary + alternate)">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {FALL_MOVE_IDS.map((id) => {
                  const mv = FALL_CAPACITY_MOVES[id];
                  const selected = moveId === id;
                  const tag = id === match?.primary ? "Primary" : id === match?.alternate ? "Alternate" : null;
                  return (
                    <button
                      key={id}
                      onClick={() => setMoveId(id)}
                      style={{
                        textAlign: "left", padding: "0.6rem 0.7rem", borderRadius: "10px",
                        border: `1.5px solid ${selected ? G : "#e0e0e0"}`,
                        background: selected ? G : "#fff", cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: "0.78rem", fontWeight: "bold", color: selected ? "#fff" : DARK }}>{id} — {mv.title}</div>
                      {tag && <div style={{ fontSize: "0.68rem", color: selected ? "#fff" : G, fontWeight: "bold", marginTop: "0.15rem" }}>{tag}</div>}
                    </button>
                  );
                })}
              </div>
              {moveId && (
                <div style={{ marginTop: "0.8rem", fontSize: "0.82rem", color: "#666", lineHeight: 1.5 }}>
                  {FALL_CAPACITY_MOVES[moveId].thisMightBeYourMoveIf}
                </div>
              )}
            </SectionCard>

            <SectionCard title="A/B/E dose (Section 12 — coach may personalize)">
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
                {DOSE_OPTIONS.map((d) => {
                  const selected = dose === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDose(d.id)}
                      style={{
                        flex: 1, padding: "0.6rem", borderRadius: "10px",
                        border: `1.5px solid ${selected ? G : "#e0e0e0"}`,
                        background: selected ? G : "#fff", color: selected ? "#fff" : DARK,
                        fontWeight: "600", fontSize: "0.85rem", cursor: "pointer",
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              {moveId && dose && (
                <div style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.5, background: "#f7f7f5", borderRadius: "8px", padding: "0.6rem 0.8rem" }}>
                  {FALL_CAPACITY_MOVES[moveId].doses[dose]}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Weekly plan limit">
              <select
                value={weeklyPlanLimit}
                onChange={(e) => setWeeklyPlanLimit(e.target.value)}
                style={{ width: "100%", padding: "0.6rem 0.7rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, background: "#fff" }}
              >
                {WEEKLY_LIMIT_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
              <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "0.5rem", lineHeight: 1.4 }}>
                Keeps weekly targets from increasing beyond this level while this Move is active.
              </div>
            </SectionCard>

            <SectionCard title="Personalize this Move (optional)">
              <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.6rem" }}>
                Write the specific action you agreed on. The member will see this.
              </div>
              <textarea
                value={personalizedPlan}
                onChange={(e) => setPersonalizedPlan(e.target.value.slice(0, 300))}
                rows={2}
                maxLength={300}
                placeholder="Example: Put my phone on the kitchen charger when I start the boys' bedtime routine."
                style={{ width: "100%", padding: "0.6rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, resize: "vertical", boxSizing: "border-box" }}
              />
              <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "0.3rem", textAlign: "right" }}>{personalizedPlan.length}/300</div>
            </SectionCard>
          </>
        )}

        <SectionCard title="Coach note (optional)">
          <textarea
            value={coachNote}
            onChange={(e) => setCoachNote(e.target.value)}
            rows={2}
            placeholder="Personalize the execution detail if needed — do not require notes on Green members."
            style={{ width: "100%", padding: "0.6rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, resize: "vertical", boxSizing: "border-box" }}
          />
        </SectionCard>

        {validationMsg && (
          <div style={{ color: "#e05030", fontSize: "0.82rem", textAlign: "center", marginBottom: "0.8rem", padding: "0.5rem 1rem", background: "#fff4f2", borderRadius: "12px", border: "1px solid #fad0c8" }}>
            {validationMsg}
          </div>
        )}

        <button
          onClick={handleConfirm}
          style={{ width: "100%", background: G, color: "#fff", border: "none", borderRadius: "12px", padding: "1rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}
        >
          Confirm →
        </button>
      </div>
    </div>
  );
}
