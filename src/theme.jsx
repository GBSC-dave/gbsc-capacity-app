// Shared style constants + tiny primitives, pulled out of gbsc-capacity-app.jsx so both
// the main app and src/fall/*.jsx can import them without a circular dependency (the main
// file imports Fall components; Fall components need these — this file depends on neither).
import React from "react";

export const G = "#5DC842";
export const DARK = "#2D2D2D";
export const CARD = "#fdfcfb";
export const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.05)";
export const PAGE_BG = "#f9f7f4";
export const LIGHT_BG = "linear-gradient(180deg, #fdfcfb 0%, #c2bfc8 100%)";
export const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export function F({ label, children }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.3rem", color: DARK, fontSize: "0.9rem" }}>{label}</label>
      {children}
    </div>
  );
}
