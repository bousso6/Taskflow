import React, { useState } from 'react';
import { ApiTesterView } from './components/ApiTesterView';
import { DashboardView } from './components/DashboardView';
import { DeploymentView } from './components/DeploymentView';
import { Header } from './components/Header';
import { ProfileModal } from './components/ProfileModal';
import { ProjectsView } from './components/ProjectsView';
import { NavigationTab, Sidebar } from './components/Sidebar';
import { TasksView } from './components/TasksView';
import { UsersView } from './components/UsersView';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainApp() {
  const { currentUser, isLoading, isAuthenticated, login } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Login form state (if logged out)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const handleSelectProjectForTasks = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab('tasks');
  };

  const handleRefreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError(null);
    const res = await login(loginEmail, loginPassword);
    setLoginSubmitting(false);
    if (!res.success) {
      setLoginError(res.message || 'Identifiants incorrects');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#09090b] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ff2d75] to-[#f43f5e] flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(255,45,117,0.5)] animate-pulse">
          T
        </div>
        <p className="text-xs font-mono text-zinc-400">Initialisation de TaskFlow...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="bg-[#121218] border border-[#282836] rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 card-shadow">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ff2d75] to-[#f43f5e] mx-auto flex items-center justify-center font-black text-2xl text-white shadow-[0_0_20px_rgba(255,45,117,0.4)]">
              T
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Task<span className="text-[#ff2d75]">Flow</span> Backoffice
            </h2>
            <p className="text-xs text-zinc-400">
              Authentification sécurisée avec token JWT Bearer
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Adresse Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@taskflow.dev"
                className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
              />
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-2.5 rounded-lg bg-[#ff2d75] hover:bg-[#e02666] font-bold text-white text-xs transition-all shadow-[0_2px_12px_rgba(255,45,117,0.35)] disabled:opacity-50"
            >
              {loginSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#1f1f2a] text-center">
            <span className="text-[11px] text-zinc-400 block mb-2">Comptes de test rapide :</span>
            <div className="flex flex-wrap gap-2 justify-center text-[10px]">
              <button
                onClick={() => {
                  setLoginEmail('admin@taskflow.dev');
                  setLoginPassword('Admin123!');
                }}
                className="px-2.5 py-1 rounded bg-[#181822] text-[#ff2d75] border border-[#2a2a38] font-semibold"
              >
                Amadou (CTO)
              </button>
              <button
                onClick={() => {
                  setLoginEmail('fatou.sow@taskflow.dev');
                  setLoginPassword('User123!');
                }}
                className="px-2.5 py-1 rounded bg-[#181822] text-zinc-300 border border-[#2a2a38] hover:text-white"
              >
                Fatou (Lead Front)
              </button>
              <button
                onClick={() => {
                  setLoginEmail('cheikh.ndiaye@taskflow.dev');
                  setLoginPassword('User123!');
                }}
                className="px-2.5 py-1 rounded bg-[#181822] text-zinc-300 border border-[#2a2a38] hover:text-white"
              >
                Cheikh (DevOps)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b] text-[#fafafa]">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Top Bar */}
        <Header
          currentTab={currentTab}
          onOpenProfile={() => setIsProfileOpen(true)}
          onRefreshData={handleRefreshData}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'projects' && (
            <ProjectsView onSelectProjectForTasks={handleSelectProjectForTasks} />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              key={`tasks-${selectedProjectId || 'all'}-${refreshTrigger}`}
              initialProjectId={selectedProjectId}
            />
          )}

          {currentTab === 'users' && <UsersView />}

          {currentTab === 'api-tester' && <ApiTesterView />}

          {currentTab === 'deployment' && <DeploymentView />}
        </main>
      </div>

      {/* User Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
