import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Play,
  RotateCcw,
  Send,
  Terminal,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';

interface EndpointPreset {
  name: string;
  module: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: string;
  description: string;
}

const PRESETS: EndpointPreset[] = [
  {
    name: 'Tableau de bord & Stats',
    module: 'Module D',
    method: 'GET',
    endpoint: '/dashboard/stats',
    description: 'Calcul des KPIs en temps réel (projets, tâches, retards, répartition)',
  },
  {
    name: 'Profil Utilisateur Connecté',
    module: 'Module A',
    method: 'GET',
    endpoint: '/users/me',
    description: 'Retourne le profil de l’utilisateur associé au Bearer token',
  },
  {
    name: 'Lister les Projets Accessibles',
    module: 'Module B',
    method: 'GET',
    endpoint: '/projects',
    description: 'Retourne les projets filtrés selon les autorisations de l’utilisateur',
  },
  {
    name: 'Lister les Tâches (avec filtres & tri)',
    module: 'Module C',
    method: 'GET',
    endpoint: '/tasks?limit=5&sortBy=createdAt&order=desc',
    description: 'Lister les tâches accessibles avec pagination et tri',
  },
  {
    name: 'Créer un Projet',
    module: 'Module B',
    method: 'POST',
    endpoint: '/projects',
    body: JSON.stringify(
      {
        name: 'Campagne Acquisition Clients Q1',
        description: 'Mise en place des tunnels de conversion et tracking analytics.',
        color: '#ff2d75',
      },
      null,
      2
    ),
    description: 'Créer un nouveau projet avec l’utilisateur comme responsable',
  },
  {
    name: 'Lister Tous les Utilisateurs',
    module: 'Module A & Admin',
    method: 'GET',
    endpoint: '/users',
    description: 'Lister les utilisateurs pour les affectations',
  },
  {
    name: 'Spécification OpenAPI 3.0 (JSON)',
    module: 'Documentation',
    method: 'GET',
    endpoint: '/openapi.json',
    description: 'Télécharger le contrat Swagger / OpenAPI complet au format JSON',
  },
  {
    name: 'Healthcheck Serveur',
    module: 'Système',
    method: 'GET',
    endpoint: '/health',
    description: 'Vérifier la disponibilité et l’uptime du serveur Node.js Express',
  },
];

