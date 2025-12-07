import * as vscode from 'vscode';
import { AuthenticationService } from './services/authService';
import { GitHubApiService } from './services/githubApiService';
import { GitWorkflowService } from './services/gitWorkflowService';
import { ProjectsProvider } from './projectsProvider';
import { GitHubTask, CreateTaskParams } from './types';

let authService: AuthenticationService;
let apiService: GitHubApiService | null = null;
let gitService: GitWorkflowService;
let projectsProvider: ProjectsProvider;

/**
 * Activa la extensión
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('GitHub Task Flow está activándose...');

  // Inicializar servicios
  authService = new AuthenticationService(context);
  gitService = new GitWorkflowService();
  
  // Inicializar apiService si hay una cuenta autenticada
  const authConfig = await authService.getAuthConfig();
  if (authConfig) {
    apiService = new GitHubApiService(authConfig.token);
  }
  
  projectsProvider = new ProjectsProvider(apiService, authService);

  // Cargar proyectos de todas las cuentas
  await projectsProvider.loadProjects();

  // Registrar provider de vista de proyectos
  vscode.window.registerTreeDataProvider('githubTaskFlow.projectsView', projectsProvider);

  // Registrar comandos
  registerCommands(context);

  console.log('✅ GitHub Task Flow está activo');
}

/**
 * Registra todos los comandos de la extensión
 */
