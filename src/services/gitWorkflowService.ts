import * as vscode from 'vscode';
import { GitHubTask } from '../types';

/**
 * Servicio para gestionar operaciones de Git y flujo de trabajo
 */
export class GitWorkflowService {
  /**
   * Genera un nombre de rama válido basado en una tarea
   */
  generateBranchName(task: GitHubTask): string {
    // Limpiar el título: convertir a minúsculas, remover caracteres especiales
    const cleanTitle = task.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50); // Limitar longitud

    // Determinar prefijo basado en el tipo de trabajo (si está disponible)
    const workTypeField = task.customFields.find(
      cf => cf.fieldName.toLowerCase().includes('tipo') || 
           cf.fieldName.toLowerCase().includes('work type')
    );

    let prefix = 'feature';
    if (workTypeField?.value) {
      const workType = String(workTypeField.value).toLowerCase();
      if (workType.includes('bug')) {
        prefix = 'bugfix';
      } else if (workType.includes('hotfix')) {
        prefix = 'hotfix';
      } else if (workType.includes('admin')) {
        prefix = 'chore';
      } else if (workType.includes('doc')) {
        prefix = 'docs';
      }
    }

    return `${prefix}/${task.number}-${cleanTitle}`;
  }

  /**
   * Crea una nueva rama de Git basada en una tarea
   */
  async createBranch(branchName: string): Promise<boolean> {
    try {
      // Obtener la extensión de Git
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (!gitExtension) {
        throw new Error('La extensión de Git no está disponible');
      }

      if (!gitExtension.isActive) {
        await gitExtension.activate();
      }

      const git = gitExtension.exports.getAPI(1);
      
      // Obtener el repositorio activo
      const repositories = git.repositories;
      if (repositories.length === 0) {
        throw new Error('No hay repositorios de Git abiertos en el workspace');
      }

      // Usar el primer repositorio (o podríamos permitir al usuario elegir)
      const repo = repositories[0];

      // Verificar si hay cambios sin confirmar
      const hasChanges = repo.state.workingTreeChanges.length > 0 || 
                        repo.state.indexChanges.length > 0;

      if (hasChanges) {
        const choice = await vscode.window.showWarningMessage(
          'Tienes cambios sin confirmar. ¿Qué deseas hacer?',
          'Hacer Stash',
          'Continuar sin Stash',
          'Cancelar'
        );

        if (choice === 'Hacer Stash') {
          await repo.createStash();
          vscode.window.showInformationMessage('Cambios guardados en stash');
        } else if (choice === 'Cancelar' || !choice) {
          return false;
        }
      }

      // Crear y cambiar a la nueva rama
      await repo.createBranch(branchName, true);
      
      vscode.window.showInformationMessage(`✅ Rama creada y activada: ${branchName}`);
      return true;

    } catch (error) {
      vscode.window.showErrorMessage(
        `Error al crear la rama: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
      console.error('Error al crear rama:', error);
      return false;
    }
  }

  /**
   * Cambia a una rama existente
   */
  async checkoutBranch(branchName: string): Promise<boolean> {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (!gitExtension) {
        throw new Error('La extensión de Git no está disponible');
      }

      if (!gitExtension.isActive) {
        await gitExtension.activate();
      }

      const git = gitExtension.exports.getAPI(1);
      const repositories = git.repositories;
      
      if (repositories.length === 0) {
        throw new Error('No hay repositorios de Git abiertos');
      }

      const repo = repositories[0];
      await repo.checkout(branchName);
      
      vscode.window.showInformationMessage(`✅ Cambiado a rama: ${branchName}`);
      return true;

    } catch (error) {
      vscode.window.showErrorMessage(
        `Error al cambiar de rama: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
      return false;
    }
  }

  /**
   * Obtiene todas las ramas del repositorio actual
   */
  async getBranches(): Promise<string[]> {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (!gitExtension) {
        return [];
      }

      if (!gitExtension.isActive) {
        await gitExtension.activate();
      }

      const git = gitExtension.exports.getAPI(1);
      const repositories = git.repositories;
      
      if (repositories.length === 0) {
        return [];
      }

      const repo = repositories[0];
      const refs = await repo.getRefs();
      
      return refs
        .filter((ref: any) => ref.type === 0) // Solo branches (type 0)
        .map((ref: any) => ref.name || '');

    } catch (error) {
      console.error('Error al obtener ramas:', error);
      return [];
    }
  }

  /**
   * Busca una rama que coincida con el número de tarea
   */
  async findBranchForTask(taskNumber: number): Promise<string | null> {
    const branches = await this.getBranches();
    const pattern = new RegExp(`[/-]${taskNumber}[-/]`, 'i');
    
    const matchingBranch = branches.find(branch => pattern.test(branch));
    return matchingBranch || null;
  }

  /**
   * Obtiene la rama actual
   */
  async getCurrentBranch(): Promise<string | null> {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (!gitExtension) {
        return null;
      }

      if (!gitExtension.isActive) {
        await gitExtension.activate();
      }

      const git = gitExtension.exports.getAPI(1);
      const repositories = git.repositories;
      
      if (repositories.length === 0) {
        return null;
      }

      const repo = repositories[0];
      return repo.state.HEAD?.name || null;

    } catch (error) {
      console.error('Error al obtener rama actual:', error);
      return null;
    }
  }

  /**
   * Verifica si hay un repositorio Git abierto
   */
  async hasGitRepository(): Promise<boolean> {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (!gitExtension) {
        return false;
      }

      if (!gitExtension.isActive) {
        await gitExtension.activate();
      }

      const git = gitExtension.exports.getAPI(1);
      return git.repositories.length > 0;

    } catch (error) {
      return false;
    }
  }
}
