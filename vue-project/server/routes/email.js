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
    
    // Save code + expiration to session
    req.session.verification = {
      email,
      code: code.toString(),
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    await new Promise((resolve, reject) => {
      req.session.save(err => err ? reject(err) : resolve());
    });
    
    res.json({ success: true, code });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

router.post('/verify-code', async (req, res) => {
  const { code, email } = req.body;
  const sessionData = req.session.verification;

  if (!sessionData) {
    return res.status(400).json({ success: false, message: 'No verification code found.' });
  }

  const { email: storedEmail, code: storedCode, expiresAt } = sessionData;

  if (email !== storedEmail) {
    return res.status(400).json({ success: false, message: 'Email mismatch.' });
  }

  if (Date.now() > expiresAt) {
    return res.status(400).json({ success: false, message: 'Verification code expired.' });
  }

  if (code !== storedCode) {
    return res.status(400).json({ success: false, message: 'Invalid verification code.' });
  }

  // Optionally remove the code after success
  delete req.session.verification;

  res.json({ success: true });
});

export default router;