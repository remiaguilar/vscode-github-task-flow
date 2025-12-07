import * as vscode from 'vscode';
import { GitHubProject, ProjectData } from './types';
import { GitHubApiService } from './services/githubApiService';

/**
 * Provider para el árbol de proyectos en la barra lateral
 */
export class ProjectsProvider implements vscode.TreeDataProvider<AccountItem | ProjectItem | TaskItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AccountItem | ProjectItem | TaskItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private accountsProjects: Map<string, GitHubProject[]> = new Map();

  constructor(
    private apiService: GitHubApiService | null,
    private authService: any
  ) {}

  /**
   * Actualiza el servicio de API
   */
  setApiService(apiService: GitHubApiService | null): void {
    this.apiService = apiService;
  }

  /**
   * Actualiza el servicio de autenticación
   */
  setAuthService(authService: any): void {
    this.authService = authService;
  }

  /**
   * Refresca la vista
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Carga los proyectos de todas las cuentas
   */
  async loadProjects(): Promise<void> {
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
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error al cargar proyectos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
      this.accountsProjects.clear();
      this.refresh();
    }
  }

  /**
   * Carga proyectos para una cuenta específica
   */
  private async loadProjectsForAccount(accountId: string, token: string): Promise<void> {
    try {
      const { GitHubApiService } = await import('./services/githubApiService');
      const apiService = new GitHubApiService(token);
      const projects = await apiService.fetchProjects();
      this.accountsProjects.set(accountId, projects);
    } catch (error) {
      console.error(`Error al cargar proyectos para cuenta ${accountId}:`, error);
      this.accountsProjects.set(accountId, []);
    }
  }

  getTreeItem(element: AccountItem | ProjectItem | TaskItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: AccountItem | ProjectItem | TaskItem): Promise<(AccountItem | ProjectItem | TaskItem)[]> {
    if (!this.authService) {
      return [];
    }

    if (!element) {
      // Raíz: mostrar cuentas
      const accounts = await this.authService.getAllAccounts();
      
      if (accounts.length === 0) {
        return [];
      }

      return accounts.map((account: any) => new AccountItem(
        account,
        vscode.TreeItemCollapsibleState.Expanded
      ));
    }

    // Si es una cuenta, mostrar sus proyectos
    if (element instanceof AccountItem) {
      const projects = this.accountsProjects.get(element.account.id) || [];
      return projects.map(project => new ProjectItem(
        project,
        vscode.TreeItemCollapsibleState.Collapsed,
        element.account.id
      ));
    }

    // Si es un proyecto, mostrar sus tareas
    if (element instanceof ProjectItem && element.project && element.accountId) {
      try {
        const accounts = await this.authService.getAllAccounts();
        const account = accounts.find((acc: any) => acc.id === element.accountId);
        
        if (!account) {
          return [];
        }

        const { GitHubApiService } = await import('./services/githubApiService');
        const apiService = new GitHubApiService(account.token);
        const projectData = await apiService.fetchProjectData(element.project.id);
        return projectData.tasks.map((task: any) => new TaskItem(task, element.project!));
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error al cargar tareas: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
        return [];
      }
    }

    return [];
  }

  /**
   * Obtiene un proyecto por ID de todas las cuentas
   */
  getProject(projectId: string): GitHubProject | undefined {
    for (const projects of this.accountsProjects.values()) {
      const project = projects.find((p: GitHubProject) => p.id === projectId);
      if (project) {
        return project;
      }
    }
    return undefined;
  }

  /**
   * Obtiene todos los proyectos de todas las cuentas
   */
  getProjects(): GitHubProject[] {
    const allProjects: GitHubProject[] = [];
    for (const projects of this.accountsProjects.values()) {
      allProjects.push(...projects);
    }
    return allProjects;
  }
}

/**
 * Item de cuenta en el árbol
 */
export class AccountItem extends vscode.TreeItem {
  constructor(
    public readonly account: any,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(`👤 ${account.username}`, collapsibleState);

    this.tooltip = `Cuenta: ${account.username}${account.isActive ? ' (Activa)' : ''}`;
    this.description = account.isActive ? '(Activa)' : '';
    this.contextValue = 'account';
    this.iconPath = new vscode.ThemeIcon('account');
  }
}

/**
 * Item de proyecto en el árbol
 */
export class ProjectItem extends vscode.TreeItem {
  constructor(
    public readonly project: GitHubProject,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly accountId?: string
  ) {
    super('', collapsibleState);

    this.label = project.title;
    this.tooltip = project.shortDescription || project.title;
    this.description = project.closed ? '(Cerrado)' : '';
    this.contextValue = 'project';
    this.iconPath = new vscode.ThemeIcon('project');
  }
}

/**
 * Item de tarea en el árbol
 */
export class TaskItem extends vscode.TreeItem {
  constructor(
    public readonly task: any,
    public readonly project: GitHubProject
  ) {
    super(task.title, vscode.TreeItemCollapsibleState.None);

    this.tooltip = `#${task.number} - ${task.title}`;
    this.description = `#${task.number}`;
    this.contextValue = 'task';
    
    // Icono según el estado
    this.iconPath = new vscode.ThemeIcon(
      task.state === 'OPEN' ? 'issues' : 'issue-closed'
    );
  }
}
