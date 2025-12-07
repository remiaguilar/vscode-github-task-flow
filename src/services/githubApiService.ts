import { graphql } from '@octokit/graphql';
import {
  GitHubProject,
  GitHubTask,
  CustomFieldDefinition,
  ProjectData,
  CreateTaskParams,
  UpdateTaskFieldParams,
  CustomFieldType,
  CustomFieldOption
} from '../types';

/**
 * Servicio para interactuar con la API GraphQL de GitHub
 */
export class GitHubApiService {
  private graphqlClient: typeof graphql;

  constructor(token: string) {
    this.graphqlClient = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  /**
   * Obtiene todos los proyectos del usuario autenticado
   */
  async fetchProjects(): Promise<GitHubProject[]> {
    const query = `
      query {
        viewer {
          projectsV2(first: 100) {
            nodes {
              id
              number
              title
              url
              shortDescription
              public
              closed
              owner {
                ... on User {
                  login
                }
                ... on Organization {
                  login
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response: any = await this.graphqlClient(query);
      const projects = response.viewer.projectsV2.nodes;

      return projects.map((project: any) => ({
        id: project.id,
        number: project.number,
        title: project.title,
        url: project.url,
        shortDescription: project.shortDescription,
        public: project.public,
        closed: project.closed,
        owner: {
          login: project.owner.login
        }
      }));
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      throw new Error(`No se pudieron cargar los proyectos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene todas las tareas y campos personalizados de un proyecto
   */
  async fetchProjectData(projectId: string): Promise<ProjectData> {
    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            id
            number
            title
            url
            shortDescription
            public
            closed
            owner {
              ... on User {
                login
              }
              ... on Organization {
                login
              }
            }
            fields(first: 50) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                    color
                  }
                }
                ... on ProjectV2IterationField {
                  id
                  name
                  dataType
                }
              }
            }
            items(first: 100) {
              nodes {
                id
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue {
                      text
                      field {
                        ... on ProjectV2Field {
                          id
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldNumberValue {
                      number
                      field {
                        ... on ProjectV2Field {
                          id
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      date
                      field {
                        ... on ProjectV2Field {
                          id
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          id
                          name
                        }
                      }
                    }
                  }
                }
                content {
                  __typename
                  ... on Issue {
                    id
                    number
                    title
                    body
                    url
                    state
                    repository {
                      name
                      owner {
                        login
                      }
                    }
                    assignees(first: 10) {
                      nodes {
                        login
                        avatarUrl
                        url
                      }
                    }
                  }
                  ... on DraftIssue {
                    id
                    title
                    body
                    assignees(first: 10) {
                      nodes {
                        login
                        avatarUrl
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response: any = await this.graphqlClient(query, { projectId });
      const project = response.node;

      // Procesar campos personalizados
      const customFields: CustomFieldDefinition[] = project.fields.nodes.map((field: any) => ({
        id: field.id,
        name: field.name,
        dataType: field.dataType as CustomFieldType,
        options: field.options?.map((opt: any) => ({
          id: opt.id,
          name: opt.name,
          color: opt.color
        }))
      }));

      // Procesar tareas (Issues y DraftIssues)
      const tasks: GitHubTask[] = project.items.nodes
        .filter((item: any) => item.content && (item.content.__typename === 'Issue' || item.content.__typename === 'DraftIssue'))
        .map((item: any) => {
          const content = item.content;
          const isDraft = content.__typename === 'DraftIssue';
          
          // Procesar valores de campos personalizados
          const customFieldValues = item.fieldValues.nodes
            .filter((fv: any) => fv.field)
            .map((fv: any) => ({
              fieldId: fv.field.id,
              fieldName: fv.field.name,
              fieldType: customFields.find(cf => cf.id === fv.field.id)?.dataType || 'TEXT',
              value: fv.text || fv.number || fv.date || fv.name || null
            }));

          return {
            id: content.id,
            number: isDraft ? 0 : content.number,
            title: content.title,
            body: content.body,
            url: isDraft ? '' : content.url,
            state: isDraft ? 'DRAFT' : content.state,
            projectItemId: item.id,
            repository: isDraft ? undefined : {
              name: content.repository.name,
              owner: content.repository.owner.login
            },
            assignees: content.assignees.nodes.map((assignee: any) => ({
              login: assignee.login,
              avatarUrl: assignee.avatarUrl,
              url: assignee.url
            })),
            customFields: customFieldValues
          };
        });

      return {
        project: {
          id: project.id,
          number: project.number,
          title: project.title,
          url: project.url,
          shortDescription: project.shortDescription,
          public: project.public,
          closed: project.closed,
          owner: {
            login: project.owner.login
          }
        },
        tasks,
        customFields
      };
    } catch (error) {
      console.error('Error al obtener datos del proyecto:', error);
      throw new Error(`No se pudieron cargar los datos del proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualiza el valor de un campo personalizado de una tarea
   */
  async updateTaskField(params: UpdateTaskFieldParams): Promise<void> {
    const mutation = `
      mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: $projectId
            itemId: $itemId
            fieldId: $fieldId
            value: $value
          }
        ) {
          projectV2Item {
            id
          }
        }
      }
    `;

    try {
      // Nota: Necesitaremos el projectId también, se puede agregar a los params
      await this.graphqlClient(mutation, {
        itemId: params.projectItemId,
        fieldId: params.fieldId,
        value: params.value
      });
    } catch (error) {
      console.error('Error al actualizar campo:', error);
      throw new Error(`No se pudo actualizar el campo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crea una nueva tarea (Issue) y la añade a un proyecto
   * Si no hay repositorio, crea un draft item directamente en el proyecto
   */
  async createIssue(params: CreateTaskParams): Promise<GitHubTask> {
    // Si no hay repositorio, crear un draft item
    if (!params.repositoryOwner || !params.repositoryName) {
      return this.createDraftIssue(params);
    }

    // Crear Issue en repositorio
    const createIssueMutation = `
      mutation($repositoryId: ID!, $title: String!, $body: String, $assigneeIds: [ID!]) {
        createIssue(input: {
          repositoryId: $repositoryId
          title: $title
          body: $body
          assigneeIds: $assigneeIds
        }) {
          issue {
            id
            number
            title
            body
            url
            state
            repository {
              name
              owner {
                login
              }
            }
            assignees(first: 10) {
              nodes {
                login
                avatarUrl
                url
              }
            }
          }
        }
      }
    `;

    try {
      // Primero necesitamos obtener el repositoryId
      const repoId = await this.getRepositoryId(params.repositoryOwner, params.repositoryName);

      const response: any = await this.graphqlClient(createIssueMutation, {
        repositoryId: repoId,
        title: params.title,
        body: params.body || '',
        assigneeIds: params.assignees || []
      });

      const issue = response.createIssue.issue;

      // Si hay un projectId, añadir el issue al proyecto
      if (params.projectId) {
        await this.addIssueToProject(params.projectId, issue.id);
      }

      return {
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        url: issue.url,
        state: issue.state,
        repository: {
          name: issue.repository.name,
          owner: issue.repository.owner.login
        },
        assignees: issue.assignees.nodes.map((assignee: any) => ({
          login: assignee.login,
          avatarUrl: assignee.avatarUrl,
          url: assignee.url
        })),
        customFields: []
      };
    } catch (error) {
      console.error('Error al crear issue:', error);
      throw new Error(`No se pudo crear la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crea un draft issue (borrador) directamente en el proyecto sin repositorio
   */
  private async createDraftIssue(params: CreateTaskParams): Promise<GitHubTask> {
    const mutation = `
      mutation($projectId: ID!, $title: String!, $body: String!) {
        addProjectV2DraftIssue(input: {
          projectId: $projectId
          title: $title
          body: $body
        }) {
          projectItem {
            id
            content {
              ... on DraftIssue {
                id
                title
                body
              }
            }
          }
        }
      }
    `;

    try {
      const response: any = await this.graphqlClient(mutation, {
        projectId: params.projectId,
        title: params.title,
        body: params.body || ''
      });

      const item = response.addProjectV2DraftIssue.projectItem;
      const draft = item.content;

      return {
        id: draft.id,
        number: 0, // Los drafts no tienen número
        title: draft.title,
        body: draft.body || '',
        url: '', // Los drafts no tienen URL hasta convertirse en issues
        state: 'DRAFT',
        assignees: [],
        customFields: []
      };
    } catch (error) {
      console.error('Error al crear draft issue:', error);
      throw new Error(`No se pudo crear la tarea borrador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene el ID de un repositorio
   */
  private async getRepositoryId(owner: string, name: string): Promise<string> {
    const query = `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
        }
      }
    `;

    const response: any = await this.graphqlClient(query, { owner, name });
    return response.repository.id;
  }

  /**
   * Añade un issue a un proyecto
   */
  private async addIssueToProject(projectId: string, issueId: string): Promise<void> {
    const mutation = `
      mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {
          projectId: $projectId
          contentId: $contentId
        }) {
          item {
            id
          }
        }
      }
    `;

    await this.graphqlClient(mutation, { projectId, contentId: issueId });
  }
}
