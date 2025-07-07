import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import prisma from './prisma/client.js';

dotenv.config();

// Local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' }, // tells Passport to use 'email' instead of default 'username'
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.password) {
        return done(null, false, { message: 'Incorrect email or password' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect email or password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.use(new GoogleStrategy({
  clientID: process.env.VITE_GOOGLE_CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // User doesn't exist, create a new user
      user = await prisma.user.create({
        data: {
          email,
          firstName: profile.name.givenName || '',
          lastName: profile.name.familyName || '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});