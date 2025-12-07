# GitHub Task Flow

Gestión minimalista de GitHub Projects v2 integrado con Git en VS Code.

## Funcionalidad

**Vista: GitHub Task Flow**
- Tree view: Cuentas → Proyectos → Tareas
- Multi-cuenta con soporte para múltiples tokens
- Autenticación con GitHub (OAuth + Secret Storage)
- Sin clicks automáticos - solo menú contextual

**Gestión de Tareas:**
- Ver tareas por proyecto
- Crear/editar/eliminar tareas
- Abrir tarea en GitHub (navegador)

**Integración Git:**
- Crear rama desde tarea: `feature/123-titulo`
- Switch entre ramas de tareas

## Estructura Vista

```
📋 GitHub Task Flow
  └─ 👤 usuario1
      └─ 🗂️ Proyecto Web
          ├─ #123 Implementar login
          ├─ #124 Bug en navbar
          └─ #125 Docs
```

## Comandos

**Gestión de Cuentas:**
- **Gestionar Cuentas** - Agregar/cambiar/eliminar cuentas GitHub
- **Refrescar** - Sincronizar proyectos de todas las cuentas

**Tareas (menú contextual):**
- **Crear Tarea** - Nueva tarea en proyecto (click derecho en proyecto)
- **Abrir en GitHub** - Ver tarea en navegador (click derecho en tarea)
- **Crear Rama** - Branch desde tarea (click derecho en tarea)
- **Editar Tarea** - Modificar título/descripción/estado (click derecho en tarea)
- **Eliminar Tarea** - Cerrar tarea (click derecho en tarea)

**Git:**
- **Ir a Rama de Tarea** - Switch a rama existente

## Personal Access Token

**Permisos requeridos:**
- `repo` - Acceso a repositorios
- `project` - Acceso a Projects
- `read:org` - Leer organizaciones

**Crear token:** GitHub → Settings → Developer settings → Personal access tokens

## Autor

