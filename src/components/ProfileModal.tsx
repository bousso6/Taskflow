import { Key, Lock, Mail, Shield, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, refreshProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    const payload: any = {
      name,
      email,
      jobTitle,
      department,
      avatarUrl,
    };

    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const res = await apiClient.patch('/users/me', payload);
    setSubmitting(false);

    if (res.status === 200) {
      setStatusMsg({ type: 'success', text: 'Profil mis à jour avec succès.' });
      setCurrentPassword('');
      setNewPassword('');
      await refreshProfile();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'Erreur lors de la mise à jour du profil.',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#121218] border border-[#2a2a38] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#20202c] pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#ff2d75]" />
            <h3 className="text-base font-bold text-white">Mon Profil Utilisateur</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-lg text-xs font-medium border ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Nom complet</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#ff2d75]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#ff2d75]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Poste</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#ff2d75]"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Département</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#ff2d75]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#20202c]">
            <span className="font-semibold text-zinc-400 block mb-2">
              Modifier le mot de passe (optionnel)
            </span>
            <div className="space-y-2">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Mot de passe actuel"
                className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe (min 6 car.)"
                className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff2d75]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#20202c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-zinc-300 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 font-semibold rounded-lg bg-[#ff2d75] text-white hover:bg-[#e02666] disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
