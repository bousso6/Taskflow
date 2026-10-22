import {
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  ExternalLink,
  FileCode,
  Layers,
  Rocket,
  Server,
  ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';

export const DeploymentView: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const renderYamlContent = `services:
  - type: web
    name: taskflow-backend
    env: node
    plan: free
    region: frankfurt
    buildCommand: npm install && npm run build
    startCommand: npm run start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: JWT_SECRET
        generateValue: true`;

  const vercelJsonContent = `{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://taskflow-backend.onrender.com/api/$1"
    },
    {
      "source": "/api-docs",
      "destination": "https://taskflow-backend.onrender.com/api-docs"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Guide de Déploiement : Render (Backend) & Vercel (Backoffice)
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Spécifications complètes pour la mise en production en architecture découplée ou monolithique.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Render Card */}
        <div className="p-6 rounded-xl bg-[#121217] border border-[#22222a] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
                  <Server className="w-5 h-5 text-[#ff2d75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    1. Backend Node.js & Express sur Render
                  </h3>
                  <span className="text-xs text-zinc-400">Web Service & REST API</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff2d75]/20 text-[#ff2d75] border border-[#ff2d75]/40 font-bold">
                API REST
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mt-4">
              L'API Node.js / Express expose l'ensemble des modules REST (Auth JWT, Projets, Tâches, Stats) ainsi que Swagger UI sur <code className="text-white">/api-docs</code>.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1f1f2a]">
                <span className="text-zinc-400">Build Command :</span>
                <span className="font-mono text-zinc-200">npm install && npm run build</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1f1f2a]">
                <span className="text-zinc-400">Start Command :</span>
                <span className="font-mono text-zinc-200">npm run start</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1f1f2a]">
                <span className="text-zinc-400">Health Check :</span>
                <span className="font-mono text-emerald-400">/api/health</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Fichier Blueprint :</span>
                <span className="font-mono text-white">render.yaml (généré à la racine)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1f1f2a] flex items-center justify-between">
            <button
              onClick={() => copyToClipboard(renderYamlContent, 'render')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181822] border border-[#2a2a38] text-xs font-semibold text-zinc-300 hover:text-white hover:border-[#ff2d75] transition-all"
            >
              {copiedFile === 'render' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié dans le presse-papier</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#ff2d75]" />
                  <span>Copier render.yaml</span>
                </>
              )}
            </button>
            <a
              href="https://dashboard.render.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#ff2d75] hover:underline flex items-center gap-1"
            >
              Dashboard Render
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Vercel Card */}
        <div className="p-6 rounded-xl bg-[#121217] border border-[#22222a] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    2. Backoffice React SPA sur Vercel
                  </h3>
                  <span className="text-xs text-zinc-400">Interface Administrateur Vite</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                FRONTEND
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mt-4">
              L'interface administrateur moderne est compilée avec Vite. Le fichier <code className="text-white">vercel.json</code> gère automatiquement les réécritures d'URL et proxifie les requêtes vers le backend distant.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1f1f2a]">
                <span className="text-zinc-400">Framework Preset :</span>
                <span className="font-mono text-zinc-200">Vite</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1f1f2a]">
                <span className="text-zinc-400">Output Directory :</span>
                <span className="font-mono text-zinc-200">dist</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1f1f2a]">
                <span className="text-zinc-400">Variable VITE_API_URL :</span>
                <span className="font-mono text-zinc-300">URL backend Render</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Configuration Vercel :</span>
                <span className="font-mono text-white">vercel.json (généré à la racine)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1f1f2a] flex items-center justify-between">
            <button
              onClick={() => copyToClipboard(vercelJsonContent, 'vercel')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181822] border border-[#2a2a38] text-xs font-semibold text-zinc-300 hover:text-white hover:border-[#ff2d75] transition-all"
            >
              {copiedFile === 'vercel' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié dans le presse-papier</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>Copier vercel.json</span>
                </>
              )}
            </button>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-zinc-300 hover:text-white hover:underline flex items-center gap-1"
            >
              Dashboard Vercel
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Production Readiness Verification */}
      <div className="p-6 rounded-xl bg-[#121217] border border-[#22222a] space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Vérification de Conformité & Sécurité
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#181822] border border-[#242432] space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Hachage des mots de passe</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Tous les mots de passe sont hachés via <code className="text-zinc-200">bcrypt</code> avec sel à 10 rounds. Aucun hash n'est exposé.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#181822] border border-[#242432] space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Protection JWT Bearer</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Toutes les routes privées exigent un token signé valide. Le middleware extrait les identités et valide l'expiration.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#181822] border border-[#242432] space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Swagger & OpenAPI 3.0</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Documentation interactive servie sur <code className="text-zinc-200">/api-docs</code> avec support direct du bouton Authorize.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#181822] border border-[#242432] space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Ségrégation des Équipes</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Un collaborateur ne peut pas consulter ni altérer les projets d'une autre équipe sans autorisation (code HTTP 403 Forbidden).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#181822] border border-[#242432] space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Gestion des Rôles ADMIN / USER</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Régulation stricte des privilèges : seul un ADMIN peut modifier les rôles, supprimer des utilisateurs ou réinitialiser la base.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#181822] border border-[#242432] space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Healthcheck & Monitoring</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Endpoint <code className="text-zinc-200">/api/health</code> prêt pour les sondes de disponibilité de Render et des load-balancers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
