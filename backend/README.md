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

## Deploy the API

Deploy the `backend` directory to a Python host such as Render or Railway.
Use `gunicorn app:app` as the start command and configure these environment
variables:

- `FIREBASE_SERVICE_ACCOUNT`: the complete service-account JSON on one line
- `CORS_ORIGINS`: your Vercel URL, for example `https://motion-nova-theta.vercel.app`

Then set `VITE_API_BASE_URL` in the Vercel project's environment variables to
the deployed API URL, for example `https://motionnova-api.onrender.com`, and
redeploy the frontend.
