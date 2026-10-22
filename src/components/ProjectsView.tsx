import {
  Calendar,
  Check,
  Edit2,
  FolderKanban,
  Plus,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';
import { Project, SafeUser } from '../types/api';

interface ProjectsViewProps {
  onSelectProjectForTasks?: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectProjectForTasks }) => {
  const { currentUser, isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#ff2d75');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Member management state
  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');
  const [selectedNewMemberRole, setSelectedNewMemberRole] = useState<'MEMBER' | 'OWNER'>('MEMBER');

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient.get<{ projects: Project[] }>('/projects');
    if (res.status === 200 && res.data?.projects) {
      setProjects(res.data.projects);
    } else {
      setError(res.message || 'Impossible de charger les projets.');
    }
    setLoading(false);
  };

  const fetchAllUsers = async () => {
    const res = await apiClient.get<{ users: SafeUser[] }>('/users');
    if (res.status === 200 && res.data?.users) {
      setAllUsers(res.data.users);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchAllUsers();
  }, [currentUser]);

  const handleOpenCreate = () => {
    setFormName('');
    setFormDescription('');
    setFormColor('#ff2d75');
    setSelectedMemberIds([]);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setActiveProject(project);
    setFormName(project.name);
    setFormDescription(project.description);
    setFormColor(project.color || '#ff2d75');
    setIsEditOpen(true);
  };

  const handleOpenMembers = (project: Project) => {
    setActiveProject(project);
    setSelectedNewMemberId('');
    setSelectedNewMemberRole('MEMBER');
    setIsMembersOpen(true);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setFormSubmitting(true);

    const res = await apiClient.post('/projects', {
      name: formName,
      description: formDescription,
      color: formColor,
      memberIds: selectedMemberIds,
    });

    setFormSubmitting(false);
    if (res.status === 201) {
      setIsCreateOpen(false);
      fetchProjects();
    } else {
      alert(res.message || 'Erreur lors de la création du projet');
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !formName.trim()) return;
    setFormSubmitting(true);

    const res = await apiClient.patch(`/projects/${activeProject.id}`, {
      name: formName,
      description: formDescription,
      color: formColor,
    });

    setFormSubmitting(false);
    if (res.status === 200) {
      setIsEditOpen(false);
      fetchProjects();
    } else {
      alert(res.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Confirmer la suppression du projet "${project.name}" et de toutes ses tâches ?`)) {
      return;
    }
    const res = await apiClient.delete(`/projects/${project.id}`);
    if (res.status === 200) {
      fetchProjects();
    } else {
      alert(res.message || 'Erreur lors de la suppression');
    }
  };

  const handleAddMember = async () => {
    if (!activeProject || !selectedNewMemberId) return;
    const res = await apiClient.post(`/projects/${activeProject.id}/members`, {
      userId: selectedNewMemberId,
      role: selectedNewMemberRole,
    });
    if (res.status === 201 && res.data?.project) {
      setActiveProject(res.data.project);
      fetchProjects();
      setSelectedNewMemberId('');
    } else {
      alert(res.message || 'Erreur lors de l’ajout du membre');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeProject) return;
    const res = await apiClient.delete(`/projects/${activeProject.id}/members/${userId}`);
    if (res.status === 200 && res.data?.project) {
      setActiveProject(res.data.project);
      fetchProjects();
    } else {
      alert(res.message || 'Impossible de retirer ce membre');
    }
  };

  const canManage = (project: Project) => {
    return isAdmin || project.ownerId === currentUser?.id;
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Gestion des Projets & Équipes
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Module B : Contrôle strict des autorisations d’équipe et affectation des membres.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(255,45,117,0.3)] shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau Projet
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-[#121217] border border-[#22222a] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#121217] border border-[#22222a]">
          <FolderKanban className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Aucun projet accessible</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            Vous ne participez à aucun projet pour l'instant ou vous n'avez pas les autorisations nécessaires.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666]"
          >
            Créer votre premier projet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const hasManageRights = canManage(project);
            return (
              <div
                key={project.id}
                className="rounded-xl bg-[#121217] border border-[#282836] p-5 flex flex-col justify-between transition-all group card-shadow card-shadow-hover"
              >
                <div>
                  {/* Card Header with Color & Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm"
                        style={{ backgroundColor: project.color || '#ff2d75' }}
                      />
                      <h3 className="text-base font-bold text-white group-hover:text-[#ff2d75] transition-colors truncate">
                        {project.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {hasManageRights && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(project)}
                            title="Modifier le projet"
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#1f1f28] rounded-md transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project)}
                            title="Supprimer le projet"
                            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                    {project.description || 'Aucune description détaillée.'}
                  </p>

                  {/* Owner & Dates */}
                  <div className="text-[11px] text-zinc-400 space-y-1 mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-zinc-400" />
                      <span>Responsable :</span>
                      <span className="font-semibold text-zinc-200">
                        {project.owner?.name || 'Inconnu'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>Créé le :</span>
                      <span className="font-mono tabular-nums text-zinc-300">
                        {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Members & Open Tasks */}
                <div className="pt-3 border-t border-[#1e1e28] flex items-center justify-between">
                  {/* Members Avatars & Modal Trigger */}
                  <button
                    onClick={() => handleOpenMembers(project)}
                    className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white transition-all"
                  >
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {project.members.slice(0, 4).map((m) => (
                        <img
                          key={m.userId}
                          src={
                            m.user?.avatarUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${m.user?.name || m.userId}`
                          }
                          alt={m.user?.name || ''}
                          title={`${m.user?.name || m.userId} (${m.role})`}
                          className="w-6 h-6 rounded-full border-2 border-[#121217] object-cover"
                        />
                      ))}
                      {project.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full border-2 border-[#121217] bg-zinc-800 text-[10px] flex items-center justify-center font-bold text-zinc-300">
                          +{project.members.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-zinc-400">
                      {project.members.length} membre{project.members.length > 1 ? 's' : ''}
                    </span>
                  </button>

                  {/* View Tasks Action */}
                  {onSelectProjectForTasks && (
                    <button
                      onClick={() => onSelectProjectForTasks(project.id)}
                      className="text-xs font-semibold text-[#ff2d75] hover:underline"
                    >
                      Voir tâches &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121218] border border-[#2a2a38] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20202c] pb-3">
              <h3 className="text-base font-bold text-white">Nouveau Projet</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ex: Migration Cloud & Refonte API"
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
                  placeholder="Objectifs stratégiques, livrables attendus..."
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Couleur d'identification
                </label>
                <div className="flex items-center gap-3">
                  {['#ff2d75', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'].map(
                    (c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormColor(c)}
                        className={`w-7 h-7 rounded-lg transition-transform ${
                          formColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#121218]' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Sélectionner les membres initiaux
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 border border-[#2a2a38] rounded-lg p-2 bg-[#181822]">
                  {allUsers
                    .filter((u) => u.id !== currentUser?.id)
                    .map((user) => {
                      const isChecked = selectedMemberIds.includes(user.id);
                      return (
                        <label
                          key={user.id}
                          className="flex items-center justify-between p-1.5 rounded hover:bg-[#20202c] cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 text-zinc-200">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMemberIds([...selectedMemberIds, user.id]);
                                } else {
                                  setSelectedMemberIds(
                                    selectedMemberIds.filter((id) => id !== user.id)
                                  );
                                }
                              }}
                              className="accent-[#ff2d75]"
                            />
                            <span>{user.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {user.role}
                          </span>
                        </label>
                      );
                    })}
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
                  {formSubmitting ? 'Création...' : 'Créer le projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && activeProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121218] border border-[#2a2a38] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20202c] pb-3">
              <h3 className="text-base font-bold text-white">Modifier le Projet</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nom du projet
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Couleur
                </label>
                <div className="flex items-center gap-3">
                  {['#ff2d75', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'].map(
                    (c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormColor(c)}
                        className={`w-7 h-7 rounded-lg transition-transform ${
                          formColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#121218]' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
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
                  {formSubmitting ? 'Mise à jour...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBERS MANAGEMENT DRAWER / MODAL */}
      {isMembersOpen && activeProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121218] border border-[#2a2a38] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20202c] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Équipe du projet : {activeProject.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  {activeProject.members.length} membres assignés
                </p>
              </div>
              <button
                onClick={() => setIsMembersOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Members List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activeProject.members.map((m) => {
                const isOwner = m.role === 'OWNER' || activeProject.ownerId === m.userId;
                return (
                  <div
                    key={m.userId}
                    className="p-2.5 rounded-lg bg-[#181822] border border-[#242432] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          m.user?.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${m.user?.name || m.userId}`
                        }
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-semibold text-white block">
                          {m.user?.name || m.userId}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {m.user?.email} · {m.user?.jobTitle || 'Membre'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isOwner
                            ? 'bg-[#ff2d75]/20 text-[#ff2d75] border border-[#ff2d75]/40'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {m.role}
                      </span>

                      {canManage(activeProject) && !isOwner && (
                        <button
                          onClick={() => handleRemoveMember(m.userId)}
                          title="Retirer du projet"
                          className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Member Section */}
            {canManage(activeProject) && (
              <div className="pt-3 border-t border-[#20202c] space-y-3">
                <span className="text-xs font-semibold text-zinc-300 block">
                  Ajouter un collaborateur
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={selectedNewMemberId}
                    onChange={(e) => setSelectedNewMemberId(e.target.value)}
                    className="flex-1 bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  >
                    <option value="">Sélectionner un utilisateur...</option>
                    {allUsers
                      .filter((u) => !activeProject.members.some((m) => m.userId === u.id))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.jobTitle || u.role})
                        </option>
                      ))}
                  </select>

                  <select
                    value={selectedNewMemberRole}
                    onChange={(e) => setSelectedNewMemberRole(e.target.value as any)}
                    className="bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="OWNER">OWNER</option>
                  </select>

                  <button
                    onClick={handleAddMember}
                    disabled={!selectedNewMemberId}
                    className="px-3 py-2 rounded-lg bg-[#ff2d75] hover:bg-[#e02666] text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsMembersOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#181820] text-zinc-300 hover:text-white"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
