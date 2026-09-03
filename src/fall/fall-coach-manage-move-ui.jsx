// Fall 2026 — Coach "Manage Move" screen, for a member who already has an active Capacity
// Move. Separate from FallCoachSnapshot (which is the FIRST-assignment flow) because
// re-running the assignment RPC on an already-active Move would insert a duplicate
// fall_moves row instead of updating the existing one — see fall_confirm_move in fall-schema.sql.
//
// Three coach actions, each a thin wrapper over a fall-schema.sql RPC:
//   - add/edit the coach note (fall_add_coach_note)
//   - change the A/B/E dose (fall_change_dose)
//   - close the Move as graduated/replaced (fall_close_move)
// All three write straight to fall_moves / fall_member_state, so the member's My Move tab
// reflects the change on its next load — there's no realtime push, so the member needs to
// revisit the tab (or reload) to see it.
import React, { useState } from "react";
import { FALL_CAPACITY_MOVES } from "./fall-moves-data.js";
import { STRUCTURED_REASONS } from "./fall-matching-data.js";
import { MOVE_USED_OPTIONS, MOVE_HELPED_OPTIONS } from "./fall-weekly-checkin-ui.jsx";
import { G, DARK, CARD, CARD_SHADOW, SANS } from "../theme.jsx";

function labelFor(options, id) {
  return options.find((o) => o.id === id)?.label || "Not answered";
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background: CARD, borderRadius: "16px", boxShadow: CARD_SHADOW, padding: "1.1rem 1.3rem", marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: "bold", color: "#999", letterSpacing: "0.06em", marginBottom: "0.6rem" }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}

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

