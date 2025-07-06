// server/index.js
import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import './passport.js';

import emailRoutes from './routes/email.js';

// Load environment variables
dotenv.config();

const app = express();
const NODE_PORT = process.env.NODE_PORT;

app.use(express.json());

// Session setup
app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/api', emailRoutes);

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
  }),
  (req, res) => {
    // Redirect back to frontend with user email
    res.redirect(`http://localhost:5173/landing?email=${encodeURIComponent(req.user.email)}`)
  }
)

// For testing
app.get('/api/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user)
  } else {
    res.status(401).json({ error: 'Not authenticated' })
  }
})

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});


// Start server
app.listen(NODE_PORT, () => {
  console.log(`Server is running on http://localhost:${NODE_PORT}`);
});