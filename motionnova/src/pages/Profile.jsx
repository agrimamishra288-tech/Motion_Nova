
import React, { useEffect, useRef, useState } from "react";
import {
  friendlyAuthError,
  onAuthChange,
  sendPhoneOTP,
  setupRecaptcha,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
  updateAccountProfile,
  verifyPhoneOTP,
} from "../lib/firebase.js";
import { COLORS, FONT_MONO, shared } from "../theme.js";

const emptyProfile = { name: "", age: "", sport: "", goal: "", avatar: "" };
const inputStyle = (hasError) => ({
  ...shared.input,
  marginBottom: 4,
  borderColor: hasError ? COLORS.red : COLORS.panelBorder,
  boxShadow: hasError ? "0 0 0 3px rgba(255,71,87,0.12)" : "none",
});

function ErrorText({ children }) {
  return children ? <small style={{ color: "#ff8490", display: "block", minHeight: 18, fontSize: 11 }}>{children}</small> : <small style={{ display: "block", minHeight: 18 }} />;
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [authMode, setAuthMode] = useState(null); // email | phone
  const [emailMode, setEmailMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => onAuthChange((currentUser) => setUser(currentUser)), []);

  useEffect(() => {
    const key = `motionnova-profile-${user?.uid || "guest"}`;
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      setProfile({ ...emptyProfile, ...(saved || {}), name: saved?.name || user?.displayName || "", avatar: saved?.avatar || user?.photoURL || "" });
    } catch {
      setProfile({ ...emptyProfile, name: user?.displayName || "", avatar: user?.photoURL || "" });
    }
    setErrors({});
  }, [user]);

  const setField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
  };

  const validateProfile = () => {
    const next = {};
    if (profile.name.trim().length < 2) next.name = "Enter at least 2 characters.";
    const age = Number(profile.age);
    if (!Number.isInteger(age) || age < 13 || age > 120) next.age = "Age must be between 13 and 120.";
    if (profile.sport.trim().length < 2) next.sport = "Tell us your sport or focus area.";
    if (profile.goal.trim().length < 3) next.goal = "Add a primary goal (at least 3 characters).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!validateProfile()) return;
    const key = `motionnova-profile-${user?.uid || "guest"}`;
    localStorage.setItem(key, JSON.stringify(profile));
    if (user) {
      try { await updateAccountProfile(user, { displayName: profile.name, photoURL: profile.avatar || null }); }
      catch { /* The local profile remains saved if Firebase profile metadata is unavailable. */ }
    }
    setNotice("Profile saved successfully.");
  };

  const chooseAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErrors((current) => ({ ...current, avatar: "Choose an image file." }));
    if (file.size > 2 * 1024 * 1024) return setErrors((current) => ({ ...current, avatar: "Image must be smaller than 2 MB." }));
    const reader = new FileReader();
    reader.onload = () => { setField("avatar", reader.result); setErrors((current) => ({ ...current, avatar: "" })); };
    reader.readAsDataURL(file);
  };

  const closeAuth = () => { setAuthMode(null); setAuthError(""); setLoading(false); setConfirmation(null); setOtp(""); };
  const googleLogin = async () => {
    setLoading(true); setAuthError("");
    try { await signInWithGoogle(); setNotice("Signed in with Google."); }
    catch (error) { setAuthError(friendlyAuthError(error.code)); }
    finally { setLoading(false); }
  };
  const emailLogin = async (event) => {
    event.preventDefault(); setAuthError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setAuthError("Enter a valid email address.");
    if (password.length < 6) return setAuthError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      if (emailMode === "signup") await signUpWithEmail(email, password);
      else await signInWithEmail(email, password);
      closeAuth(); setNotice(emailMode === "signup" ? "Account created and signed in." : "Signed in successfully.");
    } catch (error) { setAuthError(friendlyAuthError(error.code)); setLoading(false); }
  };
  const startPhoneLogin = async (event) => {
    event.preventDefault(); setAuthError("");
    if (!/^\+[1-9]\d{7,14}$/.test(phone.replace(/[\s()-]/g, ""))) return setAuthError("Use international format, e.g. +91 9876543210.");
    setLoading(true);
    try {
      setupRecaptcha("recaptcha-container");
      const result = await sendPhoneOTP(phone.replace(/[\s()-]/g, ""));
      setConfirmation(result);
    } catch (error) { setAuthError(friendlyAuthError(error.code)); }
    finally { setLoading(false); }
  };
  const finishPhoneLogin = async (event) => {
    event.preventDefault(); setAuthError("");
    if (!/^\d{6}$/.test(otp)) return setAuthError("Enter the 6-digit code we sent.");
    setLoading(true);
    try { await verifyPhoneOTP(confirmation, otp); closeAuth(); setNotice("Phone number verified and signed in."); }
    catch (error) { setAuthError(friendlyAuthError(error.code)); setLoading(false); }
  };

  const accountName = profile.name || user?.displayName || "Your Name";
  const avatar = profile.avatar || user?.photoURL;
  return (
    <main style={{ ...shared.content, maxWidth: 860, paddingTop: 36 }}>
      <section style={{ ...shared.panel, padding: "38px 44px", animation: "fadeInUp .5s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, paddingBottom: 28, borderBottom: `1px solid ${COLORS.panelBorder}` }}>
          <button type="button" onClick={() => fileInput.current?.click()} style={styles.avatarButton} title="Upload avatar">
            {avatar ? <img src={avatar} alt="Profile avatar" style={styles.avatarImage} /> : <span>?</span>}
            <span className="profile-avatar-edit" style={styles.avatarHint}>Edit</span>
          </button>
          <input ref={fileInput} onChange={chooseAvatar} type="file" accept="image/*" style={{ display: "none" }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>{accountName}</h1>
            <p style={{ margin: "5px 0 10px", color: COLORS.muted }}>{profile.sport || user?.email || user?.phoneNumber || "Sport / Focus Area"}</p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => fileInput.current?.click()} style={styles.uploadButton}>Upload image</button>
              {profile.avatar && <button type="button" onClick={() => setField("avatar", "")} style={styles.removeButton}>Remove photo</button>}
              <span style={{ color: COLORS.muted, fontSize: 11 }}>JPG, PNG, or WebP · max 2 MB</span>
            </div>
          </div>
        </div>
        <ErrorText>{errors.avatar}</ErrorText>
        <form onSubmit={saveProfile} noValidate>
          <h2 style={styles.sectionHeading}>PROFILE DETAILS</h2>
          <div className="profile-fields" style={styles.grid}>
            <label style={styles.fieldLabel}>FULL NAME<input value={profile.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Krishna Mahajan" style={inputStyle(errors.name)} /><ErrorText>{errors.name}</ErrorText></label>
            <label style={styles.fieldLabel}>AGE<input type="number" value={profile.age} onChange={(e) => setField("age", e.target.value)} min="13" max="120" step="1" inputMode="numeric" placeholder="e.g. 19" style={inputStyle(errors.age)} /><ErrorText>{errors.age}</ErrorText></label>
            <label style={styles.fieldLabel}>SPORT / FOCUS AREA<input value={profile.sport} onChange={(e) => setField("sport", e.target.value)} placeholder="e.g. Athletics, Strength Training" style={inputStyle(errors.sport)} /><ErrorText>{errors.sport}</ErrorText></label>
            <label style={styles.fieldLabel}>PRIMARY GOAL<input value={profile.goal} onChange={(e) => setField("goal", e.target.value)} placeholder="e.g. Improve squat depth" style={inputStyle(errors.goal)} /><ErrorText>{errors.goal}</ErrorText></label>
          </div>
          <button type="submit" style={{ ...shared.btn, ...shared.btnPrimary, width: "100%", marginTop: 10 }}>Save Profile</button>
          {notice && <p role="status" style={{ color: COLORS.green, textAlign: "center", margin: "12px 0 0", fontSize: 13 }}>{notice}</p>}
        </form>
        <div style={styles.connect}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><h2 style={{ ...styles.sectionHeading, margin: 0 }}>CONNECT ACCOUNT</h2>{user && <button onClick={() => signOut()} style={styles.signOut}>Sign out</button>}</div>
          <p style={{ color: COLORS.muted, marginTop: 12 }}>{user ? `Signed in as ${user.email || user.phoneNumber || "Google account"}.` : "Sign in to sync your profile and history across devices."}</p>
          <div className="profile-auth-buttons" style={styles.grid}>
            <button onClick={googleLogin} disabled={loading} style={styles.authButton}><b style={{ color: "#4285f4" }}>G</b> Continue with Google</button>
            <button onClick={() => { setAuthMode("email"); setEmailMode("signin"); setAuthError(""); }} style={styles.authButton}>✉ <span>Continue with Email</span></button>
            <button onClick={() => { setAuthMode("phone"); setAuthError(""); }} style={styles.authButton}>♧ <span>Continue with Phone</span></button>
            <button disabled title="Apple sign-in has not been configured" style={{ ...styles.authButton, opacity: .5, cursor: "not-allowed" }}>● <span>Continue with Apple</span></button>
          </div>
        </div>
      </section>
      {authMode && <div role="dialog" aria-modal="true" style={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && closeAuth()}><section style={styles.modal}>
        <button onClick={closeAuth} style={styles.closeButton} aria-label="Close">×</button>
        {authMode === "email" ? <form onSubmit={emailLogin} noValidate><h2 style={styles.modalTitle}>{emailMode === "signin" ? "Sign in with email" : "Create your account"}</h2><p style={styles.modalCopy}>{emailMode === "signin" ? "Welcome back to MotionNova." : "Use your email and password to get started."}</p><label style={shared.label}>EMAIL<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={inputStyle(false)} /></label><label style={shared.label}>PASSWORD<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={emailMode === "signin" ? "current-password" : "new-password"} style={inputStyle(false)} /></label><ErrorText>{authError}</ErrorText><button disabled={loading} style={{ ...shared.btn, ...shared.btnPrimary, width: "100%" }}>{loading ? "Please wait…" : emailMode === "signin" ? "Sign in" : "Create account"}</button><p style={styles.switchText}>{emailMode === "signin" ? "New to MotionNova?" : "Already have an account?"} <button type="button" onClick={() => { setEmailMode(emailMode === "signin" ? "signup" : "signin"); setAuthError(""); }} style={styles.textButton}>{emailMode === "signin" ? "Create an account" : "Sign in"}</button></p></form> : <form onSubmit={confirmation ? finishPhoneLogin : startPhoneLogin} noValidate><h2 style={styles.modalTitle}>{confirmation ? "Enter verification code" : "Sign in with phone"}</h2><p style={styles.modalCopy}>{confirmation ? `We sent a 6-digit code to ${phone}.` : "We’ll send a one-time verification code."}</p>{confirmation ? <label style={shared.label}>ONE-TIME CODE<input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" style={inputStyle(false)} /></label> : <label style={shared.label}>PHONE NUMBER<input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+91 9876543210" style={inputStyle(false)} /></label>}<ErrorText>{authError}</ErrorText><button disabled={loading} style={{ ...shared.btn, ...shared.btnPrimary, width: "100%" }}>{loading ? "Please wait…" : confirmation ? "Verify and sign in" : "Send OTP"}</button><div id="recaptcha-container" /></form>}
      </section></div>}
    </main>
  );
}

const styles = {
  avatarButton: { position: "relative", width: 80, height: 80, flex: "0 0 80px", overflow: "hidden", borderRadius: "50%", border: "3px solid #38c9ff", background: "#10152b", color: COLORS.cyan, fontSize: 30, fontWeight: 800, cursor: "pointer", padding: 0 },
  avatarImage: { width: "100%", height: "100%", objectFit: "cover" }, avatarHint: { position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(4,12,24,.64)", fontSize: 11, opacity: 0, transition: "opacity .2s" },
  uploadButton: { border: `1px solid rgba(0,240,255,.42)`, background: "rgba(0,240,255,.08)", color: COLORS.cyan, borderRadius: 7, padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  removeButton: { border: 0, background: "transparent", color: COLORS.muted, padding: "6px 0", fontSize: 12, cursor: "pointer", textDecoration: "underline" },
  sectionHeading: { fontFamily: FONT_MONO, fontSize: 13, letterSpacing: 1.4, color: "#909bb0", margin: "27px 0 18px" }, grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px 24px" }, fieldLabel: { display: "block", fontFamily: FONT_MONO, fontSize: 12, letterSpacing: .7, color: "#909bb0" },
  connect: { borderTop: `1px solid ${COLORS.panelBorder}`, marginTop: 32, paddingTop: 5 }, authButton: { ...shared.btn, ...shared.btnGhost, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 52, fontSize: 15 }, signOut: { border: 0, color: COLORS.cyan, background: "transparent", cursor: "pointer", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, zIndex: 100, background: "rgba(3,6,13,.76)", display: "grid", placeItems: "center", padding: 20, backdropFilter: "blur(6px)" }, modal: { position: "relative", width: "min(100%, 420px)", background: "#101629", border: `1px solid ${COLORS.panelBorder}`, boxShadow: "0 22px 70px rgba(0,0,0,.5)", borderRadius: 18, padding: "32px 30px" }, closeButton: { position: "absolute", right: 14, top: 10, background: "transparent", border: 0, color: COLORS.muted, fontSize: 28, cursor: "pointer" }, modalTitle: { margin: 0, fontSize: 21 }, modalCopy: { color: COLORS.muted, margin: "8px 0 22px", fontSize: 14 }, switchText: { color: COLORS.muted, textAlign: "center", fontSize: 13, margin: "20px 0 0" }, textButton: { background: "transparent", border: 0, color: COLORS.cyan, cursor: "pointer", padding: 0, font: "inherit" },
};
