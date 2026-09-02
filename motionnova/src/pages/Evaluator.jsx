/* ============================================================================
   MotionNova — Squat Form Evaluator page
   ----------------------------------------------------------------------------
   Core MVP feature. Pose-detection, angle math, and state-machine logic
   are unchanged from the original version — this file adds the advanced
   UI treatment (glow effects, animated HUD, gradient gauge, hover-lift).
============================================================================ */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { COLORS, FONT_MONO, shared } from "../theme.js";

/* ── MediaPipe CDN loader ─────────────────────────────────────────────────
   The @mediapipe/pose npm package is NOT compatible with Vite's bundler —
   Vite minifies internal class names (e.g. Pose → sf) which breaks the
   constructor. We load the scripts directly from CDN at runtime instead,
   exactly as MediaPipe recommends for web usage.
──────────────────────────────────────────────────────────────────────── */
// Keep the library and its model assets on the exact same MediaPipe release.
// An unversioned CDN URL can serve a newer, incompatible bundle.
const MEDIAPIPE_VERSION = "0.5.1675469404";
const POSE_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${MEDIAPIPE_VERSION}`;
const DRAWING_UTILS_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124";
let mediaPipePromise;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.crossOrigin = "anonymous";
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

function loadMediaPipe() {
  if (!mediaPipePromise) {
    mediaPipePromise = Promise.all([loadScript(`${POSE_CDN}/pose.js`), loadScript(`${DRAWING_UTILS_CDN}/drawing_utils.js`)])
      .then(() => {
        if (typeof window.Pose !== "function") {
          throw new Error("MediaPipe Pose did not load correctly. Please refresh and try again.");
        }
        if (typeof window.drawConnectors !== "function" || typeof window.drawLandmarks !== "function") {
          throw new Error("MediaPipe drawing utilities did not load correctly. Please refresh and try again.");
        }
      })
      .catch((error) => {
        mediaPipePromise = null;
        throw error;
      });
  }
  return mediaPipePromise;
}

/* ANGLE MATH ENGINE */
function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

const LM = { L_HIP: 23, R_HIP: 24, L_KNEE: 25, R_KNEE: 26, L_ANKLE: 27, R_ANKLE: 28 };

export default function Evaluator() {
  const [cameraActive, setCameraActive] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [kneeAngle, setKneeAngle] = useState(180);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState({ text: "Get in frame and press Start.", level: "idle" });
  const [sessionLog, setSessionLog] = useState([]);
  const [summary, setSummary] = useState(null);
  const [depthPercent, setDepthPercent] = useState(0);
  const [saveMessage, setSaveMessage] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const poseRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef("STANDING");
  const minAngleRef = useRef(180);
  const sessionActiveRef = useRef(false);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  const completeRep = useCallback((minAngle) => {
    const isGoodDepth = minAngle <= 90;
    const quality = isGoodDepth ? "Good Depth (Parallel)" : "Shallow Depth";
    const tip = isGoodDepth ? "Great depth! Drive straight up!" : "Go lower! Lower hips parallel to knees.";
    const repScore = isGoodDepth ? 100 : 80;

    setRepCount((prev) => prev + 1);
    setFeedback({ text: tip, level: isGoodDepth ? "good" : "warn" });
    setSessionLog((prev) => [
      { id: prev.length + 1, quality, tip, minAngle: Math.round(minAngle), score: repScore, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  }, []);

  /* STATE MACHINE — STANDING -> DESCENDING -> ASCENDING (rep complete).
     Immediately resetting to STANDING after counting prevents double-counts
     from angle jitter near the 160° threshold. */
  const runStateMachine = useCallback(
    (angle) => {
      if (!sessionActiveRef.current) return;

      if (stateRef.current === "STANDING") {
        if (angle < 140) {
          stateRef.current = "DESCENDING";
          minAngleRef.current = angle;
        }
        setDepthPercent(0);
      } else {
        if (angle < minAngleRef.current) minAngleRef.current = angle;
        const pct = Math.max(0, Math.min(100, Math.round(((170 - angle) / (170 - 90)) * 100)));
        setDepthPercent(pct);

        if (angle > 160) {
          completeRep(minAngleRef.current);
          stateRef.current = "STANDING";
          minAngleRef.current = 180;
        }
      }
    },
    [completeRep]
  );

  const onResults = useCallback(
    (results) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || !video.videoWidth) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.poseLandmarks) {
        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: COLORS.cyan, lineWidth: 3 });
        window.drawLandmarks(ctx, results.poseLandmarks, { color: COLORS.green, lineWidth: 1, radius: 4 });

        const lm = results.poseLandmarks;
        const leftVisibility = (lm[LM.L_KNEE].visibility + lm[LM.L_ANKLE].visibility) / 2;
        const rightVisibility = (lm[LM.R_KNEE].visibility + lm[LM.R_ANKLE].visibility) / 2;
        const useLeft = leftVisibility >= rightVisibility;

        const hip = useLeft ? lm[LM.L_HIP] : lm[LM.R_HIP];
        const knee = useLeft ? lm[LM.L_KNEE] : lm[LM.R_KNEE];
        const ankle = useLeft ? lm[LM.L_ANKLE] : lm[LM.R_ANKLE];

        const angle = calculateAngle(hip, knee, ankle);
        setKneeAngle(Math.round(angle));
        runStateMachine(angle);
      }
      ctx.restore();
    },
    [runStateMachine]
  );

  const startCamera = async () => {
    try {
      // Load and validate the model before requesting the webcam. This prevents
      // a model-load error from leaving the browser camera indicator on.
      await loadMediaPipe();

      if (!poseRef.current) {
        const pose = new window.Pose({
          locateFile: (file) => `${POSE_CDN}/${file}`,
        });
        pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        pose.onResults(onResults);
        poseRef.current = pose;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setSessionLog([]);
      setSummary(null);
      setSaveMessage("");
      setRepCount(0);
      setFeedback({ text: "Session live — get into position!", level: "idle" });
      stateRef.current = "STANDING";
      minAngleRef.current = 180;

      setCameraActive(true);
      setSessionActive(true);
      sessionActiveRef.current = true;

      const detectFrame = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          await poseRef.current.send({ image: videoRef.current });
        }
        rafRef.current = requestAnimationFrame(detectFrame);
      };
      detectFrame();
    } catch (err) {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraActive(false);
      setSessionActive(false);
      sessionActiveRef.current = false;
      alert("Unable to start the camera session: " + err.message);
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setSessionActive(false);
    sessionActiveRef.current = false;

    setSessionLog((currentLog) => {
      if (currentLog.length === 0) {
        setSummary({ totalReps: 0, formScore: 0, recommendation: "No reps detected — try again with your full body in frame.", log: [] });
        setSaveMessage("No session was saved because no completed reps were detected.");
        return currentLog;
      }
      const avgScore = Math.round(currentLog.reduce((sum, r) => sum + r.score, 0) / currentLog.length);
      const shallowCount = currentLog.filter((r) => r.quality === "Shallow Depth").length;
      const recommendation =
        shallowCount > currentLog.length / 2
          ? "Focus on squatting deeper — aim to bring your hips level with your knees on every rep."
          : "Solid depth control this session — keep it up and start focusing on tempo and control.";

      const completedSession = { totalReps: currentLog.length, formScore: avgScore, recommendation, log: currentLog };
      setSummary(completedSession);

      try {
        const key = `motionnova_session_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify(completedSession));
        setSaveMessage("✓ Session saved automatically in this browser.");
      } catch {
        setSaveMessage("Unable to save this session in this browser.");
      }
      return currentLog;
    });
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const feedbackColor = feedback.level === "good" ? COLORS.green : feedback.level === "warn" ? COLORS.amber : COLORS.muted;
  const feedbackGlow =
    feedback.level === "good" ? "0 0 20px rgba(57,255,136,0.25)" : feedback.level === "warn" ? "0 0 20px rgba(255,176,32,0.25)" : "none";

  return (
    <div className="evaluator-content" style={shared.content}>
      <header className="evaluator-header" style={styles.header}>
        <div>
          <div style={styles.eyebrow}><span style={styles.eyebrowDot} /> MOTION ANALYSIS LAB</div>
          <h1 className="evaluator-title" style={styles.title}>Squat Form Evaluator</h1>
          <p style={styles.tagline}>Precision feedback for stronger, safer movement.</p>
        </div>
        <div style={{ ...styles.statusBadge, borderColor: sessionActive ? COLORS.green : COLORS.cyan, color: sessionActive ? COLORS.green : COLORS.cyan }}>
          <span style={{ ...styles.statusDot, background: sessionActive ? COLORS.green : COLORS.cyan }} />
          {sessionActive ? "Live Session Active" : "System Ready"}
        </div>
      </header>

      <div className="evaluator-insights" style={styles.insightRow}>
        <div style={styles.insightItem}><span style={styles.insightIcon}>◎</span><div><b>On-device analysis</b><small>Your camera feed stays in your browser</small></div></div>
        <div style={styles.insightItem}><span style={{ ...styles.insightIcon, color: COLORS.green }}>↗</span><div><b>Live depth tracking</b><small>Target: knees at or below 90°</small></div></div>
        <div style={styles.insightItem}><span style={{ ...styles.insightIcon, color: COLORS.purple }}>◌</span><div><b>Ready when you are</b><small>Frame your full body before starting</small></div></div>
      </div>

      <main className="evaluator-grid" style={styles.grid}>
        <section style={shared.panel}>
          <div style={styles.videoWrap}>
            <video ref={videoRef} style={styles.video} muted playsInline />
            <canvas ref={canvasRef} style={styles.canvas} />

            <div style={styles.cameraLabel}><span style={{ ...styles.statusDot, background: cameraActive ? COLORS.green : COLORS.muted }} /> {cameraActive ? "CAMERA ONLINE" : "CAMERA PREVIEW"}</div>

            <div
              style={{
                ...styles.hudCard,
                top: 14,
                left: 14,
                boxShadow: sessionActive ? "0 0 20px rgba(0,240,255,0.2)" : "none",
              }}
            >
              <div style={styles.hudLabel}>KNEE ANGLE</div>
              <div style={styles.hudValueMono}>{kneeAngle}°</div>
            </div>

            <div
              style={{
                ...styles.hudCard,
                top: 14,
                right: 14,
                animation: repCount > 0 ? "pulseGlowGreen 1.8s ease-in-out 1" : "none",
              }}
            >
              <div style={styles.hudLabel}>REPS</div>
              <div style={styles.hudValueMono}>{repCount}</div>
            </div>

            {cameraActive && (
              <div
                key={feedback.text}
                style={{
                  ...styles.feedbackBanner,
                  borderColor: feedbackColor,
                  color: feedbackColor,
                  boxShadow: feedbackGlow,
                  animation: "fadeInUp 0.35s ease",
                }}
              >
                {feedback.text}
              </div>
            )}
            {!cameraActive && (
              <div style={styles.placeholderOverlay}>Camera is off. Press "Start Camera &amp; Session" below.</div>
            )}
          </div>

          <div style={styles.controlsRow}>
            <button
              style={{ ...shared.btn, ...shared.btnPrimary, opacity: cameraActive ? 0.4 : 1, cursor: cameraActive ? "not-allowed" : "pointer", flex: 1 }}
              onClick={startCamera}
              disabled={cameraActive}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              ▶ Start Camera &amp; Session
            </button>
            <button
              style={{ ...shared.btn, ...shared.btnDanger, opacity: cameraActive ? 1 : 0.4, cursor: cameraActive ? "pointer" : "not-allowed", flex: 1 }}
              onClick={stopCamera}
              disabled={!cameraActive}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              ■ Stop &amp; Finish Session
            </button>
          </div>
        </section>

        <section style={shared.panel}>
          <h3 style={shared.sectionTitle}>Real-Time Form Meter</h3>
          <DepthGauge percent={depthPercent} />

          <h3 style={{ ...shared.sectionTitle, marginTop: 24 }}>Live Feedback Stream</h3>
          <div style={styles.feedStream}>
            {sessionLog.length === 0 && <div style={styles.feedEmpty}>Completed reps will appear here as they happen.</div>}
            {sessionLog.map((rep) => (
              <div
                key={rep.id}
                style={{
                  ...styles.feedItem,
                  borderLeftColor: rep.quality === "Good Depth (Parallel)" ? COLORS.green : COLORS.amber,
                  animation: "fadeInUp 0.4s ease",
                }}
              >
                <div style={styles.feedItemHeader}>
                  <span style={{ fontFamily: FONT_MONO }}>Rep #{rep.id}</span>
                  <span style={{ fontFamily: FONT_MONO }}>{rep.time}</span>
                </div>
                <div style={{ fontWeight: 600, color: rep.quality === "Good Depth (Parallel)" ? COLORS.green : COLORS.amber }}>
                  {rep.quality} · {rep.minAngle}°
                </div>
                <div style={{ color: COLORS.muted, fontSize: 13 }}>{rep.tip}</div>
              </div>
            ))}
          </div>

          {summary && (
            <div style={styles.summaryCard}>
              <h3 style={{ ...shared.sectionTitle, marginTop: 0 }}>Session Summary</h3>
              <div style={styles.summaryRow}>
                <span style={{ color: COLORS.muted, fontSize: 13 }}>Total Reps</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.cyan, fontWeight: 700 }}>{summary.totalReps}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={{ color: COLORS.muted, fontSize: 13 }}>Overall Form Score</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.cyan, fontWeight: 700 }}>{summary.formScore}%</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{ color: COLORS.muted, fontSize: 13 }}>Coaching Recommendation</span>
                <p style={{ color: COLORS.text, marginTop: 6, lineHeight: 1.5 }}>{summary.recommendation}</p>
              </div>
              <p style={{ color: summary.totalReps > 0 ? COLORS.green : COLORS.amber, fontSize: 13, margin: "12px 0 0" }}>
                {saveMessage}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* Radial gauge showing live squat depth: 0% standing, 100% full parallel
   depth. Gains a gradient stroke and glow once depth target is reached. */
