/**
 * Tipos y estructuras de datos para GitHub Task Flow
 */

/**
 * Proyecto de GitHub
 */
export interface GitHubProject {
  id: string;
  number: number;
  title: string;
  url: string;
  shortDescription?: string;
  public: boolean;
  closed: boolean;
  repository?: {
    name: string;
    owner: string;
  };
  organization?: {
    login: string;
  };
  owner: {
    login: string;
  };
}

/**
 * Tarea (Issue) de GitHub Project
 */
export interface GitHubTask {
  id: string;
  number: number;
  title: string;
  body?: string;
  url: string;
  state: 'OPEN' | 'CLOSED' | 'DRAFT';
  assignees: TaskAssignee[];
  repository?: {
    name: string;
    owner: string;
  };
  customFields: CustomFieldValue[];
  projectItemId?: string; // ID del item en el project
}

/**
 * Asignatario de una tarea
 */
export interface TaskAssignee {
  login: string;
  avatarUrl?: string;
  url: string;
}

/**
 * Valor de un campo personalizado
 */
export interface CustomFieldValue {
  fieldId: string;
  fieldName: string;
  fieldType: CustomFieldType;
  value: string | number | Date | null;
}

/**
 * Tipos de campos personalizados soportados
 */
export type CustomFieldType = 
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'SINGLE_SELECT'
  | 'ITERATION'
  | 'TITLE'
  | 'ASSIGNEES'
  | 'LABELS'
  | 'REPOSITORY'
  | 'MILESTONE';

/**
 * Definición de campo personalizado
 */
export interface CustomFieldDefinition {
  id: string;
  name: string;
  dataType: CustomFieldType;
  options?: CustomFieldOption[];
}

/**
 * Opción de un campo de selección
 */
export interface CustomFieldOption {
  id: string;
  name: string;
  color?: string;
}

/**
 * Filtros para tareas
 */
export interface TaskFilter {
  assignee?: string;
  workType?: string; // Tipo de Trabajo
  status?: string;
  priority?: string;
  module?: string;
  searchText?: string;
}

/**
 * Datos completos de un proyecto con sus tareas
 */
export interface ProjectData {
  project: GitHubProject;
  tasks: GitHubTask[];
  customFields: CustomFieldDefinition[];
}

/**
 * Parámetros para crear una nueva tarea
 */
export interface CreateTaskParams {
  title: string;
  body?: string;
  repositoryOwner: string;
  repositoryName: string;
  assignees?: string[];
  projectId?: string;
  customFieldValues?: {
    fieldId: string;
    value: string | number;
  }[];
}

/**
 * Parámetros para actualizar un campo de tarea
 */
export interface UpdateTaskFieldParams {
  projectItemId: string;
  fieldId: string;
  value: string | number | null;
}

/**
 * Configuración de autenticación
 */
export interface AuthConfig {
  token: string;
  username?: string;
}

/**
 * Cuenta de GitHub guardada
 */
export interface GitHubAccount {
  id: string;
  username: string;
  token: string;
  email?: string;
  avatarUrl?: string;
  isActive: boolean;
}

/**
 * Almacenamiento de cuentas múltiples
 */
export interface AccountsStorage {
  accounts: GitHubAccount[];
  activeAccountId: string | null;
}
