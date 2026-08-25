// Fall 2026 — Midweek Reset (Section 16)
// "5-10 seconds." One question, at most one follow-up. No make-up requirement ever offered.
//
// MERGE NOTE: self-contained for standalone review, same pattern as the other fall-*-ui files.
// Delete the duplicated style constants below once pasted into gbsc-capacity-app.jsx.

import React, { useState } from "react";

// ─── duplicated from main app — delete on merge, use the real ones instead ───
const G = "#5DC842";
const DARK = "#2D2D2D";
const CARD = "#fdfcfb";
const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.05)";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
// ─── end duplicated block ─────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { id: "on_track", label: "On track" },
  { id: "adjust", label: "Need to adjust" },
  { id: "got_away", label: "This week got away from me" },
];

/**
 * @param {{
 *   moveTitle: string,
 *   onComplete: (result: { status: string, shiftToAnchor: boolean|null }) => void,
 * }} props
 */
export function FallMidweekReset({ moveTitle, onComplete }) {
  const [status, setStatus] = useState(null);

  const handleStatus = (id) => {
    setStatus(id);
    if (id === "on_track") onComplete({ status: id, shiftToAnchor: null });
    if (id === "got_away") onComplete({ status: id, shiftToAnchor: null }); // recommend Anchor, no make-up requirement — nothing more to ask
  };

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: SANS, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ maxWidth: "400px", width: "100%", background: CARD, borderRadius: "16px", boxShadow: CARD_SHADOW, padding: "1.5rem" }}>
        <div style={{ fontSize: "1.05rem", fontWeight: "bold", color: DARK, marginBottom: "0.3rem" }}>
          How's your Capacity Move going?
        </div>
        {moveTitle && <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: "1.1rem" }}>{moveTitle}</div>}

        {status !== "adjust" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleStatus(opt.id)}
                style={{
                  padding: "0.8rem 1rem", minHeight: "44px", textAlign: "left",
                  border: "1.5px solid #e0e0e0", borderRadius: "10px",
                  background: "#fff", color: DARK, cursor: "pointer",
                  fontSize: "0.92rem", fontWeight: "600",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {status === "adjust" && (
          <div>
            <div style={{ fontSize: "0.9rem", color: DARK, marginBottom: "0.8rem" }}>Shift to Anchor for the rest of this week?</div>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                onClick={() => onComplete({ status: "adjust", shiftToAnchor: true })}
                style={{ flex: 1, padding: "0.8rem", minHeight: "44px", border: "none", borderRadius: "10px", background: G, color: "#fff", fontWeight: "bold", cursor: "pointer" }}
              >
                Yes
              </button>
              <button
                onClick={() => onComplete({ status: "adjust", shiftToAnchor: false })}
                style={{ flex: 1, padding: "0.8rem", minHeight: "44px", border: "1.5px solid #e0e0e0", borderRadius: "10px", background: "#fff", color: DARK, fontWeight: "600", cursor: "pointer" }}
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
