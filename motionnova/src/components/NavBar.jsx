import React from "react";
import { NavLink } from "react-router-dom";
import { COLORS, FONT_MONO } from "../theme.js";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/evaluator", label: "Evaluator" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
  { to: "/profile", label: "Profile" },
];

export default function NavBar() {
  return (
    <nav className="app-nav" style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.brandDot} />
        <span style={styles.brandMark}>MotionNova</span>
      </div>
      <div className="app-nav-links" style={styles.links}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            style={({ isActive }) => ({
              ...styles.link,
              color: isActive ? COLORS.cyan : COLORS.muted,
              borderBottomColor: isActive ? COLORS.cyan : "transparent",
              textShadow: isActive ? "0 0 12px rgba(0,240,255,0.6)" : "none",
            })}
            className="app-nav-link"
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 32px",
    borderBottom: "1px solid rgba(0,240,255,0.1)",
    background: "rgba(7,11,19,0.76)",
    backdropFilter: "blur(18px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: COLORS.cyan,
    boxShadow: `0 0 10px ${COLORS.cyan}`,
    animation: "pulseGlowCyan 2.4s ease-in-out infinite",
  },
  brandMark: {
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: 0.5,
    background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.purple}, ${COLORS.cyan})`,
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "shimmerText 5s linear infinite",
  },
  links: { display: "flex", gap: 24 },
  link: {
    textDecoration: "none",
    fontFamily: FONT_MONO,
    fontSize: 13,
    paddingBottom: 4,
    borderBottom: "2px solid transparent",
    transition: "color 0.2s, border-color 0.2s, text-shadow 0.2s",
  },
};
