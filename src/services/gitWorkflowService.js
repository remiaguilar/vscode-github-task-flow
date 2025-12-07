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
exports.GitWorkflowService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Servicio para gestionar operaciones de Git y flujo de trabajo
 */
class GitWorkflowService {
    /**
     * Genera un nombre de rama válido basado en una tarea
     */
    generateBranchName(task) {
        // Limpiar el título: convertir a minúsculas, remover caracteres especiales
        const cleanTitle = task.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50); // Limitar longitud
        // Determinar prefijo basado en el tipo de trabajo (si está disponible)
        const workTypeField = task.customFields.find(cf => cf.fieldName.toLowerCase().includes('tipo') ||
            cf.fieldName.toLowerCase().includes('work type'));
        let prefix = 'feature';
        if (workTypeField?.value) {
            const workType = String(workTypeField.value).toLowerCase();
            if (workType.includes('bug')) {
                prefix = 'bugfix';
            }
            else if (workType.includes('hotfix')) {
                prefix = 'hotfix';
            }
            else if (workType.includes('admin')) {
                prefix = 'chore';
            }
            else if (workType.includes('doc')) {
                prefix = 'docs';
            }
        }
        return `${prefix}/${task.number}-${cleanTitle}`;
    }
    /**
     * Crea una nueva rama de Git basada en una tarea
     */
    async createBranch(branchName) {
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
                const choice = await vscode.window.showWarningMessage('Tienes cambios sin confirmar. ¿Qué deseas hacer?', 'Hacer Stash', 'Continuar sin Stash', 'Cancelar');
                if (choice === 'Hacer Stash') {
                    await repo.createStash();
                    vscode.window.showInformationMessage('Cambios guardados en stash');
                }
                else if (choice === 'Cancelar' || !choice) {
                    return false;
                }
            }
            // Crear y cambiar a la nueva rama
            await repo.createBranch(branchName, true);
            vscode.window.showInformationMessage(`✅ Rama creada y activada: ${branchName}`);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error al crear la rama: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            console.error('Error al crear rama:', error);
            return false;
        }
    }
    /**
     * Cambia a una rama existente
     */
    async checkoutBranch(branchName) {
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
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error al cambiar de rama: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            return false;
        }
    }
    /**
     * Obtiene todas las ramas del repositorio actual
     */
    async getBranches() {
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
                .filter((ref) => ref.type === 0) // Solo branches (type 0)
                .map((ref) => ref.name || '');
        }
        catch (error) {
            console.error('Error al obtener ramas:', error);
            return [];
        }
    }
    /**
     * Busca una rama que coincida con el número de tarea
     */
    async findBranchForTask(taskNumber) {
        const branches = await this.getBranches();
        const pattern = new RegExp(`[/-]${taskNumber}[-/]`, 'i');
        const matchingBranch = branches.find(branch => pattern.test(branch));
        return matchingBranch || null;
    }
    /**
     * Obtiene la rama actual
     */
    async getCurrentBranch() {
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
        }
        catch (error) {
            console.error('Error al obtener rama actual:', error);
            return null;
        }
    }
    /**
     * Verifica si hay un repositorio Git abierto
     */
    async hasGitRepository() {
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
        }
        catch (error) {
            return false;
        }
    }
}
exports.GitWorkflowService = GitWorkflowService;
//# sourceMappingURL=gitWorkflowService.js.map