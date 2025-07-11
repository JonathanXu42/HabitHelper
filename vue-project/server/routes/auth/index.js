import express from 'express';
import localAuth from './local.js';
import googleAuth from './google.js';
import prisma from '../../prisma/client.js';

const router = express.Router();

router.use(localAuth);
router.use(googleAuth);

router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(err => {
      if (err) return res.status(500).send('Logout failed');
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out' });
    });
  });
});

router.post('/check-existing-account', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.json({ success: false, message: 'An account already exists for this email address' });
  }

  return res.json({ success: true });
});

export default router;