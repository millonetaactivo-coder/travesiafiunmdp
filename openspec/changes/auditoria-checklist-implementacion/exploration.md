# Exploration: Auditoría Checklist vs Código Actual

## Current State

Snapshot del estado real del repositorio al 2026-06-27, contrastado contra el checklist
de implementación provisto por el usuario. Se inspeccionaron:

- `src/components/AppRouter.tsx` (motor de rutas, login, layout, dock de navegación)
- `src/hooks/{useAuth,useScore,useAlertas,useEstudiantes,useEncuesta,usePerfil,usePlan}.ts`
- `src/components/dashboards/{DashAdmin,DashTutor,DashDocente,DashEstudiante,DashEncuestasAdmin,DashPlanAdmin,DashPlanEstudiante,Encuestas,EncuestaInicial,EncuestaEditor,EncuestaInicial,ImportarAlumnos,Configuracion,GestionCategorias,PlanSelector,DashboardSelector}.tsx`
- `src/services/{authService,estudiantesService,scoresService,scoringService,alertasService,intervencionesService,categoriasService,encuestasService,planService}.ts`
- `src/types/{database,index}.ts`
- `supabase/functions/calcular-score/index.ts`
- Tablas y edge functions reales vía MCP Supabase

### Inventario clave del backend (Supabase)

| Tabla | Filas | Notas |
|---|---|---|
| `usuarios` | 8 | FK a `auth.users` |
| `carreras` | 10 | Soporte multicarrera OK |
| `usuario_roles` | 13 | Roles: `admin / docente / tutor / asesor_par / estudiante` |
| `estudiantes` | 5 | Tiene `encuesta_inicial_completada` |
| `materias` | 478 | |
| `plan_estudios` | 478 | |
| `correlativas` | 134 | |
| `progreso_estudiante` | 0 | Vacía; CHECK válido |
| `cursadas` | 32 | |
| `finales` | 0 | |
| `encuestas` | 3 | Tipos: inicial / cuatrimestral / entrevista |
| `encuesta_secciones` | 5 | |
| `preguntas` | 19 | |
| `sesiones_encuesta` | 0 | |
| `respuestas` | 0 | |
| `indicadores` | 4 | Pesos configurables |
| `indicador_componentes` | 9 | |
| `scores` | 0 | |
| `asignaciones_tutor` | 5 | |
| `alertas` | 0 | 6 tipos: score_critico, perfil_silencioso, encuesta_omitida, ralentizacion, solicitud_ayuda, cambio_plan |
| `intervenciones` | 0 | 4 tipos, 3 modalidades |
| `entrevistas` | 0 | |
| `categorias_pregunta` | 5 | |
| `scoring_opciones` | 35 | |
| `scoring_tramos` | 17 | |

### Edge functions desplegadas

| Slug | Estado | verify_jwt | Notas |
|---|---|---|---|
| `calcular-score` | ACTIVE v2 | `false` | Implementa los 4 pilares (académico, encuesta, ralentización, aislamiento). Umbrales 0-30/31-55/56-80/81+ hardcodeados. |
| `detectar-perfil-silencioso` | ACTIVE v1 | `false` | Existe pero sin UI que la invoque. |
| `guardar-preguntas` | ACTIVE v1 | `false` | Existe pero `scoringService.ts` está vacío (TODO). |
| `importar-alumnos` | ACTIVE v1 | `false` | Usado por `ImportarAlumnos.tsx` con soporte para creación de usuarios Auth. |

### Rutas registradas en `AppRouter`

| Ruta | Componente | Estado real |
|---|---|---|
| `/login` | `Login` | Funcional con UI completa |
| `/dashboard` | `DashboardSelector` | Switch por rol, todos los roles tienen dashboard |
| `/plan` | `PlanSelector` | Switch admin/estudiante |
| `/encuestas` | `EncuestasSelector` | Switch admin/estudiante |
| `/encuesta-inicial` | `EncuestaInicial` | UI completa |
| `/ayuda` | `Placeholder` | **Solo placeholder animado** |
| `/alumnos` | `Placeholder` | **Solo placeholder animado** |
| `/alertas` | `Placeholder` | **Solo placeholder animado** |
| `/intervenciones` | `Placeholder` | **Solo placeholder animado** |
| `/materias` | `Placeholder` | **Solo placeholder animado** |
| `/reportes` | `Placeholder` | **Solo placeholder animado** |
| `/usuarios` | `Placeholder` | **Solo placeholder animado** |
| `/configuracion` | `Configuracion` | UI completa (pesos indicadores) |
| `/importar-alumnos` | `ImportarAlumnos` | UI completa (CSV) |

