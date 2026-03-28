# Universal Bridge

AI-powered web application that converts unstructured, real-world inputs into structured, actionable insights using Google Gemini AI.

## Architecture

```
universal-bridge/
├── client/           # React + Vite frontend
├── server/           # Express.js backend API
├── Dockerfile        # Frontend container (nginx)
├── server/Dockerfile # Backend container (Node.js)
└── cloudbuild.yaml   # Google Cloud Build config
```

## Features

- **Multi-modal Input**: Text, voice (Web Speech API), and image/file upload
- **AI Analysis**: Powered by Google Gemini 2.0 Flash for intelligent parsing
- **Structured Output**: Urgency-coded action cards (Critical, Action, Info)
- **Location Support**: Google Maps embed for location-based insights
- **Backend Proxy**: Server-side Gemini API calls — API key never exposed to client
- **Firebase Firestore**: Persistent storage of processed results
- **Security First**: DOMPurify sanitization, CORS, rate limiting, CSP headers
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation and screen reader support

## Setup

### Client

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
cp .env.example .env   # fill in your keys
npm install
npm run dev
```

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey) |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `http://localhost:5173`) |
| `PORT` | Server port (default: `3001`) |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g. `http://localhost:3001`) |

## Commands

### Client

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |

### Server

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm start` | Start production server |

## Tech Stack

**Frontend**
- Vite + React + TypeScript
- DOMPurify
- Vitest + React Testing Library

**Backend**
- Express.js
- Google Gemini API (`@google/generative-ai`)
- Firebase Admin SDK (Firestore)
- express-rate-limit

## Deployment

The app is containerized and deployed via Google Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions _VITE_API_URL=https://your-api-url
```

- Frontend: served via `nginx` on port `8080`
- Backend: Node.js container on port `8080`

## Security

- Gemini API key stored server-side only (never sent to client)
- All user input sanitized with DOMPurify
- CORS restricted to configured `FRONTEND_URL`
- Rate limiting on API routes
- `server/.env` is gitignored
