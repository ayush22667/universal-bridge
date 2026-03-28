# 🌉 Universal Bridge

> **Turn Chaos into Action** — Feed any unstructured input (voice, text, images, medical records) and get structured, verified, life-saving actions powered by Google AI.

Built for the **Google AI Hackathon** · Live at [universal-bridge-1005461601459.us-central1.run.app](https://universal-bridge-1005461601459.us-central1.run.app)

---

## 🤖 Powered by Google

Universal Bridge is built **entirely on Google's ecosystem** — from AI to infrastructure to developer tools. Here's every Google service in the stack:

### ✅ Active — Currently Running in Production

| Service | Purpose |
|---------|---------|
| **Google Gemini AI** (`gemini-2.5-flash-lite`) | Core AI engine — converts unstructured inputs (text, voice, images) into structured, verified, actionable crisis response |
| **Google Cloud Run** | Serverless container hosting for both the React frontend (Nginx) and Node.js backend — auto-scales to zero |
| **Google Cloud Firestore** | NoSQL database for real-time request logging, analytics, and user history |
| **Google Cloud Build** | CI/CD pipeline — builds Docker images and deploys to Cloud Run on every push |
| **Google Container Registry (GCR)** | Stores Docker images for frontend and backend deployments |
| **Google Cloud Translation API** | Auto-detects 100+ languages and translates non-English inputs to English before Gemini processing |
| **Google Maps Platform** | Renders interactive maps for extracted emergency locations |
| **Google Maps Places API** | Finds the 3 nearest hospitals, police stations, pharmacies, and fire stations from any location |
| **Google Cloud Speech-to-Text** | Cross-browser voice transcription — works on Firefox, iOS, Android (unlike native Web Speech API) |
| **Firebase Authentication** | Google Sign-In for user accounts, session management, and request history |
| **Firebase Analytics** | Usage tracking, event monitoring, and user engagement metrics |
| **Google Calendar API** | Deep-links action cards directly into Google Calendar with pre-filled event details |

### 🔜 Planned — Roadmap

| Service | Planned Feature |
|---------|----------------|
| **Google Cloud Vision API** | Structured OCR for prescriptions, medical records, ID cards, and accident photos |
| **Google Cloud Text-to-Speech** | Read action cards aloud for hands-free emergency use |
| **Firebase Cloud Messaging (FCM)** | Push notifications when critical-urgency events are detected |
| **Google Cloud Document AI** | Parse multi-page PDFs (hospital discharge summaries, insurance documents) |
| **Google Cloud Natural Language API** | Entity extraction (person names, locations) to improve Gemini context |
| **Google Cloud Healthcare API** | FHIR-based medical record ingestion and structured health data extraction |
| **Google Chronicle (Security)** | Audit logging for compliance in healthcare and emergency services use cases |
| **Google Cloud Pub/Sub** | Real-time event streaming for multi-agency emergency coordination |
| **Google Cloud Vertex AI** | Fine-tuned models for domain-specific crisis scenarios (medical, disaster, legal) |
| **Google BigQuery** | Analytics warehouse for aggregated crisis pattern analysis across all requests |

---

## 🚀 Features

- **📝 Text Input** — Describe any emergency or situation in plain language (any language)
- **🎤 Voice Input** — Record audio, transcribed via Google Cloud Speech-to-Text
- **📎 File Upload** — Analyze images and documents (prescriptions, accident photos)
- **🌐 Auto-Translation** — Input in Hindi, Spanish, French, Arabic? Auto-translated before AI processing
- **🗺️ Nearby Services** — When a location is detected, find nearest hospital/police/pharmacy in one click
- **📅 Calendar Integration** — Add follow-up actions directly to Google Calendar
- **⚡ Rate Limiting** — 20 requests/minute per IP
- **🔒 CORS Protected** — Backend locked to frontend origin only

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Cloud Run (Frontend)          │
│     React + Vite → served by Nginx      │
│  universal-bridge-1005461601459.run.app │
└────────────────────┬────────────────────┘
                     │ HTTPS /api/*
┌────────────────────▼────────────────────┐
│           Cloud Run (Backend)           │
│         Node.js + Express               │
│  universal-bridge-api-1005461601459...  │
└──┬──────────┬──────────┬───────────────-┘
   │          │          │
   ▼          ▼          ▼
Gemini AI  Firestore  Google APIs
           (logging)  (Translate, Places, Speech)
```

---

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- Google Cloud SDK (`gcloud`)
- Firebase CLI (`firebase`)

### Setup

```bash
# Clone
git clone https://github.com/ayush22667/universal-bridge.git
cd universal-bridge

# Backend
cp server/.env.example server/.env
# Fill in: GEMINI_API_KEY, GOOGLE_CLOUD_API_KEY
cd server && npm install && npm run dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

**`server/.env`**
```env
GEMINI_API_KEY=        # From aistudio.google.com
GEMINI_MODEL=gemini-2.5-flash-lite
FRONTEND_URL=http://localhost:5173
PORT=3001
LOG_LEVEL=info
GOOGLE_CLOUD_API_KEY=  # From GCP Console — enables Translate, Places, Speech
```

**`client/.env`**
```env
VITE_API_URL=          # Empty for local dev (Vite proxy handles it)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

---

## 🚢 Deployment

```bash
# Deploy backend (reads server/.env)
./deploy-backend.sh

# Deploy frontend (reads client/.env)
./deploy-frontend.sh
```

Both scripts automatically read environment variables, build Docker images, push to Google Container Registry, and deploy to Cloud Run.

---

## 📁 Project Structure

```
universal-bridge/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components (ActionCard, NearbyServices, VoiceRecorder...)
│   │   ├── services/        # API clients (gemini, firebase, speech)
│   │   └── types/           # TypeScript interfaces
│   └── Dockerfile           # Multi-stage build → Nginx
├── server/                  # Node.js + Express backend
│   ├── lib/                 # Gemini, Translate, Logger utilities
│   ├── routes/              # /api/process, /api/nearby, /api/transcribe
│   └── Dockerfile           # Node.js container
├── deploy-backend.sh        # One-command backend deploy
├── deploy-frontend.sh       # One-command frontend deploy
└── cloudbuild.yaml          # Google Cloud Build config
```

---

## 📄 License

MIT — Built with ❤️ using Google AI
