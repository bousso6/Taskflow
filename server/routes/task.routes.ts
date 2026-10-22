import { Request, Response, Router } from 'express';
import { db } from '../db/data-store';
import { TaskPriority, TaskStatus } from '../db/types';
import { authenticateJWT } from '../middleware/auth';
import { validateTask } from '../middleware/validation';

export const taskRouter = Router();

// Helper vérification d'accès à la tâche
function checkTaskAccess(req: Request, res: Response, taskId: string) {
  const task = db.getTaskById(taskId);
  if (!task) {
    res.status(404).json({
      error: 'Not Found',
      message: `Tâche avec l’ID ${taskId} introuvable.`,
      statusCode: 404,
    });
    return null;
  }

  const currentUser = req.user!;
  if (currentUser.role === 'ADMIN') return task;

  const project = db.getProjectById(task.projectId);
  if (!project) {
    res.status(404).json({
      error: 'Not Found',
      message: 'Projet associé introuvable.',
      statusCode: 404,
    });
    return null;
  }

  const isMember =
    project.ownerId === currentUser.id ||
    project.members.some((m) => m.userId === currentUser.id);

  if (!isMember) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Accès interdit : vous ne faites pas partie de l’équipe de ce projet.',
      statusCode: 403,
    });
    return null;
  }

  return task;
}

/**
 * GET /api/tasks
 * Lister toutes les tâches accessibles avec filtres, recherche, pagination et tri
 */
taskRouter.get('/', authenticateJWT, (req: Request, res: Response): void => {
  const {
    projectId,
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
    projectId: projectId as string,
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

/**
 * GET /api/tasks/:id
 * Consulter une tâche
 */
taskRouter.get('/:id', authenticateJWT, (req: Request, res: Response): void => {
  const task = checkTaskAccess(req, res, req.params.id);
  if (!task) return;

  res.status(200).json({ task });
});

/**
 * PATCH /api/tasks/:id
 * Modifier une tâche
 */
taskRouter.patch('/:id', authenticateJWT, (req: Request, res: Response): void => {
  const task = checkTaskAccess(req, res, req.params.id);
  if (!task) return;

  const { title, description, status, priority, dueDate, assignedUserId, projectId } = req.body;

  // Validation partielle
  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 2)) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Le titre de la tâche doit comporter au moins 2 caractères.',
      statusCode: 400,
    });
    return;
  }

  if (status !== undefined && !['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Le statut doit être TODO, IN_PROGRESS ou DONE.',
      statusCode: 400,
    });
    return;
  }

  if (priority !== undefined && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'La priorité doit être LOW, MEDIUM ou HIGH.',
      statusCode: 400,
    });
    return;
  }

  if (dueDate !== undefined && dueDate !== null && isNaN(Date.parse(dueDate))) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'La date limite doit être valide au format ISO ou YYYY-MM-DD.',
      statusCode: 400,
    });
    return;
  }

  // Vérifier la légitimité du membre assigné
  const targetProjectId = projectId || task.projectId;
  if (assignedUserId !== undefined && assignedUserId !== null) {
    const project = db.getProjectById(targetProjectId);
    const isMember =
      project?.ownerId === assignedUserId ||
      project?.members.some((m) => m.userId === assignedUserId);

    if (!isMember) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'L’utilisateur assigné doit être un membre validé de l’équipe du projet.',
        statusCode: 400,
      });
      return;
    }
  }

  const updated = db.updateTask(task.id, {
    title,
    description,
    status,
    priority,
    dueDate,
    assignedUserId,
    projectId,
  });

  res.status(200).json({
    message: 'Tâche mise à jour avec succès.',
    task: updated,
  });
});

/**
 * DELETE /api/tasks/:id
 * Supprimer une tâche
 */
taskRouter.delete('/:id', authenticateJWT, (req: Request, res: Response): void => {
  const task = checkTaskAccess(req, res, req.params.id);
  if (!task) return;

  const currentUser = req.user!;
  const project = db.getProjectById(task.projectId);

  const canDelete =
    currentUser.role === 'ADMIN' ||
    task.createdById === currentUser.id ||
    project?.ownerId === currentUser.id;

  if (!canDelete) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Seul le créateur de la tâche, le responsable du projet ou un administrateur peut supprimer cette tâche.',
      statusCode: 403,
    });
    return;
  }

  db.deleteTask(task.id);
  res.status(200).json({
    message: 'Tâche supprimée avec succès.',
    deletedTaskId: task.id,
  });
});
