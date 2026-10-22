import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';
import { DashboardStats } from '../types/api';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient.get<{ stats: DashboardStats }>('/dashboard/stats');
    if (res.status === 200 && res.data?.stats) {
      setStats(res.data.stats);
    } else {
      setError(res.message || 'Impossible de récupérer les statistiques');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-zinc-800/60 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#121217] border border-[#22222a] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 flex items-center justify-between">
          <span>{error || 'Erreur lors du chargement des statistiques'}</span>
          <button
            onClick={fetchStats}
            className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded text-xs font-semibold text-white"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Tableau de bord décisionnel
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Métriques d’avancement agrégées en temps réel sur la base de données TaskFlow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(255,45,117,0.3)]"
          >
            <ListTodo className="w-3.5 h-3.5" />
            Voir les tâches
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#181820] text-zinc-200 border border-[#272732] hover:text-white hover:border-zinc-500 transition-all"
          >
            Gérer les projets
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Projets Accessibles */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#282836] relative overflow-hidden card-shadow-kpi card-shadow-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Projets Accessibles
            </span>
            <FolderKanban className="w-4 h-4 text-[#ff2d75]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {stats.totalProjects}
            </span>
            <span className="text-xs text-zinc-400">
              {currentUser?.role === 'ADMIN' ? 'Visibilité totale (Admin)' : 'Vos équipes'}
            </span>
          </div>
        </div>

        {/* KPI 2: Tâches Totales & Taux de complétion */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#282836] relative overflow-hidden card-shadow-kpi card-shadow-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Complétion Globale
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {stats.completionRate}%
            </span>
            <span className="text-xs text-zinc-400">
              {stats.completedTasks} sur {stats.totalTasks} terminées
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Tâches En cours */}
        <div className="p-5 rounded-xl bg-[#121217] border border-[#282836] relative overflow-hidden card-shadow-kpi card-shadow-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tâches En Cours
            </span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {stats.inProgressTasks}
            </span>
            <span className="text-xs text-zinc-400">
              + {stats.todoTasks} à faire
            </span>
          </div>
        </div>

        {/* KPI 4: Tâches En retard (Alerte critique) */}
        <div
          className={`p-5 rounded-xl border relative overflow-hidden card-shadow-kpi card-shadow-hover ${
            stats.overdueTasks > 0
              ? 'bg-rose-950/20 border-rose-900/60'
              : 'bg-[#121217] border-[#282836]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                stats.overdueTasks > 0 ? 'text-rose-400' : 'text-zinc-400'
              }`}
            >
              Tâches En Retard
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${
                stats.overdueTasks > 0 ? 'text-rose-500 animate-pulse' : 'text-zinc-600'
              }`}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold font-mono tabular-nums ${
                stats.overdueTasks > 0 ? 'text-rose-400' : 'text-zinc-300'
              }`}
            >
              {stats.overdueTasks}
            </span>
            <span className="text-xs text-zinc-400">
              {stats.overdueTasks > 0 ? 'Date limite dépassée' : 'Aucun retard'}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Section: Status & Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="p-6 rounded-xl bg-[#121217] border border-[#282836] space-y-4 card-shadow">
          <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Répartition par Statut
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              {stats.totalTasks} tâches
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  À faire (TODO)
                </span>
                <span className="font-mono tabular-nums text-white">
                  {stats.tasksByStatus.TODO}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-zinc-400 h-full rounded-full"
                  style={{
                    width: `${stats.totalTasks ? (stats.tasksByStatus.TODO / stats.totalTasks) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff2d75]" />
                  En cours (IN PROGRESS)
                </span>
                <span className="font-mono tabular-nums text-white">
                  {stats.tasksByStatus.IN_PROGRESS}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#ff2d75] h-full rounded-full"
                  style={{
                    width: `${stats.totalTasks ? (stats.tasksByStatus.IN_PROGRESS / stats.totalTasks) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Terminées (DONE)
                </span>
                <span className="font-mono tabular-nums text-white">
                  {stats.tasksByStatus.DONE}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${stats.totalTasks ? (stats.tasksByStatus.DONE / stats.totalTasks) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-6 rounded-xl bg-[#121217] border border-[#282836] space-y-4 card-shadow">
          <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Répartition par Priorité
            </h3>
            <span className="text-xs font-mono text-zinc-400">Gravité</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Haute priorité (HIGH)
                </span>
                <span className="font-mono tabular-nums text-white">
                  {stats.tasksByPriority.HIGH}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{
                    width: `${stats.totalTasks ? (stats.tasksByPriority.HIGH / stats.totalTasks) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Moyenne (MEDIUM)
                </span>
                <span className="font-mono tabular-nums text-white">
                  {stats.tasksByPriority.MEDIUM}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${stats.totalTasks ? (stats.tasksByPriority.MEDIUM / stats.totalTasks) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Basse (LOW)
                </span>
                <span className="font-mono tabular-nums text-white">
                  {stats.tasksByPriority.LOW}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{
                    width: `${stats.totalTasks ? (stats.tasksByPriority.LOW / stats.totalTasks) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick RBAC Diagnostic Box */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#121217] to-[#181822] border border-[#282836] flex flex-col justify-between card-shadow">
          <div>
            <div className="flex items-center gap-2 text-[#ff2d75] mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Contrôle des Accès (RBAC)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connecté en tant que <span className="text-white font-semibold">{currentUser?.name}</span> avec le rôle{' '}
              <span className="font-mono font-bold text-[#ff2d75]">{currentUser?.role}</span>.
              {currentUser?.role === 'ADMIN' ? (
                ' Vous disposez de la pleine visibilité sur tous les projets de l’entreprise et pouvez modifier les rôles dans l’onglet Utilisateurs.'
              ) : (
                ' Vos statistiques et vos accès sont strictement isolés à vos équipes et projets assignés, conformément aux règles du Module B.'
              )}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#22222a] flex items-center justify-between text-xs">
            <span className="text-zinc-400">Tester en tant qu’autre rôle :</span>
            <button
              onClick={() => onNavigate('users')}
              className="text-[#ff2d75] hover:underline font-semibold flex items-center gap-1"
            >
              Gérer les rôles
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="p-6 rounded-xl bg-[#121217] border border-[#282836] space-y-4 card-shadow">
        <div className="flex items-center justify-between border-b border-[#22222a] pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Dernières Tâches Mises à Jour
            </h3>
            <p className="text-xs text-zinc-400">
              Flux d'activité récent sur les projets actifs
            </p>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold text-[#ff2d75] hover:text-[#f43f5e] flex items-center gap-1"
          >
            Toutes les tâches
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#1e1e28]">
          {stats.recentTasks.map((task) => (
            <div
              key={task.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    task.status === 'DONE'
                      ? 'bg-emerald-500'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-[#ff2d75]'
                      : 'bg-zinc-500'
                  }`}
                />
                <div>
                  <span className="font-semibold text-white block">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 text-zinc-400 mt-0.5">
                    <span>{task.project?.name || 'Projet'}</span>
                    <span>·</span>
                    <span>Priorité {task.priority}</span>
                    {task.dueDate && (
                      <>
                        <span>·</span>
                        <span className="font-mono tabular-nums">Échéance : {task.dueDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                {task.assignedUser ? (
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <img
                      src={
                        task.assignedUser.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignedUser.name}`
                      }
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{task.assignedUser.name}</span>
                  </div>
                ) : (
                  <span className="text-zinc-400 italic">Non assignée</span>
                )}
                <span
                  className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                    task.status === 'DONE'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-pink-950/60 text-[#ff2d75] border border-pink-900/80'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
