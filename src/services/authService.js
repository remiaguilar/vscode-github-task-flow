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
exports.AuthenticationService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Servicio de autenticación para GitHub
 * Maneja múltiples cuentas y tokens
 */
class AuthenticationService {
    constructor(context) {
        this.context = context;
    }
    /**
     * Solicita al usuario su Personal Access Token y agrega una nueva cuenta
     */
    async authenticate() {
        const token = await vscode.window.showInputBox({
            prompt: 'Ingresa tu GitHub Personal Access Token',
            password: true,
            placeHolder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'El token no puede estar vacío';
                }
                if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
                    return 'El token debe comenzar con ghp_ o github_pat_';
                }
                return null;
            }
        });
        if (!token) {
            return false;
        }
        // Obtener información del usuario
        try {
            const userInfo = await this.fetchUserInfo(token);
            // Verificar si la cuenta ya existe
            const accounts = await this.getAllAccounts();
            const existingAccount = accounts.find(acc => acc.username === userInfo.username);
            if (existingAccount) {
                const update = await vscode.window.showWarningMessage(`La cuenta @${userInfo.username} ya existe. ¿Actualizar token?`, 'Sí', 'No');
                if (update === 'Sí') {
                    existingAccount.token = token;
                    await this.saveAccounts(accounts);
                    await this.setActiveAccount(existingAccount.id);
                    vscode.window.showInformationMessage(`✅ Token actualizado para @${userInfo.username}`);
                    return true;
                }
                return false;
            }
            // Crear nueva cuenta
            const newAccount = {
                id: `${userInfo.username}-${Date.now()}`,
                username: userInfo.username,
                token,
                email: userInfo.email,
                avatarUrl: userInfo.avatarUrl,
                isActive: accounts.length === 0 // Primera cuenta es activa por defecto
            };
            accounts.push(newAccount);
            await this.saveAccounts(accounts);
            if (newAccount.isActive) {
                await this.setActiveAccount(newAccount.id);
            }
            vscode.window.showInformationMessage(`✅ Cuenta agregada: @${userInfo.username}`);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`❌ Error al autenticar: ${error instanceof Error ? error.message : 'Token inválido'}`);
            return false;
        }
    }
    /**
     * Obtiene todas las cuentas almacenadas
     */
    async getAllAccounts() {
        const accountsJson = await this.context.secrets.get(AuthenticationService.ACCOUNTS_KEY);
        if (!accountsJson) {
            return [];
        }
        try {
            const storage = JSON.parse(accountsJson);
            return storage.accounts || [];
        }
        catch {
            return [];
        }
    }
    /**
     * Obtiene la cuenta activa
     */
    async getActiveAccount() {
        const accounts = await this.getAllAccounts();
        const activeId = await this.context.secrets.get(AuthenticationService.ACTIVE_ACCOUNT_KEY);
        if (!activeId) {
            return accounts.length > 0 ? accounts[0] : null;
        }
        return accounts.find(acc => acc.id === activeId) || null;
    }
    /**
     * Obtiene el token de la cuenta activa
     */
    async getToken() {
        const account = await this.getActiveAccount();
        return account?.token;
    }
    /**
     * Obtiene el nombre de usuario de la cuenta activa
     */
    async getUsername() {
        const account = await this.getActiveAccount();
        return account?.username;
    }
    /**
     * Obtiene la configuración de autenticación de la cuenta activa
     */
    async getAuthConfig() {
        const account = await this.getActiveAccount();
        if (!account) {
            return null;
        }
        return {
            token: account.token,
            username: account.username
        };
    }
    /**
     * Verifica si hay alguna cuenta autenticada
     */
    async isAuthenticated() {
        const accounts = await this.getAllAccounts();
        return accounts.length > 0;
    }
    /**
     * Guarda las cuentas en el almacenamiento seguro
     */
    async saveAccounts(accounts) {
        const storage = {
            accounts,
            activeAccountId: await this.context.secrets.get(AuthenticationService.ACTIVE_ACCOUNT_KEY) || null
        };
        await this.context.secrets.store(AuthenticationService.ACCOUNTS_KEY, JSON.stringify(storage));
    }
    /**
     * Establece una cuenta como activa
     */
    async setActiveAccount(accountId) {
        await this.context.secrets.store(AuthenticationService.ACTIVE_ACCOUNT_KEY, accountId);
        const accounts = await this.getAllAccounts();
        accounts.forEach(acc => acc.isActive = acc.id === accountId);
        await this.saveAccounts(accounts);
    }
    /**
     * Cambia entre cuentas
     */
    async switchAccount() {
        const accounts = await this.getAllAccounts();
        if (accounts.length === 0) {
            vscode.window.showInformationMessage('No hay cuentas disponibles. Agrega una cuenta primero.');
            return false;
        }
        if (accounts.length === 1) {
            vscode.window.showInformationMessage('Solo hay una cuenta configurada.');
            return false;
        }
        const activeAccount = await this.getActiveAccount();
        const selected = await vscode.window.showQuickPick(accounts.map(acc => ({
            label: `@${acc.username}`,
            description: acc.email || '',
            detail: acc.id === activeAccount?.id ? '✓ Cuenta activa' : '',
            accountId: acc.id
        })), {
            placeHolder: 'Selecciona una cuenta',
            title: 'Cambiar Cuenta de GitHub'
        });
        if (selected) {
            await this.setActiveAccount(selected.accountId);
            vscode.window.showInformationMessage(`✅ Cambiado a @${accounts.find(a => a.id === selected.accountId)?.username}`);
            return true;
        }
        return false;
    }
    /**
     * Elimina una cuenta
     */
    async removeAccount() {
        const accounts = await this.getAllAccounts();
        if (accounts.length === 0) {
            vscode.window.showInformationMessage('No hay cuentas para eliminar.');
            return false;
        }
        const activeAccount = await this.getActiveAccount();
        const selected = await vscode.window.showQuickPick(accounts.map(acc => ({
            label: `@${acc.username}`,
            description: acc.email || '',
            detail: acc.id === activeAccount?.id ? '✓ Cuenta activa' : '',
            accountId: acc.id
        })), {
            placeHolder: 'Selecciona la cuenta a eliminar',
            title: 'Eliminar Cuenta'
        });
        if (!selected) {
            return false;
        }
        const confirm = await vscode.window.showWarningMessage(`¿Eliminar la cuenta @${accounts.find(a => a.id === selected.accountId)?.username}?`, 'Sí', 'No');
        if (confirm !== 'Sí') {
            return false;
        }
        // Filtrar la cuenta eliminada
        const updatedAccounts = accounts.filter(acc => acc.id !== selected.accountId);
        await this.saveAccounts(updatedAccounts);
        // Si era la cuenta activa, establecer otra
        if (activeAccount?.id === selected.accountId && updatedAccounts.length > 0) {
            await this.setActiveAccount(updatedAccounts[0].id);
        }
        else if (updatedAccounts.length === 0) {
            await this.context.secrets.delete(AuthenticationService.ACTIVE_ACCOUNT_KEY);
        }
        vscode.window.showInformationMessage(`✅ Cuenta eliminada`);
        return true;
    }
    /**
     * Cierra la sesión de la cuenta activa
     */
    async logout() {
        const result = await this.removeAccount();
        if (!result) {
            vscode.window.showInformationMessage('No se eliminó ninguna cuenta');
        }
    }
    /**
     * Elimina todas las cuentas
     */
    async logoutAll() {
        const confirm = await vscode.window.showWarningMessage('¿Cerrar sesión de todas las cuentas?', 'Sí', 'No');
        if (confirm === 'Sí') {
            await this.context.secrets.delete(AuthenticationService.ACCOUNTS_KEY);
            await this.context.secrets.delete(AuthenticationService.ACTIVE_ACCOUNT_KEY);
            vscode.window.showInformationMessage('✅ Todas las sesiones cerradas');
        }
    }
    /**
     * Solicita autenticación si no está autenticado
     */
    async ensureAuthenticated() {
        const isAuth = await this.isAuthenticated();
        if (isAuth) {
            return true;
        }
        const choice = await vscode.window.showWarningMessage('Debes autenticarte con GitHub para usar esta función', 'Autenticar', 'Cancelar');
        if (choice === 'Autenticar') {
            return await this.authenticate();
        }
        return false;
    }
    /**
     * Obtiene información del usuario desde GitHub usando el token
     */
    async fetchUserInfo(token) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            if (!response.ok) {
                throw new Error('Token inválido o sin permisos adecuados');
            }
            const data = await response.json();
            return {
                username: data.login,
                email: data.email,
                avatarUrl: data.avatar_url
            };
        }
        catch (error) {
            console.error('Error al obtener información del usuario:', error);
            throw error;
        }
    }
}
exports.AuthenticationService = AuthenticationService;
AuthenticationService.ACCOUNTS_KEY = 'githubTaskFlow.accounts';
AuthenticationService.ACTIVE_ACCOUNT_KEY = 'githubTaskFlow.activeAccountId';
//# sourceMappingURL=authService.js.map