import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { db, sanitizeUser } from '../db/data-store';
import { generateToken } from '../middleware/auth';
import { validateLogin, validateRegister } from '../middleware/validation';

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
authRouter.post('/register', (req: Request, res: Response): void => {
  const validation = validateRegister(req.body);
  if (!validation.valid) {
    res.status(400).json({
      error: 'Bad Request',
      message: validation.message,
      statusCode: 400,
    });
    return;
  }

  const { name, email, password, role, jobTitle, department, avatarUrl } = req.body;

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(409).json({
      error: 'Conflict',
      message: `Un compte avec l’adresse email "${email}" existe déjà.`,
      statusCode: 409,
    });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = db.createUser({
    name,
    email,
    passwordHash,
    role: role || 'USER',
    jobTitle,
    department,
    avatarUrl,
  });

  const token = generateToken(user);

  res.status(201).json({
    message: 'Compte utilisateur créé avec succès.',
    token,
    user,
  });
});

/**
 * POST /api/auth/login
 * Connexion avec email et mot de passe
 */
authRouter.post('/login', (req: Request, res: Response): void => {
  const validation = validateLogin(req.body);
  if (!validation.valid) {
    res.status(400).json({
      error: 'Bad Request',
      message: validation.message,
      statusCode: 400,
    });
    return;
  }

  const { email, password } = req.body;
  const user = db.getUserByEmail(email);

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Identifiants invalides (email ou mot de passe incorrect).',
      statusCode: 401,
    });
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Identifiants invalides (email ou mot de passe incorrect).',
      statusCode: 401,
    });
    return;
  }

  const safeUser = sanitizeUser(user);
  const token = generateToken(safeUser);

  res.status(200).json({
    message: 'Authentification réussie.',
    token,
    user: safeUser,
  });
});
