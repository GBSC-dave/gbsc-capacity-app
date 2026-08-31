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
import { G, DARK, CARD, CARD_SHADOW, SANS } from "../theme.jsx";

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
 *   move: { id: string, move_key: string, dose: string, coach_note: string|null },
 *   onAddNote: (note: string) => void,
 *   onChangeDose: (dose: string, structuredReason: string, note: string) => void,
 *   onCloseMove: (eventType: "graduated"|"replaced", structuredReason: string, note: string, exitImpact: number|null) => void,
 *   onBack?: () => void,
 * }} props
 */
export function FallManageMove({ member, move, onAddNote, onChangeDose, onCloseMove, onBack }) {
  const mv = FALL_CAPACITY_MOVES[move.move_key];

  const [note, setNote] = useState(move.coach_note || "");
  const [noteMsg, setNoteMsg] = useState("");

  const [dose, setDose] = useState(move.dose);
  const [doseReason, setDoseReason] = useState("");
  const [doseNote, setDoseNote] = useState("");
  const [doseMsg, setDoseMsg] = useState("");

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

  const handleSaveDose = () => {
    if (dose === move.dose) { setDoseMsg("Pick a different dose first."); return; }
    if (!doseReason) { setDoseMsg("Pick a structured reason before saving."); return; }
    onChangeDose(dose, doseReason, doseNote.trim());
    setDoseMsg("Dose updated — visible to the member now.");
    setTimeout(() => setDoseMsg(""), 2500);
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
