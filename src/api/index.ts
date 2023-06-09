import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import '../localization';
import i18next from 'i18next';
import i18nMiddleware from 'i18next-http-middleware';
import authRoutes from '../routes/auth';
import userRoutes from '../routes/user';
import postsRoutes from '../routes/posts';
import categoryRoutes from '../routes/category';
import { NOT_FOUND, OK } from '../constants';
import AppError from '../utils/AppError';
import globalErrorHandler from '../controllers/errorController';
import compression from 'compression';

const app: express.Application = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});

// Allow cors
app.use(
  cors({
    origin: [
      'https://topic-nexus.netlify.app',
      'https://topic-nexus.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

// Set Security HTTP Headers
app.use(helmet());

// Limit requests from same IP
// app.use('/api', limiter);

// Cookie parser
app.use(cookieParser());

// Body parser
app.use(
  express.json({
    limit: '10kb',
  })
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [],
  })
);

// Compress text responses
app.use(compression());

// Serving static files
app.use(express.static('public'));
//Add Socket Id to request

app.use('/api/v1', (req, res, next) => {
  const socketId = req.headers.socketid;
  req.socketId = socketId;
  next();
});
// Language Headers
app.use(i18nMiddleware.handle(i18next));
app.use('/api/v1', (req, res, next) => {
  const lang = req.headers.lang || 'en';
  req.i18n.changeLanguage(lang);
  req.i18n.getFixedT<'translation'>(lang);
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/post', postsRoutes);
app.use('/api/v1/category', categoryRoutes);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, NOT_FOUND));
});

app.use(globalErrorHandler);

export default app;
