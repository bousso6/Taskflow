# Guide de Déploiement Professionnel — TaskFlow

Ce document détaille les étapes pour déployer l'API REST TaskFlow sur **Render** et le Backoffice Admin sur **Vercel**, ou en mode Full-Stack conteneurisé.

---

## 1. Déploiement du Backend sur Render (Node.js & Express)

### Option A — Déploiement automatique via Blueprint (`render.yaml`)
1. Poussez votre code sur GitHub / GitLab.
2. Rendez-vous sur le dashboard [Render](https://dashboard.render.com).
3. Cliquez sur **New +** > **Blueprint**.
4. Connectez votre dépôt GitHub et sélectionnez la branche principale.
5. Render va automatiquement lire le fichier `render.yaml` situé à la racine et provisionner le service web Node.js.

### Option B — Création Manuelle de Web Service
1. Cliquez sur **New +** > **Web Service**.
2. Renseignez les paramètres suivants :
   - **Environment** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm run start`
   - **Health Check Path** : `/api/health`
3. Dans l'onglet **Environment Variables**, ajoutez :
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `JWT_SECRET` = (Générez une clé sécurisée de 32+ caractères, ex: `openssl rand -hex 32`)
4. Cliquez sur **Deploy Web Service**.
5. Votre backend sera accessible sur : `https://<nom-de-votre-app>.onrender.com`.
   - Documentation Swagger : `https://<nom-de-votre-app>.onrender.com/api-docs`
   - Spécification OpenAPI : `https://<nom-de-votre-app>.onrender.com/api/openapi.json`

---

## 2. Déploiement du Backoffice Frontend sur Vercel

1. Rendez-vous sur le dashboard [Vercel](https://vercel.com/dashboard).
2. Cliquez sur **Add New...** > **Project** et importez votre dépôt.
3. Vercel détecte automatiquement le framework **Vite** :
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
4. Configuration des variables d'environnement (optionnel si le proxy `vercel.json` est utilisé) :
   - `VITE_API_URL` : L'URL de votre backend Render (ex: `https://taskflow-backend.onrender.com`).
5. Le fichier `vercel.json` à la racine réécrit automatiquement les requêtes `/api/*` et `/api-docs` vers votre backend distant et gère le routage SPA pour React.
6. Cliquez sur **Deploy**.

---

## 3. Lancement Local & Développement

```bash
# Installation des dépendances
npm install

# Lancement en développement (Backend Express + Vite HMR sur le port 3000)
npm run dev

# Accès :
# - Backoffice Admin : http://localhost:3000
# - Documentation Swagger UI : http://localhost:3000/api-docs
# - Spécification OpenAPI JSON : http://localhost:3000/api/openapi.json
# - Healthcheck : http://localhost:3000/api/health
```

---

## 4. Comptes de test disponibles immédiatement

| Rôle | Nom | Email | Mot de passe |
| :--- | :--- | :--- | :--- |
| **ADMIN** | Amadou Diallo (CTO) | `admin@taskflow.dev` | `Admin123!` |
| **USER** | Fatou Bintou Sow (Lead Front) | `fatou.sow@taskflow.dev` | `User123!` |
| **USER** | Cheikh Tidiane Ndiaye (DevOps) | `cheikh.ndiaye@taskflow.dev` | `User123!` |
| **USER** | Aïssatou Diop (UX/UI) | `aissatou.diop@taskflow.dev` | `User123!` |
| **USER** | Moussa Fall (QA/Sec) | `moussa.fall@taskflow.dev` | `User123!` |
