//routes/email.js
import express from 'express';
import { emailVerificationCode } from '../utils/send_email.js';

const router = express.Router();

router.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;

  console.log('Received email request:', email);

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const code = await emailVerificationCode(email);
    res.json({ success: true, code });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

export default router;