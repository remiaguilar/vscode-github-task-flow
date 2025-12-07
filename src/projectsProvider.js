"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskItem = exports.ProjectItem = exports.AccountItem = exports.ProjectsProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Provider para el árbol de proyectos en la barra lateral
 */
class ProjectsProvider {
    constructor(apiService, authService) {
        this.apiService = apiService;
        this.authService = authService;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.accountsProjects = new Map();
    }
    /**
     * Actualiza el servicio de API
     */
    setApiService(apiService) {
        this.apiService = apiService;
    }
    /**
     * Actualiza el servicio de autenticación
     */
    setAuthService(authService) {
        this.authService = authService;
    }
    /**
     * Refresca la vista
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    /**
     * Carga los proyectos de todas las cuentas
     */
    async loadProjects() {
        if (!this.authService) {
            this.accountsProjects.clear();
            this.refresh();
            return;
        }
        try {
            const accounts = await this.authService.getAllAccounts();
            if (accounts.length === 0) {
                this.accountsProjects.clear();
                this.refresh();
                return;
            }
            // Cargar proyectos para cada cuenta
            for (const account of accounts) {
                await this.loadProjectsForAccount(account.id, account.token);
            }
            this.refresh();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error al cargar proyectos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            this.accountsProjects.clear();
            this.refresh();
        }
    }
    /**
     * Carga proyectos para una cuenta específica
     */
    async loadProjectsForAccount(accountId, token) {
        try {
            const { GitHubApiService } = await Promise.resolve().then(() => __importStar(require('./services/githubApiService')));
            const apiService = new GitHubApiService(token);
            const projects = await apiService.fetchProjects();
            this.accountsProjects.set(accountId, projects);
        }
        catch (error) {
            console.error(`Error al cargar proyectos para cuenta ${accountId}:`, error);
            this.accountsProjects.set(accountId, []);
        }
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!this.authService) {
            return [];
        }
        if (!element) {
            // Raíz: mostrar cuentas
            const accounts = await this.authService.getAllAccounts();
            if (accounts.length === 0) {
                return [];
            }
            return accounts.map((account) => new AccountItem(account, vscode.TreeItemCollapsibleState.Expanded));
        }
        // Si es una cuenta, mostrar sus proyectos
        if (element instanceof AccountItem) {
            const projects = this.accountsProjects.get(element.account.id) || [];
            return projects.map(project => new ProjectItem(project, vscode.TreeItemCollapsibleState.Collapsed, element.account.id));
        }
        // Si es un proyecto, mostrar sus tareas
        if (element instanceof ProjectItem && element.project && element.accountId) {
            try {
                const accounts = await this.authService.getAllAccounts();
                const account = accounts.find((acc) => acc.id === element.accountId);
                if (!account) {
                    return [];
                }
                const { GitHubApiService } = await Promise.resolve().then(() => __importStar(require('./services/githubApiService')));
                const apiService = new GitHubApiService(account.token);
                const projectData = await apiService.fetchProjectData(element.project.id);
                return projectData.tasks.map((task) => new TaskItem(task, element.project));
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error al cargar tareas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                return [];
            }
        }
        return [];
    }
    /**
     * Obtiene un proyecto por ID de todas las cuentas
     */
    getProject(projectId) {
        for (const projects of this.accountsProjects.values()) {
            const project = projects.find((p) => p.id === projectId);
            if (project) {
                return project;
            }
        }
        return undefined;
    }
    /**
     * Obtiene todos los proyectos de todas las cuentas
     */
    getProjects() {
        const allProjects = [];
        for (const projects of this.accountsProjects.values()) {
            allProjects.push(...projects);
        }
        return allProjects;
    }
}
exports.ProjectsProvider = ProjectsProvider;
/**
 * Item de cuenta en el árbol
 */
class AccountItem extends vscode.TreeItem {
    constructor(account, collapsibleState) {
        super(`👤 ${account.username}`, collapsibleState);
        this.account = account;
        this.collapsibleState = collapsibleState;
        this.tooltip = `Cuenta: ${account.username}${account.isActive ? ' (Activa)' : ''}`;
        this.description = account.isActive ? '(Activa)' : '';
        this.contextValue = 'account';
        this.iconPath = new vscode.ThemeIcon('account');
    }
}
exports.AccountItem = AccountItem;
/**
 * Item de proyecto en el árbol
 */
class ProjectItem extends vscode.TreeItem {
    constructor(project, collapsibleState, accountId) {
        super('', collapsibleState);
        this.project = project;
        this.collapsibleState = collapsibleState;
        this.accountId = accountId;
        this.label = project.title;
        this.tooltip = project.shortDescription || project.title;
        this.description = project.closed ? '(Cerrado)' : '';
        this.contextValue = 'project';
        this.iconPath = new vscode.ThemeIcon('project');
    }
}
exports.ProjectItem = ProjectItem;
/**
 * Item de tarea en el árbol
 */
class TaskItem extends vscode.TreeItem {
    constructor(task, project) {
        super(task.title, vscode.TreeItemCollapsibleState.None);
        this.task = task;
        this.project = project;
        this.tooltip = `#${task.number} - ${task.title}`;
        this.description = `#${task.number}`;
        this.contextValue = 'task';
        // Icono según el estado
        this.iconPath = new vscode.ThemeIcon(task.state === 'OPEN' ? 'issues' : 'issue-closed');
        // Comando al hacer clic
        this.command = {
            command: 'githubTaskFlow.openTaskInBrowser',
            title: 'Abrir en GitHub',
            arguments: [task]
        };
    }
}
exports.TaskItem = TaskItem;
//# sourceMappingURL=projectsProvider.js.map