function registerCommands(context: vscode.ExtensionContext) {
  // Comando: Autenticar
  context.subscriptions.push(
    vscode.commands.registerCommand('githubTaskFlow.authenticate', async () => {
      const success = await authService.authenticate();
      
      if (success) {
        const authConfig = await authService.getAuthConfig();
        if (authConfig) {
          apiService = new GitHubApiService(authConfig.token);
          projectsProvider.setApiService(apiService);
          
          // Cargar proyectos
          await projectsProvider.loadProjects();
        }
      }
    })
  );

  // Comando: Refrescar proyectos
  context.subscriptions.push(
    vscode.commands.registerCommand('githubTaskFlow.refreshProjects', async () => {
      if (!apiService) {
        vscode.window.showWarningMessage('Debes autenticarte primero');
        return;
      }
      
      await projectsProvider.loadProjects();
      vscode.window.showInformationMessage('✅ Proyectos actualizados');
    })
  );



  // Comando: Crear rama desde tarea
  context.subscriptions.push(
    vscode.commands.registerCommand('githubTaskFlow.createBranchFromTask', async (taskItemOrTask: any) => {
      // Extraer la tarea del TaskItem si es necesario
      const task = taskItemOrTask?.task || taskItemOrTask;
      
      if (!task) {
        vscode.window.showWarningMessage('No se proporcionó ninguna tarea');
        return;
      }

      const hasGit = await gitService.hasGitRepository();
      if (!hasGit) {
        vscode.window.showWarningMessage('No hay un repositorio Git abierto en el workspace');
        return;
      }

      const branchName = gitService.generateBranchName(task);
      await gitService.createBranch(branchName);
    })
  );

  // Comando: Abrir tarea en navegador
  context.subscriptions.push(
    vscode.commands.registerCommand('githubTaskFlow.openTaskInBrowser', (taskItemOrTask: any) => {
      // Extraer la tarea del TaskItem si es necesario
      const task = taskItemOrTask?.task || taskItemOrTask;
      
      if (task && task.url) {
        vscode.env.openExternal(vscode.Uri.parse(task.url));
      }
    })
  );

  // Comando: Ir a rama de tarea
  context.subscriptions.push(
    vscode.commands.registerCommand('githubTaskFlow.goToTaskBranch', async () => {

      const hasGit = await gitService.hasGitRepository();
      if (!hasGit) {
        vscode.window.showWarningMessage('No hay repositorio Git abierto');
        return;
      }

      const branches = await gitService.getBranches();
      if (branches.length === 0) {
        vscode.window.showInformationMessage('No hay ramas disponibles');
        return;
      }

      const selected = await vscode.window.showQuickPick(branches, {
        placeHolder: 'Selecciona una rama'
      });

      if (selected) {
        await gitService.checkoutBranch(selected);
      }
    })
  );

  // Comando: Crear nueva tarea
  context.subscriptions.push(
    vscode.commands.registerCommand('githubTaskFlow.createTask', async (projectItem?: any) => {
      if (!apiService) {
        vscode.window.showWarningMessage('Debes autenticarte primero');
        return;
      }

      let projects = projectsProvider.getProjects();
      if (projects.length === 0) {
        await projectsProvider.loadProjects();
        projects = projectsProvider.getProjects();
      }

      if (projects.length === 0) {
        vscode.window.showWarningMessage('No hay proyectos disponibles');
        return;
      }

      // Determinar proyecto destino
      let selectedProject = projectItem?.project;
      
      if (!selectedProject) {
        const projectChoice = await vscode.window.showQuickPick(
          projects.map(p => ({
            label: p.title,
            description: p.owner.login,
            project: p
          })),
          { placeHolder: 'Selecciona el proyecto' }
        );

        if (!projectChoice) {
          return;
        }
        selectedProject = projectChoice.project;
      }

      // Pedir datos de la tarea
      const title = await vscode.window.showInputBox({
        prompt: 'Título de la tarea',
        placeHolder: 'Ej: Implementar autenticación...',
        validateInput: (value) => {
          return value.trim().length === 0 ? 'El título no puede estar vacío' : null;
        }
      });

      if (!title) {
        return;
      }

      const body = await vscode.window.showInputBox({
        prompt: 'Descripción (opcional)',
        placeHolder: 'Describe la tarea en detalle...'
      });

      try {
        // Obtener repositorio del proyecto (si existe)
        const projectData = await apiService.fetchProjectData(selectedProject.id);
        
        let repositoryOwner = '';
        let repositoryName = '';

        if (projectData.tasks.length > 0 && projectData.tasks[0].repository) {
          // Usar repositorio de la primera tarea
          repositoryOwner = projectData.tasks[0].repository.owner;
          repositoryName = projectData.tasks[0].repository.name;
        } else {
          // Preguntar si quiere vincular a un repositorio (opcional)
          const useRepo = await vscode.window.showQuickPick(
            ['No vincular a repositorio', 'Vincular a un repositorio'],
            { 
              placeHolder: 'Las tareas se pueden crear sin repositorio',
              title: '¿Vincular a un repositorio?' 
            }
          );

          if (useRepo === 'Vincular a un repositorio') {
            const repoInput = await vscode.window.showInputBox({
              prompt: 'Repositorio (formato: owner/repo)',
              placeHolder: 'ej: usuario/mi-repo',
              validateInput: (value) => {
                if (!value) {
                  return null; // Permitir vacío
                }
                return value.includes('/') ? null : 'Formato inválido. Usa owner/repo';
              }
            });

            if (repoInput) {
              [repositoryOwner, repositoryName] = repoInput.split('/');
            }
          }
        }

        const params: CreateTaskParams = {
          title,
          body: body || '',
          repositoryOwner,
          repositoryName,
          projectId: selectedProject.id
        };

        const newTask = await apiService.createIssue(params);
        vscode.window.showInformationMessage(`✅ Tarea creada: #${newTask.number} - ${newTask.title}`);
        
        await projectsProvider.loadProjects();

      } catch (error) {
        vscode.window.showErrorMessage(
          `Error al crear tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
      }
    })
  );

  // Comando: Editar tarea
  context.subscriptions.push(
    vscode.commands.registerCommand('githubTaskFlow.editTask', async (taskItem?: any) => {
      if (!apiService) {
        vscode.window.showWarningMessage('Debes autenticarte primero');
        return;
      }

      if (!taskItem || !taskItem.task) {
        vscode.window.showWarningMessage('No se seleccionó ninguna tarea');
        return;
      }

      const task = taskItem.task;

      const action = await vscode.window.showQuickPick([
        { label: '✏️ Editar Título', action: 'title' },
        { label: '📝 Editar Descripción', action: 'description' },
        { label: '🏷️ Cambiar Estado', action: 'state' },
        { label: '👤 Cambiar Asignatario', action: 'assignee' }
      ], {
        placeHolder: `Editar: ${task.title}`
      });

      if (!action) {
        return;
      }

      try {
        switch (action.action) {
          case 'title':
            const newTitle = await vscode.window.showInputBox({
              prompt: 'Nuevo título',
              value: task.title,
              validateInput: (value) => {
                return value.trim().length === 0 ? 'El título no puede estar vacío' : null;
              }
            });
            if (newTitle && newTitle !== task.title) {
              // Aquí llamarías a la API para actualizar
              vscode.window.showInformationMessage('✅ Título actualizado (implementación pendiente en API)');
            }
            break;

          case 'description':
            const newBody = await vscode.window.showInputBox({
              prompt: 'Nueva descripción',
              value: task.body || '',
              validateInput: () => null
            });
            if (newBody !== undefined) {
              vscode.window.showInformationMessage('✅ Descripción actualizada (implementación pendiente en API)');
            }
            break;

          case 'state':
            const newState = await vscode.window.showQuickPick([
              { label: '🟢 Abierto', state: 'OPEN' },
              { label: '🔴 Cerrado', state: 'CLOSED' }
            ], {
              placeHolder: 'Selecciona el nuevo estado'
            });
            if (newState) {
              vscode.window.showInformationMessage(`✅ Estado cambiado a ${newState.label}`);
            }
            break;

          case 'assignee':
            vscode.window.showInformationMessage('Cambio de asignatario (implementación pendiente)');
            break;
        }

        await projectsProvider.loadProjects();

      } catch (error) {
        vscode.window.showErrorMessage(
          `Error al editar tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
      }
    })
  );

  // Comando: Eliminar tarea
  context.subscriptions.push(
    vscode.commands.registerCommand('githubTaskFlow.deleteTask', async (taskItem?: any) => {
      if (!apiService) {
        vscode.window.showWarningMessage('Debes autenticarte primero');
        return;
      }

      if (!taskItem || !taskItem.task) {
        vscode.window.showWarningMessage('No se seleccionó ninguna tarea');
        return;
      }

      const task = taskItem.task;

      const confirm = await vscode.window.showWarningMessage(
        `¿Cerrar la tarea #${task.number}: ${task.title}?`,
        { modal: true },
        'Cerrar Tarea',
        'Cancelar'
      );

      if (confirm !== 'Cerrar Tarea') {
        return;
      }

      try {
        // En GitHub Projects, "eliminar" generalmente significa cerrar el issue
        vscode.window.showInformationMessage(`✅ Tarea #${task.number} cerrada (implementación de cierre pendiente en API)`);
        await projectsProvider.loadProjects();

      } catch (error) {
        vscode.window.showErrorMessage(
          `Error al cerrar tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
      }
    })
  );

  // Comando: Gestionar cuentas
  context.subscriptions.push(
    vscode.commands.registerCommand('githubTaskFlow.manageAccounts', async () => {
      const accounts = await authService.getAllAccounts();
      const activeAccount = await authService.getActiveAccount();
      
      if (accounts.length === 0) {
        vscode.window.showInformationMessage('No hay cuentas. Agrega una cuenta primero.');
        return;
      }
      
      const items = [
        {
          label: '$(add) Agregar Nueva Cuenta',
          action: 'add'
        },
        {
          label: '$(arrow-swap) Cambiar Cuenta',
          action: 'switch',
          hidden: accounts.length < 2
        },
        {
          label: '$(trash) Eliminar Cuenta',
          action: 'remove'
        },
        {
          label: '$(sign-out) Cerrar Todas las Sesiones',
          action: 'logoutAll'
        },
        {
          label: '',
          kind: vscode.QuickPickItemKind.Separator
        },
        ...accounts.map(acc => ({
          label: `${acc.id === activeAccount?.id ? '$(check) ' : ''}@${acc.username}`,
          description: acc.email || '',
          detail: acc.id === activeAccount?.id ? 'Cuenta activa' : 'Click para activar',
          action: 'activate',
          accountId: acc.id
        }))
      ].filter((item: any) => !item.hidden);
      
      const selected = await vscode.window.showQuickPick(items as any[], {
        placeHolder: 'Gestionar Cuentas de GitHub',
        title: `Cuentas (${accounts.length})`
      });
      
      if (!selected) {
        return;
      }
      
      switch ((selected as any).action) {
        case 'add':
          await vscode.commands.executeCommand('githubTaskFlow.authenticate');
          break;
        case 'switch':
          await vscode.commands.executeCommand('githubTaskFlow.switchAccount');
          break;
        case 'remove':
          const removed = await authService.removeAccount();
          if (removed) {
            const authConfig = await authService.getAuthConfig();
            if (authConfig) {
              apiService = new GitHubApiService(authConfig.token);
              projectsProvider.setApiService(apiService);
              await projectsProvider.loadProjects();
            } else {
              apiService = null;
              projectsProvider.setApiService(null);
              projectsProvider.refresh();
            }
          }
          break;
        case 'logoutAll':
          await authService.logoutAll();
          apiService = null;
          projectsProvider.setApiService(null);
          projectsProvider.refresh();
          break;
        case 'activate':
          await authService.setActiveAccount((selected as any).accountId);
          const authConfig = await authService.getAuthConfig();
          if (authConfig) {
            apiService = new GitHubApiService(authConfig.token);
            projectsProvider.setApiService(apiService);
            await projectsProvider.loadProjects();
          }
          break;
      }
    })
  );

}

/**
 * Desactiva la extensión
 */
export function deactivate() {
  console.log('GitHub Task Flow se está desactivando');
}
