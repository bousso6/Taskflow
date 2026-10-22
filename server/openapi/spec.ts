export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'TaskFlow REST API',
    version: '1.0.0',
    description: `### API REST professionnelle de gestion de projets, d'équipes et de tâches

**TaskFlow** permet aux entreprises de collaborer efficacement :
- **Module A** : Authentification JWT, hachage bcrypt, gestion des utilisateurs et rôles (\`ADMIN\` et \`USER\`).
- **Module B** : Gestion des projets, affectation des membres et contrôle des autorisations d'équipe.
- **Module C** : Gestion complète des tâches (statuts \`TODO\`, \`IN_PROGRESS\`, \`DONE\`, priorités \`LOW\`, \`MEDIUM\`, \`HIGH\`), filtres, recherche par titre, tri et pagination.
- **Module D** : Tableau de bord décisionnel et métriques d'avancement en temps réel.

---
### Authentification
Toutes les routes protégées requièrent un jeton **Bearer JWT** valide.
1. Authentifiez-vous via \`POST /api/auth/login\` ou inscrivez-vous via \`POST /api/auth/register\`.
2. Cliquez sur le bouton vert **Authorize** en haut à droite.
3. Saisissez votre jeton dans le champ (ex: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\`).
4. Testez directement les endpoints !

**Comptes de test pré-configurés :**
- Administrateur : \`admin@taskflow.dev\` / \`Admin123!\` (Amadou Diallo, Rôle: \`ADMIN\`)
- Collaboratrice : \`fatou.sow@taskflow.dev\` / \`User123!\` (Fatou Bintou Sow, Rôle: \`USER\`)
- Collaborateur : \`cheikh.ndiaye@taskflow.dev\` / \`User123!\` (Cheikh Tidiane Ndiaye, Rôle: \`USER\`)
- Collaboratrice : \`aissatou.diop@taskflow.dev\` / \`User123!\` (Aïssatou Diop, Rôle: \`USER\`)
`,
    contact: {
      name: 'TaskFlow Engineering Team',
      email: 'support@taskflow.dev',
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Serveur Actuel (Production & Développement)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Jeton JWT au format Bearer (obtenu via /api/auth/login ou /api/auth/register)',
      },
    },
    schemas: {
      UserRole: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
        example: 'USER',
      },
      TaskStatus: {
        type: 'string',
        enum: ['TODO', 'IN_PROGRESS', 'DONE'],
        example: 'IN_PROGRESS',
      },
      TaskPriority: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        example: 'HIGH',
      },
      SafeUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-sarah-02' },
          name: { type: 'string', example: 'Sarah Martin' },
          email: { type: 'string', format: 'email', example: 'sarah.martin@taskflow.dev' },
          role: { $ref: '#/components/schemas/UserRole' },
          jobTitle: { type: 'string', example: 'Lead Frontend Engineer' },
          department: { type: 'string', example: 'Ingénierie' },
          avatarUrl: { type: 'string', format: 'uri', example: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-27T08:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-10-22T10:00:00.000Z' },
        },
      },
      RegisterDto: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Camille Bernard', description: 'Nom complet (min 2 car.)' },
          email: { type: 'string', format: 'email', example: 'camille.bernard@taskflow.dev' },
          password: { type: 'string', format: 'password', example: 'Secur3Pass!', description: 'Mot de passe (min 6 car.)' },
          role: { $ref: '#/components/schemas/UserRole', description: 'Rôle par défaut: USER' },
          jobTitle: { type: 'string', example: 'Product Manager' },
          department: { type: 'string', example: 'Produit' },
        },
      },
      LoginDto: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@taskflow.dev' },
          password: { type: 'string', format: 'password', example: 'Admin123!' },
        },
      },
      UpdateProfileDto: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Thomas Dubois' },
          email: { type: 'string', format: 'email', example: 'thomas.dubois@taskflow.dev' },
          jobTitle: { type: 'string', example: 'VP of Engineering' },
          department: { type: 'string', example: 'Direction Technique' },
          avatarUrl: { type: 'string', format: 'uri', example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
          currentPassword: { type: 'string', format: 'password', example: 'Admin123!' },
          newPassword: { type: 'string', format: 'password', example: 'NewSecret123!' },
        },
      },
      ProjectMember: {
        type: 'object',
        properties: {
          userId: { type: 'string', example: 'usr-sarah-02' },
          role: { type: 'string', enum: ['OWNER', 'MEMBER'], example: 'MEMBER' },
          joinedAt: { type: 'string', format: 'date-time', example: '2026-10-04T08:00:00.000Z' },
          user: { $ref: '#/components/schemas/SafeUser' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prj-saas-2026' },
          name: { type: 'string', example: 'Refonte Plateforme SaaS 2026' },
          description: { type: 'string', example: 'Modernisation de l’infrastructure et refonte UX.' },
          color: { type: 'string', example: '#ff2d75' },
          ownerId: { type: 'string', example: 'usr-admin-01' },
          owner: { $ref: '#/components/schemas/SafeUser' },
          members: {
            type: 'array',
            items: { $ref: '#/components/schemas/ProjectMember' },
          },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-02T10:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-10-22T08:00:00.000Z' },
        },
      },
      CreateProjectDto: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Refonte Portail Client B2B' },
          description: { type: 'string', example: 'Architecture microservices et authentification SSO.' },
          color: { type: 'string', example: '#ff2d75' },
          memberIds: {
            type: 'array',
            items: { type: 'string' },
            example: ['usr-sarah-02', 'usr-alex-03'],
          },
        },
      },
      UpdateProjectDto: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Refonte Portail Client v2' },
          description: { type: 'string', example: 'Périmètre étendu aux intégrations ERP.' },
          color: { type: 'string', example: '#ec4899' },
          ownerId: { type: 'string', example: 'usr-alex-03' },
        },
      },
      AddMemberDto: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', example: 'usr-claire-04' },
          role: { type: 'string', enum: ['OWNER', 'MEMBER'], example: 'MEMBER' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'tsk-01' },
          title: { type: 'string', example: 'Mettre en place la documentation Swagger OpenAPI 3.0' },
          description: { type: 'string', example: 'Exposer la spécification OpenAPI à /api/openapi.json et monter Swagger UI.' },
          status: { $ref: '#/components/schemas/TaskStatus' },
          priority: { $ref: '#/components/schemas/TaskPriority' },
          dueDate: { type: 'string', format: 'date', nullable: true, example: '2026-10-25' },
          assignedUserId: { type: 'string', nullable: true, example: 'usr-alex-03' },
          assignedUser: { $ref: '#/components/schemas/SafeUser', nullable: true },
          projectId: { type: 'string', example: 'prj-saas-2026' },
          project: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'prj-saas-2026' },
              name: { type: 'string', example: 'Refonte Plateforme SaaS 2026' },
            },
          },
          createdById: { type: 'string', example: 'usr-admin-01' },
          createdBy: { $ref: '#/components/schemas/SafeUser' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-07T12:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-10-22T09:00:00.000Z' },
        },
      },
      CreateTaskDto: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Sécuriser le rate limiting sur les routes d’auth' },
          description: { type: 'string', example: 'Limiter les tentatives de connexion brute-force à 5 req/min.' },
          status: { $ref: '#/components/schemas/TaskStatus', default: 'TODO' },
          priority: { $ref: '#/components/schemas/TaskPriority', default: 'MEDIUM' },
          dueDate: { type: 'string', format: 'date', example: '2026-10-30' },
          assignedUserId: { type: 'string', nullable: true, example: 'usr-sarah-02' },
        },
      },
      UpdateTaskDto: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Sécuriser le rate limiting (revu et testé)' },
          description: { type: 'string', example: 'Documentation ajoutée et tests de charge validés.' },
          status: { $ref: '#/components/schemas/TaskStatus' },
          priority: { $ref: '#/components/schemas/TaskPriority' },
          dueDate: { type: 'string', format: 'date', nullable: true, example: '2026-11-05' },
          assignedUserId: { type: 'string', nullable: true, example: 'usr-alex-03' },
          projectId: { type: 'string', example: 'prj-saas-2026' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 42 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
      DashboardStats: {
        type: 'object',
        properties: {
          totalProjects: { type: 'integer', example: 3 },
          totalTasks: { type: 'integer', example: 10 },
          completedTasks: { type: 'integer', example: 3 },
          inProgressTasks: { type: 'integer', example: 4 },
          todoTasks: { type: 'integer', example: 3 },
          overdueTasks: { type: 'integer', example: 2 },
          completionRate: { type: 'integer', example: 30, description: 'Pourcentage de complétion global (0 à 100)' },
          tasksByStatus: {
            type: 'object',
            properties: {
              TODO: { type: 'integer', example: 3 },
              IN_PROGRESS: { type: 'integer', example: 4 },
              DONE: { type: 'integer', example: 3 },
            },
          },
          tasksByPriority: {
            type: 'object',
            properties: {
              LOW: { type: 'integer', example: 2 },
              MEDIUM: { type: 'integer', example: 4 },
              HIGH: { type: 'integer', example: 4 },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
          message: { type: 'string', example: 'Une adresse email valide est obligatoire.' },
          statusCode: { type: 'integer', example: 400 },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Module A - Authentification & Utilisateurs'],
        summary: 'Inscription d’un nouvel utilisateur',
        description: 'Crée un nouveau compte utilisateur avec mot de passe haché par bcrypt. Retourne le profil et un jeton JWT valide.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterDto' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Compte créé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Compte utilisateur créé avec succès.' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: { $ref: '#/components/schemas/SafeUser' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Données invalides (email malformé, mot de passe trop court)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '409': {
            description: 'Email déjà enregistré',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Module A - Authentification & Utilisateurs'],
        summary: 'Connexion utilisateur',
        description: 'Vérifie l’email et le mot de passe puis génère un jeton JWT Bearer.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Connexion réussie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Authentification réussie.' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: { $ref: '#/components/schemas/SafeUser' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Champs manquants ou format invalide',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '401': {
            description: 'Identifiants incorrects',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Module A - Authentification & Utilisateurs'],
        summary: 'Consulter son profil utilisateur connecté',
        description: 'Retourne les informations du compte associé au jeton JWT.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profil utilisateur',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/SafeUser' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Token manquant ou expiré',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      patch: {
        tags: ['Module A - Authentification & Utilisateurs'],
        summary: 'Modifier son profil',
        description: 'Permet de mettre à jour son nom, email, département, poste ou mot de passe.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profil mis à jour',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Profil mis à jour avec succès.' },
                    user: { $ref: '#/components/schemas/SafeUser' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Données fournies invalides',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '401': {
            description: 'Non autorisé ou mot de passe actuel invalide',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '409': {
            description: 'Nouvelle adresse email déjà utilisée',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Module A - Authentification & Utilisateurs'],
        summary: 'Lister les utilisateurs du système',
        description: 'Permet de lister tous les utilisateurs pour l’affectation aux projets et tâches. Filtrable par rôle ou recherche texte.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche par nom, email ou poste' },
          { name: 'role', in: 'query', schema: { $ref: '#/components/schemas/UserRole' }, description: 'Filtrer par rôle ADMIN ou USER' },
        ],
        responses: {
          '200': {
            description: 'Liste des utilisateurs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 4 },
                    users: { type: 'array', items: { $ref: '#/components/schemas/SafeUser' } },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non autorisé',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/users/{id}/role': {
      patch: {
        tags: ['Administration - Contrôle d’accès'],
        summary: 'Modifier le rôle d’un utilisateur (ADMIN)',
        description: 'Permet à un administrateur de promouvoir ou rétrograder un utilisateur entre les rôles ADMIN et USER.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de l’utilisateur' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { $ref: '#/components/schemas/UserRole' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Rôle modifié avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/SafeUser' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Accès réservé aux administrateurs',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '404': {
            description: 'Utilisateur non trouvé',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/users/{id}': {
      delete: {
        tags: ['Administration - Contrôle d’accès'],
        summary: 'Supprimer un utilisateur (ADMIN)',
        description: 'Supprime un compte utilisateur du système et détache ses assignations.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Utilisateur supprimé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    deletedUserId: { type: 'string' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Accès réservé aux administrateurs',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '404': {
            description: 'Utilisateur introuvable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/projects': {
      post: {
        tags: ['Module B - Gestion des Projets'],
        summary: 'Créer un nouveau projet',
        description: 'Crée un projet dont le créateur devient automatiquement le responsable (OWNER).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProjectDto' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Projet créé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    project: { $ref: '#/components/schemas/Project' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Données invalides',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '401': {
            description: 'Authentification requise',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      get: {
        tags: ['Module B - Gestion des Projets'],
        summary: 'Lister les projets accessibles',
        description: 'Retourne la liste des projets auxquels l’utilisateur participe ou qu’il possède. Les administrateurs ont une visibilité globale.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Liste des projets accessibles',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 3 },
                    projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non autorisé',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Module B - Gestion des Projets'],
        summary: 'Consulter un projet',
        description: 'Retourne les détails complets d’un projet et de ses membres.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Détails du projet',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    project: { $ref: '#/components/schemas/Project' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Accès interdit aux équipes externes',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '404': {
            description: 'Projet introuvable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      patch: {
        tags: ['Module B - Gestion des Projets'],
        summary: 'Modifier un projet',
        description: 'Met à jour un projet. Seul le responsable ou un administrateur peut modifier le projet.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProjectDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Projet mis à jour',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    project: { $ref: '#/components/schemas/Project' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Droits insuffisants (réservé au responsable ou ADMIN)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '404': {
            description: 'Projet introuvable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      delete: {
        tags: ['Module B - Gestion des Projets'],
        summary: 'Supprimer un projet',
        description: 'Supprime un projet et ses tâches associées. Seul le responsable ou un administrateur peut supprimer.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Projet supprimé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    deletedProjectId: { type: 'string' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Droits insuffisants',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '404': {
            description: 'Projet introuvable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/projects/{id}/members': {
      get: {
        tags: ['Module B - Gestion des Projets'],
        summary: 'Lister les membres d’un projet',
        description: 'Retourne la liste des membres avec leur rôle au sein du projet.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Membres du projet',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    projectId: { type: 'string' },
                    total: { type: 'integer' },
                    members: { type: 'array', items: { $ref: '#/components/schemas/ProjectMember' } },
                  },
                },
              },
            },
          },
          '403': { description: 'Accès non autorisé' },
          '404': { description: 'Projet non trouvé' },
        },
      },
      post: {
        tags: ['Module B - Gestion des Projets'],
        summary: 'Ajouter un membre à un projet',
        description: 'Ajoute un utilisateur existant dans l’équipe du projet.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddMemberDto' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Membre ajouté avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    project: { $ref: '#/components/schemas/Project' },
                  },
                },
              },
            },
          },
          '400': { description: 'Paramètres invalides' },
          '403': { description: 'Droits de gestion requis' },
          '404': { description: 'Projet ou utilisateur non trouvé' },
        },
      },
    },
    '/api/projects/{id}/members/{userId}': {
      delete: {
        tags: ['Module B - Gestion des Projets'],
        summary: 'Retirer un membre d’un projet',
        description: 'Retire un membre de l’équipe du projet (impossible de retirer le propriétaire principal).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Membre retiré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    project: { $ref: '#/components/schemas/Project' },
                  },
                },
              },
            },
          },
          '400': { description: 'Impossible de retirer le propriétaire principal' },
          '403': { description: 'Droits insuffisants' },
          '404': { description: 'Projet introuvable' },
        },
      },
    },
    '/api/projects/{id}/tasks': {
      post: {
        tags: ['Module C - Gestion des Tâches'],
        summary: 'Créer une tâche dans un projet',
        description: 'Crée une nouvelle tâche rattachée au projet spécifié. Si un utilisateur est assigné, il doit être membre du projet.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskDto' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tâche créée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          '400': { description: 'Données invalides ou assigné hors du projet' },
          '403': { description: 'Accès au projet non autorisé' },
          '404': { description: 'Projet introuvable' },
        },
      },
      get: {
        tags: ['Module C - Gestion des Tâches'],
        summary: 'Lister les tâches d’un projet',
        description: 'Retourne les tâches du projet avec support complet des filtres, recherche, tri et pagination.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/TaskStatus' }, description: 'Filtrer par statut' },
          { name: 'priority', in: 'query', schema: { $ref: '#/components/schemas/TaskPriority' }, description: 'Filtrer par priorité' },
          { name: 'assignedUserId', in: 'query', schema: { type: 'string' }, description: 'Filtrer par membre assigné' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche dans le titre ou la description' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'dueDate'] }, description: 'Champ de tri' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Sens du tri' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Nombre d’éléments par page' },
        ],
        responses: {
          '200': {
            description: 'Liste paginée des tâches',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          '403': { description: 'Accès non autorisé au projet' },
          '404': { description: 'Projet introuvable' },
        },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Module C - Gestion des Tâches'],
        summary: 'Lister toutes les tâches accessibles',
        description: 'Retourne toutes les tâches auxquelles l’utilisateur a accès à travers ses projets avec pagination, filtres et tri.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' }, description: 'Filtrer par projet' },
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/TaskStatus' }, description: 'Filtrer par statut' },
          { name: 'priority', in: 'query', schema: { $ref: '#/components/schemas/TaskPriority' }, description: 'Filtrer par priorité' },
          { name: 'assignedUserId', in: 'query', schema: { type: 'string' }, description: 'Filtrer par assigné' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche par mot-clé' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'dueDate'] }, description: 'Tri' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Ordre asc ou desc' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Liste globale paginée des tâches',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          '401': { description: 'Authentification requise' },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Module C - Gestion des Tâches'],
        summary: 'Consulter une tâche',
        description: 'Retourne les détails d’une tâche spécifique.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Détails de la tâche',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          '403': { description: 'Accès non autorisé' },
          '404': { description: 'Tâche introuvable' },
        },
      },
      patch: {
        tags: ['Module C - Gestion des Tâches'],
        summary: 'Modifier une tâche',
        description: 'Met à jour le statut, priorité, assignation, titre ou description d’une tâche.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tâche mise à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          '400': { description: 'Données invalides ou assignation non autorisée' },
          '403': { description: 'Accès refusé' },
          '404': { description: 'Tâche introuvable' },
        },
      },
      delete: {
        tags: ['Module C - Gestion des Tâches'],
        summary: 'Supprimer une tâche',
        description: 'Supprime une tâche. Réservé au créateur de la tâche, au responsable du projet ou à un administrateur.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Tâche supprimée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    deletedTaskId: { type: 'string' },
                  },
                },
              },
            },
          },
          '403': { description: 'Droits de suppression insuffisants' },
          '404': { description: 'Tâche introuvable' },
        },
      },
    },
    '/api/dashboard/stats': {
      get: {
        tags: ['Module D - Tableau de Bord & Statistiques'],
        summary: 'Consulter les statistiques et KPIs',
        description: 'Calcule les indicateurs clés réels : projets accessibles, tâches totales, en cours, terminées, tâches en retard, répartition par statut et priorité, et taux de complétion.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Statistiques calculées en temps réel',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    timestamp: { type: 'string', format: 'date-time' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        role: { type: 'string' },
                      },
                    },
                    stats: { $ref: '#/components/schemas/DashboardStats' },
                  },
                },
              },
            },
          },
          '401': { description: 'Authentification requise' },
        },
      },
    },
    '/api/seed/reset': {
      post: {
        tags: ['Administration - Contrôle d’accès'],
        summary: 'Réinitialiser le jeu de données de test',
        description: 'Réinitialise la base de données avec des projets, tâches et utilisateurs réalistes de démonstration.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Base de données réinitialisée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Base de données réinitialisée avec succès.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Système'],
        summary: 'Healthcheck de l’API',
        description: 'Vérifie la disponibilité et l’état de santé de l’API REST TaskFlow.',
        responses: {
          '200': {
            description: 'API opérationnelle',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    uptime: { type: 'number', example: 124.5 },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