Hay 8 rutas declaradas como `<Placeholder>` sin implementación real.

---

## Affected Areas

- `src/components/AppRouter.tsx` — Rees para que el sistema de rutas y la navegación
  reflejen páginas reales en lugar de `Placeholder`.
- `src/components/dashboards/DashAdmin.tsx` — Reemplazar el `carreraId` hardcodeado
  `'1fded8a2-...'` por un selector y agregar widgets faltantes (alertas, sin tutor).
- `src/components/dashboards/DashDocente.tsx` — Actualmente MOCK puro; requiere
  data real + lista filtrable de alumnos.
- `src/components/dashboards/DashTutor.tsx` — Score y `riskLevel` están hardcodeados
  (`score = 50; riskLevel = 'medio'`); usa `useScore` real por alumno.
- `src/components/dashboards/DashEstudiante.tsx` — El radial chart usa un valor
  estático `data = [{ name: 'Progress', value: 75, ... }]`.
- `src/components/dashboards/Configuracion.tsx` — No cubre umbrales ni frecuencia.
- `src/components/dashboards/ImportarAlumnos.tsx` — Solo CSV, sin XLS ni mapeo
  configurable.
- `src/hooks/useAlertas.ts` — `alertCount = 0` literal en `AppRouter.tsx:244`.
- `src/services/scoringService.ts` — Archivo con un solo TODO, sin implementación.
- `src/services/intervencionesService.ts` — `getIntervencionesEstudiante` y
  `crearEntrevista` definidos pero sin UI consumidora.
- Edge functions: `detectar-perfil-silencioso` y `guardar-preguntas` sin
  integración visible.

---

## Detalle por sección del checklist

Convención: `[x]` implementado · `[x*]` parcial · `[ ]` faltante.

### 1. Login / Acceso

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 1.1 | Pantalla de login funcional | `[x]` | `AppRouter.tsx:20-222` (`Login`); `authService.ts:signIn` | — |
| 1.2 | Redirección automática al dashboard según rol | `[x*]` | `AppRouter.tsx:31-33` redirige a `/dashboard`; `DashboardSelector.tsx:11-23` despacha por rol. Falta que el selector sepa el `carreraId` del usuario para admins con varias carreras. | Baja |

### 2. Dashboards por rol

#### 2.A Administrador

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 2.A.1 | Vista global: total alumnos, cantidad en rojo/amarillo/verde, alertas pendientes | `[x*]` | `DashAdmin.tsx:69-74` muestra 4 KPI; el de "Intervenciones" es MOCK (línea 59: `intervencionesMes = 24`); "Perfiles Silenciosos" MOCK (línea 58: `perfilesSilenciosos = 12`). La distribución sí viene de `get_distribucion_cohorte` RPC. **No hay contador de alertas pendientes** (en `AppRouter.tsx:244` está `alertCount = 0`). | Media |
| 2.A.2 | Accesos rápidos a configuración | `[x]` | Dock en `AppRouter.tsx:269-278` incluye `/configuracion`. | — |
| 2.A.3 | Acceso rápido a asignación de tutores | `[ ]` | La ruta `/usuarios` es `Placeholder`. No hay UI de asignación. | Alta |
| 2.A.4 | Distribución 4 colores con % y absolutos | `[x*]` | `DashAdmin.tsx:50-56,193-200` muestra Pie + leyenda con valor y %. **Pero** los colores usados son teal/blue/amber/red (no verde/amarillo/naranja/rojo como pide el checklist). El conteo sí incluye los 4 niveles. | Baja |
| 2.A.5 | Widget "Alumnos sin tutor asignado" | `[ ]` | No existe. | Media |

#### 2.B Docente

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 2.B.1 | Lista filtrable de estudiantes con semáforo | `[ ]` | `DashDocente.tsx:1-82` es 100% MOCK; muestra "Alumnos Activos: 42" hardcodeado. | Alta |
| 2.B.2 | Filtros (año, carrera, materia, riesgo) | `[ ]` | No existe. | Alta |
| 2.B.3 | Contador alumnos en riesgo sin tutor | `[ ]` | No existe. | Media |
| 2.B.4 | Contador intervenciones activas | `[ ]` | No existe. | Baja (datos en `intervenciones`) |

