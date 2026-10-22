import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { db } from '../db/data-store';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { isValidEmail } from '../middleware/validation';

export const userRouter = Router();

/**
 * GET /api/users/me
 * Consulter son propre profil
 */
userRouter.get('/me', authenticateJWT, (req: Request, res: Response): void => {
  res.status(200).json({
    user: req.user,
  });
});

/**
 * PATCH /api/users/me
 * Modifier son propre profil
 */
userRouter.patch('/me', authenticateJWT, (req: Request, res: Response): void => {
  const currentUserId = req.user!.id;
  const { name, email, jobTitle, department, avatarUrl, currentPassword, newPassword } = req.body;

  const updates: any = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Le nom doit comporter au moins 2 caractères.',
        statusCode: 400,
      });
      return;
    }
    updates.name = name;
  }

  if (email !== undefined) {
    if (!isValidEmail(email)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Une adresse email valide est requise.',
        statusCode: 400,
      });
      return;
    }
    const existing = db.getUserByEmail(email);
    if (existing && existing.id !== currentUserId) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Cette adresse email est déjà utilisée par un autre compte.',
        statusCode: 409,
      });
      return;
    }
    updates.email = email;
  }

  if (jobTitle !== undefined) updates.jobTitle = jobTitle;
  if (department !== undefined) updates.department = department;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

  // Mot de passe
  if (newPassword) {
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Le nouveau mot de passe doit comporter au moins 6 caractères.',
        statusCode: 400,
      });
      return;
    }
    const fullUser = db.getUserById(currentUserId);
    if (!fullUser || !currentPassword || !bcrypt.compareSync(currentPassword, fullUser.passwordHash)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Le mot de passe actuel est incorrect.',
        statusCode: 401,
      });
      return;
    }
    updates.passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  const updatedUser = db.updateUser(currentUserId, updates);

  res.status(200).json({
    message: 'Profil mis à jour avec succès.',
    user: updatedUser,
  });
});

/**
 * GET /api/users
 * Lister les utilisateurs (authentification requise)
 * Accessible aux membres pour assigner des tâches / membres, avec filtre recherche
 */
userRouter.get('/', authenticateJWT, (req: Request, res: Response): void => {
  let users = db.getUsers();

  const { search, role } = req.query;

  if (role && typeof role === 'string') {
    users = users.filter((u) => u.role === role);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.jobTitle && u.jobTitle.toLowerCase().includes(q))
    );
  }

  res.status(200).json({
    total: users.length,
    users,
  });
});

/**
 * GET /api/users/:id
 * Consulter un utilisateur spécifique
 */
userRouter.get('/:id', authenticateJWT, (req: Request, res: Response): void => {
  const user = db.getSafeUserById(req.params.id);
  if (!user) {
    res.status(404).json({
      error: 'Not Found',
      message: `Utilisateur avec l’ID ${req.params.id} introuvable.`,
      statusCode: 404,
    });
    return;
  }

  res.status(200).json({ user });
});

/**
 * PATCH /api/users/:id/role
 * Modifier le rôle d'un utilisateur (ADMIN only)
 */
userRouter.patch(
  '/:id/role',
  authenticateJWT,
  requireRole('ADMIN'),
  (req: Request, res: Response): void => {
    const targetId = req.params.id;
    const { role } = req.body;

    if (!role || (role !== 'ADMIN' && role !== 'USER')) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Le rôle doit être obligatoirement "ADMIN" ou "USER".',
        statusCode: 400,
      });
      return;
    }

    const targetUser = db.getUserById(targetId);
    if (!targetUser) {
      res.status(404).json({
        error: 'Not Found',
        message: `Utilisateur avec l’ID ${targetId} introuvable.`,
        statusCode: 404,
      });
      return;
    }

    // Protection : un admin ne peut pas se rétrograder lui-même s'il est le seul admin
    if (targetId === req.user!.id && role === 'USER') {
      const allAdmins = db.getUsers().filter((u) => u.role === 'ADMIN');
      if (allAdmins.length <= 1) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Impossible de rétrograder le dernier administrateur du système.',
          statusCode: 400,
        });
        return;
      }
    }

    const updated = db.updateUser(targetId, { role });
    res.status(200).json({
      message: `Rôle de l’utilisateur mis à jour vers ${role}.`,
      user: updated,
    });
  }
);

/**
 * DELETE /api/users/:id
 * Supprimer un utilisateur (ADMIN only)
 */
userRouter.delete(
  '/:id',
  authenticateJWT,
  requireRole('ADMIN'),
  (req: Request, res: Response): void => {
    const targetId = req.params.id;

    if (targetId === req.user!.id) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Vous ne pouvez pas supprimer votre propre compte administrateur connecté.',
        statusCode: 400,
      });
      return;
    }

    const success = db.deleteUser(targetId);
    if (!success) {
      res.status(404).json({
        error: 'Not Found',
        message: `Utilisateur avec l’ID ${targetId} introuvable.`,
        statusCode: 404,
      });
      return;
    }

    res.status(200).json({
      message: 'Utilisateur supprimé avec succès.',
      deletedUserId: targetId,
    });
  }
);
