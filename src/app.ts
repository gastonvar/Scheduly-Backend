import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env, frontendOrigins } from './config/env.js';
import { errorHandler } from './errors/error-handler.js';
import { authRoutes } from './features/auth/auth.routes.js';
import { classesRoutes } from './features/classes/classes.routes.js';
import { studentsRoutes } from './features/students/students.routes.js';
import { subjectsRoutes } from './features/subjects/subjects.routes.js';
import { pinoLogger } from './lib/pino.js';
import { requireAuth, requireCsrf } from './middleware/auth.js';
import { initModels } from './models/index.js';

initModels();

export function createApp() {
  const app = express();

  if (env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: frontendOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger: pinoLogger,
      serializers: {
        req(request) {
          return {
            id: request.id,
            method: request.method,
            url: request.url,
          };
        },
        res(response) {
          return {
            statusCode: response.statusCode,
          };
        },
      },
    }),
  );

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      data: {
        status: 'ok',
      },
    });
  });

  app.use('/api/auth', authRoutes);

  const api = express.Router();
  api.use(requireAuth);
  api.use(requireCsrf);

  api.use('/students', studentsRoutes);
  api.use('/subjects', subjectsRoutes);
  api.use('/classes', classesRoutes);

  app.use('/api', api);

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  app.use(errorHandler);

  return app;
}
