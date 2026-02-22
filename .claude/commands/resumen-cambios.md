## Usage
`/resumen-cambios <git-hash>`

## Context
- Hash base del análisis: $ARGUMENTS
- Cubre todos los commits desde `$ARGUMENTS` hasta HEAD en la rama actual.

## Tu Rol
Eres un **documentador de producto** especializado en comunicación para usuarios finales no técnicos. Tu objetivo es traducir cambios de código en descripciones claras, en español, agrupadas por módulo de negocio. No uses jerga técnica, nombres de archivos, ni términos de programación. Escribe como si le explicaras las novedades de la aplicación a alguien del equipo de administración o finanzas.

---

## Proceso

### 1. Obtener la lista de commits
```
git log $ARGUMENTS..HEAD --oneline
```

### 2. Analizar cada commit
Para cada hash de la lista, ejecuta:
```
git show --stat <hash>
```
Registra: mensaje del commit y archivos modificados.

### 3. Clasificar los cambios
Separa los commits en dos grupos:

**Visibles al usuario final** (incluir en el reporte):
- Cambios en componentes de UI (components/, layout/)
- Nuevas funcionalidades o pantallas
- Cambios en filtros, tablas, formularios, botones
- Exportaciones (Excel, PDF)
- Mejoras en mensajes de error o feedback
- Correcciones que afectan lo que el usuario ve o puede hacer

**Cambios internos/técnicos** (excluir del reporte):
- Refactors de servicios o modelos sin efecto visible
- Tests unitarios
- Cambios de configuración o tooling
- Actualizaciones de dependencias
- Cambios en archivos de configuración (`.json`, `.ts` de configuración)

### 4. Agrupar por módulo de negocio
Usa los módulos de la aplicación como categorías:
- Módulo de Pagos
- Módulo de Cuentas
- Módulo de Órdenes
- Módulo de Proyectos
- Módulo de Proveedores
- Módulo de Ventas / Unidades
- Autenticación
- Reportes PDF / Exportación Excel
- General (si no encaja en otro módulo)

### 5. Redactar descripciones
- Describe cada cambio en una línea corta, en español
- Usa lenguaje orientado al beneficio: qué puede hacer el usuario ahora, qué mejoró
- No menciones nombres de archivos, clases, funciones ni commits
- Agrupa funcionalidades relacionadas bajo el mismo bullet si corresponde

---

## Output

El reporte debe seguir este formato exacto:

```markdown
# Resumen de Cambios — [Fecha legible]
**Período:** [fecha primer commit] al [fecha último commit]
**Base:** Commit `$ARGUMENTS`
**Fecha del reporte:** [hoy]

---

### [Módulo 1]

#### Nuevas funcionalidades
- [Descripción breve orientada al usuario]

#### Mejoras
- [Descripción breve orientada al usuario]

#### Correcciones
- [Descripción breve orientada al usuario]

---

### [Módulo 2]
...

---

## Resumen

**Total de cambios visibles:** [N] mejoras y funcionalidades para el usuario final
**Enfoque principal:** [2-3 temas principales en lenguaje natural]
**Impacto:** [Una oración describiendo el beneficio general para el equipo]
```

### Reglas de estilo
- Sin emojis
- Sin jerga técnica ni nombres de código
- Secciones vacías se omiten (no escribir "#### Correcciones" si no hay correcciones)
- Módulos sin cambios visibles se omiten completamente
- Bullets cortos, una idea por bullet

---

## Guardar Reporte

Guarda el reporte en:
```
reports/YYYY-MM-DD-resumen-cambios-sprint.md
```
Donde `YYYY-MM-DD` es la fecha de hoy.

Confirma al usuario la ruta completa del archivo generado.
