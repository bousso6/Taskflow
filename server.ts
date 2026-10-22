import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/auth.routes';
import { dashboardRouter } from './server/routes/dashboard.routes';
import { projectRouter } from './server/routes/project.routes';
import { renderSwaggerUiHtml, swaggerRouter } from './server/routes/swagger.routes';
import { taskRouter } from './server/routes/task.routes';
import { userRouter } from './server/routes/user.routes';

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = express();

  // Middleware JSON
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Headers CORS pour API
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Documentation Swagger UI
  app.get('/api-docs', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderSwaggerUiHtml());
  });

  // Montage des routes REST
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api', swaggerRouter);

  // Gestion des erreurs globales de l'API
  app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled API Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || 'Une erreur interne est survenue sur le serveur.',
      statusCode: 500,
    });
  });

  // Frontend integration: Vite middleware in dev, static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev middleware mounted');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('📦 Serving production build from dist/');
    } else {
      console.warn('⚠️ Warning: dist/ folder not found. Please run "npm run build".');
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 TaskFlow Server démarré avec succès !`);
    console.log(`📍 URL locale : http://localhost:${PORT}`);
    console.log(`📑 Documentation Swagger UI : http://localhost:${PORT}/api-docs`);
    console.log(`📋 Spécification OpenAPI JSON : http://localhost:${PORT}/api/openapi.json`);
    console.log(`🩺 Healthcheck API : http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start TaskFlow server:', err);
  process.exit(1);
});
