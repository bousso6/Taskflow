import { Request, Response, Router } from 'express';
import { db } from '../db/data-store';
import { TaskPriority, TaskStatus } from '../db/types';
import { authenticateJWT } from '../middleware/auth';
import { validateProject, validateTask } from '../middleware/validation';

export const projectRouter = Router();

// Middleware helper pour vérifier l'accès à un projet
function checkProjectAccess(req: Request, res: Response, projectId: string): boolean {
  const project = db.getProjectById(projectId);
  if (!project) {
    res.status(404).json({
      error: 'Not Found',
      message: `Projet avec l’ID ${projectId} introuvable.`,
      statusCode: 404,
    });
    return false;
  }

  const currentUser = req.user!;
  if (currentUser.role === 'ADMIN') {
    return true;
  }

  const isMember =
    project.ownerId === currentUser.id ||
    project.members.some((m) => m.userId === currentUser.id);

  if (!isMember) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Accès non autorisé : vous ne faites pas partie de l’équipe de ce projet.',
      statusCode: 403,
    });
    return false;
  }

  return true;
}

// Middleware helper pour vérifier le droit de modification/gestion (Owner ou ADMIN)
function checkProjectManageRights(req: Request, res: Response, projectId: string): boolean {
  const project = db.getProjectById(projectId);
  if (!project) {
    res.status(404).json({
      error: 'Not Found',
      message: `Projet avec l’ID ${projectId} introuvable.`,
      statusCode: 404,
    });
    return false;
  }

  const currentUser = req.user!;
  if (currentUser.role === 'ADMIN') {
    return true;
  }

  if (project.ownerId !== currentUser.id) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Seul le responsable du projet ou un administrateur peut modifier ou supprimer ce projet.',
      statusCode: 403,
    });
    return false;
  }

  return true;
}

/**
 * POST /api/projects
 * Créer un nouveau projet
 */
projectRouter.post('/', authenticateJWT, (req: Request, res: Response): void => {
  const validation = validateProject(req.body);
  if (!validation.valid) {
    res.status(400).json({
      error: 'Bad Request',
      message: validation.message,
      statusCode: 400,
    });
    return;
  }

  const { name, description, color, memberIds } = req.body;
  const project = db.createProject({
    name,
    description,
    color,
    ownerId: req.user!.id,
    memberIds,
  });

  res.status(201).json({
    message: 'Projet créé avec succès.',
    project,
  });
});

/**
 * GET /api/projects
 * Lister les projets accessibles à l'utilisateur connecté
 */
projectRouter.get('/', authenticateJWT, (req: Request, res: Response): void => {
  const projects = db.getProjects(req.user!.id, req.user!.role);
  res.status(200).json({
    total: projects.length,
    projects,
  });
});

/**
 * GET /api/projects/:id
 * Consulter un projet en détail
 */
projectRouter.get('/:id', authenticateJWT, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (!checkProjectAccess(req, res, id)) return;

  const project = db.getProjectById(id);
  res.status(200).json({ project });
});

/**
 * PATCH /api/projects/:id
 * Modifier un projet (responsable ou admin)
 */
projectRouter.patch('/:id', authenticateJWT, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (!checkProjectManageRights(req, res, id)) return;

  const { name, description, color, ownerId } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Le nom du projet doit comporter au moins 2 caractères.',
      statusCode: 400,
    });
    return;
  }

  const updated = db.updateProject(id, { name, description, color, ownerId });
  res.status(200).json({
    message: 'Projet mis à jour avec succès.',
    project: updated,
  });
});

/**
 * DELETE /api/projects/:id
 * Supprimer un projet (responsable ou admin)
 */
projectRouter.delete('/:id', authenticateJWT, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (!checkProjectManageRights(req, res, id)) return;

  db.deleteProject(id);
  res.status(200).json({
    message: 'Projet et tâches associées supprimés avec succès.',
    deletedProjectId: id,
  });
});

/**
 * GET /api/projects/:id/members
 * Lister les membres d'un projet
 */
projectRouter.get('/:id/members', authenticateJWT, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (!checkProjectAccess(req, res, id)) return;

  const project = db.getProjectById(id);
  res.status(200).json({
    projectId: id,
    total: project!.members.length,
    members: project!.members,
  });
});

/**
 * POST /api/projects/:id/members
 * Ajouter un membre au projet
 */
projectRouter.post('/:id/members', authenticateJWT, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (!checkProjectManageRights(req, res, id)) return;

  const { userId, role } = req.body;
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Le paramètre userId est obligatoire.',
      statusCode: 400,
    });
    return;
  }

  const userExists = db.getSafeUserById(userId);
  if (!userExists) {
    res.status(404).json({
      error: 'Not Found',
      message: `Utilisateur avec l’ID ${userId} introuvable.`,
      statusCode: 404,
    });
    return;
  }

  const updated = db.addMemberToProject(id, userId, role === 'OWNER' ? 'OWNER' : 'MEMBER');
  res.status(201).json({
    message: 'Membre ajouté au projet avec succès.',
    project: updated,
  });
});

/**
 * DELETE /api/projects/:id/members/:userId
 * Retirer un membre du projet
 */
projectRouter.delete('/:id/members/:userId', authenticateJWT, (req: Request, res: Response): void => {
  const { id, userId } = req.params;
  if (!checkProjectManageRights(req, res, id)) return;

  const project = db.getProjectById(id);
  if (project?.ownerId === userId) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Impossible de retirer le propriétaire principal du projet.',
      statusCode: 400,
    });
    return;
  }

  const updated = db.removeMemberFromProject(id, userId);
  res.status(200).json({
    message: 'Membre retiré du projet avec succès.',
    project: updated,
  });
});

/**
 * POST /api/projects/:id/tasks
 * Créer une tâche dans le projet
 */
projectRouter.post('/:id/tasks', authenticateJWT, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (!checkProjectAccess(req, res, id)) return;

  const validation = validateTask(req.body);
  if (!validation.valid) {
    res.status(400).json({
      error: 'Bad Request',
      message: validation.message,
      statusCode: 400,
    });
    return;
  }

  const { title, description, status, priority, dueDate, assignedUserId } = req.body;

  // Si un utilisateur est assigné, vérifier qu'il est membre du projet ou admin
  if (assignedUserId) {
    const project = db.getProjectById(id);
    const isMember =
      project?.ownerId === assignedUserId ||
      project?.members.some((m) => m.userId === assignedUserId);

    if (!isMember) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'L’utilisateur assigné doit être un membre validé du projet.',
        statusCode: 400,
      });
      return;
    }
  }

  const task = db.createTask({
    title,
    description,
    status,
    priority,
    dueDate,
    assignedUserId,
    projectId: id,
    createdById: req.user!.id,
  });

  res.status(201).json({
    message: 'Tâche créée avec succès dans le projet.',
    task,
  });
});

/**
 * GET /api/projects/:id/tasks
 * Lister les tâches du projet avec filtres, tri, recherche et pagination
 */
projectRouter.get('/:id/tasks', authenticateJWT, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (!checkProjectAccess(req, res, id)) return;

  const {
    status,
    priority,
    assignedUserId,
    search,
    sortBy,
    order,
    page,
    limit,
  } = req.query;

  const result = db.getTasks({
    projectId: id,
    userId: req.user!.id,
    userRole: req.user!.role,
    status: status as TaskStatus,
    priority: priority as TaskPriority,
    assignedUserId: assignedUserId as string,
    search: search as string,
    sortBy: (sortBy as 'createdAt' | 'dueDate') || 'createdAt',
    order: (order as 'asc' | 'desc') || 'desc',
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });

  res.status(200).json(result);
});
