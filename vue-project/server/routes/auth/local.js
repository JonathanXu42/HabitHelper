import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/client.js';

const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json(req.user);
});

router.post('/signup', async (req, res, next) => {
  const { firstName, lastName, email, password, timezone } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Account already exists with that email' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, timezone }
    });

    // ✅ Log the user in after signup
    req.login(newUser, (err) => {
      if (err) {
        console.error('Login after signup failed', err);
        return next(err); // ensures proper error handling
      }
      return res.json({ email: newUser.email });
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Error creating account' });
  }
});

export default router;