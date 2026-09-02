import React, { useState, useEffect } from "react";
import { COLORS, FONT_DISPLAY, FONT_MONO, shared } from "../theme.js";

const PROFILE_KEY = "motionnova_profile";
const emptyProfile = { name: "", age: "", sport: "", goal: "" };

/* ─────────────────────────────────────────────────────────────────
   LOCAL-ONLY profile for the MVP demo — stored in localStorage.
   Social-login buttons are UI-only placeholders ready to wire to
   Firebase / Auth0 in a production build.
   ───────────────────────────────────────────────────────────────── */
export default function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [saved, setSaved] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [socialHover, setSocialHover] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  const handleChange = (field) => (e) => {
    setProfile((p) => ({ ...p, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const inputStyle = (field) => ({
    ...styles.input,
    borderColor: focusedField === field ? COLORS.cyan : "rgba(0,240,255,0.15)",
    boxShadow: focusedField === field ? `0 0 0 3px rgba(0,240,255,0.08)` : "none",
  });

  return (
    <div style={styles.page}>
      {/* Ambient orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.wrapper}>

        {/* Page header */}
        <div style={styles.pageHeader}>
          <div style={styles.badge}>MY ACCOUNT</div>
          <h1 style={styles.pageTitle}>Athlete Profile</h1>
          <p style={styles.pageSubtitle}>
            Your data lives locally on this device for the demo —&nbsp;
            <span style={{ color: COLORS.cyan }}>no account or server yet.</span>
          </p>
        </div>

        {/* Main card */}
        <div style={styles.card}>

          {/* Avatar row */}
          <div style={styles.avatarRow}>
            <div style={styles.avatarRing}>
              <div style={styles.avatar}>{initials}</div>
            </div>
            <div>
              <div style={styles.avatarName}>{profile.name || "Your Name"}</div>
              <div style={styles.avatarSub}>{profile.sport || "Sport / Focus Area"}</div>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Profile form */}
          <form onSubmit={handleSave}>
            <div style={styles.sectionLabel}>PROFILE DETAILS</div>

            <div style={styles.grid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={inputStyle("name")}
                  value={profile.name}
                  onChange={handleChange("name")}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Krishna Mahajan"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Age</label>
                <input
                  style={inputStyle("age")}
                  type="number"
                  value={profile.age}
                  onChange={handleChange("age")}
                  onFocus={() => setFocusedField("age")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. 19"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Sport / Focus Area</label>
                <input
                  style={inputStyle("sport")}
                  value={profile.sport}
                  onChange={handleChange("sport")}
                  onFocus={() => setFocusedField("sport")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Athletics, Strength Training"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Primary Goal</label>
                <input
                  style={inputStyle("goal")}
                  value={profile.goal}
                  onChange={handleChange("goal")}
                  onFocus={() => setFocusedField("goal")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Improve squat depth"
                />
              </div>
            </div>

            <button
              type="submit"
              style={styles.saveBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,240,255,0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,240,255,0.15)";
              }}
            >
              {saved ? "✓  Profile Saved!" : "Save Profile"}
            </button>
          </form>

          <div style={styles.divider} />

          {/* Sign-in / Connect section */}
          <div style={styles.sectionLabel}>
            CONNECT ACCOUNT
            <span style={styles.comingSoon}>Coming soon</span>
          </div>
          <p style={styles.connectHint}>
            Sign in to sync your profile and history across devices.
          </p>

          <div style={styles.socialGrid}>
            {/* Google */}
            <button
              style={{ ...styles.socialBtn, ...(socialHover === "google" ? styles.socialBtnHover : {}) }}
              onMouseEnter={() => setSocialHover("google")}
              onMouseLeave={() => setSocialHover(null)}
              onClick={() => alert("Google sign-in coming soon!")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Email */}
            <button
              style={{ ...styles.socialBtn, ...(socialHover === "email" ? styles.socialBtnHover : {}) }}
              onMouseEnter={() => setSocialHover("email")}
              onMouseLeave={() => setSocialHover(null)}
              onClick={() => alert("Email sign-in coming soon!")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              Continue with Email
            </button>

            {/* Phone */}
            <button
              style={{ ...styles.socialBtn, ...(socialHover === "phone" ? styles.socialBtnHover : {}) }}
              onMouseEnter={() => setSocialHover("phone")}
              onMouseLeave={() => setSocialHover(null)}
              onClick={() => alert("Phone sign-in coming soon!")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Continue with Phone
            </button>

            {/* Apple */}
            <button
              style={{ ...styles.socialBtn, ...(socialHover === "apple" ? styles.socialBtnHover : {}) }}
              onMouseEnter={() => setSocialHover("apple")}
              onMouseLeave={() => setSocialHover(null)}
              onClick={() => alert("Apple sign-in coming soon!")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.text}>
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.42.07 2.4.83 3.22.85.95-.19 1.84-.93 3.18-.85 1.66.12 2.91.82 3.72 2.07-3.45 2.02-2.89 6.57.88 7.81zm-4.54-14.7c-2.17.2-3.94 2.47-3.74 4.41 2.25.17 4.08-1.98 3.74-4.41z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <p style={styles.tos}>
            By connecting, you agree to our{" "}
            <span style={styles.link}>Terms of Service</span> and{" "}
            <span style={styles.link}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: `radial-gradient(circle at 18% 20%, rgba(168,85,247,0.18), transparent 40%),
                 radial-gradient(circle at 82% 10%, rgba(0,240,255,0.1), transparent 35%),
                 linear-gradient(160deg, #080b14 0%, #0b1020 60%, #070b13 100%)`,
    color: COLORS.text,
    fontFamily: FONT_DISPLAY,
    position: "relative",
    overflow: "hidden",
    paddingBottom: 80,
  },
  orb1: {
    position: "absolute", top: -80, left: "15%",
    width: 340, height: 340, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute", top: 60, right: "10%",
    width: 240, height: 240, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  wrapper: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "60px 24px 40px",
    position: "relative",
    zIndex: 1,
  },
  pageHeader: {
    textAlign: "center",
    marginBottom: 36,
  },
  badge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    color: COLORS.cyan,
    border: `1px solid rgba(0,240,255,0.3)`,
    borderRadius: 20,
    padding: "4px 14px",
    marginBottom: 14,
    background: "rgba(0,240,255,0.05)",
    fontFamily: FONT_MONO,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: 800,
    margin: "0 0 10px",
    background: `linear-gradient(135deg, #fff 30%, ${COLORS.cyan} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    background: "rgba(14,20,36,0.72)",
    border: "1px solid rgba(0,240,255,0.12)",
    borderRadius: 24,
    padding: "32px 36px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
    backdropFilter: "blur(24px)",
  },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    marginBottom: 28,
  },
  avatarRing: {
    padding: 3,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.purple})`,
    flexShrink: 0,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    background: "#0b1220",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 800,
    color: COLORS.cyan,
    letterSpacing: 1,
    fontFamily: FONT_MONO,
  },
  avatarName: {
    fontSize: 17,
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: 3,
  },
  avatarSub: {
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    background: "rgba(0,240,255,0.08)",
    margin: "24px 0",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    color: COLORS.muted,
    fontFamily: FONT_MONO,
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  comingSoon: {
    fontSize: 9,
    background: "rgba(168,85,247,0.15)",
    border: "1px solid rgba(168,85,247,0.3)",
    color: "#a855f7",
    borderRadius: 20,
    padding: "2px 8px",
    letterSpacing: 1,
    fontFamily: FONT_MONO,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 20px",
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.muted,
    letterSpacing: 0.8,
    marginBottom: 7,
    display: "block",
    textTransform: "uppercase",
    fontFamily: FONT_MONO,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: `1px solid rgba(0,240,255,0.15)`,
    background: "rgba(255,255,255,0.03)",
    color: COLORS.text,
    fontFamily: FONT_DISPLAY,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  saveBtn: {
    width: "100%",
    padding: "13px 20px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.purple})`,
    color: "#04101a",
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.25s",
    boxShadow: "0 4px 20px rgba(0,240,255,0.15)",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  connectHint: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 18,
    marginTop: -8,
    lineHeight: 1.5,
  },
  socialGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  socialBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 16px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: COLORS.text,
    fontFamily: FONT_DISPLAY,
    fontWeight: 500,
    fontSize: 13,
    cursor: "pointer",
    transition: "background 0.18s, border-color 0.18s, transform 0.15s",
    letterSpacing: 0.2,
  },
  socialBtnHover: {
    background: "rgba(255,255,255,0.07)",
    borderColor: "rgba(0,240,255,0.25)",
    transform: "translateY(-1px)",
  },
  tos: {
    fontSize: 11,
    color: "rgba(122,134,153,0.7)",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 0,
    lineHeight: 1.6,
  },
  link: {
    color: COLORS.cyan,
    cursor: "pointer",
    textDecoration: "underline",
    textDecorationColor: "rgba(0,240,255,0.35)",
  },
};