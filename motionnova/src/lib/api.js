const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const CLIENT_ID_KEY = "motionnova_client_id";

export function getClientId() {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
}

async function request(path, options = {}) {
  if (!API_BASE_URL) throw new Error("The Firebase API URL has not been configured.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": getClientId(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "The server could not complete the request.");
  }
  return response.status === 204 ? null : response.json();
}

export function createSession(session) {
  return request("/api/sessions", { method: "POST", body: JSON.stringify(session) });
}

export function getSessions() {
  return request("/api/sessions");
}

export function removeSession(sessionId) {
  return request(`/api/sessions/${sessionId}`, { method: "DELETE" });
}

export function isBackendConfigured() {
  return Boolean(API_BASE_URL);
}