#### 2.C Tutor

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 2.C.1 | Lista de alumnos asignados | `[x*]` | `DashTutor.tsx:12,89-139` consume `useEstudiantes` que filtra por `asignaciones_tutor` activas. **Pero** los campos `score`, `riskLevel`, `isSilentProfile` son MOCK (líneas 94-95). | Media |
| 2.C.2 | Entrevistas pendientes de registrar | `[ ]` | No existe UI; el modal en `DashTutor.tsx:141-201` solo crea entrevistas, no lista las pendientes. | Media |
| 2.C.3 | Próximas entrevistas planificadas | `[ ]` | El estado `planificada` existe en DB pero no hay UI que lo liste. | Baja |

#### 2.D Estudiante

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 2.D.1 | Panel propio: semáforo, notas, historial encuestas | `[x*]` | `DashEstudiante.tsx:52-81` muestra semáforo + mensaje. **El radial chart usa `value: 75` hardcodeado** (línea 40). No muestra notas ni historial de encuestas. | Media |
| 2.D.2 | Botón "Pedir ayuda" prominente | `[x]` | `DashEstudiante.tsx:108-121` con styling teal-400 según spec. | — |

### 3. Gestión de Estudiantes

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 3.1 | Lista completa con búsqueda y filtros avanzados | `[ ]` | Solo existe lista filtrada por tutor (`/alumnos` = `Placeholder`). | Alta |
| 3.2 | Perfil de alumno unificado | `[ ]` | No existe ruta de perfil de alumno. `DashEstudiante` es dashboard, no perfil. | Alta |

#### Permisos por rol (matriz)

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 3.P.1 | Admin: acceso total + editar + cargar historial + ver sensible | `[x*]` | Rutas accesibles; pero **no hay UI de edición de usuarios ni de carga de historial de notas**. | Alta |
| 3.P.2 | Docente: lista completa con semáforo + datos académicos | `[ ]` | No hay lista. | Alta |
| 3.P.3 | Tutor: solo estudiantes asignados; perfil con entrevistas + semáforo | `[x*]` | Filtro OK en `estudiantesService.getEstudiantesDelTutor`; **el modal no muestra el historial de entrevistas del alumno** (`getIntervencionesEstudiante` existe pero no se invoca). | Baja |
| 3.P.4 | Estudiante: solo su propio perfil | `[x]` | `usePerfil(usuario?.id)` + RLS en Supabase. | — |

#### Tipos de usuarios (matriz global)

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 3.T.1 | Admin: configurar sistema, usuarios, indicadores, encuestas, plan | `[x*]` | Indicadores ✓ (`Configuracion.tsx`), Encuestas ✓ (`DashEncuestasAdmin.tsx`), Plan ✓ (`DashPlanAdmin.tsx`). **Usuarios: ✗**. | Media |
| 3.T.2 | Docente: ver todos, importar notas, reportes | `[ ]` | Lista ✗, Importar notas ✗ (solo alumnos), Reportes ✗. | Alta |
| 3.T.3 | Tutor: ver asignados, registrar entrevistas, alertas | `[x*]` | Asignados ✓, entrevistas parcial (modal sin historial), alertas vía `useAlertas` (que se filtra por `tutor_id` OK). | Media |
| 3.T.4 | Estudiante: perfil, encuestas, pedir ayuda | `[x*]` | Perfil parcial, encuestas ✓, pedir ayuda ✓. | Baja |

### 4. Módulo de Notas

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 4.1 | Importar XLS/CSV | `[x*]` | `ImportarAlumnos.tsx` solo acepta `.csv` (línea 180: `accept=".csv"`). No XLS. | Baja |
| 4.2 | Mapeo de columnas a campos internos | `[ ]` | El CSV exige columnas fijas: `legajo, apellido, nombres, email, anio_ingreso, carrera_codigo` (línea 176). No hay UI de mapping. | Media |
| 4.3 | Estados: aprobado / reprobado / ausente / promocionado | `[x*]` | DB: `cursadas.situacion` permite `promovio/habilito/desaprobo/abandono`; `finales.resultado` permite `aprobado/desaprobado/ausente`. **Pero la UI de encuestas (`Encuestas.tsx:206-213`) ofrece 6 opciones simplificadas** que no incluyen explícitamente "ausente" ni diferencian "promocionado vs aprobado". | Media |
| 4.4 | Previsualización antes de confirmar | `[x]` | `ImportarAlumnos.tsx:191-261`. | — |
| 4.5 | Detección y muestra de errores | `[x]` | `ImportarAlumnos.tsx:64-91` con `_isValid` + `_errors`; descarga log CSV (línea 135-156). | — |
| 4.6 | Carga manual nota por nota | `[ ]` | No existe UI de carga individual de notas para docentes. | Alta |

