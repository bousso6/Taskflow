export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRegister(body: any): { valid: boolean; message?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Le corps de la requête doit être un objet JSON.' };
  }
  const { name, email, password, role } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valid: false, message: 'Le nom est obligatoire et doit comporter au moins 2 caractères.' };
  }
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return { valid: false, message: 'Une adresse email valide est obligatoire.' };
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return { valid: false, message: 'Le mot de passe doit comporter au moins 6 caractères.' };
  }
  if (role && role !== 'ADMIN' && role !== 'USER') {
    return { valid: false, message: 'Le rôle doit être soit ADMIN, soit USER.' };
  }
  return { valid: true };
}

export function validateLogin(body: any): { valid: boolean; message?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Le corps de la requête doit être un objet JSON.' };
  }
  const { email, password } = body;
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return { valid: false, message: 'Une adresse email valide est obligatoire.' };
  }
  if (!password || typeof password !== 'string' || !password) {
    return { valid: false, message: 'Le mot de passe est obligatoire.' };
  }
  return { valid: true };
}

export function validateProject(body: any): { valid: boolean; message?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Le corps de la requête doit être un objet JSON.' };
  }
  const { name } = body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valid: false, message: 'Le nom du projet est obligatoire (au moins 2 caractères).' };
  }
  return { valid: true };
}

export function validateTask(body: any): { valid: boolean; message?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Le corps de la requête doit être un objet JSON.' };
  }
  const { title, status, priority, dueDate } = body;
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return { valid: false, message: 'Le titre de la tâche est obligatoire (au moins 2 caractères).' };
  }
  if (status && !['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
    return { valid: false, message: 'Le statut doit être TODO, IN_PROGRESS ou DONE.' };
  }
  if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
    return { valid: false, message: 'La priorité doit être LOW, MEDIUM ou HIGH.' };
  }
  if (dueDate && isNaN(Date.parse(dueDate))) {
    return { valid: false, message: 'La date limite doit être une date valide au format ISO ou YYYY-MM-DD.' };
  }
  return { valid: true };
}
