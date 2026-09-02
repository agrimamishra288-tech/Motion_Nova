import React from "react";
import { COLORS, shared } from "../theme.js";

export default function About() {
  return (
    <div style={shared.content}>
      <h1 style={styles.title}>How MotionNova Works</h1>
      <p style={{ color: COLORS.muted, maxWidth: 680, lineHeight: 1.7 }}>
        A quick technical breakdown of the squat evaluator MVP — useful for
        walking judges or your teacher through the pipeline step by step.
      </p>

      <div style={styles.stepGrid}>
        {steps.map((step, i) => (
          <div
            key={step.title}
            style={{
              ...shared.panel,
              animation: "fadeInUp 0.5s ease",
              animationDelay: `${i * 80}ms`,
              animationFillMode: "backwards",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = COLORS.purple;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = COLORS.panelBorder;
            }}
          >
            <div style={styles.stepNumber}>{String(i + 1).padStart(2, "0")}</div>
            <h3 style={{ ...shared.sectionTitle, color: COLORS.cyan }}>{step.title}</h3>
            <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ ...shared.panel, marginTop: 32 }}>
        <h3 style={{ ...shared.sectionTitle, color: COLORS.purple }}>Tech Stack</h3>
        <ul style={styles.list}>
          <li>React (functional components, hooks)</li>
          <li>WebRTC — <code>navigator.mediaDevices.getUserMedia</code> for camera access</li>
          <li>HTML5 Canvas — for drawing the skeleton overlay</li>
          <li>MediaPipe Pose — in-browser pose estimation model</li>
          <li>React Router — multi-page navigation</li>
          <li>localStorage — session persistence (no backend yet)</li>
        </ul>
      </div>

      <div style={{ ...shared.panel, marginTop: 20 }}>
        <h3 style={{ ...shared.sectionTitle, color: COLORS.green }}>Beyond the MVP</h3>
        <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6 }}>
          Planned next steps: a real backend + auth so athlete history syncs
          across devices, more exercise types beyond squats (lunges, deadlifts),
          and a coach-facing dashboard to review multiple athletes' sessions.
        </p>
      </div>
    </div>
  );
}

const steps = [
  { title: "Camera Access", desc: "The browser asks for webcam permission and streams live video into a hidden <video> element." },
  { title: "Pose Estimation", desc: "Every frame is sent to MediaPipe Pose, which returns 33 body landmark coordinates in real time." },
  { title: "Angle Calculation", desc: "The hip, knee, and ankle coordinates are used with atan2 trigonometry to compute the live knee joint angle." },
  { title: "State Machine", desc: "The angle drives a Standing → Descending → Ascending state machine that detects one clean rep per squat." },
  { title: "Depth Grading", desc: "The lowest angle reached during the rep decides if it counts as 'Good Depth' or 'Shallow', instantly." },
  { title: "Session Summary", desc: "At the end, reps are averaged into a form score and saved locally so it shows up on the History page." },
];

const styles = {
  title: { fontSize: 28, marginBottom: 8 },
  stepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 18,
    marginTop: 32,
  },
  stepNumber: { fontFamily: "'JetBrains Mono', monospace", color: COLORS.purple, fontSize: 13, marginBottom: 8 },
  list: { color: COLORS.muted, fontSize: 14, lineHeight: 2, paddingLeft: 20, margin: 0 },
};