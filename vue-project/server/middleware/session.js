import session from 'express-session';
import MongoStore from 'connect-mongo';

export default session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
});