<p align="center">
  <img src="public/Logo.png" alt="EndoPath logo" width="150" />
</p>

```text
Built with:

Frontend  : React 19, Vite, React Router
Backend   : Django, Django CORS Headers, Gunicorn, WhiteNoise
AI        : Featherless AI, OpenAI-compatible API client
Auth      : Google OAuth, JWT
Exports   : jsPDF, jsPDF AutoTable
3D/Visuals: Spline, CSS modules, animated particles
Deploy    : Vercel frontend, Render-ready Django backend
```

## Demo Video

[![Watch the EndoPath demo](https://img.youtube.com/vi/1CHN4Owsac8/maxresdefault.jpg)](https://youtu.be/1CHN4Owsac8?si=mIqY5dZFKlR6aJ8L)

# EndoPath

---

EndoPath is an AI-powered endometriosis companion built to help users predict, confirm, understand, manage, and recover through a guided care journey. It combines symptom logging, staged AI conversations, body-area tracking, referral recommendations, health records, and support chat in one app.

> EndoPath is not a medical diagnosis tool. It is designed to support tracking, education, preparation, and communication with healthcare professionals.

## Screenshots

### Landing Page

![EndoPath landing page](docs/screenshots/home-hero.png)

### Predict to Recover CTA

![Predict to Recover call to action](docs/screenshots/predict-to-recover.png)

### Health Dashboard

![EndoPath dashboard](docs/screenshots/dashboard.png)

### EndoAI Staged Assistant

![EndoAI staged assistant](docs/screenshots/endoai.png)

### Referral Tool

![EndoPath referral tool](docs/screenshots/referral-tool.png)

### Health Records Library

![EndoPath library](docs/screenshots/library.png)

### PuffyAI Support

![PuffyAI support assistant](docs/screenshots/puffyai.png)

## Core Features

- **EndoAI staged journey**: guides users through Predict, Prepare, Action, Manage, Stabilize, and Recover stages.
- **Symptom logging**: captures symptoms, pain intensity, selected body areas, and uploaded images from chat.
- **Dashboard insights**: shows flare risk, days logged, average pain level, next cycle, symptom timeline, recent activity, and health score.
- **Referral tool**: collects AI-generated tests, appointments, and schedules with urgency labels.
- **Health records library**: stores chat history, body maps, photos, key insights, referrals, and symptom records.
- **PDF reports**: exports a doctor-ready health report from logged symptoms, insights, and recommendations.
- **NerdAI library assistant**: answers questions using the user's stored EndoAI chat history.
- **PuffyAI support**: app support assistant for feature help, account questions, and workflow guidance.
- **Google login**: signs users in with Google OAuth and stores the app session locally.

## App Flow

```text
Home
  -> Sign in with Google
  -> Dashboard
  -> EndoAI
       Predict -> Prepare -> Action -> Manage -> Stabilize -> Recover
  -> Referral Tool
  -> Library
       Body Maps + Photos
       Chat History
       NerdAI search
       PDF export
  -> Support
       PuffyAI or human support placeholder
```

## Tech Stack

### Frontend

- React
- Vite
- React Router
- CSS Modules
- Spline 3D scene
- jsPDF and jsPDF AutoTable
- Google OAuth client

### Backend

- Django
- Django CORS Headers
- OpenAI Python SDK with Featherless AI base URL
- JWT authentication
- Gunicorn
- WhiteNoise

## Project Structure

```text
EndoPath/
  public/
    Logo.png
  src/
    components/
    context/
    pages/
    styles/
    App.jsx
    main.jsx
  backend/
    api/
    endopath_backend/
    manage.py
    requirements.txt
  docs/
    screenshots/
  package.json
  vite.config.js
  vercel.json
```

## Getting Started

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure environment variables

Create `backend/.env`:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
FEATHERLESS_API_KEY=your-featherless-api-key
```

Create frontend `.env` in the project root:

```env
VITE_API_URL=http://localhost:8000
```

### 4. Run the backend

```bash
cd backend
source .venv/bin/activate
python manage.py runserver
```

### 5. Run the frontend

```bash
npm run dev
```

The app will run on the Vite local development URL, usually `http://localhost:5173`.

## Available Scripts

```bash
npm run dev      # start Vite development server
npm run build    # build production frontend
npm run preview  # preview production build locally
```

## API Endpoints

```text
POST /api/auth/google/    Google OAuth login
POST /api/endoai/chat/    EndoAI staged health assistant
POST /api/nerdai/chat/    Library and history assistant
POST /api/puffyai/chat/   EndoPath support assistant
```

## Deployment Notes

- Frontend is configured for Vercel through `vercel.json`.
- Backend is Render-ready with `gunicorn`, `whitenoise`, and `build.sh`.
- Update `CORS_ALLOWED_ORIGINS` in `backend/endopath_backend/settings.py` with the deployed frontend URL.
- Set all backend secrets in the deployment environment instead of committing them.

## Team

Made by MONSTER LIAR for Hackathon 2026.
