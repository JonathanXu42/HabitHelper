import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/google', (req, res, next) => {
  if (req.query.tz) {
    req.session.timezone = req.query.tz;
  }
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    res.redirect(`/landing?email=${encodeURIComponent(req.user.email)}`);
  }
);

export default router;