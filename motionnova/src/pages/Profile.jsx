import React, { useState, useEffect } from "react";
import { COLORS, shared } from "../theme.js";

const PROFILE_KEY = "motionnova_profile";
const emptyProfile = { name: "", age: "", sport: "", goal: "" };

/* This is a LOCAL-ONLY profile for the MVP demo — there's no real login
   or server. It's just stored in this browser's localStorage so the app
   can feel personalized during a demo. Worth saying that out loud to
   judges so it's clear what's a placeholder vs. a finished feature. */
export default function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [saved, setSaved] = useState(false);

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
  };

  const focusGlow = (e) => (e.target.style.boxShadow = `0 0 0 2px ${COLORS.cyan}33`);
  const blurGlow = (e) => (e.target.style.boxShadow = "none");

  return (
    <div style={shared.content}>
      <h1 style={styles.title}>Athlete Profile</h1>
      <p style={{ color: COLORS.muted, maxWidth: 560, lineHeight: 1.6, marginBottom: 24 }}>
        Stored locally on this device for the demo — no account or server yet.
      </p>

      <form style={{ ...shared.panel, maxWidth: 480 }} onSubmit={handleSave}>
        <label style={shared.label}>Name</label>
        <input
          style={shared.input}
          value={profile.name}
          onChange={handleChange("name")}
          onFocus={focusGlow}
          onBlur={blurGlow}
          placeholder="e.g. Krishna Mahajan"
        />

        <label style={shared.label}>Age</label>
        <input
          style={shared.input}
          type="number"
          value={profile.age}
          onChange={handleChange("age")}
          onFocus={focusGlow}
          onBlur={blurGlow}
          placeholder="e.g. 19"
        />

        <label style={shared.label}>Sport / Focus Area</label>
        <input
          style={shared.input}
          value={profile.sport}
          onChange={handleChange("sport")}
          onFocus={focusGlow}
          onBlur={blurGlow}
          placeholder="e.g. Athletics, Strength Training"
        />

        <label style={shared.label}>Primary Goal</label>
        <input
          style={shared.input}
          value={profile.goal}
          onChange={handleChange("goal")}
          onFocus={focusGlow}
          onBlur={blurGlow}
          placeholder="e.g. Improve squat depth and consistency"
        />

        <button
          type="submit"
          style={{ ...shared.btn, ...shared.btnPrimary, width: "100%", marginTop: 4 }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Save Profile
        </button>

        {saved && (
          <p style={{ color: COLORS.green, fontSize: 13, marginTop: 12, textAlign: "center" }}>
            ✓ Profile saved
          </p>
        )}
      </form>
    </div>
  );
}

const styles = {
  title: { fontSize: 28, marginBottom: 4 },
};