function DepthGauge({ percent }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);
  const isComplete = percent >= 100;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg
        width={130}
        height={130}
        viewBox="0 0 130 130"
        style={{ filter: isComplete ? "drop-shadow(0 0 10px rgba(57,255,136,0.6))" : "none" }}
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isComplete ? COLORS.green : COLORS.cyan} />
            <stop offset="100%" stopColor={COLORS.purple} />
          </linearGradient>
        </defs>
        <circle cx="65" cy="65" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
        <circle
          cx="65"
          cy="65"
          r={r}
          stroke="url(#gaugeGradient)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 0.15s linear" }}
        />
        <text x="65" y="72" textAnchor="middle" fill={COLORS.text} fontFamily={FONT_MONO} fontSize="22">
          {percent}%
        </text>
      </svg>
      <div style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.5, maxWidth: 150 }}>
        Fills up as you descend. Reaching 100% means you hit parallel depth (≤90° knee angle).
      </div>
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  eyebrow: { display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.4, color: COLORS.cyan, marginBottom: 8 },
  eyebrowDot: { width: 6, height: 6, borderRadius: "50%", background: COLORS.cyan, boxShadow: "0 0 12px rgba(0,240,255,.9)" },
  title: { margin: 0, fontSize: 36, lineHeight: 1.15, fontWeight: 800, letterSpacing: -1.2 },
  tagline: { margin: "7px 0 0", color: COLORS.muted, fontSize: 14, letterSpacing: 0.2 },
  statusBadge: { display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: "1px solid", fontFamily: FONT_MONO, fontSize: 12, background: "rgba(255,255,255,0.03)" },
  statusDot: { width: 8, height: 8, borderRadius: "50%" },
  insightRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 },
  insightItem: { display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, background: "rgba(255,255,255,.025)", fontSize: 12 },
  insightIcon: { color: COLORS.cyan, fontFamily: FONT_MONO, fontSize: 22, lineHeight: 1 },
  grid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" },
  videoWrap: { position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: 16, overflow: "hidden", background: "#03060b", border: `1px solid ${COLORS.panelBorder}`, boxShadow: "inset 0 0 45px rgba(0,0,0,.55)" },
  video: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" },
  canvas: { position: "absolute", inset: 0, width: "100%", height: "100%", transform: "scaleX(-1)" },
  cameraLabel: { position: "absolute", display: "flex", alignItems: "center", gap: 7, bottom: 14, left: 14, padding: "6px 9px", borderRadius: 7, color: COLORS.text, fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 0.7, background: "rgba(5,9,15,.75)", border: "1px solid rgba(255,255,255,.1)" },
  hudCard: { position: "absolute", background: "rgba(10,14,23,0.7)", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 10, padding: "8px 14px", backdropFilter: "blur(6px)", transition: "box-shadow 0.3s" },
  hudLabel: { fontSize: 10, letterSpacing: 1.5, color: COLORS.muted },
  hudValueMono: { fontFamily: FONT_MONO, fontSize: 22, color: COLORS.cyan, fontWeight: 600 },
  feedbackBanner: { position: "absolute", bottom: 14, left: 14, right: 14, textAlign: "center", padding: "10px 12px", borderRadius: 10, border: "1px solid", background: "rgba(10,14,23,0.8)", backdropFilter: "blur(6px)", fontSize: 14, fontWeight: 600 },
  placeholderOverlay: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.muted, fontSize: 14, padding: 20, textAlign: "center" },
  controlsRow: { display: "flex", gap: 12, marginTop: 16 },
  feedStream: { maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 },
  feedEmpty: { color: COLORS.muted, fontSize: 13, fontStyle: "italic" },
  feedItem: { background: "rgba(255,255,255,0.03)", borderLeft: "3px solid", borderRadius: 8, padding: "10px 12px" },
  feedItemHeader: { display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, marginBottom: 4 },
  summaryCard: { marginTop: 24, padding: 18, borderRadius: 12, background: "rgba(168,85,247,0.08)", border: `1px solid ${COLORS.purple}` },
  summaryRow: { display: "flex", justifyContent: "space-between", padding: "6px 0" },
};
