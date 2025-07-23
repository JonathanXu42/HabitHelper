import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import authLimiter from './middleware/rateLimiter.js';

import emailRoutes from './routes/email.js';
import resetPasswordRoutes from './routes/reset-password.js';
import authRoutes from './routes/auth/index.js';
import meRoutes from './routes/me.js';
import userSettingsRoutes from './routes/user-settings.js';
import habitRoutes from './routes/habit.js';
import habitLogRoutes from './routes/habit-log.js';

import sessionMiddleware from './middleware/session.js';
import './passport.js';

import './utils/reminderScheduler.js';
import './utils/streakResetter.js';

// Setup path helpers (for __dirname in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const NODE_PORT = process.env.NODE_PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https://www.gstatic.com"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  }
}));

app.use(helmet.hsts({
  maxAge: 31536000,  // 1 year in seconds
  includeSubDomains: true,
  preload: true
}))

app.use(compression());
app.use(express.json());

// CORS
const allowedOrigins = [
  'https://localhost:3000',                  // Local dev
  process.env.FRONTEND_URL                 // Production frontend (e.g., https://habithelper.app)
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());

// Sessions and auth
// app.set('trust proxy', 1);     //Setting this in development breaks Google sign ins because there's no proxy
app.use(sessionMiddleware);       //being used. Only enable this in production
app.use(passport.initialize());
app.use(passport.session());

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/auth/login', authLimiter);
app.use('/api/send-verification-code', authLimiter);
app.use('/api/verify-code', authLimiter);

// API Routes
app.use('/api', emailRoutes);
app.use('/reset-password', resetPasswordRoutes);
app.use('/auth', authRoutes);
app.use('/api', meRoutes);
app.use('/user-settings', userSettingsRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/habit-logs', habitLogRoutes);

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// === Serve Frontend ===
// Serve static frontend files from dist/
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Match only non-API, non-static routes
app.get(/^\/(?!api|auth|user-settings|static).*$/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start HTTPS server in development
if (process.env.NODE_ENV !== 'production') {
  const httpsOptions = {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem'),
  };

  https.createServer(httpsOptions, app).listen(NODE_PORT, () => {
    console.log(`🚀 Dev server running at https://localhost:${NODE_PORT}`);
  });
} else {
  app.listen(NODE_PORT, () => {
    console.log(`🚀 Prod server running at https://localhost:${NODE_PORT}`);
  });
}