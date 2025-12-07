# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.0.1] - 2025-12-07

### Agregado
- ✨ Sistema de autenticación con GitHub mediante Personal Access Token
- 🔒 Almacenamiento seguro de credenciales usando VS Code Secret Storage
- 📋 Vista de árbol de proyectos en la barra lateral
- 📊 Panel WebView para gestión detallada de tareas
- 🔍 Filtrado avanzado de tareas por:
  - Tipo de Trabajo
  - Estado (Abierto/Cerrado)
  - Búsqueda por texto
- 🌿 Creación automática de ramas Git desde tareas
- 📝 Crear tareas de GitHub desde código seleccionado
- 🎨 Soporte completo para campos personalizados de GitHub Projects
- 🔄 Sincronización con GitHub Projects v2
- 🌐 Integración con la API GraphQL de GitHub
- 📱 Comandos:
  - `githubTaskFlow.authenticate` - Autenticar con GitHub
  - `githubTaskFlow.refreshProjects` - Refrescar proyectos
  - `githubTaskFlow.showTaskPanel` - Mostrar panel de tareas
  - `githubTaskFlow.createBranchFromTask` - Crear rama desde tarea
  - `githubTaskFlow.openTaskInBrowser` - Abrir tarea en GitHub
  - `githubTaskFlow.addTaskFromSelection` - Crear tarea desde código
  - `githubTaskFlow.goToTaskBranch` - Navegar a rama de tarea
  - `githubTaskFlow.logout` - Cerrar sesión

### Características Principales

#### Gestión de Proyectos
- Visualización de todos los GitHub Projects del usuario
- Carga automática de tareas al expandir proyecto
- Información de asignatarios y estados
- Soporte para campos personalizados (Prioridad, Tipo de Trabajo, Módulo, etc.)

#### Flujo de Trabajo Git
- Generación inteligente de nombres de rama basados en:
  - Número de issue
  - Título de tarea
  - Tipo de trabajo (feature, bugfix, hotfix, docs, chore)
- Manejo automático de cambios sin confirmar (stash)
- Navegación entre ramas de tareas

#### Panel de Tareas
- Interfaz limpia y minimalista con estilos de VS Code
- Tarjetas de tareas con información clave
- Filtrado en tiempo real
- Acciones rápidas:
  - Crear rama
  - Abrir en GitHub
  - Ver detalles

#### Creación de Tareas
- Desde código seleccionado en el editor
- Inclusión automática del código en la descripción
- Selección de proyecto destino
- Vinculación automática al proyecto

### Técnico
- Arquitectura modular con servicios separados:
  - `AuthenticationService` - Gestión de autenticación
  - `GitHubApiService` - Comunicación con API de GitHub
  - `GitWorkflowService` - Operaciones Git
  - `ProjectsProvider` - Provider de vista de árbol
  - `TaskPanelProvider` - Panel WebView
- TypeScript con tipado estricto
- Soporte para VS Code 1.85.0+
- Integración con extensión Git de VS Code
- Manejo robusto de errores
- Validación de entrada de usuario

### Documentación
- README.md completo con características y uso básico
- SETUP.md con guía detallada de instalación y configuración
- EXAMPLES.md con casos de uso y patrones comunes
- Comentarios JSDoc en todo el código

### Pendiente para Futuras Versiones
- [ ] Soporte para GitHub Enterprise
- [ ] Sincronización bidireccional de campos personalizados
- [ ] Vista de tablero Kanban en la WebView
- [ ] Notificaciones de cambios en tareas
- [ ] Plantillas de tareas personalizables
- [ ] Estadísticas y métricas de productividad
- [ ] Integración con GitHub Actions
- [ ] Modo offline con sincronización
- [ ] Atajos de teclado personalizables
- [ ] Temas personalizados para el panel
- [ ] Exportación de tareas a diferentes formatos
- [ ] Integración con otras herramientas (Jira, Trello, etc.)

[0.0.1]: https://github.com/tu-usuario/github-task-flow/releases/tag/v0.0.1
