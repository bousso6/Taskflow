export type UserRole = 'ADMIN' | 'USER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jobTitle?: string;
  department?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  user?: SafeUser;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color?: string;
  ownerId: string;
  owner?: SafeUser;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignedUserId: string | null;
  assignedUser?: SafeUser | null;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
  createdById: string;
  createdBy?: SafeUser;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
  tasksByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  recentTasks: Task[];
  recentProjects: Project[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
