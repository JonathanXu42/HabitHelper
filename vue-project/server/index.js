// server/index.js
import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import cors from 'cors';

import emailRoutes from './routes/email.js';
import resetPasswordRoutes from './routes/reset-password.js';
import authRoutes from './routes/auth/index.js';
import meRoutes from './routes/me.js';
import userSettingsRoutes from './routes/user-settings.js';
import habitRoutes from './routes/habit.js';

import sessionMiddleware from './middleware/session.js';
import './passport.js';

// Load environment variables
dotenv.config();

const app = express();
const NODE_PORT = process.env.NODE_PORT;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json());
app.use(sessionMiddleware);

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/api', emailRoutes);
app.use('/reset-password', resetPasswordRoutes);
app.use('/auth', authRoutes);
app.use('/api', meRoutes);
app.use('/user-settings', userSettingsRoutes);
app.use('/api/habits', habitRoutes);

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(NODE_PORT, () => {
  console.log(`Server is running on http://localhost:${NODE_PORT}`);
});