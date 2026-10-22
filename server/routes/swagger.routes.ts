import { Request, Response, Router } from 'express';
import { db } from '../db/data-store';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { openApiSpec } from '../openapi/spec';

export const swaggerRouter = Router();

// Endpoint pour servir le fichier OpenAPI JSON
swaggerRouter.get('/openapi.json', (_req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(openApiSpec);
});

// Endpoint pour réinitialiser les données de test
swaggerRouter.post('/seed/reset', authenticateJWT, requireRole('ADMIN'), (_req: Request, res: Response): void => {
  db.seedDefaultData();
  res.status(200).json({
    message: 'Base de données réinitialisée avec succès avec les données de test par défaut.',
  });
});

// Endpoint Healthcheck
swaggerRouter.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'TaskFlow REST API',
    version: '1.0.0',
  });
});

// Endpoint pour servir Swagger UI interactif
export function renderSwaggerUiHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow API - Documentation Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      background: #09090b;
      color: #fafafa;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    .topbar-taskflow {
      background: #121217;
      border-bottom: 1px solid #27272a;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .topbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .topbar-badge {
      background: #ff2d75;
      color: #ffffff;
      font-weight: 700;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .topbar-title {
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.01em;
    }
    .topbar-links a {
      color: #ff2d75;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      margin-left: 16px;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid #3f3f46;
      transition: all 0.2s ease;
    }
    .topbar-links a:hover {
      background: #ff2d75;
      color: #ffffff;
      border-color: #ff2d75;
    }
    /* Quick Token Helper Bar */
    .helper-bar {
      background: #18181b;
      border-bottom: 1px solid #27272a;
      padding: 10px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #a1a1aa;
    }
    .helper-bar button {
      background: #27272a;
      color: #fafafa;
      border: 1px solid #3f3f46;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .helper-bar button:hover {
      background: #ff2d75;
      border-color: #ff2d75;
      color: #ffffff;
    }
    /* Swagger UI Overrides for clean readability */
    .swagger-ui {
      background: #09090b;
      color: #e4e4e7;
    }
    .swagger-ui .info {
      margin: 24px 0;
    }
    .swagger-ui .info .title {
      color: #ffffff !important;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .swagger-ui .info p, .swagger-ui .info li {
      color: #a1a1aa !important;
    }
    .swagger-ui .scheme-container {
      background: #121217 !important;
      box-shadow: none !important;
      border-bottom: 1px solid #27272a;
      padding: 16px 24px !important;
    }
    .swagger-ui .btn.authorize {
      background-color: #ff2d75 !important;
      border-color: #ff2d75 !important;
      color: #ffffff !important;
      font-weight: 600;
      border-radius: 6px;
    }
    .swagger-ui .btn.authorize svg {
      fill: #ffffff !important;
    }
    .swagger-ui .opblock .opblock-summary-operation-id, 
    .swagger-ui .opblock .opblock-summary-path,
    .swagger-ui .opblock .opblock-summary-path__deprecated {
      font-family: 'JetBrains Mono', monospace !important;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="topbar-taskflow">
    <div class="topbar-brand">
      <span class="topbar-badge">API REST</span>
      <span class="topbar-title">TaskFlow &mdash; Swagger OpenAPI Documentation</span>
    </div>
    <div class="topbar-links">
      <a href="/api/openapi.json" target="_blank" rel="noopener">Format OpenAPI JSON</a>
      <a href="/">Retour au Backoffice</a>
    </div>
  </div>

  <div class="helper-bar">
    <span>Astuce de test rapide :</span>
    <button onclick="quickAuth('admin@taskflow.dev', 'Admin123!')">Se connecter Admin (Copier Token)</button>
    <button onclick="quickAuth('sarah.martin@taskflow.dev', 'User123!')">Se connecter User Sarah (Copier Token)</button>
    <span id="auth-status" style="color: #4ade80; margin-left: auto;"></span>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        persistAuthorization: true,
        docExpansion: "list",
        filter: true,
        displayRequestDuration: true
      });
    };

    async function quickAuth(email, password) {
      const statusEl = document.getElementById('auth-status');
      statusEl.textContent = 'Authentification en cours...';
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.token) {
          navigator.clipboard.writeText(data.token);
          // Auto inject into Swagger UI authorization if available
          if (window.ui && window.ui.preauthorizeApiKey) {
            window.ui.preauthorizeApiKey('bearerAuth', data.token);
          }
          statusEl.textContent = 'Token copié dans le presse-papier et appliqué à Swagger UI (' + email + ')';
          setTimeout(() => { statusEl.textContent = ''; }, 6000);
        } else {
          statusEl.textContent = 'Erreur d’authentification: ' + (data.message || 'Échec');
        }
      } catch (err) {
        statusEl.textContent = 'Erreur réseau';
      }
    }
  </script>
</body>
</html>`;
}
