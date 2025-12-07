# Guía de Configuración - GitHub Task Flow

## Requisitos Previos

1. **VS Code** versión 1.85.0 o superior
2. **Node.js** versión 18 o superior
3. **GitHub Personal Access Token** con los siguientes permisos:
   - `repo` (acceso completo a repositorios)
   - `project` (acceso a GitHub Projects)
   - `write:org` (si trabajas con proyectos de organización)

## Instalación

### 1. Instalar Dependencias

```bash
cd github-task-flow
npm install
```

### 2. Compilar la Extensión

```bash
npm run compile
```

O para desarrollo continuo:

```bash
npm run watch
```

### 3. Ejecutar en Modo Debug

1. Abre el proyecto en VS Code
2. Presiona `F5` o ve a Run > Start Debugging
3. Se abrirá una nueva ventana de VS Code con la extensión cargada

## Configuración Inicial

### Crear un Personal Access Token

1. Ve a GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token (classic)"
3. Nombre: `VS Code Task Flow`
4. Selecciona los siguientes scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `project` (Full control of projects)
   - ✅ `write:org` (Read and write org and team membership)
5. Click en "Generate token"
6. **IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)

### Autenticar en la Extensión

1. En VS Code, abre la paleta de comandos (`Cmd+Shift+P` en Mac, `Ctrl+Shift+P` en Windows/Linux)
2. Busca y ejecuta: `GitHub Task Flow: Autenticar con GitHub`
3. Pega tu Personal Access Token
4. Presiona Enter

¡Listo! La extensión cargará automáticamente tus proyectos.

## Configuración de GitHub Projects

### Estructura Recomendada

Para aprovechar al máximo la extensión, configura tus GitHub Projects con estos campos personalizados:

1. **Tipo de Trabajo** (Single Select)
   - Opciones: Administrativa, Desarrollo, Bug, Hotfix, Documentación

2. **Prioridad** (Single Select)
   - Opciones: Alta, Media, Baja, Crítica

3. **Módulo** (Single Select)
   - Define los módulos según tu proyecto

4. **Tiempo Estimado** (Number)
   - En horas o días

5. **Fecha Límite** (Date)

6. **Estado** (Status)
   - Se mapea automáticamente a las columnas del proyecto

### Crear Campos Personalizados en GitHub

1. Ve a tu GitHub Project
2. Click en el ícono de configuración (engranaje)
3. En "Fields", click en "+ New field"
4. Configura cada campo según la estructura recomendada arriba

## Uso Básico

### Ver Proyectos

1. Click en el ícono de GitHub Task Flow en la barra lateral
2. Verás la lista de todos tus proyectos
3. Expande un proyecto para ver sus tareas

### Gestionar Tareas

1. Click en un proyecto para abrir el panel de tareas
2. Usa los filtros para encontrar tareas específicas:
   - Buscar por texto
   - Filtrar por Tipo de Trabajo
   - Filtrar por Estado

### Crear Rama desde Tarea

1. En el panel de tareas, click en el botón "🌿 Crear Rama"
2. La extensión generará automáticamente un nombre de rama siguiendo el patrón:
   - `feature/#123-titulo-de-tarea`
   - `bugfix/#456-corregir-error`
   - etc.

### Crear Tarea desde Código

1. Selecciona un fragmento de código en el editor
2. Click derecho → "GitHub Task Flow: Crear Tarea desde Selección"
3. Ingresa el título de la tarea
4. Selecciona el proyecto destino
5. El código seleccionado se incluirá en la descripción de la tarea

## Atajos de Teclado Sugeridos

Puedes agregar estos atajos en VS Code (File > Preferences > Keyboard Shortcuts):

```json
[
  {
    "key": "cmd+shift+g t",
    "command": "githubTaskFlow.showTaskPanel",
    "when": "editorTextFocus"
  },
  {
    "key": "cmd+shift+g n",
    "command": "githubTaskFlow.addTaskFromSelection",
    "when": "editorHasSelection"
  },
  {
    "key": "cmd+shift+g r",
    "command": "githubTaskFlow.refreshProjects"
  }
]
```

## Convenciones de Nombres de Rama

La extensión genera nombres de rama automáticamente siguiendo estas reglas:

- **Feature**: `feature/#123-titulo-tarea`
- **Bug**: `bugfix/#456-descripcion-bug`
- **Hotfix**: `hotfix/#789-parche-critico`
- **Documentación**: `docs/#012-actualizar-readme`
- **Administrativa**: `chore/#345-tarea-admin`

El prefijo se determina automáticamente basándose en el campo "Tipo de Trabajo".

## Solución de Problemas

### "No se pudieron cargar los proyectos"

- Verifica que tu token tenga los permisos correctos
- Comprueba tu conexión a Internet
- Intenta cerrar sesión y volver a autenticarte

### "No hay repositorio Git abierto"

- Asegúrate de tener un workspace con un repositorio Git inicializado
- Ejecuta `git init` si es necesario

### "Error al crear rama"

- Verifica que no tengas cambios sin confirmar
- La extensión te preguntará si deseas hacer stash de los cambios

### Errores de Compilación

```bash
# Limpiar y reinstalar dependencias
rm -rf node_modules out
npm install
npm run compile
```

## Desarrollo Avanzado

### Estructura del Proyecto

```
github-task-flow/
├── src/
│   ├── extension.ts           # Punto de entrada
│   ├── types.ts               # Definiciones de tipos
│   ├── projectsProvider.ts    # Provider de vista de árbol
│   ├── services/
│   │   ├── authService.ts     # Autenticación
│   │   ├── githubApiService.ts # API de GitHub
│   │   └── gitWorkflowService.ts # Operaciones Git
│   └── webview/
│       └── taskPanelProvider.ts # Panel WebView
├── resources/
│   └── icon.svg               # Icono de la extensión
└── package.json               # Manifest
```

### Agregar Nuevos Comandos

1. Edita `package.json` → `contributes.commands`
2. Implementa el comando en `src/extension.ts`
3. Registra el comando en `registerCommands()`

### Personalizar la WebView

Edita `src/webview/taskPanelProvider.ts` → método `getWebviewContent()`

## Publicación

Para empaquetar la extensión:

```bash
npm install -g @vscode/vsce
vsce package
```

Esto generará un archivo `.vsix` que puedes instalar o publicar en el marketplace.

## Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/github-task-flow/issues)
- **Documentación**: Este archivo y el README.md

## Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.
