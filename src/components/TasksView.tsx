import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Filter,
  Kanban,
  List,
  Plus,
  Search,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';
import { PaginationMeta, Project, SafeUser, Task, TaskPriority, TaskStatus } from '../types/api';

interface TasksViewProps {
  initialProjectId?: string | null;
}

export const TasksView: React.FC<TasksViewProps> = ({ initialProjectId }) => {
  const { currentUser, isAdmin } = useAuth();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [filterProject, setFilterProject] = useState<string>(initialProjectId || '');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Form states
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<TaskStatus>('TODO');
  const [formPriority, setFormPriority] = useState<TaskPriority>('MEDIUM');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAssignedUserId, setFormAssignedUserId] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchProjects = async () => {
    const res = await apiClient.get<{ projects: Project[] }>('/projects');
    if (res.status === 200 && res.data?.projects) {
      setProjects(res.data.projects);
      if (!formProjectId && res.data.projects.length > 0) {
        setFormProjectId(res.data.projects[0].id);
      }
    }
  };

  const fetchTasks = async (page = 1) => {
    setLoading(true);
    const endpoint = filterProject ? `/projects/${filterProject}/tasks` : '/tasks';
    const res = await apiClient.get<{ tasks: Task[]; pagination: PaginationMeta }>(
      endpoint,
      {
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
        assignedUserId: filterAssignee || undefined,
        search: searchQuery || undefined,
        sortBy,
        order: sortOrder,
        page,
        limit: 25,
      }
    );

    if (res.status === 200 && res.data) {
      setTasks(res.data.tasks || []);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  useEffect(() => {
    fetchTasks(1);
  }, [filterProject, filterStatus, filterPriority, filterAssignee, sortBy, sortOrder, currentUser]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks(1);
  };

  const handleOpenCreate = () => {
    setFormTitle('');
    setFormDescription('');
    setFormStatus('TODO');
    setFormPriority('MEDIUM');
    setFormDueDate('');
    setFormAssignedUserId('');
    if (filterProject) {
      setFormProjectId(filterProject);
    } else if (projects.length > 0) {
      setFormProjectId(projects[0].id);
    }
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setActiveTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate || '');
    setFormAssignedUserId(task.assignedUserId || '');
    setFormProjectId(task.projectId);
    setIsEditOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formProjectId) return;
    setFormSubmitting(true);

    const res = await apiClient.post(`/projects/${formProjectId}/tasks`, {
      title: formTitle,
      description: formDescription,
      status: formStatus,
      priority: formPriority,
      dueDate: formDueDate || null,
      assignedUserId: formAssignedUserId || null,
    });

    setFormSubmitting(false);
    if (res.status === 201) {
      setIsCreateOpen(false);
      fetchTasks(pagination.page);
    } else {
      alert(res.message || 'Erreur lors de la création de la tâche');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !formTitle.trim()) return;
    setFormSubmitting(true);

    const res = await apiClient.patch(`/tasks/${activeTask.id}`, {
      title: formTitle,
      description: formDescription,
      status: formStatus,
      priority: formPriority,
      dueDate: formDueDate || null,
      assignedUserId: formAssignedUserId || null,
      projectId: formProjectId,
    });

    setFormSubmitting(false);
    if (res.status === 200) {
      setIsEditOpen(false);
      fetchTasks(pagination.page);
    } else {
      alert(res.message || 'Erreur lors de la modification de la tâche');
    }
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const res = await apiClient.patch(`/tasks/${taskId}`, { status: newStatus });
    if (res.status === 200) {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } else {
      alert(res.message || 'Action non autorisée');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;
    const res = await apiClient.delete(`/tasks/${taskId}`);
    if (res.status === 200) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      alert(res.message || 'Action non autorisée (créateur, responsable ou ADMIN requis)');
    }
  };

  // Get project members for assignee dropdown
  const currentSelectedProject = projects.find((p) => p.id === formProjectId);
  const eligibleAssignees: SafeUser[] = currentSelectedProject?.members
    ?.map((m) => m.user)
    .filter((u): u is SafeUser => !!u) || [];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Gestion & Suivi des Tâches
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Module C : Filtres, recherche, tri, pagination et assignation de membres d’équipe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#121217] border border-[#22222a] rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-[#ff2d75] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-[#ff2d75] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tableau
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(255,45,117,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Tâche
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#121217] border border-[#22222a] flex flex-col md:flex-row flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] w-full md:w-auto">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou description..."
            className="w-full bg-[#181822] border border-[#282836] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-[#181822] border border-[#282836] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#ff2d75]"
          >
            <option value="">Tous les projets</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#181822] border border-[#282836] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#ff2d75]"
          >
            <option value="">Tous les statuts</option>
            <option value="TODO">À faire (TODO)</option>
            <option value="IN_PROGRESS">En cours (IN PROGRESS)</option>
            <option value="DONE">Terminé (DONE)</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#181822] border border-[#282836] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#ff2d75]"
          >
            <option value="">Toutes priorités</option>
            <option value="HIGH">Haute (HIGH)</option>
            <option value="MEDIUM">Moyenne (MEDIUM)</option>
            <option value="LOW">Basse (LOW)</option>
          </select>

          {/* Sort By */}
          <button
            onClick={() => {
              if (sortBy === 'createdAt') {
                setSortBy('dueDate');
              } else {
                setSortBy('createdAt');
              }
            }}
            title="Changer le critère de tri"
            className="flex items-center gap-1 bg-[#181822] border border-[#282836] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            <ArrowUpDown className="w-3 h-3 text-[#ff2d75]" />
            <span>Tri : {sortBy === 'createdAt' ? 'Date création' : 'Échéance'}</span>
          </button>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="bg-[#181822] border border-[#282836] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white font-mono"
          >
            {sortOrder.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main Views */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-[#121217] border border-[#22222a] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#121217] border border-[#22222a]">
          <CheckCircle2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Aucune tâche trouvée</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            Aucune tâche ne correspond à vos filtres actuels ou aucun projet n'a encore été créé.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666]"
          >
            Créer une tâche
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column 1: TODO */}
          <KanbanColumn
            title="À Faire"
            status="TODO"
            badgeColor="bg-zinc-700 text-zinc-300"
            tasks={tasks.filter((t) => t.status === 'TODO')}
            onOpenEdit={handleOpenEdit}
            onDelete={handleDeleteTask}
            onStatusChange={handleQuickStatusChange}
          />

          {/* Column 2: IN_PROGRESS */}
          <KanbanColumn
            title="En Cours"
            status="IN_PROGRESS"
            badgeColor="bg-pink-950/60 text-[#ff2d75] border border-pink-900/60"
            tasks={tasks.filter((t) => t.status === 'IN_PROGRESS')}
            onOpenEdit={handleOpenEdit}
            onDelete={handleDeleteTask}
            onStatusChange={handleQuickStatusChange}
          />

          {/* Column 3: DONE */}
          <KanbanColumn
            title="Terminé"
            status="DONE"
            badgeColor="bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
            tasks={tasks.filter((t) => t.status === 'DONE')}
            onOpenEdit={handleOpenEdit}
            onDelete={handleDeleteTask}
            onStatusChange={handleQuickStatusChange}
          />
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="rounded-xl bg-[#121217] border border-[#282836] overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181820] border-b border-[#22222a] text-zinc-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Tâche & Projet</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Priorité</th>
                  <th className="px-4 py-3">Assigné</th>
                  <th className="px-4 py-3">Date Limite</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e28]">
                {tasks.map((task) => {
                  const isOverdue =
                    task.dueDate &&
                    task.dueDate < new Date().toISOString().split('T')[0] &&
                    task.status !== 'DONE';

                  return (
                    <tr key={task.id} className="hover:bg-[#16161e] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{task.title}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <span>{task.project?.name || task.projectId}</span>
                          <span>·</span>
                          <span>Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleQuickStatusChange(task.id, e.target.value as TaskStatus)
                          }
                          className="bg-[#181822] border border-[#282836] rounded px-2 py-1 text-[11px] font-mono font-semibold text-zinc-200 focus:outline-none focus:border-[#ff2d75]"
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold text-[11px] ${
                            task.priority === 'HIGH'
                              ? 'text-red-400'
                              : task.priority === 'MEDIUM'
                              ? 'text-amber-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
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
                          <span className="text-zinc-500 italic">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums">
                        {task.dueDate ? (
                          <span
                            className={
                              isOverdue ? 'text-rose-400 font-bold flex items-center gap-1' : 'text-zinc-300'
                            }
                          >
                            {isOverdue && <AlertCircle className="w-3 h-3 text-rose-500" />}
                            {task.dueDate}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-[#20202c]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 rounded hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 border-t border-[#22222a] bg-[#16161e] flex items-center justify-between text-xs text-zinc-400">
            <span>
              Affichage de {tasks.length} sur {pagination.total} tâches (Page {pagination.page} / {pagination.totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchTasks(pagination.page - 1)}
                className="px-3 py-1 rounded bg-[#1f1f28] hover:bg-[#282836] disabled:opacity-40 text-zinc-300"
              >
                Précédent
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchTasks(pagination.page + 1)}
                className="px-3 py-1 rounded bg-[#1f1f28] hover:bg-[#282836] disabled:opacity-40 text-zinc-300"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121218] border border-[#2a2a38] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20202c] pb-3">
              <h3 className="text-base font-bold text-white">Créer une Tâche</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Projet concerné *
                </label>
                <select
                  required
                  value={formProjectId}
                  onChange={(e) => {
                    setFormProjectId(e.target.value);
                    setFormAssignedUserId('');
                  }}
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2d75]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Titre de la tâche *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="ex: Implémenter les tests de régression JWT"
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Détails techniques, critères d'acceptation..."
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Statut
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  >
                    <option value="TODO">À faire (TODO)</option>
                    <option value="IN_PROGRESS">En cours (IN_PROGRESS)</option>
                    <option value="DONE">Terminé (DONE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Priorité
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  >
                    <option value="LOW">Basse (LOW)</option>
                    <option value="MEDIUM">Moyenne (MEDIUM)</option>
                    <option value="HIGH">Haute (HIGH)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Date limite (facultative)
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Assigner un membre
                  </label>
                  <select
                    value={formAssignedUserId}
                    onChange={(e) => setFormAssignedUserId(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  >
                    <option value="">Non assignée</option>
                    {eligibleAssignees.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#20202c]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] disabled:opacity-50"
                >
                  {formSubmitting ? 'Création...' : 'Créer la tâche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {isEditOpen && activeTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121218] border border-[#2a2a38] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20202c] pb-3">
              <h3 className="text-base font-bold text-white">Modifier la Tâche</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Titre de la tâche
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2d75]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2d75]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Statut
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  >
                    <option value="TODO">À faire (TODO)</option>
                    <option value="IN_PROGRESS">En cours (IN_PROGRESS)</option>
                    <option value="DONE">Terminé (DONE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Priorité
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  >
                    <option value="LOW">Basse (LOW)</option>
                    <option value="MEDIUM">Moyenne (MEDIUM)</option>
                    <option value="HIGH">Haute (HIGH)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Date limite
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Assigner un membre
                  </label>
                  <select
                    value={formAssignedUserId}
                    onChange={(e) => setFormAssignedUserId(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  >
                    <option value="">Non assignée</option>
                    {eligibleAssignees.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#20202c]">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] disabled:opacity-50"
                >
                  {formSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Kanban Column Component
interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  badgeColor: string;
  tasks: Task[];
  onOpenEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  badgeColor,
  tasks,
  onOpenEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="rounded-xl bg-[#121217] border border-[#282836] p-4 flex flex-col min-h-[480px] card-shadow">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e1e28] mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>{title}</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${badgeColor}`}>
            {tasks.length}
          </span>
        </h3>
      </div>

      {/* Tasks List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {tasks.map((task) => {
          const isOverdue =
            task.dueDate &&
            task.dueDate < new Date().toISOString().split('T')[0] &&
            task.status !== 'DONE';

          return (
            <div
              key={task.id}
              className="p-3.5 rounded-lg bg-[#161620] border border-[#28283a] space-y-2 group card-shadow card-shadow-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-white leading-snug">
                  {task.title}
                </span>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onOpenEdit(task)}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1 text-zinc-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-[#20202c]">
                <span
                  className={`font-semibold ${
                    task.priority === 'HIGH'
                      ? 'text-red-400'
                      : task.priority === 'MEDIUM'
                      ? 'text-amber-400'
                      : 'text-blue-400'
                  }`}
                >
                  {task.priority}
                </span>

                {task.dueDate && (
                  <span
                    className={`font-mono tabular-nums flex items-center gap-1 ${
                      isOverdue ? 'text-rose-400 font-bold' : 'text-zinc-400'
                    }`}
                  >
                    <Calendar className="w-2.5 h-2.5" />
                    {task.dueDate}
                  </span>
                )}
              </div>

              {/* Assignee & Status Quick Switch */}
              <div className="flex items-center justify-between pt-1">
                {task.assignedUser ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                    <img
                      src={
                        task.assignedUser.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignedUser.name}`
                      }
                      alt=""
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="truncate max-w-[100px]">{task.assignedUser.name}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-500 italic">Non assignée</span>
                )}

                {/* Move buttons */}
                <div className="flex items-center gap-1">
                  {status !== 'TODO' && (
                    <button
                      onClick={() =>
                        onStatusChange(task.id, status === 'DONE' ? 'IN_PROGRESS' : 'TODO')
                      }
                      title="Reculer d'un état"
                      className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 hover:text-white"
                    >
                      &larr;
                    </button>
                  )}
                  {status !== 'DONE' && (
                    <button
                      onClick={() =>
                        onStatusChange(task.id, status === 'TODO' ? 'IN_PROGRESS' : 'DONE')
                      }
                      title="Avancer à l'état suivant"
                      className="px-1.5 py-0.5 rounded bg-[#ff2d75] hover:bg-[#e02666] text-[10px] font-bold text-white"
                    >
                      &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