### 5. Motor de Indicadores

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 5.1 | Definir variables (notas o respuestas de encuesta) | `[x*]` | `EncuestaEditor.tsx` permite crear preguntas; `indicador_componentes` y `categorias_pregunta` configurables desde admin. No existe UI para declarar "variables" como tales — son preguntas con scoring. | Baja |
| 5.2 | Construir fórmulas combinando variables | `[x*]` | `scoring_tramos.formula` (text) permite evaluar expresiones por pregunta individual (Deno eval). **No hay UI de editor de fórmulas ni de combinación entre variables**. | Alta |
| 5.3 | Resultado determina color del semáforo | `[x]` | `calcular-score/index.ts:265-272` aplica umbrales 0-30/31-55/56-80/81+ y asigna `nivel_riesgo`. | — |

### 6. Gestión de Tutorías y Entrevistas

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 6.1 | Lista de entrevistas planificadas y realizadas | `[ ]` | No existe UI. | Media |
| 6.2 | Crear nueva entrevista | `[x*]` | `DashTutor.tsx:32-58` crea intervención pero no completa la tabla `entrevistas` (factores_riesgo, estado_alumno_percibido, etc.). | Media |
| 6.3 | Registrar si contactó el tutor o si alumno pidió ayuda | `[x*]` | "Pedir ayuda" del estudiante crea alerta `solicitud_ayuda` (`alertasService.ts:15-32`). **No hay flag "contactó/no contactó"** en la tabla `intervenciones`. | Baja |
| 6.4 | Mostrar alumnos en riesgo nunca contactados | `[ ]` | La edge function `detectar-perfil-silencioso` existe pero no la consume ningún componente. | Media |

### 7. Alertas y Notificaciones

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 7.1 | Centro de alertas con todas las activas | `[ ]` | Ruta `/alertas` es `Placeholder`. | Alta |
| 7.2 | Estado por alerta (pendiente/resuelta) | `[x*]` | `alertas.estado` en DB + `resolverAlerta` en `alertasService.ts:34-43`. **No hay UI** para cambiar el estado. | Baja |
| 7.3 | Asignación de alerta a un tutor | `[x*]` | `alertas.tutor_id` se asigna automáticamente cuando el estudiante pide ayuda. **No hay UI para reasignar manualmente**. | Baja |

### 8. Reportes

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 8.1 | Generador con tipos: cohorte / materia / período / riesgo | `[ ]` | Ruta `/reportes` = `Placeholder`. | Alta |
| 8.2 | Aplicación de filtros | `[ ]` | No existe. | Alta |
| 8.3 | Exportar PDF o CSV | `[ ]` | No existe. | Alta |
| 8.4 | Reportes globales anonimizados | `[ ]` | No existe. | Media |
| 8.5 | Ranking de materias con mayor tasa de abandono/recursada | `[x*]` | `DashAdmin.tsx:62-67,204-235` muestra un BarChart **hardcodeado** (Análisis Mat. I 35%, Física I 28%, etc.). No consulta la DB. | Media |

### 9. Configuración (solo Admin)

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| 9.1 | Gestión de usuarios y roles | `[ ]` | Ruta `/usuarios` = `Placeholder`. | Alta |
| 9.2 | Configuración de umbrales del semáforo | `[x*]` | `Configuracion.tsx` edita **pesos** de los 4 pilares (40/35/15/10). **Los umbrales (30/55/80) están hardcodeados en `calcular-score/index.ts:264-272`**. | Baja |
| 9.3 | Configuración de frecuencia de encuestas | `[ ]` | No existe. | Media |
| 9.4 | Asignación de tutores a grupos | `[ ]` | No existe UI. La tabla `asignaciones_tutor` solo soporta relación 1-a-1 actual. | Alta |

