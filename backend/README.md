# MotionNova Firebase API

This Flask service stores completed squat sessions in Cloud Firestore. It uses
an anonymous browser identifier for this prototype, not authentication.

## Firebase setup

1. Create a Firebase project and enable **Firestore Database** in production
   mode.
2. In Firebase Console, open **Project settings → Service accounts → Generate
   new private key**.
3. For local development, save the downloaded JSON as
   `backend/service-account.json` and set `GOOGLE_APPLICATION_CREDENTIALS` as
   shown in `.env.example`. Never commit this JSON file.

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
flask --app app run --debug
```

## Deploy on Vercel

This repository includes `api/index.py`, which exposes the Flask application
as a Vercel Python Function. The frontend calls it at `/api`, on the same
domain, so no API URL is required.

In the Vercel project, configure these environment variables:

- `FIREBASE_SERVICE_ACCOUNT`: the complete service-account JSON on one line
- `CORS_ORIGINS`: your Vercel URL, for example `https://motion-nova-theta.vercel.app`

Redeploy after setting the secrets. You can alternatively set
`VITE_API_BASE_URL` to use a separately hosted Flask API, but it is not needed
for the included Vercel Function.
