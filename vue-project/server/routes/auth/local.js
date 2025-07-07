import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/client.js';

const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json(req.user);
});

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, timezone } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Account already exists with that email' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, timezone }
    });

    req.login(newUser, err => {
      if (err) return res.status(500).json({ error: 'Login after signup failed' });
      res.json({ message: 'Signup successful', user: newUser });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating account' });
  }
});

export default router;