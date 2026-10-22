import {
  Key,
  Mail,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';
import { SafeUser, UserRole } from '../types/api';

export const UsersView: React.FC = () => {
  const { currentUser, isAdmin, quickSwitchUser } = useAuth();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('USER');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient.get<{ users: SafeUser[] }>('/users', {
      search: search || undefined,
      role: roleFilter || undefined,
    });
    if (res.status === 200 && res.data?.users) {
      setUsers(res.data.users);
    } else {
      setError(res.message || 'Impossible de récupérer la liste des utilisateurs');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword) return;
    setFormSubmitting(true);

    const res = await apiClient.post('/auth/register', {
      name: formName,
      email: formEmail,
      password: formPassword,
      role: formRole,
      jobTitle: formJobTitle,
      department: formDepartment,
    });

    setFormSubmitting(false);
    if (res.status === 201) {
      setIsCreateOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormJobTitle('');
      setFormDepartment('');
      fetchUsers();
    } else {
      alert(res.message || 'Erreur lors de la création de l’utilisateur');
    }
  };

  const handleToggleRole = async (targetUser: SafeUser) => {
    const newRole: UserRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Changer le rôle de ${targetUser.name} vers ${newRole} ?`)) return;

    const res = await apiClient.patch(`/users/${targetUser.id}/role`, {
      role: newRole,
    });

    if (res.status === 200) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } else {
      alert(res.message || 'Action refusée');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Confirmer la suppression définitive du compte de ${userName} ?`)) return;

    const res = await apiClient.delete(`/users/${userId}`);
    if (res.status === 200) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      alert(res.message || 'Action refusée');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Administration des Utilisateurs & Rôles
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Module A : Gestion RBAC des rôles (ADMIN et USER) et sécurité des identités.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(255,45,117,0.3)] shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Créer un Utilisateur
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-xl bg-[#121217] border border-[#22222a] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, département..."
            className="w-full bg-[#181822] border border-[#282836] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#181822] border border-[#282836] rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#ff2d75]"
          >
            <option value="">Tous les rôles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-[#121217] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200">
          {error}
        </div>
      ) : (
        <div className="rounded-xl bg-[#121217] border border-[#22222a] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181820] border-b border-[#22222a] text-zinc-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Collaborateur</th>
                <th className="px-5 py-3.5">Département & Poste</th>
                <th className="px-5 py-3.5">Rôle (RBAC)</th>
                <th className="px-5 py-3.5">Créé le</th>
                <th className="px-5 py-3.5 text-right">Actions Administrateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e28]">
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className="hover:bg-[#16161e] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatarUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <span className="font-semibold text-white block">
                            {user.name} {isSelf && '(Vous)'}
                          </span>
                          <span className="text-zinc-400 text-[11px] font-mono">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-zinc-300">
                      <div>{user.jobTitle || 'Non renseigné'}</div>
                      <div className="text-[10px] text-zinc-500">
                        {user.department || 'Général'}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          user.role === 'ADMIN'
                            ? 'bg-[#ff2d75]/20 text-[#ff2d75] border border-[#ff2d75]/40'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono tabular-nums text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Switch button to test as this user */}
                        <button
                          onClick={() => quickSwitchUser(user.email)}
                          title="Se connecter sous ce profil pour tester l’API"
                          className="px-2.5 py-1 text-[11px] font-medium rounded bg-[#181822] border border-[#2a2a38] text-zinc-300 hover:text-white hover:border-[#ff2d75] transition-all"
                        >
                          Tester ce compte
                        </button>

                        {/* Toggle Role (ADMIN only) */}
                        {isAdmin && !isSelf && (
                          <button
                            onClick={() => handleToggleRole(user)}
                            title={`Changer en ${user.role === 'ADMIN' ? 'USER' : 'ADMIN'}`}
                            className="px-2.5 py-1 text-[11px] font-medium rounded bg-[#181822] border border-[#2a2a38] text-amber-400 hover:bg-amber-950/30 transition-all"
                          >
                            Passer {user.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                          </button>
                        )}

                        {/* Delete User (ADMIN only) */}
                        {isAdmin && !isSelf && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            title="Supprimer l'utilisateur"
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121218] border border-[#2a2a38] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20202c] pb-3">
              <h3 className="text-base font-bold text-white">Créer un Utilisateur</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ex: Julien Moreau"
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Adresse Email *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ex: julien.moreau@taskflow.dev"
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Mot de passe provisoire (min 6 car.) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Poste / Rôle métier
                  </label>
                  <input
                    type="text"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder="ex: QA Engineer"
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Département
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="ex: Qualité"
                    className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Rôle de sécurité (RBAC) *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2d75]"
                >
                  <option value="USER">USER (Collaborateur standard)</option>
                  <option value="ADMIN">ADMIN (Accès administrateur complet)</option>
                </select>
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
                  {formSubmitting ? 'Création...' : 'Créer l’utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