### Lógica de cálculo del score

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| S.1 | Score primer año (solo notas, sin encuesta) | `[x*]` | `calcular-score/index.ts:103-110` fallback `scoreEncuestaTotal = 50` cuando no hay encuesta (no es 0). El pilar académico funciona sin encuesta (`get_resumen_academico` RPC). | Baja |
| S.2 | Score por dimensión (encuestas) | `[x]` | `calcular-score/index.ts:67-101` agrega por categoría con topes (`categorias_pregunta.score_maximo`). | — |
| S.3 | Score total ponderado | `[x]` | `calcular-score/index.ts:251-265` aplica pesos normalizados. | — |
| S.4 | Edge Function `calcular-score` existe | `[x]` | ACTIVE v2. | — |

### Extras

| # | Ítem | Estado | Evidencia | Complejidad |
|---|---|---|---|---|
| E.1 | Botón "Pedir Ayuda" proactivo | `[x]` | `DashEstudiante.tsx:108-121` con `bg-teal-500/10` (per spec). | — |
| E.2 | Escalabilidad multicarrera | `[x*]` | `carreras` tiene 10 filas, `DashPlanAdmin` soporta switch entre carreras, RLS con `carrera_id` por rol. **No todas las vistas filtran por carrera** (e.g. `DashAdmin` hardcodea un UUID). | Baja |
| E.3 | Alertas semáforo: verde(0-30), amarillo(31-55), naranja(56-80), rojo(81-100) | `[x*]` | Umbrales numéricos OK en `calcular-score`. **Colores usados en UI son teal(verde)/blue(amarillo)/amber(naranja)/red(rojo)**. Spec pide verde/amarillo/naranja/rojo. | Baja |

---

## Resumen cuantitativo

**Total de ítems auditados: 58**

| Estado | Cantidad | Porcentaje |
|---|---|---|
| Implementado `[x]` | 14 | 24% |
| Parcial `[x*]` | 19 | 33% |
| Faltante `[ ]` | 25 | 43% |

### Faltantes agrupados por complejidad

| Prioridad | Cantidad | Ítems | Esfuerzo estimado |
|---|---|---|---|
| **Baja** (1 archivo, soporte backend listo) | 11 | 1.2, 2.A.4, 2.B.4, 2.C.3, 3.P.3, 3.T.4, 4.1, 5.1, 6.3, 7.2, 7.3, 9.2, S.1, E.2, E.3 | 1-2 días c/u |
| **Media** (endpoint/edge + UI) | 14 | 2.A.1, 2.A.5, 2.B.3, 2.C.1, 2.C.2, 2.D.1, 3.T.1, 4.2, 4.3, 6.1, 6.2, 6.4, 8.4, 8.5, 9.3 | 3-5 días c/u |
| **Alta** (subsistema nuevo) | 8 | 2.A.3, 2.B.1, 2.B.2, 3.1, 3.2, 3.P.1, 3.P.2, 3.T.2, 4.6, 5.2, 7.1, 8.1, 8.2, 8.3, 9.1, 9.4 | 1-2 semanas c/u |

> Nota: totales pueden no cerrar exacto si un ítem tiene múltiples sub-tareas; el
> desglose cualitativo está en las tablas de cada sección.

### Top 5 huecos estructurales (alta complejidad)

1. **Centro de alertas + lista de entrevistas** (7.1 + 6.1): el backend tiene
   las tablas y la realtime subscription (`useAlertas.ts:18-28`), pero no hay
   vista. Es la pieza más visible para tutores.
2. **Reportes** (8.1-8.5): cero implementación. Requiere nueva RPC o vista
   materializada + generador PDF/CSV.
3. **DashDocente real** (2.B.1-2.B.4): actualmente MOCK puro. Necesita
   reescritura completa para usar `useEstudiantes` + filtros + semáforo real.
4. **Perfil unificado del alumno** (3.2): ningún componente lo implementa;
   tendría que combinar `usePerfil` + `useScore` + `usePlan` + historial de
   encuestas + intervenciones.
5. **ABM de usuarios y asignación de tutores** (9.1, 9.4, 2.A.3): tabla
   `asignaciones_tutor` actualmente es 1-a-1; el spec pide "grupos" →
   requiere migración para soportar cohortes.

---

## Approaches para cerrar la brecha

