# Ejemplos de Uso - GitHub Task Flow

## Casos de Uso Comunes

### 1. Flujo de Trabajo Diario

#### Mañana: Revisar Tareas del Día

```
1. Abre VS Code
2. Click en el ícono de GitHub Task Flow en la barra lateral
3. Expande tu proyecto actual
4. Revisa las tareas asignadas a ti
```

#### Comenzar a Trabajar en una Tarea

```
1. En el panel de tareas, filtra por "Tipo de Trabajo: Desarrollo"
2. Encuentra la tarea con mayor prioridad
3. Click en "🌿 Crear Rama"
4. La extensión:
   - Crea una rama: `feature/123-implementar-login`
   - Cambia automáticamente a esa rama
   - Guarda tus cambios actuales en stash (si los hay)
```

### 2. Gestión de Bugs

#### Cuando Encuentras un Bug en el Código

```
1. Selecciona el código problemático
2. Click derecho → "GitHub Task Flow: Crear Tarea desde Selección"
3. Título: "Fix: Error en validación de email"
4. Selecciona el proyecto
5. La tarea se crea con:
   - El código seleccionado en la descripción
   - Referencia al archivo
   - Listo para ser categorizado como "Bug"
```

#### Trabajar en el Bug

```
1. Ve a GitHub Projects y marca la tarea como "Bug"
2. Asigna prioridad "Alta"
3. De vuelta en VS Code, refresca los proyectos
4. Crea la rama desde la tarea: `bugfix/456-fix-email-validation`
```

### 3. Revisión de Código y Documentación

#### Encontrar Código que Necesita Documentación

```
1. Mientras revisas código, selecciona una función compleja
2. Click derecho → "Crear Tarea desde Selección"
3. Título: "Docs: Documentar función calculateTax"
4. En GitHub, categoriza como "Documentación"
5. Asigna a un compañero o a ti mismo
```

### 4. Planificación de Sprint

#### Filtrar Tareas para el Sprint

```
1. Abre el panel de tareas de tu proyecto
2. Filtra por "Tipo de Trabajo: Desarrollo"
3. Ordena mentalmente por "Prioridad: Alta"
4. Para cada tarea:
   - Estima el tiempo (actualiza en GitHub)
   - Asigna a miembros del equipo
   - Crea ramas para las que empezarás hoy
```

### 5. Trabajo con Múltiples Proyectos

#### Cambiar Entre Proyectos

```
Proyecto A (Frontend):
1. Click en "Proyecto Frontend"
2. Filtra por "Módulo: Componentes"
3. Trabaja en tarea de componentes
4. Crea rama: `feature/789-nuevo-componente`

Proyecto B (Backend):
1. Cmd+Shift+P → "GitHub Task Flow: Mostrar Panel de Tareas"
2. Selecciona "Proyecto Backend"
3. Filtra por "Tipo: Bug"
4. Arregla bug crítico
5. Crea rama: `hotfix/012-fix-api-crash`
```

## Patrones de Uso Avanzados

### Patrón 1: Revisión de PR con Tareas

```
Cuando revisas un PR:

1. Identifica mejoras o issues
2. Selecciona el código en cuestión
3. Crea tarea con contexto del PR
4. Añade en el título: "[PR#123] Refactor needed"
5. La tarea queda vinculada al contexto del PR
```

### Patrón 2: Hotfix Urgente

```
1. Recibe reporte de bug crítico
2. Cmd+Shift+P → "Crear Tarea desde Selección"
3. O crea manualmente en GitHub con alta prioridad
4. En VS Code:
   - Refresca proyectos
   - Encuentra la tarea
   - Crea rama: `hotfix/999-critical-fix`
5. Trabaja el fix
6. Push y PR con referencia a la tarea
```

### Patrón 3: Tareas de Investigación

```
Para tareas de investigación o spike:

1. Crea tarea en GitHub: "Research: Evaluar librería X"
2. Tipo: Administrativa
3. En VS Code:
   - Crea rama: `chore/888-research-library-x`
4. Crea archivos de notas/ejemplos
5. Documenta hallazgos en el código
6. Actualiza la tarea con conclusiones
```

## Integraciones con Git

### Commits Vinculados a Tareas

Después de crear rama desde tarea:

