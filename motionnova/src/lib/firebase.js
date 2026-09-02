import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCU8j-IW3Ra5r1bPSJmyzHsFQw8fRrBWY8",
  authDomain: "motionnova.firebaseapp.com",
  projectId: "motionnova",
  storageBucket: "motionnova.firebasestorage.app",
  messagingSenderId: "833662663096",
  appId: "1:833662663096:web:c6081db088fcf7256bf74d",
  measurementId: "G-M0Z2SB37VH",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export function setupRecaptcha(containerId) {
  if (window._recaptchaVerifier) {
    try { window._recaptchaVerifier.clear(); } catch (_) {}
    window._recaptchaVerifier = null;
  }
  window._recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  return window._recaptchaVerifier;
}

export async function sendPhoneOTP(phoneNumber) {
  return signInWithPhoneNumber(auth, phoneNumber, window._recaptchaVerifier);
}

export async function verifyPhoneOTP(confirmationResult, code) {
  const result = await confirmationResult.confirm(code);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function updateAccountProfile(user, profile) {
  await updateProfile(user, profile);
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function friendlyAuthError(code) {
  const map = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Incorrect email or password. Try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/invalid-phone-number": "Enter a valid phone number with country code (e.g. +91 98765 43210).",
    "auth/invalid-verification-code": "That OTP is incorrect. Please check and try again.",
    "auth/code-expired": "OTP expired. Please request a new one.",
    "auth/popup-closed-by-user": "Sign-in window was closed. Please try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
