import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import { DEFAULT_CREDENTIALS, useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';
import { NavigationTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenProfile: () => void;
  onRefreshData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab: _currentTab,
  onOpenProfile,
  onRefreshData,
}) => {
  const { currentUser, isAdmin, quickSwitchUser, token } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Voulez-vous réinitialiser toutes les données de test par défaut ?')) {
      return;
    }
    setResetting(true);
    const res = await apiClient.post('/seed/reset');
    setResetting(false);
    if (res.status === 200) {
      setStatusMessage('Données réinitialisées');
      onRefreshData();
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage(res.message || 'Erreur');
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  return (
    <header className="h-16 bg-[#0a0a0e] border-b border-[#20202a] px-6 flex items-center justify-between gap-6 shrink-0 z-20">
      {/* Left zone left clean without redundant view title */}
      <div className="flex items-center gap-2"></div>

      {/* Zone 2: Status Notice (Temporary) */}
      {statusMessage && (
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-[11px] font-mono text-emerald-400">
          <Check className="w-3 h-3" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Direct Link to Swagger UI */}
        <a
          href="/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] transition-all shadow-sm"
        >
          <span>Swagger UI</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Compact Quick Tools Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsToolsOpen(!isToolsOpen);
              setIsAccountOpen(false);
            }}
            title="Outils développeur (Copier Token, Reset Demo)"
            className={`p-2 rounded-lg border text-xs font-medium transition-all ${
              isToolsOpen
                ? 'bg-[#181824] border-[#ff2d75] text-white'
                : 'bg-[#121218] border-[#252532] text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {isToolsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#121218] border border-[#2a2a38] rounded-xl shadow-2xl p-2 z-50 card-shadow">
              <div className="px-2.5 py-1.5 border-b border-[#20202c] mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Outils Rapides
                </span>
              </div>

              <button
                onClick={() => {
                  handleCopyToken();
                  setTimeout(() => setIsToolsOpen(false), 800);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1a1a24] text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-[#ff2d75]" />
                  <span>Copier le token JWT</span>
                </div>
                {copiedToken && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    handleResetData();
                    setIsToolsOpen(false);
                  }}
                  disabled={resetting}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1a1a24] text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                  <span>Réinitialiser les données</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Account Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsAccountOpen(!isAccountOpen);
              setIsToolsOpen(false);
            }}
            className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border transition-all ${
              isAccountOpen
                ? 'bg-[#181824] border-[#ff2d75]'
                : 'bg-[#121218] border-[#252532] hover:border-zinc-500'
            }`}
          >
            <img
              src={
                currentUser?.avatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name || 'U'}`
              }
              alt=""
              className="w-5 h-5 rounded-full object-cover border border-zinc-700"
            />
            <span className="text-xs font-semibold text-white max-w-[120px] truncate hidden sm:inline">
              {currentUser?.name}
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#ff2d75]/20 text-[#ff2d75] border border-[#ff2d75]/30">
              {currentUser?.role}
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isAccountOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#121218] border border-[#2a2a38] rounded-xl shadow-2xl p-2 z-50 card-shadow">
              <div className="px-3 py-2 border-b border-[#20202c]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Changer de profil (Test RBAC)
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Basculez entre comptes sénégalais pour tester les accès.
                </p>
              </div>

              <div className="py-1 space-y-0.5">
                {DEFAULT_CREDENTIALS.map((cred) => {
                  const isSelected = currentUser?.email === cred.email;
                  return (
                    <button
                      key={cred.email}
                      onClick={async () => {
                        await quickSwitchUser(cred.email, cred.password);
                        setIsAccountOpen(false);
                        onRefreshData();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'bg-[#ff2d75]/15 border border-[#ff2d75]/40 text-white'
                          : 'hover:bg-[#1a1a24] text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          {cred.name}
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                              cred.role === 'ADMIN'
                                ? 'bg-[#ff2d75] text-white'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {cred.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400">{cred.jobTitle}</span>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-[#ff2d75]" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-1 border-t border-[#20202c]">
                <button
                  onClick={() => {
                    setIsAccountOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#1a1a24] rounded-lg transition-all flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-[#ff2d75]" />
                  Modifier mon profil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