```bash
# La rama se llama: feature/123-nueva-funcionalidad
git add .
git commit -m "feat: implementa nueva funcionalidad

- Añade componente X
- Actualiza servicio Y
- Tests incluidos

Refs #123"
```

El `#123` vincula el commit a la tarea de GitHub.

### Pull Requests Automáticos

```bash
# Después de terminar el trabajo en la rama
git push origin feature/123-nueva-funcionalidad

# Luego en GitHub:
# El PR se puede auto-titular basado en la rama
# Automáticamente vincula al issue #123
```

## Tips y Trucos

### Tip 1: Búsqueda Rápida

En el panel de tareas, usa el campo de búsqueda:
- `login` - Encuentra todas las tareas relacionadas con login
- `#123` - Busca por número de issue
- `auth` - Encuentra issues de autenticación

### Tip 2: Prefiltros Útiles

Crea estas vistas mentales:
- **Mis Tareas**: Filtra por tu nombre
- **Bugs Críticos**: Tipo: Bug + Búsqueda: "crítico" o "critical"
- **Listo Para Empezar**: Estado: Open + Sin asignar

### Tip 3: Nombres de Rama Personalizados

Si el nombre auto-generado no te gusta:
1. Deja que la extensión cree la rama
2. Luego renómbrala manualmente: `git branch -m nuevo-nombre`

### Tip 4: Sincronización

Refresca regularmente:
- Después de reuniones de planning
- Antes de comenzar el día
- Después de que alguien actualice tareas

### Tip 5: Campos Personalizados Clave

Los más útiles:
- **Tipo de Trabajo**: Para filtrar y agrupar
- **Prioridad**: Para decidir qué hacer primero
- **Tiempo Estimado**: Para planning
- **Fecha Límite**: Para deadlines

## Flujo Completo: Desde Idea hasta Deploy

```
1. IDEA
   - Encuentras algo que mejorar en el código
   - Seleccionas el código relevante
   - Creas tarea desde selección

2. PLANIFICACIÓN
   - En GitHub, añades campos personalizados:
     * Tipo: Desarrollo
     * Prioridad: Media
     * Tiempo: 3 horas
     * Módulo: Auth
   
3. DESARROLLO
   - En VS Code, refrescas proyectos
   - Encuentras tu tarea
   - Creas rama: `feature/456-mejora-auth`
   - Trabajas en el código
   
4. COMMIT
   git commit -m "feat: mejora sistema auth
   
   - Optimiza validación
   - Añade tests
   
   Refs #456"
   
5. PUSH & PR
   git push origin feature/456-mejora-auth
   - Creas PR en GitHub
   - PR se vincula automáticamente a issue #456
   
6. REVISIÓN
   - Equipo revisa
   - Si encuentran issues, repiten flujo (paso 1)
   
7. MERGE
   - PR aprobado y mergeado
   - Issue #456 se cierra automáticamente
   
8. LIMPIEZA
   git checkout main
   git pull
   git branch -d feature/456-mejora-auth
```

## Comandos Rápidos de Referencia

| Comando | Atajo Sugerido | Uso |
|---------|----------------|-----|
| Mostrar Panel | `Cmd+Shift+G T` | Ver tareas de proyecto |
| Crear desde Selección | `Cmd+Shift+G N` | Nueva tarea con código |
| Refrescar | `Cmd+Shift+G R` | Actualizar proyectos |
| Autenticar | - | Primera vez o cambio token |

## Solución Rápida a Problemas Comunes

### "La rama ya existe"

```bash
git branch -d feature/123-old
# Luego crea la rama nuevamente desde VS Code
```

### "Cambios sin confirmar"

La extensión preguntará automáticamente si quieres hacer stash.
O manualmente:

```bash
git stash
# Crea la rama
git stash pop
```

### "No veo mis proyectos"

1. Verifica autenticación
2. Refresca: `Cmd+Shift+G R`
3. Verifica permisos del token en GitHub

### "El filtro no funciona"

- Asegúrate de que los campos personalizados estén configurados en GitHub
- Los nombres deben incluir "tipo", "work type", "prioridad", etc.
- Refresca los datos del proyecto

---

¿Tienes otros casos de uso? ¡Contribuye con ejemplos a este documento!
