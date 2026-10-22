import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/data-store';
import { SafeUser, UserRole } from '../db/types';

export const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-super-secret-jwt-key-2026-secure-production';

export interface AuthJwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export function generateToken(user: SafeUser): string {
  const payload: AuthJwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token d’authentification manquant dans l’en-tête Authorization (Bearer token).',
      statusCode: 401,
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Format de token invalide. Utilisez: Authorization: Bearer <token>',
      statusCode: 401,
    });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
    const user = db.getSafeUserById(decoded.id);

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Utilisateur associé au jeton introuvable ou supprimé.',
        statusCode: 401,
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    const isExpired = err?.name === 'TokenExpiredError';
    res.status(401).json({
      error: 'Unauthorized',
      message: isExpired
        ? 'Le jeton d’authentification a expiré. Veuillez vous reconnecter.'
        : 'Jeton d’authentification invalide.',
      statusCode: 401,
    });
  }
}

export function requireRole(allowedRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentification requise.',
        statusCode: 401,
      });
      return;
    }

    if (req.user.role !== allowedRole) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Accès refusé. Privilèges ${allowedRole} requis pour effectuer cette action.`,
        statusCode: 403,
      });
      return;
    }

    next();
  };
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      const decoded = jwt.verify(parts[1], JWT_SECRET) as AuthJwtPayload;
      const user = db.getSafeUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch {
      // ignore token verification failure in optional auth
    }
  }
  next();
}
