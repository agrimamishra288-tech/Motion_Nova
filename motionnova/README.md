# MotionNova

**Analyze. Correct. Improve.**

MotionNova is an AI-powered movement analysis and coaching system that evaluates squat form in real time — directly in the browser, with no server-side processing and no video data ever leaving the user's device.

Built as an MVP for **Smart India Hackathon (SIH)**.

---

## 🎯 What It Does

MotionNova uses your webcam and an in-browser pose-estimation model to:

- Track 33 body landmarks live via **MediaPipe Pose**
- Calculate real-time knee joint angles using vector trigonometry
- Detect complete squat repetitions with a client-side finite state machine
- Grade each rep's depth (Good Depth vs. Shallow) and give instant feedback
- Score full sessions and save history locally for progress tracking

No wearables. No gym camera rigs. No backend required for the core loop — just a browser and a webcam.

---

## 🖥️ Pages

| Route         | Description                                              |
|---------------|-----------------------------------------------------------|
| `/`           | Landing page introducing the product                     |
| `/evaluator`  | The core squat form evaluator (camera + live coaching)   |
| `/history`    | Past saved sessions, pulled from `localStorage`           |
| `/about`      | Technical breakdown of the pipeline, for demos/judges     |
| `/profile`    | Local athlete profile (name, sport, goal — no auth yet)  |

---

## ⚙️ Tech Stack

- **React** (functional components, hooks)
- **React Router** — multi-page navigation
- **WebRTC** — `navigator.mediaDevices.getUserMedia` for camera access
- **HTML5 Canvas** — skeleton overlay rendering
- **MediaPipe Pose** — in-browser pose estimation
- **Vite** — build tooling
- **localStorage** — session + profile persistence (no backend yet)

---

## 🧠 How the Squat Detection Works

1. **Angle calculation** — using the hip, knee, and ankle landmark coordinates:

angle = |atan2(ankle.y - knee.y, ankle.x - knee.x)
- atan2(hip.y - knee.y, hip.x - knee.x)| × (180 / π)

2. **State machine**
   - `STANDING` → knee angle > 160°
   - `DESCENDING` → knee angle drops below 140°
   - Minimum angle reached is tracked throughout the descent
   - `ASCENDING` (rep complete) → knee angle rises back above 160°
3. **Depth grading**
   - Minimum angle ≤ 90° → **Good Depth (Parallel)**
   - Minimum angle > 90° → **Shallow Depth** (−20 points)
4. **Double-count protection** — the state is flipped back to `STANDING` immediately after a rep is counted, so angle jitter near the 160° threshold can't trigger a duplicate rep.

---

## 🚀 Getting Started

```bash
git clone https://github.com/<your-username>/motionnova.git
cd motionnova
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`) and allow camera access when prompted.

---

## 📂 Project Structure

motionnova/
├── index.html
├── package.json
├── vite.config.js
└── src/
├── main.jsx
├── App.jsx
├── theme.js
├── components/
│ └── NavBar.jsx
└── pages/
├── Home.jsx
├── Evaluator.jsx
├── History.jsx
├── About.jsx
└── Profile.jsx


---

## 🔭 Roadmap

- [ ] Backend + auth for cross-device session history
- [ ] Support for more exercises (lunges, deadlifts, push-ups)
- [ ] Coach-facing dashboard for reviewing multiple athletes
- [ ] Voice-based real-time feedback
- [ ] Exportable progress reports (PDF)

---

## 👤 Author

Built by **Krishna Mahajan** — B.Tech CSE, K.R. Mangalam University.

- GitHub: [krishnamahajan-droid](https://github.com/krishnamahajan-droid)
- LinkedIn: [krishna-mahajan](https://www.linkedin.com/in/krishna-mahajan-92b615311)

---

## 📄 License

This project is open for educational and hackathon use. Add a formal license (MIT recommended) before public release if needed.