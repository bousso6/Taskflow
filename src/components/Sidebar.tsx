import {
  BookOpen,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Rocket,
  ShieldAlert,
  Users,
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../context/AuthContext';

export type NavigationTab =
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'users'
  | 'api-tester'
  | 'deployment';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, isAdmin } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      id: 'projects' as NavigationTab,
      label: 'Projets & Équipes',
      icon: FolderKanban,
    },
    {
      id: 'tasks' as NavigationTab,
      label: 'Tâches & Kanban',
      icon: CheckSquare,
    },
    {
      id: 'users' as NavigationTab,
      label: 'Utilisateurs & Rôles',
      icon: Users,
      adminOnly: true,
    },
    {
      id: 'api-tester' as NavigationTab,
      label: 'Console REST & Swagger',
      icon: BookOpen,
    
    },
    {
      id: 'deployment' as NavigationTab,
      label: 'Déploiement Render / Vercel',
      icon: Rocket,
    },
  ];

  return (
    <aside className="w-64 bg-[#0d0d11] border-r border-[#22222a] flex flex-col shrink-0 select-none">
      {/* Brand Section */}
      <div className="h-16 flex items-center px-6 border-b border-[#22222a] gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff2d75] to-[#f43f5e] flex items-center justify-center font-black text-white text-lg shadow-[0_0_15px_rgba(255,45,117,0.4)]">
          T
        </div>
        <div>
          <span className="text-base font-extrabold text-white tracking-tight">
            Task<span className="text-[#ff2d75]">Flow</span>
          </span>
          <span className="block text-[10px] text-zinc-400 font-medium tracking-wider uppercase">
            Backoffice Admin
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Modules Système
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isRestricted = item.adminOnly && !isAdmin;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#ff2d75] text-white shadow-[0_2px_12px_rgba(255,45,117,0.35)]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#181820]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              

              {isRestricted && (
                <span title="ADMIN requis">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Status & Swagger Link */}
      <div className="p-4 border-t border-[#22222a] bg-[#101015]/80 space-y-3">
        <a
          href="/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-[#181820] text-[#ff2d75] border border-[#2a2a35] hover:bg-[#ff2d75] hover:text-white transition-all shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Ouvrir Swagger UI (/api-docs)
        </a>

        {currentUser && (
          <div className="pt-2 border-t border-[#1f1f28] flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  currentUser.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`
                }
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0d0d11] ${
                  isAdmin ? 'bg-[#ff2d75]' : 'bg-emerald-500'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="font-mono text-[10px] font-bold text-[#ff2d75]">
                  {currentUser.role}
                </span>
                <span>·</span>
                <span className="truncate">{currentUser.jobTitle || 'Membre'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