function ReasonPicker({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "0.6rem 0.7rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, background: "#fff", marginBottom: "0.6rem" }}
    >
      <option value="">Select a reason…</option>
      {STRUCTURED_REASONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
    </select>
  );
}

/**
 * @param {{
 *   member: { name: string },
 *   move: { id: string, move_key: string, dose: string, coach_note: string|null, weekly_plan_limit: string|null, personalized_plan: string|null },
 *   latestMoveCheckin?: { submitted_at: string, move_used: string|null, move_helped: string|null, move_constraint_impact: number|null } | null,
 *   onAddNote: (note: string) => void,
 *   onChangeDose: (dose: string, structuredReason: string, note: string) => void,
 *   onSetWeeklyPlanLimit: (limit: string) => void,
 *   onSetPersonalizedPlan: (plan: string) => void,
 *   onCloseMove: (eventType: "graduated"|"replaced", structuredReason: string, note: string, exitImpact: number|null) => void,
 *   onBack?: () => void,
 * }} props
 */
export function FallManageMove({ member, move, latestMoveCheckin, onAddNote, onChangeDose, onSetWeeklyPlanLimit, onSetPersonalizedPlan, onCloseMove, onBack }) {
  const mv = FALL_CAPACITY_MOVES[move.move_key];

  const [note, setNote] = useState(move.coach_note || "");
  const [noteMsg, setNoteMsg] = useState("");

  const [plan, setPlan] = useState(move.personalized_plan || "");
  const [planMsg, setPlanMsg] = useState("");

  const [dose, setDose] = useState(move.dose);
  const [doseReason, setDoseReason] = useState("");
  const [doseNote, setDoseNote] = useState("");
  const [doseMsg, setDoseMsg] = useState("");

  const [limit, setLimit] = useState(move.weekly_plan_limit || "no_limit");
  const [limitMsg, setLimitMsg] = useState("");

  const [closeType, setCloseType] = useState(null); // "graduated" | "replaced"
  const [closeReason, setCloseReason] = useState("");
  const [closeNote, setCloseNote] = useState("");
  const [closeImpact, setCloseImpact] = useState("");
  const [closeMsg, setCloseMsg] = useState("");

  const handleSaveNote = () => {
    onAddNote(note.trim());
    setNoteMsg("Saved — visible to the member now.");
    setTimeout(() => setNoteMsg(""), 2500);
  };

  const handleSavePlan = () => {
    onSetPersonalizedPlan(plan.trim());
    setPlanMsg("Saved — visible to the member now.");
    setTimeout(() => setPlanMsg(""), 2500);
  };

  const handleSaveDose = () => {
    if (dose === move.dose) { setDoseMsg("Pick a different dose first."); return; }
    if (!doseReason) { setDoseMsg("Pick a structured reason before saving."); return; }
    onChangeDose(dose, doseReason, doseNote.trim());
    setDoseMsg("Dose updated — visible to the member now.");
    setTimeout(() => setDoseMsg(""), 2500);
  };

  const handleSaveLimit = () => {
    if (limit === (move.weekly_plan_limit || "no_limit")) { setLimitMsg("Already set to this."); return; }
    onSetWeeklyPlanLimit(limit);
    setLimitMsg("Saved.");
    setTimeout(() => setLimitMsg(""), 2500);
  };

  const handleClose = () => {
    if (!closeType) return;
    if (!closeReason) { setCloseMsg("Pick a structured reason before closing."); return; }
    onCloseMove(closeType, closeReason, closeNote.trim(), closeImpact ? Number(closeImpact) : null);
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
          <div style={{ color: "#aaa", fontSize: "0.85rem" }}>{move.move_key} — {mv.title}</div>
          <div style={{ color: "#777", fontSize: "0.75rem", marginTop: "0.4rem" }}>Currently on: {move.dose?.toUpperCase()}</div>
        </div>

        <SectionCard title={latestMoveCheckin ? `Latest Move check-in · ${new Date(latestMoveCheckin.submitted_at).toLocaleDateString()}` : "Latest Move check-in"}>
          {latestMoveCheckin ? (
            <>
              <div style={{ fontSize: "0.85rem", color: DARK, marginBottom: "0.3rem" }}>
                <strong>Used:</strong> {labelFor(MOVE_USED_OPTIONS, latestMoveCheckin.move_used)}
              </div>
              <div style={{ fontSize: "0.85rem", color: DARK, marginBottom: "0.3rem" }}>
                <strong>Helped:</strong> {latestMoveCheckin.move_used && !["sometimes", "most_of_the_time"].includes(latestMoveCheckin.move_used)
                  ? "Not assessed"
                  : labelFor(MOVE_HELPED_OPTIONS, latestMoveCheckin.move_helped)}
              </div>
              <div style={{ fontSize: "0.85rem", color: DARK }}>
                <strong>Constraint impact:</strong> {latestMoveCheckin.move_constraint_impact ? `${latestMoveCheckin.move_constraint_impact} / 5` : "Not answered"}
              </div>
            </>
          ) : (
            <div style={{ fontSize: "0.85rem", color: "#aaa" }}>No weekly check-in submitted yet.</div>
          )}
        </SectionCard>

        <SectionCard title="Coach note">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Personalize the execution detail for this member — shows on their My Move tab."
            style={{ width: "100%", padding: "0.6rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, resize: "vertical", boxSizing: "border-box", marginBottom: "0.6rem" }}
          />
          <button
            onClick={handleSaveNote}
            style={{ background: G, color: "#fff", border: "none", borderRadius: "10px", padding: "0.6rem 1.1rem", fontWeight: "bold", fontSize: "0.85rem", cursor: "pointer" }}
          >
            Save Note
          </button>
          {noteMsg && <div style={{ color: G, fontSize: "0.8rem", marginTop: "0.5rem" }}>{noteMsg}</div>}
        </SectionCard>

        <SectionCard title="Personalize this Move">
          <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.6rem" }}>
            Write the specific action you agreed on. The member will see this on My Move and My Week.
          </div>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value.slice(0, 300))}
            rows={2}
            maxLength={300}
            placeholder="Example: Put my phone on the kitchen charger when I start the boys' bedtime routine."
            style={{ width: "100%", padding: "0.6rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, resize: "vertical", boxSizing: "border-box", marginBottom: "0.4rem" }}
          />
          <div style={{ fontSize: "0.72rem", color: "#aaa", marginBottom: "0.6rem", textAlign: "right" }}>{plan.length}/300</div>
          <button
            onClick={handleSavePlan}
            style={{ background: G, color: "#fff", border: "none", borderRadius: "10px", padding: "0.6rem 1.1rem", fontWeight: "bold", fontSize: "0.85rem", cursor: "pointer" }}
          >
            Save Plan
          </button>
          {planMsg && <div style={{ color: G, fontSize: "0.8rem", marginTop: "0.5rem" }}>{planMsg}</div>}
        </SectionCard>

        <SectionCard title="A/B/E dose (Section 12)">
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
          {dose !== move.dose && (
            <>
              <ReasonPicker value={doseReason} onChange={setDoseReason} />
              <textarea
                value={doseNote}
                onChange={(e) => setDoseNote(e.target.value)}
                rows={2}
                placeholder="Optional note"
                style={{ width: "100%", padding: "0.6rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, resize: "vertical", boxSizing: "border-box", marginBottom: "0.6rem" }}
              />
              <button
                onClick={handleSaveDose}
                style={{ background: G, color: "#fff", border: "none", borderRadius: "10px", padding: "0.6rem 1.1rem", fontWeight: "bold", fontSize: "0.85rem", cursor: "pointer" }}
              >
                Update Dose
              </button>
            </>
          )}
          {doseMsg && <div style={{ color: dose !== move.dose ? "#e05030" : G, fontSize: "0.8rem", marginTop: "0.5rem" }}>{doseMsg}</div>}
        </SectionCard>

        <SectionCard title="Weekly plan limit">
          <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            style={{ width: "100%", padding: "0.6rem 0.7rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, background: "#fff", marginBottom: "0.6rem" }}
          >
            {WEEKLY_LIMIT_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
          <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "0.6rem", lineHeight: 1.4 }}>
            Keeps weekly targets from increasing beyond this level while this Move is active.
          </div>
          <button
            onClick={handleSaveLimit}
            style={{ background: G, color: "#fff", border: "none", borderRadius: "10px", padding: "0.6rem 1.1rem", fontWeight: "bold", fontSize: "0.85rem", cursor: "pointer" }}
          >
            Save
          </button>
          {limitMsg && <div style={{ color: G, fontSize: "0.8rem", marginTop: "0.5rem" }}>{limitMsg}</div>}
        </SectionCard>

        <SectionCard title="Close this Move">
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
            {[["graduated", "Graduated"], ["replaced", "Replaced"]].map(([id, label]) => {
              const selected = closeType === id;
              return (
                <button
                  key={id}
                  onClick={() => setCloseType(selected ? null : id)}
                  style={{
                    flex: 1, padding: "0.6rem", borderRadius: "10px",
                    border: `1.5px solid ${selected ? "#e05030" : "#e0e0e0"}`,
                    background: selected ? "#e05030" : "#fff", color: selected ? "#fff" : DARK,
                    fontWeight: "600", fontSize: "0.85rem", cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {closeType && (
            <>
              <ReasonPicker value={closeReason} onChange={setCloseReason} />
              <input
                type="number" min="1" max="5" value={closeImpact}
                onChange={(e) => setCloseImpact(e.target.value)}
                placeholder="Exit Constraint Impact 1–5 (Section 41 — only if closing early)"
                style={{ width: "100%", padding: "0.6rem 0.7rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, boxSizing: "border-box", marginBottom: "0.6rem" }}
              />
              <textarea
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                rows={2}
                placeholder="Optional note"
                style={{ width: "100%", padding: "0.6rem", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "0.85rem", fontFamily: SANS, resize: "vertical", boxSizing: "border-box", marginBottom: "0.6rem" }}
              />
              <button
                onClick={handleClose}
                style={{ width: "100%", background: "#e05030", color: "#fff", border: "none", borderRadius: "10px", padding: "0.7rem", fontWeight: "bold", fontSize: "0.85rem", cursor: "pointer" }}
              >
                Confirm — Mark {closeType === "graduated" ? "Graduated" : "Replaced"}
              </button>
            </>
          )}
          {closeMsg && <div style={{ color: "#e05030", fontSize: "0.8rem", marginTop: "0.5rem" }}>{closeMsg}</div>}
        </SectionCard>
      </div>
    </div>
  );
}
