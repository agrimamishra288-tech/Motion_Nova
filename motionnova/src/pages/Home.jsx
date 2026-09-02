import React from "react";
import { Link } from "react-router-dom";
import { COLORS, FONT_MONO, shared } from "../theme.js";

export default function Home() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Ambient floating gradient orbs behind everything — purely decorative,
          gives the page depth instead of a flat dark background. */}
      <div style={{ ...styles.orb, top: -80, left: -60, background: COLORS.purple, animationDelay: "0s" }} />
      <div style={{ ...styles.orb, top: 200, right: -100, background: COLORS.cyan, animationDelay: "1.2s" }} />

      <div style={{ ...shared.content, position: "relative", zIndex: 1 }}>
        {/* ---------------- HERO ---------------- */}
        <section style={styles.hero}>
          <span style={{ ...styles.eyebrow, ...shared.fadeInUp(0) }}>
            SIH MVP · Real-Time Movement AI
          </span>
          <h1 style={{ ...styles.heroTitle, ...shared.fadeInUp(100) }}>
            Your form coach,<br />running in the browser.
          </h1>
          <p style={{ ...styles.heroSubtitle, ...shared.fadeInUp(200) }}>
            MotionNova watches your squats through your webcam, measures your
            knee angle in real time, and tells you exactly when to go deeper —
            no wearables, no gym camera setup, no data leaving your device.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 28, ...shared.fadeInUp(320) }}>
            <Link to="/evaluator" style={{ textDecoration: "none" }}>
              <button
                style={{ ...shared.btn, ...shared.btnPrimary }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                ▶ Start a Session
              </button>
            </Link>
            <Link to="/about" style={{ textDecoration: "none" }}>
              <button style={{ ...shared.btn, ...shared.btnGhost }}>How it works</button>
            </Link>
          </div>

          {/* Stat strip */}
          <div style={{ ...styles.statStrip, ...shared.fadeInUp(440) }}>
            <Stat value="33" label="Landmarks Tracked" />
            <Stat value="~60fps" label="Live Inference" />
            <Stat value="100%" label="Runs Client-Side" />
          </div>
        </section>

        {/* ---------------- FEATURES ---------------- */}
        <section style={styles.featureGrid}>
          <FeatureCard
            index={0}
            title="Live Pose Detection"
            desc="MediaPipe tracks 33 body landmarks per frame directly in your browser — no video is ever uploaded anywhere."
          />
          <FeatureCard
            index={1}
            title="Real-Time Coaching"
            desc="A knee-angle state machine detects each rep as it happens and grades depth instantly, with clear feedback."
          />
          <FeatureCard
            index={2}
            title="Session Analytics"
            desc="Every session is scored and logged locally, so you can track form consistency across workouts over time."
          />
        </section>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={styles.stat}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.cyan, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function FeatureCard({ title, desc, index }) {
  return (
    <div
      style={{
        ...shared.panel,
        flex: 1,
        position: "relative",
        overflow: "hidden",
        ...shared.fadeInUp(500 + index * 120),
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.borderColor = COLORS.cyan;
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,240,255,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = COLORS.panelBorder;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={styles.featureAccent} />
      <h3 style={{ ...shared.sectionTitle, color: COLORS.cyan }}>{title}</h3>
      <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

const styles = {
  orb: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: "50%",
    filter: "blur(90px)",
    opacity: 0.18,
    animation: "floatOrb 10s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  hero: { padding: "60px 10px 40px", maxWidth: 720 },
  eyebrow: { fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1.5, color: COLORS.purple, display: "inline-block" },
  heroTitle: { fontSize: 44, lineHeight: 1.15, margin: "14px 0 18px", fontWeight: 700 },
  heroSubtitle: { color: COLORS.muted, fontSize: 16, lineHeight: 1.7, maxWidth: 600 },
  statStrip: { display: "flex", gap: 32, marginTop: 40 },
  stat: { paddingLeft: 16, borderLeft: `1px solid ${COLORS.panelBorder}` },
  featureGrid: { display: "flex", gap: 20, marginTop: 30, flexWrap: "wrap" },
  featureAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.purple})`,
  },
};