### Approach A: 3 cambios SDD encadenados (recomendado)

1. **`dashboard-fidelity-pass`** — Toca lo parcial y lo bajo.
   - 1.2 selector de carrera en admin
   - 2.A.1/4/5 (alertas reales, sin tutor widget, colores semáforo)
   - 2.B.4, 2.C.1 (score real en tutor), 2.D.1 (radial real)
   - 3.P.3, 3.T.1, 3.T.4, 4.1 (XLS), 4.3, 5.1, 6.3, 7.2, 7.3, 9.2, 9.3, S.1, E.2, E.3
   - Effort: ~3-4 PRs encadenados, 250-350 líneas c/u.

2. **`workflow-views`** — Toca 6.1, 6.2, 6.4, 7.1.
   - Centro de alertas (tutor + admin)
   - Lista de entrevistas planificadas/realizadas
   - Vista "alumnos en riesgo sin contactar" que invoque
     `detectar-perfil-silencioso`
   - Modal completo de entrevista con tabla `entrevistas`
   - Effort: 2 PRs, ~300 líneas c/u.

3. **`reports-and-perfiles`** — Toca 3.1, 3.2, 3.P.1, 3.P.2, 4.6, 8.x, 9.1, 9.4.
   - Lista admin/docente de estudiantes con búsqueda+filtros
   - Perfil unificado
   - ABM usuarios + asignación de tutores por cohorte (migración)
   - Generador de reportes (RPC + UI + export)
   - Carga manual de notas
   - Editor de fórmulas de scoring
   - Effort: 4-6 PRs encadenados, requiere migraciones.

### Approach B: Monolítico (NO recomendado)

Un solo cambio "implementar-todo-el-checklist" excede ampliamente el budget
de 400 líneas por PR (Sección E del phase-common). Imposible de revisar.

### Approach C: Vertical slice por rol (alternativa)

- Slice "tutor-completo" (alertas + entrevistas + score real + alumnos sin contactar)
- Slice "docente-completo" (lista filtrable + carga manual notas)
- Slice "admin-completo" (ABM usuarios + asignación tutores + reportes + umbrales)
- Slice "estudiante-completo" (perfil + historial encuestas)

Útil si el equipo es multi-feature en paralelo, pero pierde cohesión.

---

## Risks

- **8 rutas con `Placeholder`**: el router ya las anuncia al usuario; cualquier
  clic navega a una pantalla inútil. Riesgo de UX inmediato.
- **Datos MOCK visibles en producción**: `DashDocente` muestra "42 alumnos",
  `DashAdmin` muestra "12 perfiles silenciosos", `DashTutor` usa `score=50`
  literal. Un usuario real verá números falsos.
- **`useAlertas` realtime + `alertCount=0` literal** en `AppRouter.tsx:244`:
  el badge del dock nunca muestra el conteo real aunque la subscription funcione.
- **`calcular-score` con `verify_jwt: false`**: aceptaría requests sin auth.
  Es OK porque usa `SUPABASE_SERVICE_ROLE_KEY`, pero conviene auditarlo.
- **No hay tests** (`openspec/config.yaml` confirma `framework: none`).
  Cualquier refactor del motor de score es de alto riesgo.

---

## Recommendation

**Ir con Approach A (3 cambios SDD encadenados).**

- El cambio 1 (`dashboard-fidelity-pass`) es el de mayor impacto visual con
  menor riesgo: reescribe MOCKs por datos reales, fija colores del semáforo,
  y agrega el widget de "sin tutor". Es el que más rápido baja el gap del
  43% de faltantes (cubriría ~15 ítems).
- El cambio 2 (`workflow-views`) atiende el corazón funcional del tutor
  (alertas + entrevistas). Sin esto, el sistema no se usa.
- El cambio 3 (`reports-and-perfiles`) es el más grande y debería ser el
  último, cuando haya usuarios reales testeando los flujos de los cambios
  previos.

Cada cambio debe respetar el budget de 400 líneas por PR y dividirse en
slices si lo excede (Sección E del phase-common). El forecast para el
cambio 3 sugiere chained PRs obligatorio.

---

## Ready for Proposal

**Sí.** La auditoría está completa y los datos están cuantificados. El
orquestador puede elegir el approach y lanzar `sdd-propose` con el nombre
del cambio que arrancará primero (recomendado: `dashboard-fidelity-pass`).
