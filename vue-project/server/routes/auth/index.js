import express from 'express';
import localAuth from './local.js';
import googleAuth from './google.js';

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

export default router;