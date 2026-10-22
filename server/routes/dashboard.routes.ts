import { Request, Response, Router } from 'express';
import { db } from '../db/data-store';
import { authenticateJWT } from '../middleware/auth';

export const dashboardRouter = Router();

/**
 * GET /api/dashboard/stats
 * Consulter les statistiques et métriques globales du tableau de bord
 */
dashboardRouter.get('/stats', authenticateJWT, (req: Request, res: Response): void => {
  const stats = db.getDashboardStats(req.user!.id, req.user!.role);

  res.status(200).json({
    timestamp: new Date().toISOString(),
    user: {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role,
    },
    stats,
  });
});
