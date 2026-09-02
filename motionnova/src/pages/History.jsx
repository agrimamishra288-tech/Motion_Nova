import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { COLORS, FONT_MONO, shared } from "../theme.js";
import { getSessions, isBackendConfigured, removeSession } from "../lib/api.js";

/* Reads every localStorage key that starts with "motionnova_session_"
   (that's the exact key format Evaluator.jsx saves with), parses it,
   and lists sessions newest-first. */
export default function History() {
  const [sessions, setSessions] = useState([]);
  const [expandedKey, setExpandedKey] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    if (isBackendConfigured()) {
      try {
        const { sessions: cloudSessions } = await getSessions();
        setSessions(cloudSessions.map((session) => ({ ...session, key: `firebase:${session.id}`, source: "firebase" })));
        return;
      } catch {
        // The local history remains usable if the API is temporarily unavailable.
      }
    }

    const keys = Object.keys(localStorage).filter((k) => k.startsWith("motionnova_session_"));
    const parsed = keys
      .map((key) => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const timestamp = Number(key.replace("motionnova_session_", ""));
          return { key, timestamp, source: "local", ...data };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp);
    setSessions(parsed);
  }

  async function deleteSession(key) {
    if (key.startsWith("firebase:")) {
      try {
        await removeSession(key.replace("firebase:", ""));
      } catch {
        return;
      }
    } else {
    localStorage.removeItem(key);
    }
    loadSessions();
  }

  async function clearAll() {
    if (!window.confirm("Delete all saved sessions? This can't be undone.")) return;
    const cloudSessions = sessions.filter((session) => session.source === "firebase");
    if (cloudSessions.length > 0) {
      await Promise.all(cloudSessions.map((session) => removeSession(session.key.replace("firebase:", "")).catch(() => null)));
    }
    Object.keys(localStorage)
      .filter((k) => k.startsWith("motionnova_session_"))
      .forEach((k) => localStorage.removeItem(k));
    loadSessions();
  }

  return (
    <div style={shared.content}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Session History</h1>
          <p style={{ color: COLORS.muted, marginTop: 4 }}>
            Sessions saved from the Evaluator. Firebase sync is used when the backend is connected.
          </p>
        </div>
        {sessions.length > 0 && (
          <button style={{ ...shared.btn, ...shared.btnGhost }} onClick={clearAll}>
            Clear All
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div style={{ ...shared.panel, textAlign: "center", padding: 48 }}>
          <p style={{ color: COLORS.muted, marginBottom: 16 }}>No sessions saved yet.</p>
          <Link to="/evaluator" style={{ textDecoration: "none" }}>
            <button style={{ ...shared.btn, ...shared.btnPrimary }}>Start a Session</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sessions.map((s, i) => {
            const isOpen = expandedKey === s.key;
            return (
              <div
                key={s.key}
                style={{
                  ...shared.panel,
                  animation: "fadeInUp 0.4s ease",
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "backwards",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.cyan)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.panelBorder)}
              >
                <div style={styles.cardHeader} onClick={() => setExpandedKey(isOpen ? null : s.key)}>
                  <div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.muted }}>
                      {new Date(s.timestamp).toLocaleString()}
                    </div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>
                      {s.totalReps} reps · {s.formScore}% form score
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      style={{ ...shared.btn, ...shared.btnDanger, padding: "6px 12px", fontSize: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(s.key);
                      }}
                    >
                      Delete
                    </button>
                    <span style={{ color: COLORS.cyan }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={styles.expandedArea}>
                    <p style={{ color: COLORS.text, marginTop: 0 }}>{s.recommendation}</p>
                    {s.log && s.log.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {s.log.map((rep) => (
                          <div
                            key={rep.id}
                            style={{
                              ...styles.repRow,
                              borderLeftColor: rep.quality === "Good Depth (Parallel)" ? COLORS.green : COLORS.amber,
                            }}
                          >
                            <span style={{ fontFamily: FONT_MONO }}>Rep #{rep.id}</span>
                            <span>{rep.quality} · {rep.minAngle}°</span>
                            <span style={{ color: COLORS.muted }}>{rep.time}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: COLORS.muted, fontSize: 13 }}>No individual rep data for this session.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { margin: 0, fontSize: 26, fontWeight: 700 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  expandedArea: { marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.panelBorder}` },
  repRow: {
    display: "grid",
    gridTemplateColumns: "80px 1fr 90px",
    gap: 10,
    fontSize: 13,
    padding: "6px 10px",
    borderLeft: "3px solid",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 6,
  },
};
