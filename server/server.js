import express from 'express';
import cors from 'cors';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { log, requestLogger } from './lib/logger.js';
import { processRouter } from './routes/process.js';

if (!process.env.GEMINI_API_KEY) {
  log('error', 'GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

if (!getApps().length) initializeApp();
const db = getFirestore();

if (!process.env.PORT) {
  log('error', 'PORT environment variable is required');
  process.exit(1);
}

if (!process.env.FRONTEND_URL) {
  log('error', 'FRONTEND_URL environment variable is required');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/process', processRouter(db));

log('info', 'Starting Universal Bridge API', { port: PORT });

app.listen(PORT, () => {
  log('info', 'Server started', { port: PORT });
});