**Remi Aguilar**
- Website: [remiaguilar.com](https://remiaguilar.com)
- GitHub: [@remiaguilar](https://github.com/remiaguilar)

## Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

## Contribuciones

Este proyecto es open source. Contribuciones, issues y sugerencias son bienvenidas.

Si encuentras un bug o tienes una idea para mejorar la extensión, por favor abre un [issue](https://github.com/remiaguilar/vs-notes/issues).

Presiona `F5` en VS Code o:
- Run → Start Debugging

### 3. Configurar

1. En la ventana de extensión: `Cmd+Shift+P` (Mac) o `Ctrl+Shift+P` (Win/Linux)
2. Busca: `GitHub Task Flow: Autenticar con GitHub`
3. Ingresa tu Personal Access Token
4. ¡Listo! Tus proyectos se cargarán automáticamente

### 4. Usar

- **Ver proyectos**: Click en el icono en la barra lateral
- **Abrir tareas**: Click en un proyecto
- **Crear rama**: Botón "🌿 Crear Rama" en la tarea
- **Crear tarea**: Selecciona código → Click derecho → Crear tarea

---

## 📋 Requisitos

- **VS Code**: 1.85.0 o superior
- **Node.js**: 18.x o superior
- **GitHub Token**: Personal Access Token con permisos:
  - ✅ `repo` - Acceso completo a repositorios
  - ✅ `project` - Acceso a GitHub Projects
  - ✅ `write:org` - Para proyectos de organización

### Crear GitHub Token

1. Ve a: https://github.com/settings/tokens
2. Click: "Generate new token (classic)"
3. Nombre: `VS Code Task Flow`
4. Selecciona los scopes mencionados arriba
5. Genera y copia el token (¡solo se muestra una vez!)

---

## 🎯 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `GitHub Task Flow: Autenticar con GitHub` | Inicia sesión con tu token |
| `GitHub Task Flow: Actualizar Proyectos` | Refresca la lista de proyectos |
| `GitHub Task Flow: Mostrar Panel de Tareas` | Abre el panel de gestión |
| `GitHub Task Flow: Crear Rama desde Tarea` | Crea y cambia a nueva rama |
| `GitHub Task Flow: Abrir Tarea en GitHub` | Abre el issue en el navegador |
| `GitHub Task Flow: Crear Tarea desde Selección` | Nueva tarea con código |
| `GitHub Task Flow: Ir a Rama de Tarea` | Navega a rama existente |
| `GitHub Task Flow: Cerrar Sesión` | Elimina credenciales |

---

## 📚 Documentación Completa

- **[QUICKSTART.md](QUICKSTART.md)** - Guía de inicio en 5 minutos
- **[SETUP.md](SETUP.md)** - Instalación y configuración detallada
- **[EXAMPLES.md](EXAMPLES.md)** - Casos de uso y patrones comunes
- **[CHANGELOG.md](CHANGELOG.md)** - Historial de versiones
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Resumen técnico completo

---

## 💡 Casos de Uso

### Desarrollador Individual
- Gestiona tus propias tareas sin salir de VS Code
- Crea ramas automáticamente con convención de nombres
- Documenta código problemático creando tareas

### Equipos Pequeños
- Coordinación de tareas desde el editor
- Asignación rápida de bugs encontrados en code review
- Vinculación de código con issues

### Proyectos Grandes
- Filtrado avanzado por módulo, tipo y prioridad
- Gestión de múltiples proyectos simultáneos
- Integración con flujo Git existente

---

## 🔧 Desarrollo

### Modo Watch (Desarrollo Continuo)

```bash
npm run watch
```

Recompila automáticamente al guardar cambios.

### Debug

1. Abre el proyecto en VS Code
2. Pon breakpoints en el código
3. Presiona `F5`
4. Prueba en la ventana de extensión

### Estructura del Código

```
src/
├── extension.ts              # Punto de entrada
├── types.ts                  # Tipos TypeScript
├── projectsProvider.ts       # Vista de árbol
├── services/
│   ├── authService.ts        # Autenticación
│   ├── githubApiService.ts   # API GraphQL
│   └── gitWorkflowService.ts # Operaciones Git
└── webview/
    └── taskPanelProvider.ts  # Panel de tareas
```

---

## 🐛 Solución de Problemas

### "No se cargan los proyectos"
- Verifica que tu token tenga los permisos correctos
- Ejecuta "Refrescar Proyectos"
- Intenta cerrar sesión y volver a autenticarte

### "Error al crear rama"
- Asegúrate de tener un repositorio Git en el workspace
- Confirma o haz stash de cambios pendientes
- Verifica que Git esté instalado

### "Cannot find module..."
```bash
rm -rf node_modules package-lock.json
npm install
npm run compile
```

Más soluciones en [SETUP.md](SETUP.md#solución-de-problemas)

---

## 📦 Publicación

### Empaquetar

```bash
npm install -g @vscode/vsce
vsce package
```

Genera: `github-task-flow-0.0.1.vsix`

### Instalar Localmente

```bash
code --install-extension github-task-flow-0.0.1.vsix
```

### Publicar en Marketplace

```bash
vsce publish
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Abre un Pull Request

### Áreas para Contribuir

- 🎨 Mejoras de UI/UX
- 📝 Documentación y ejemplos
- 🐛 Corrección de bugs
- ✨ Nuevas características
- 🧪 Tests automatizados
- 🌍 Traducciones

---

## 📊 Estado del Proyecto

- ✅ **Versión**: 0.0.1
- ✅ **Estado**: Producción Ready
- ✅ **Tests**: Manual (automatización pendiente)
- ✅ **Documentación**: Completa
- ✅ **Licencia**: MIT

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- VS Code Extension API
- Octokit GraphQL
- GitHub Projects v2
- Comunidad de VS Code

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/github-task-flow/issues)
- **Documentación**: Ver archivos `.md` en el repositorio
- **Ejemplos**: [EXAMPLES.md](EXAMPLES.md)

---

**Hecho con ❤️ para mejorar tu flujo de trabajo con GitHub Projects**

*¿Te gusta el proyecto? Dale una ⭐ en GitHub!*
