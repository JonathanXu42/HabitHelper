import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'

dotenv.config()

passport.use(new GoogleStrategy({
  clientID: process.env.VITE_GOOGLE_CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    googleId: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName
  }
  return done(null, user)
}))

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})