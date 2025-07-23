import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma/client.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing fields.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Password reset error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;