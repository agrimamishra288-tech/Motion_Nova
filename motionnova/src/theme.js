/* ============================================================================
   SHARED DESIGN TOKENS
   Every page imports from here so the whole app stays visually consistent
   instead of each page re-declaring its own colors/fonts.
============================================================================ */
export const COLORS = {
  void: "#0a0e17",
  panel: "rgba(18, 24, 38, 0.72)",
  panelBorder: "rgba(0, 240, 255, 0.15)",
  cyan: "#00f0ff",
  purple: "#a855f7",
  green: "#39ff88",
  amber: "#ffb020",
  red: "#ff4757",
  text: "#e8ecf5",
  muted: "#7a8699",
};

export const FONT_DISPLAY = "'Manrope', 'Segoe UI', sans-serif";
export const FONT_MONO = "'DM Mono', 'Courier New', monospace";

/* Reusable glow shadows — used on active/highlighted elements to give
   an "advanced HUD" feel instead of flat borders everywhere. */
export const GLOW = {
  cyan: "0 0 24px rgba(0,240,255,0.25), inset 0 0 0 1px rgba(0,240,255,0.2)",
  purple: "0 0 24px rgba(168,85,247,0.25), inset 0 0 0 1px rgba(168,85,247,0.2)",
  green: "0 0 24px rgba(57,255,136,0.25), inset 0 0 0 1px rgba(57,255,136,0.2)",
  amber: "0 0 24px rgba(255,176,32,0.25), inset 0 0 0 1px rgba(255,176,32,0.2)",
};

/* Reusable style building blocks used across pages */
export const shared = {
  pageBg: {
    minHeight: "100vh",
    background: `radial-gradient(circle at 12% -10%, rgba(168,85,247,0.2), transparent 34%), radial-gradient(circle at 88% 0%, rgba(0,240,255,0.12), transparent 32%), linear-gradient(135deg, #080b14 0%, #0b1020 55%, #070b13 100%)`,
    color: COLORS.text,
    fontFamily: FONT_DISPLAY,
  },
  content: {
    padding: "40px 32px 64px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  panel: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    backdropFilter: "blur(18px)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
  },
  sectionTitle: {
    fontSize: 15,
    letterSpacing: 0.5,
    color: COLORS.text,
    margin: "0 0 12px",
  },
  btn: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s, box-shadow 0.25s",
  },
  btnPrimary: {
    background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.purple})`,
    color: "#04101a",
    boxShadow: "0 4px 20px rgba(0,240,255,0.15)",
  },
  btnDanger: {
    background: COLORS.red,
    color: "#fff",
    boxShadow: "0 4px 20px rgba(255,71,87,0.15)",
  },
  btnGhost: {
    background: "rgba(255,255,255,0.05)",
    color: COLORS.text,
    border: `1px solid ${COLORS.panelBorder}`,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: `1px solid ${COLORS.panelBorder}`,
    background: "rgba(255,255,255,0.03)",
    color: COLORS.text,
    fontFamily: FONT_DISPLAY,
    fontSize: 14,
    outline: "none",
    marginBottom: 16,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  label: {
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 0.5,
    marginBottom: 6,
    display: "block",
  },
  // Handy fade-in-up animation generator — spread into any element's style
  fadeInUp: (delayMs = 0) => ({
    animation: `fadeInUp 0.6s ease ${delayMs}ms forwards`,
    opacity: 0,
  }),
};
