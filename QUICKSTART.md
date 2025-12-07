# 🚀 Inicio Rápido - GitHub Task Flow

## En 5 Minutos

### 1. Instalar Dependencias (1 min)

```bash
cd github-task-flow
npm install
```

### 2. Compilar (30 seg)

```bash
npm run compile
```

### 3. Ejecutar (30 seg)

Presiona `F5` en VS Code o:
- Ve a Run → Start Debugging

Se abrirá una nueva ventana de VS Code con la extensión.

### 4. Configurar GitHub Token (2 min)

#### Crear Token
1. Ve a https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Nombre: `VS Code Task Flow`
4. Selecciona: ✅ `repo`, ✅ `project`, ✅ `write:org`
5. Click "Generate token"
6. **Copia el token** (solo se muestra una vez)

#### Usar Token
1. En la ventana de extensión: `Cmd+Shift+P`
2. Busca: `GitHub Task Flow: Autenticar`
3. Pega tu token
4. ¡Listo! Se cargarán tus proyectos

### 5. Probar (1 min)

1. **Ver proyectos**: Click en icono de GitHub Task Flow en sidebar
2. **Abrir tareas**: Click en un proyecto
3. **Crear rama**: En el panel, click "🌿 Crear Rama"
4. **Crear tarea**: Selecciona código → Click derecho → "Crear Tarea desde Selección"

---

## Comandos Esenciales

| Acción | Comando |
|--------|---------|
| Autenticar | `Cmd+Shift+P` → "GitHub Task Flow: Autenticar" |
| Ver tareas | Click en proyecto en sidebar |
| Refrescar | Click icono refresh en vista |
| Crear tarea | Selecciona código → Click derecho |
| Crear rama | En panel → Botón "🌿 Crear Rama" |

---

## Estructura de Carpetas

```
github-task-flow/
├── src/              # Código fuente TypeScript
├── out/              # JavaScript compilado
├── resources/        # Iconos y recursos
├── node_modules/     # Dependencias
├── package.json      # Configuración de extensión
└── *.md             # Documentación
```

---

## Troubleshooting Rápido

### "Cannot find module..."
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Error de compilación"
```bash
npm run compile
```

### "No se cargan los proyectos"
1. Verifica tu token en GitHub
2. Ejecuta: "GitHub Task Flow: Refrescar Proyectos"

### "No hay repositorio Git"
```bash
git init
```

---

## Próximos Pasos

✅ **Funciona?** → Lee [SETUP.md](SETUP.md) para configuración avanzada

✅ **Quieres ejemplos?** → Lee [EXAMPLES.md](EXAMPLES.md) para casos de uso

✅ **Listo para publicar?** → Ejecuta `vsce package`

---

## Desarrollo Continuo

### Modo Watch (recompilación automática)

```bash
npm run watch
```

Luego presiona `Cmd+Shift+P` → "Developer: Reload Window" después de cada cambio.

### Debug

1. Pon breakpoints en el código
2. Presiona `F5`
3. Usa la consola Debug en VS Code

---

## Recursos

- [Documentación completa](README.md)
- [Guía de setup](SETUP.md)
- [Ejemplos de uso](EXAMPLES.md)
- [VS Code API Docs](https://code.visualstudio.com/api)
- [GitHub GraphQL API](https://docs.github.com/en/graphql)

---

**¡Ya estás listo para usar GitHub Task Flow! 🎉**

Si tienes problemas, revisa [SETUP.md](SETUP.md#solución-de-problemas) para más ayuda.
