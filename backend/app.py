import json
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app

service_account = os.getenv("FIREBASE_SERVICE_ACCOUNT")
if service_account:
    initialize_app(credentials.Certificate(json.loads(service_account)))
else:
    initialize_app()
db = firestore.client()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*").split(",")}})


def client_id():
    value = request.headers.get("X-Client-Id", "").strip()
    if not value or len(value) > 128:
        return None
    return value


def session_response(document):
    data = document.to_dict()
    created_at = data.get("createdAt")
    return {
        "id": document.id,
        "timestamp": int(created_at.timestamp() * 1000) if created_at else 0,
        "totalReps": data["totalReps"],
        "formScore": data["formScore"],
        "recommendation": data["recommendation"],
        "log": data["log"],
    }


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/sessions")
def list_sessions():
    owner = client_id()
    if not owner:
        return jsonify({"error": "Missing client identifier."}), 400

    sessions = (
        db.collection("sessions")
        .where("clientId", "==", owner)
        .order_by("createdAt", direction=firestore.Query.DESCENDING)
        .stream()
    )
    return jsonify({"sessions": [session_response(doc) for doc in sessions]})


@app.post("/api/sessions")
def create_session():
    owner = client_id()
    payload = request.get_json(silent=True) or {}
    required = ("totalReps", "formScore", "recommendation", "log")
    if not owner or any(field not in payload for field in required):
        return jsonify({"error": "Invalid session data."}), 400
    if not isinstance(payload["log"], list) or not isinstance(payload["recommendation"], str):
        return jsonify({"error": "Invalid session data."}), 400

    document = {
        "clientId": owner,
        "totalReps": int(payload["totalReps"]),
        "formScore": int(payload["formScore"]),
        "recommendation": payload["recommendation"][:1000],
        "log": payload["log"][:200],
        "createdAt": datetime.now(timezone.utc),
    }
    _, reference = db.collection("sessions").add(document)
    return jsonify({"id": reference.id}), 201


@app.delete("/api/sessions")
def delete_session():
    session_id = request.args.get("sessionId", "")
    owner = client_id()
    if not owner or not session_id:
        return jsonify({"error": "Missing client identifier."}), 400

    reference = db.collection("sessions").document(session_id)
    snapshot = reference.get()
    if not snapshot.exists or snapshot.to_dict().get("clientId") != owner:
        return jsonify({"error": "Session not found."}), 404
    reference.delete()
    return "", 204


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
