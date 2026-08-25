// Fall 2026 — Coach Triage Dashboard (Section 18)
// "Do not make the coach scroll 125 profiles." Summary counts up top, Priority members first.
//
// MERGE NOTE: self-contained for standalone review, same pattern as the other fall-*-ui files.
// Delete the duplicated style constants below once pasted into gbsc-capacity-app.jsx — this
// is meant to slot in as a new tab alongside CoachDashboard's existing Members/Insights/
// Analytics/Pods tabs, reusing its search input and CARD row style rather than inventing a
// new one.

import React, { useState } from "react";
import { deriveTriageState, TRIAGE_ORDER, TRIAGE_LABELS, TRIAGE_COLORS, summarizeTriage } from "./fall-triage-data.js";

// ─── duplicated from main app — delete on merge, use the real ones instead ───
const G = "#5DC842";
const DARK = "#2D2D2D";
const CARD = "#fdfcfb";
const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.05)";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
// ─── end duplicated block ─────────────────────────────────────────────────

/**
 * @param {{
 *   members: Array<{ id: string, name: string, moveTitle?: string, fallRecentChecks: array, scopeConcernFlag?: boolean }>,
 *   onSelectMember: (memberId: string) => void,
 * }} props
 * Each member needs `fallRecentChecks` (their own Fall weekly check-in submissions, chronological,
 * most recent last) — this component doesn't fetch that, the caller supplies it from fall_weekly_checks.
 */
export function FallCoachTriageDashboard({ members, onSelectMember }) {
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");

  const evaluated = members.map((m) => ({
    member: m,
    triage: deriveTriageState({ recentChecks: m.fallRecentChecks || [], scopeConcernFlag: m.scopeConcernFlag }),
  }));

  const counts = summarizeTriage(evaluated.map((e) => e.triage.state));

  const filtered = evaluated
    .filter((e) => (filterState === "all" ? true : e.triage.state === filterState))
    .filter((e) => e.member.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const rankA = a.triage.state ? TRIAGE_ORDER.indexOf(a.triage.state) : TRIAGE_ORDER.length;
      const rankB = b.triage.state ? TRIAGE_ORDER.indexOf(b.triage.state) : TRIAGE_ORDER.length;
      return rankA - rankB;
    });

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.6rem", marginBottom: "1.2rem" }}>
        {TRIAGE_ORDER.map((state) => {
          const active = filterState === state;
          return (
            <button
              key={state}
              onClick={() => setFilterState(active ? "all" : state)}
              style={{
                background: active ? TRIAGE_COLORS[state] : DARK, borderRadius: "12px", padding: "0.9rem 0.5rem",
                textAlign: "center", border: "none", cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#fff" }}>{counts[state]}</div>
              <div style={{ fontSize: "0.68rem", color: active ? "#fff" : "#aaa", fontWeight: "bold", marginTop: "0.1rem" }}>{TRIAGE_LABELS[state]}</div>
            </button>
          );
        })}
      </div>

      <input
        placeholder="🔍 Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "0.7rem 1rem", border: "1.5px solid #ddd", borderRadius: "12px", fontSize: "1rem", boxSizing: "border-box", marginBottom: "1rem" }}
      />

      {filtered.length === 0 && <div style={{ textAlign: "center", color: "#aaa", padding: "3rem" }}>No members match.</div>}

      {filtered.map(({ member, triage }) => (
        <div
          key={member.id}
          onClick={() => onSelectMember(member.id)}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: CARD, borderRadius: "12px", boxShadow: CARD_SHADOW,
            padding: "1rem 1.2rem", marginBottom: "0.7rem", cursor: "pointer",
            border: `1.5px solid ${triage.state ? TRIAGE_COLORS[triage.state] : "transparent"}`,
          }}
        >
          <div>
            <div style={{ fontWeight: "bold", color: DARK }}>{member.name}</div>
            {member.moveTitle && <div style={{ fontSize: "0.8rem", color: "#888" }}>{member.moveTitle}</div>}
            <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "0.2rem" }}>{triage.reason}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            {triage.state ? (
              <span
                style={{
                  fontSize: "0.72rem", fontWeight: "bold", color: "#fff",
                  background: TRIAGE_COLORS[triage.state], borderRadius: "999px", padding: "0.25rem 0.7rem",
                }}
              >
                {TRIAGE_LABELS[triage.state]}
              </span>
            ) : (
              <span style={{ fontSize: "0.78rem", color: "#bbb" }}>No check-ins</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