export const ApiTesterView: React.FC = () => {
  const { token, currentUser } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
  const [endpointInput, setEndpointInput] = useState('/dashboard/stats');
  const [requestBody, setRequestBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const applyPreset = (preset: EndpointPreset) => {
    setSelectedMethod(preset.method);
    setEndpointInput(preset.endpoint);
    setRequestBody(preset.body || '');
    setResponseOutput(null);
    setResponseStatus(null);
  };

  const executeRequest = async () => {
    setLoading(true);
    let parsedBody: any = undefined;
    if (selectedMethod !== 'GET' && requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (err: any) {
        alert('Erreur de syntaxe JSON dans le corps de requête : ' + err.message);
        setLoading(false);
        return;
      }
    }

    let res;
    if (selectedMethod === 'GET') {
      res = await apiClient.get(endpointInput);
    } else if (selectedMethod === 'POST') {
      res = await apiClient.post(endpointInput, parsedBody);
    } else if (selectedMethod === 'PATCH') {
      res = await apiClient.patch(endpointInput, parsedBody);
    } else {
      res = await apiClient.delete(endpointInput);
    }

    setResponseStatus(res.status);
    setResponseDuration(res.durationMs);
    setResponseOutput(res.data);
    setLoading(false);
  };

  const copyResponse = () => {
    if (responseOutput) {
      navigator.clipboard.writeText(JSON.stringify(responseOutput, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Swagger Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Console Interactive REST & Swagger
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Testez en direct chaque endpoint HTTP avec injection du Bearer JWT et analyse de latence.
          </p>
        </div>

        <a
          href="/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] transition-all flex items-center gap-2 shadow-[0_2px_12px_rgba(255,45,117,0.35)] shrink-0 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Ouvrir l'interface Swagger UI complète</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Preset Quick Selectors */}
      <div className="p-4 rounded-xl bg-[#121217] border border-[#22222a] space-y-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
          Raccourcis de test pré-configurés
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-lg bg-[#181822] hover:bg-[#20202e] border border-[#262634] text-xs font-medium text-zinc-300 hover:text-white transition-all flex items-center gap-2"
            >
              <span
                className={`font-mono font-bold text-[10px] ${
                  preset.method === 'GET'
                    ? 'text-emerald-400'
                    : preset.method === 'POST'
                    ? 'text-[#ff2d75]'
                    : preset.method === 'PATCH'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {preset.method}
              </span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* REST Request Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Request Parameters */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#22222a] space-y-4">
          <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#ff2d75]" />
              Paramètres de la Requête HTTP
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">
              Auth: Bearer {token ? 'Inclus' : 'Non défini'}
            </span>
          </div>

          {/* Method & URL Input */}
          <div className="flex gap-2">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as any)}
              className="bg-[#181822] border border-[#282836] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#ff2d75] focus:outline-none focus:border-[#ff2d75]"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <div className="flex-1 flex items-center bg-[#181822] border border-[#282836] rounded-lg px-3">
              <span className="text-xs font-mono text-zinc-500 mr-1">/api</span>
              <input
                type="text"
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                placeholder="/dashboard/stats"
                className="w-full bg-transparent text-xs font-mono text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <button
              onClick={executeRequest}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Envoi...' : 'Envoyer'}</span>
            </button>
          </div>

          {/* Request Body (if POST or PATCH) */}
          {selectedMethod !== 'GET' && selectedMethod !== 'DELETE' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Corps de requête (JSON Payload)
              </label>
              <textarea
                rows={7}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder='{\n  "title": "Nouvelle tâche"\n}'
                className="w-full bg-[#181822] border border-[#282836] rounded-lg p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#ff2d75]"
              />
            </div>
          )}

          {/* Auth details summary */}
          <div className="p-3 rounded-lg bg-[#181822] border border-[#22222a] text-[11px] text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>Utilisateur actif :</span>
              <span className="text-white font-semibold">{currentUser?.name || 'Anonyme'}</span>
            </div>
            <div className="flex justify-between">
              <span>Rôle actif :</span>
              <span className="font-mono font-bold text-[#ff2d75]">{currentUser?.role || 'AUCUN'}</span>
            </div>
            <div className="flex justify-between">
              <span>En-tête Authorization :</span>
              <span className="font-mono text-zinc-400 truncate max-w-[200px]">
                Bearer {token?.slice(0, 16)}...
              </span>
            </div>
          </div>
        </div>

        {/* Right: Response Output */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#22222a] space-y-4">
          <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Réponse du Serveur</h3>
              {responseStatus !== null && (
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                      : responseStatus === 400 || responseStatus === 404 || responseStatus === 409
                      ? 'bg-amber-950/70 text-amber-400 border border-amber-800'
                      : 'bg-rose-950/70 text-rose-400 border border-rose-800'
                  }`}
                >
                  HTTP {responseStatus}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {responseDuration !== null && (
                <span className="text-[11px] font-mono tabular-nums text-zinc-400">
                  {responseDuration} ms
                </span>
              )}

              {responseOutput && (
                <button
                  onClick={copyResponse}
                  className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* JSON Display */}
          <div className="min-h-[260px] max-h-[460px] overflow-auto bg-[#0a0a0e] rounded-lg p-3 border border-[#22222a] font-mono text-xs">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-zinc-500 animate-pulse">
                Exécution de la requête REST en cours...
              </div>
            ) : responseOutput ? (
              <pre className="text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(responseOutput, null, 2)}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-600 text-center">
                <Play className="w-8 h-8 mb-2 opacity-30" />
                <span>Sélectionnez un preset ou cliquez sur "Envoyer"</span>
                <span className="text-[11px] mt-1 text-zinc-600">
                  Les réponses JSON formatées s'afficheront ici.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
