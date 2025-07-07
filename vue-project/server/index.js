// server/index.js
import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import emailRoutes from './routes/email.js';
import './passport.js';

// Load environment variables
dotenv.config();

const app = express();
const NODE_PORT = process.env.NODE_PORT;
const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

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

// Login route
app.post('/auth/login', passport.authenticate('local'), (req, res) => {
  res.json(req.user);
});

// Signup route
app.post('/auth/signup', async (req, res) => {
  const { firstName, lastName, email, password, timezone } = req.body;
  console.log({ firstName, lastName, email, password, timezone });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Account already exists with that email' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        timezone
      }
    });

    res.json({ message: 'Account created', user: newUser });
  } catch (err) {
    console.error('Error in /auth/signup:', err);
    res.status(500).json({ error: 'Error creating account' });
  }
});

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

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Logout failed');
      }

      // Clear the session cookie
      res.clearCookie('connect.sid'); // Default name unless you renamed it
      res.json({ message: 'Logged out' })
    });
  });
});

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(NODE_PORT, () => {
  console.log(`Server is running on http://localhost:${NODE_PORT}`);
});