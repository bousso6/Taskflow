import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import {
  DashboardStats,
  PaginationMeta,
  Project,
  ProjectMember,
  SafeUser,
  Task,
  TaskPriority,
  TaskStatus,
  User,
  UserRole,
} from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'taskflow-db.json');

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  tasks: Task[];
  version: number;
}

export function sanitizeUser(user: User): SafeUser {
  const { passwordHash: _pwd, ...safe } = user;
  return safe;
}

class DataStore {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private tasks: Map<string, Task> = new Map();
  private isLoaded = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isLoaded) return;
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data: DatabaseSchema = JSON.parse(raw);
        if (data.users && data.projects && data.tasks) {
          data.users.forEach((u) => this.users.set(u.id, u));
          data.projects.forEach((p) => this.projects.set(p.id, p));
          data.tasks.forEach((t) => this.tasks.set(t.id, t));
          this.isLoaded = true;
          return;
        }
      }
    } catch (err) {
      console.warn('Could not read existing data file, seeding defaults:', err);
    }

    this.seedDefaultData();
    this.persist();
    this.isLoaded = true;
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data: DatabaseSchema = {
        users: Array.from(this.users.values()),
        projects: Array.from(this.projects.values()),
        tasks: Array.from(this.tasks.values()),
        version: 1,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting data store:', err);
    }
  }

  public seedDefaultData() {
    this.users.clear();
    this.projects.clear();
    this.tasks.clear();

    const adminHash = bcrypt.hashSync('Admin123!', 10);
    const userHash = bcrypt.hashSync('User123!', 10);

    const now = new Date();
    const isoNow = now.toISOString();

    const adminUser: User = {
      id: 'usr-admin-01',
      name: 'Amadou Diallo',
      email: 'admin@taskflow.dev',
      passwordHash: adminHash,
      role: 'ADMIN',
      jobTitle: 'Directeur Technique (CTO)',
      department: 'Direction & Architecture',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: isoNow,
    };

    const user1: User = {
      id: 'usr-fatou-02',
      name: 'Fatou Bintou Sow',
      email: 'fatou.sow@taskflow.dev',
      passwordHash: userHash,
      role: 'USER',
      jobTitle: 'Lead Frontend Engineer',
      department: 'Ingénierie Web',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: isoNow,
    };

    const user2: User = {
      id: 'usr-cheikh-03',
      name: 'Cheikh Tidiane Ndiaye',
      email: 'cheikh.ndiaye@taskflow.dev',
      passwordHash: userHash,
      role: 'USER',
      jobTitle: 'Backend & Cloud DevOps Engineer',
      department: 'Infrastructure Cloud',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: isoNow,
    };

    const user3: User = {
      id: 'usr-aissatou-04',
      name: 'Aïssatou Diop',
      email: 'aissatou.diop@taskflow.dev',
      passwordHash: userHash,
      role: 'USER',
      jobTitle: 'Lead Product Designer UI/UX',
      department: 'Design & Ergonomie',
      avatarUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: isoNow,
    };

    const user4: User = {
      id: 'usr-moussa-05',
      name: 'Moussa Fall',
      email: 'moussa.fall@taskflow.dev',
      passwordHash: userHash,
      role: 'USER',
      jobTitle: 'Ingénieur QA & Sécurité',
      department: 'Qualité Logicielle',
      avatarUrl: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: isoNow,
    };

    [adminUser, user1, user2, user3, user4].forEach((u) => this.users.set(u.id, u));

    // Projects
    const project1: Project = {
      id: 'prj-fintech-dakar',
      name: 'Plateforme FinTech Teranga Pay',
      description: 'Développement de l’API de paiement instantané mobile money (Wave, Orange Money) et passerelle bancaire.',
      color: '#ff2d75',
      ownerId: adminUser.id,
      members: [
        { userId: adminUser.id, role: 'OWNER', joinedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
        { userId: user1.id, role: 'MEMBER', joinedAt: new Date(Date.now() - 18 * 86400000).toISOString() },
        { userId: user2.id, role: 'MEMBER', joinedAt: new Date(Date.now() - 18 * 86400000).toISOString() },
        { userId: user3.id, role: 'MEMBER', joinedAt: new Date(Date.now() - 15 * 86400000).toISOString() },
        { userId: user4.id, role: 'MEMBER', joinedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: isoNow,
    };

    const project2: Project = {
      id: 'prj-port-logistique',
      name: 'Portail Logistique Port de Dakar',
      description: 'Automatisation du suivi des conteneurs, dédouanement et interconnexion API des transporteurs.',
      color: '#ec4899',
      ownerId: user2.id,
      members: [
        { userId: user2.id, role: 'OWNER', joinedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
        { userId: adminUser.id, role: 'MEMBER', joinedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
        { userId: user1.id, role: 'MEMBER', joinedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: isoNow,
    };

    const project3: Project = {
      id: 'prj-senservices',
      name: 'Portail Numérique SenServices',
      description: 'Architecture des micro-services administratifs, authentification citoyenne et conformité d’accessibilité.',
      color: '#fb7185',
      ownerId: user3.id,
      members: [
        { userId: user3.id, role: 'OWNER', joinedAt: new Date(Date.now() - 8 * 86400000).toISOString() },
        { userId: user1.id, role: 'MEMBER', joinedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
        { userId: adminUser.id, role: 'MEMBER', joinedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: isoNow,
    };

    [project1, project2, project3].forEach((p) => this.projects.set(p.id, p));

    // Tasks (including overdue, done, in-progress, todo)
    const overdueDate = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
    const soonDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];

    const tasksSeed: Task[] = [
      {
        id: 'tsk-01',
        title: 'Mettre en place la documentation Swagger OpenAPI 3.0',
        description: 'Exposer la spécification OpenAPI à /api/openapi.json et monter l’interface Swagger UI sur /api-docs.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: overdueDate,
        assignedUserId: user2.id,
        projectId: project1.id,
        createdById: adminUser.id,
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'tsk-02',
        title: 'Hachage bcrypt et middleware d’authentification JWT',
        description: 'Sécuriser les mots de passe utilisateurs et implémenter la vérification de token Bearer avec expiration.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: overdueDate,
        assignedUserId: user2.id,
        projectId: project1.id,
        createdById: adminUser.id,
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'tsk-03',
        title: 'Composants du Backoffice Administrateur TaskFlow',
        description: 'Concevoir l’interface de supervision épurée avec KPIs, Kanban des tâches et gestion des autorisations.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: soonDate,
        assignedUserId: user1.id,
        projectId: project1.id,
        createdById: adminUser.id,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'tsk-04',
        title: 'Intégration passerelle Mobile Money (Wave & Orange Money)',
        description: 'Vérifier la signature des webhooks entrants et enregistrer les transactions idempotentes.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: soonDate,
        assignedUserId: user2.id,
        projectId: project1.id,
        createdById: adminUser.id,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'tsk-05',
        title: 'Audit de sécurité des rôles RBAC (ADMIN vs USER)',
        description: 'Vérifier que les routes d’administration et suppression globale ne sont accessibles qu’aux administrateurs.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: overdueDate, // Tâche en retard pour tester l'alerte
        assignedUserId: adminUser.id,
        projectId: project1.id,
        createdById: adminUser.id,
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'tsk-06',
        title: 'API de géolocalisation des convois portuaires',
        description: 'Calculer les temps d’attente aux postes de douane et notifier les transporteurs par SMS.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: futureDate,
        assignedUserId: user2.id,
        projectId: project2.id,
        createdById: user2.id,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'tsk-07',
        title: 'Tests unitaires du dédouanement automatisé',
        description: 'Vérifier la validation des manifestes maritimes et la génération des reçus certifiés.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: futureDate,
        assignedUserId: user1.id,
        projectId: project2.id,
        createdById: user2.id,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'tsk-08',
        title: 'Design System Rose, Noir et Blanc & Accessibilité',
        description: 'Application de la charte visuelle contrastée avec ombres portées élégantes et conformité WCAG AA.',
        status: 'DONE',
        priority: 'MEDIUM',
        dueDate: overdueDate,
        assignedUserId: user3.id,
        projectId: project3.id,
        createdById: user3.id,
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'tsk-09',
        title: 'Optimisation de la vitesse de chargement sur réseau 4G',
        description: 'Compresser les payloads JSON, activer la mise en cache et auditer le bundle JavaScript.',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        dueDate: futureDate,
        assignedUserId: user4.id,
        projectId: project3.id,
        createdById: user3.id,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'tsk-10',
        title: 'Guide de déploiement Render et Vercel',
        description: 'Documenter les variables d’environnement, scripts de build et fichiers de configuration de production.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: futureDate,
        assignedUserId: null,
        projectId: project1.id,
        createdById: adminUser.id,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
    ];

    tasksSeed.forEach((t) => this.tasks.set(t.id, t));
  }

  // --- Users ---
  public getUsers(): SafeUser[] {
    return Array.from(this.users.values()).map(sanitizeUser);
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getSafeUserById(id: string): SafeUser | undefined {
    const user = this.users.get(id);
    return user ? sanitizeUser(user) : undefined;
  }

  public getUserByEmail(email: string): User | undefined {
    const cleanEmail = email.trim().toLowerCase();
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
  }

  public createUser(userData: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
    jobTitle?: string;
    department?: string;
    avatarUrl?: string;
  }): SafeUser {
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newUser: User = {
      id,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'USER',
      jobTitle: userData.jobTitle?.trim(),
      department: userData.department?.trim(),
      avatarUrl: userData.avatarUrl,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, newUser);
    this.persist();
    return sanitizeUser(newUser);
  }

  public updateUser(
    id: string,
    updates: Partial<{
      name: string;
      email: string;
      jobTitle: string;
      department: string;
      avatarUrl: string;
      role: UserRole;
      passwordHash: string;
    }>
  ): SafeUser | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.email !== undefined) user.email = updates.email.trim().toLowerCase();
    if (updates.jobTitle !== undefined) user.jobTitle = updates.jobTitle.trim();
    if (updates.department !== undefined) user.department = updates.department.trim();
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.passwordHash !== undefined) user.passwordHash = updates.passwordHash;
    user.updatedAt = new Date().toISOString();

    this.users.set(id, user);
    this.persist();
    return sanitizeUser(user);
  }

  public deleteUser(id: string): boolean {
    if (!this.users.has(id)) return false;
    this.users.delete(id);

    // Remove user from project members
    for (const project of this.projects.values()) {
      project.members = project.members.filter((m) => m.userId !== id);
    }
    // Unassign user from tasks
    for (const task of this.tasks.values()) {
      if (task.assignedUserId === id) {
        task.assignedUserId = null;
        task.updatedAt = new Date().toISOString();
      }
    }

    this.persist();
    return true;
  }

  // --- Projects ---
  public getProjects(userId?: string, userRole?: UserRole): Project[] {
    const all = Array.from(this.projects.values());
    const enriched = all.map((p) => this.enrichProject(p));

    if (!userId || userRole === 'ADMIN') {
      return enriched;
    }

    return enriched.filter((p) =>
      p.ownerId === userId || p.members.some((m) => m.userId === userId)
    );
  }

  public getProjectById(id: string): Project | undefined {
    const project = this.projects.get(id);
    if (!project) return undefined;
    return this.enrichProject(project);
  }

  private enrichProject(project: Project): Project {
    const owner = this.getSafeUserById(project.ownerId);
    const enrichedMembers: ProjectMember[] = project.members.map((m) => ({
      ...m,
      user: this.getSafeUserById(m.userId),
    }));
    return {
      ...project,
      owner,
      members: enrichedMembers,
    };
  }

  public createProject(data: {
    name: string;
    description: string;
    color?: string;
    ownerId: string;
    memberIds?: string[];
  }): Project {
    const id = `prj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const members: ProjectMember[] = [
      { userId: data.ownerId, role: 'OWNER', joinedAt: now },
    ];

    if (data.memberIds) {
      for (const mId of data.memberIds) {
        if (mId !== data.ownerId && this.users.has(mId)) {
          members.push({ userId: mId, role: 'MEMBER', joinedAt: now });
        }
      }
    }

    const newProject: Project = {
      id,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      color: data.color || '#ff2d75',
      ownerId: data.ownerId,
      members,
      createdAt: now,
      updatedAt: now,
    };

    this.projects.set(id, newProject);
    this.persist();
    return this.enrichProject(newProject);
  }

  public updateProject(
    id: string,
    updates: Partial<{
      name: string;
      description: string;
      color: string;
      ownerId: string;
    }>
  ): Project | undefined {
    const project = this.projects.get(id);
    if (!project) return undefined;

    if (updates.name !== undefined) project.name = updates.name.trim();
    if (updates.description !== undefined) project.description = updates.description.trim();
    if (updates.color !== undefined) project.color = updates.color;
    if (updates.ownerId !== undefined && this.users.has(updates.ownerId)) {
      project.ownerId = updates.ownerId;
      // ensure owner is in members
      if (!project.members.some((m) => m.userId === updates.ownerId)) {
        project.members.push({
          userId: updates.ownerId,
          role: 'OWNER',
          joinedAt: new Date().toISOString(),
        });
      }
    }
    project.updatedAt = new Date().toISOString();

    this.projects.set(id, project);
    this.persist();
    return this.enrichProject(project);
  }

  public deleteProject(id: string): boolean {
    if (!this.projects.has(id)) return false;
    this.projects.delete(id);

    // Delete associated tasks
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.projectId === id) {
        this.tasks.delete(taskId);
      }
    }

    this.persist();
    return true;
  }

  public addMemberToProject(projectId: string, userId: string, role: 'OWNER' | 'MEMBER' = 'MEMBER'): Project | undefined {
    const project = this.projects.get(projectId);
    if (!project) return undefined;
    if (!this.users.has(userId)) return undefined;

    const existingIndex = project.members.findIndex((m) => m.userId === userId);
    if (existingIndex >= 0) {
      project.members[existingIndex].role = role;
    } else {
      project.members.push({
        userId,
        role,
        joinedAt: new Date().toISOString(),
      });
    }

    project.updatedAt = new Date().toISOString();
    this.projects.set(projectId, project);
    this.persist();
    return this.enrichProject(project);
  }

  public removeMemberFromProject(projectId: string, userId: string): Project | undefined {
    const project = this.projects.get(projectId);
    if (!project) return undefined;

    // Do not remove the owner
    if (project.ownerId === userId) return undefined;

    project.members = project.members.filter((m) => m.userId !== userId);
    project.updatedAt = new Date().toISOString();

    // Unassign tasks in this project assigned to removed member
    for (const task of this.tasks.values()) {
      if (task.projectId === projectId && task.assignedUserId === userId) {
        task.assignedUserId = null;
        task.updatedAt = new Date().toISOString();
      }
    }

    this.projects.set(projectId, project);
    this.persist();
    return this.enrichProject(project);
  }

  // --- Tasks ---
  public getTasks(params: {
    projectId?: string;
    userId?: string;
    userRole?: UserRole;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedUserId?: string;
    search?: string;
    sortBy?: 'createdAt' | 'dueDate';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): { tasks: Task[]; pagination: PaginationMeta } {
    let list = Array.from(this.tasks.values());

    // Filter accessible projects if not ADMIN
    if (params.userRole !== 'ADMIN' && params.userId) {
      const accessibleProjects = this.getProjects(params.userId, params.userRole);
      const accessibleProjectIds = new Set(accessibleProjects.map((p) => p.id));
      list = list.filter((t) => accessibleProjectIds.has(t.projectId));
    }

    // Filter by specific project
    if (params.projectId) {
      list = list.filter((t) => t.projectId === params.projectId);
    }

    // Filter by status
    if (params.status) {
      list = list.filter((t) => t.status === params.status);
    }

    // Filter by priority
    if (params.priority) {
      list = list.filter((t) => t.priority === params.priority);
    }

    // Filter by assigned user
    if (params.assignedUserId) {
      list = list.filter((t) => t.assignedUserId === params.assignedUserId);
    }

    // Search by title or description
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sortBy = params.sortBy || 'createdAt';
    const order = params.order || 'desc';
    list.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (order === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    const enriched = paginated.map((t) => this.enrichTask(t));

    return {
      tasks: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  public getTaskById(id: string): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    return this.enrichTask(task);
  }

  private enrichTask(task: Task): Task {
    const assignedUser = task.assignedUserId
      ? this.getSafeUserById(task.assignedUserId)
      : null;
    const createdBy = this.getSafeUserById(task.createdById);
    const rawProject = this.projects.get(task.projectId);
    const project = rawProject
      ? { id: rawProject.id, name: rawProject.name }
      : undefined;

    return {
      ...task,
      assignedUser,
      createdBy,
      project,
    };
  }

  public createTask(data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    assignedUserId?: string | null;
    projectId: string;
    createdById: string;
  }): Task {
    const id = `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newTask: Task = {
      id,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate || null,
      assignedUserId: data.assignedUserId || null,
      projectId: data.projectId,
      createdById: data.createdById,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(id, newTask);
    this.persist();
    return this.enrichTask(newTask);
  }

  public updateTask(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate: string | null;
      assignedUserId: string | null;
      projectId: string;
    }>
  ): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    if (updates.title !== undefined) task.title = updates.title.trim();
    if (updates.description !== undefined) task.description = updates.description.trim();
    if (updates.status !== undefined) task.status = updates.status;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
    if (updates.assignedUserId !== undefined) task.assignedUserId = updates.assignedUserId;
    if (updates.projectId !== undefined && this.projects.has(updates.projectId)) {
      task.projectId = updates.projectId;
    }
    task.updatedAt = new Date().toISOString();

    this.tasks.set(id, task);
    this.persist();
    return this.enrichTask(task);
  }

  public deleteTask(id: string): boolean {
    if (!this.tasks.has(id)) return false;
    this.tasks.delete(id);
    this.persist();
    return true;
  }

  // --- Dashboard & Stats ---
  public getDashboardStats(userId?: string, userRole?: UserRole): DashboardStats {
    const projects = this.getProjects(userId, userRole);
    const projectIds = new Set(projects.map((p) => p.id));

    let allTasks = Array.from(this.tasks.values());
    if (userRole !== 'ADMIN' && userId) {
      allTasks = allTasks.filter((t) => projectIds.has(t.projectId));
    }

    const totalProjects = projects.length;
    const totalTasks = allTasks.length;

    let completedTasks = 0;
    let inProgressTasks = 0;
    let todoTasks = 0;
    let overdueTasks = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    allTasks.forEach((t) => {
      if (t.status === 'DONE') {
        completedTasks++;
      } else if (t.status === 'IN_PROGRESS') {
        inProgressTasks++;
      } else {
        todoTasks++;
      }

      if (t.dueDate && t.dueDate < todayStr && t.status !== 'DONE') {
        overdueTasks++;
      }
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tasksByPriority = {
      LOW: allTasks.filter((t) => t.priority === 'LOW').length,
      MEDIUM: allTasks.filter((t) => t.priority === 'MEDIUM').length,
      HIGH: allTasks.filter((t) => t.priority === 'HIGH').length,
    };

    const recentTasks = allTasks
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 5)
      .map((t) => this.enrichTask(t));

    const recentProjects = projects
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 4);

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      completionRate,
      tasksByStatus: {
        TODO: todoTasks,
        IN_PROGRESS: inProgressTasks,
        DONE: completedTasks,
      },
      tasksByPriority,
      recentTasks,
      recentProjects,
    };
  }
}

export const db = new DataStore();
