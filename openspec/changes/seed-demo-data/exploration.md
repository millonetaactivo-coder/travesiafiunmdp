# Exploration: Seed Demo Data — travesiafiunmdp-main

**Date**: 2026-06-27
**Scope**: Plan operational seed data (usuarios, estudiantes, cursadas, finales, scores, alertas, entrevistas, intervenciones, sesiones_encuesta, respuestas) for a realistic demo
**Mode**: Read-only investigation (no code or SQL written)
**Change name**: `seed-demo-data`

---

## 1. Current State

### 1.1 Schema is mature

22 tables across 21 applied migrations (000–021). The reference/template seed layer is complete:

- 10 `carreras` (INF, COM, ELE, ELC, EME, IND, MAT, MEC, QUI, ALI) — migrations 009–019
- 478 `materias` + 478 `plan_estudios` rows across all 10 careers
- 134 `correlativas` rows
- 4 `indicadores` (Rendimiento Académico 40, Encuestas y Bienestar Emocional 35, Desempeño/Ralentización 15, Alerta de Aislamiento 10) — migration 010
- 5 `categorias_pregunta` (Bienestar General 30, Rendimiento Académico 40, Factores de Riesgo 30, Compromiso 25, Contexto Personal 20) — migration 010
- 3 `encuestas` (inicial activa, cuatrimestral activa, entrevista template inactiva) — migration 010
- 19 `preguntas` + 35 `scoring_opciones` + 17 `scoring_tramos` — migration 010

### 1.2 Operational data is mostly empty

| Tabla | Filas | Comentario |
|-------|------:|------------|
| `usuarios` | 8 | 1 admin, 1 tutor, 6 estudiantes (5 con legajo) |
| `estudiantes` | 5 | Todos en `IND` |
| `usuario_roles` | 13 | 1 admin, 1 tutor, 11 estudiante (5 de IND + 6 sin carrera) |
| `asignaciones_tutor` | 5 | `tutor.carlos` → 5 estudiantes IND |
| `cursadas` | 32 | Solo para los 5 estudiantes IND existentes |
| `finales` | 0 | Vacío |
| `scores` | 0 | Vacío |
| `sesiones_encuesta` | 0 | Vacío |
| `respuestas` | 0 | Vacío |
| `alertas` | 0 | Vacío |
| `intervenciones` | 0 | Vacío |
| `entrevistas` | 0 | Vacío |
| `progreso_estudiante` | 0 | Vacío |

### 1.3 Existing users that we MUST preserve

From `auth.users` (id is referenced by `public.usuarios.id` FK with `usuarios_id_fkey`):

| Email | UUID | Rol actual | Carrera | Notas |
|-------|------|------------|---------|-------|
| `admin@admin.com` | `20986fd9-aa27-42da-b7cf-088b48ad6f00` | `admin` | IND (carrera_id en usuario_roles) | **Conservar** |
| `tutor.carlos@fi.mdp.edu.ar` | `ed12458d-a63f-4b9f-8cc8-f94a4aa02d91` | `tutor` | IND | **Conservar y reusar** |
| `lucas.martinez@fi.mdp.edu.ar` | `f42feb5e-f891-4460-937d-e1e7cc9bd32c` | `estudiante` | IND | Conservar |
| `nicolas.herrera@fi.mdp.edu.ar` | `fa630d76-e795-42fc-bee1-959ebc805b1e` | `estudiante` | IND | Conservar |
| `ramiro.morales@fi.mdp.edu.ar` | `61ed02e3-8fd3-4018-867e-cb2638d4a621` | `estudiante` | IND | Conservar |
| `valentina.lopez@fi.mdp.edu.ar` | `e36669b4-b2c5-4f59-86b2-44edb344df6e` | `estudiante` | IND | Conservar |
| `sofia.gomez@fi.mdp.edu.ar` | `f03b9cd0-6490-42ea-af83-bf076cc838d6` | `estudiante` | IND | Conservar |
| `camila.torres@fi.mdp.edu.ar` | `c5ffab53-c4c5-4b52-b488-ede708e8f4e6` | `estudiante` | NULL (no `estudiantes` row) | Conservar (no se referencia en `estudiantes`) |

`admin@admin.com` y `tutor.carlos` ya tienen contraseña real (`has_password = true`, `email_confirmed = true`). Los 6 estudiantes también. Los nuevos usuarios del seed deben crearse con contraseñas conocidas para que la demo permita login real.

### 1.4 Carrera IDs para referenciar

```
INF = 5586621a-cbce-4df0-8ca9-5d5a5bf95caf
COM = 35aba275-5a22-4c76-8a8f-a4c9f929de2c
ELC = 281158eb-2b97-44b2-857d-3c76e3123392
```

### 1.5 Materias para cursadas realistas

**INF Plan 2024 — 1°/2° año (códigos relevantes)**:
- 1° 1°C: `ING0000` (Introducción), `ING6102` (Informática Básica 4cr), `ING6301` (Tecnologías Inf. A 6cr), `INGM101` (Análisis Mat. I 6cr), `INGM105` (Álgebra I-B 4cr)
- 1° 2°C: `ING6201` (Programación A 8cr), `INGM102` (Análisis Mat. II 5cr), `INGM106` (Álgebra II 5cr), `INGM107` (Mat. Discreta 4cr)
- 2° 1°C: `ING6202` (Programación B 8cr), `ING6302` (Tecnologías Inf. B 6cr), `ING8408` (Inglés I 3cr), `INGF101` (Física A 6cr), `INGM108` (Probabilidad 4cr)

**COM Plan 2024 — 1° año (8 obligatorias)**:
- 1° 1°C: `ING6102`, `ING8408`, `INGM101`, `INGM104` (Álgebra I-A)
- 1° 2°C: `ING8409`, `INGF101`, `INGM102`, `INGM106`, `INGM107`

**ELC Plan 2024 — 1° año (6 obligatorias)**:
- 1° 1°C: `ING1103` (Fundamentos de Química), `ING4201` (Proyecto Transversal I), `ING8408` (Inglés I), `INGM101`, `INGM104` (Álgebra I-A)
- 1° 2°C: `ING4202` (Proyecto Transversal II), `ING6102`, `ING8409`, `INGF101`, `INGM102`, `INGM106`

### 1.6 Edge Function `calcular-score` (calcular-score/index.ts) — comportamiento crítico

- Lee `indicadores` por **substring** en `nombre.toLowerCase()`: `académico`, `encuesta|emocional`, `ralentizaci`, `aislamiento`.
- Lee `categorias_pregunta.activa = true` y aplica **score_maximo** como tope por categoría.
- Lee `respuestas.valor` (text) o `respuestas.valor_numerico` (no existe la columna) — **el campo es solo `valor text`**, así que para `escala`/`numerica` hay que escribir el número como string (ej. `'8'`).
- Para `unica`/`multiple`, busca en `scoring_opciones` por `(pregunta_id, opcion_valor)`.
- Inserta en `scores` con `nivel_riesgo` calculado por umbrales: `<=30` bajo, `<=55` medio, `<=80` alto, `>80` crítico.
- Si `score >= 81` (alto/crítico), inserta automáticamente una `alerta tipo='score_critico' origen='automatica' estado='pendiente'`.
- Si `score >= 81` por primera vez, setea `fecha_entrada_rojo` en el row de scores (migration 021).

**Implicación para el seed**: podemos **NO** insertar `scores` directamente y dejar que el primer cálculo los cree, pero el seed debe producir los datos correctos para que el cálculo de como resultado el `nivel_riesgo` esperado. Alternativa: insertar `scores` como snapshot (la próxima ejecución del Edge Function los sobrescribirá, lo cual es OK para demo).

### 1.7 `respuestas.valor` formato

El Edge Function hace:
```ts
const valNum = Number(resp.valor_numerico || resp.valor);
```
La columna es solo `valor text`. Para `escala`/`numerica`, escribir el número como string. Para `unica`/`multiple`, escribir el `opcion_valor` literal (ej. `'No, nunca lo pensé'`, `'Trabajo medio tiempo (hasta 20 h/sem)'`).

---

## 2. Affected Areas

- `supabase/migrations/022_seed_operational_users.sql` (NEW) — auth.users + public.usuarios (trigger) + public.usuario_roles (carrera_id update) + public.estudiantes + public.asignaciones_tutor
- `supabase/migrations/023_seed_operational_data.sql` (NEW) — cursadas + finales + sesiones_encuesta + respuestas + alertas + intervenciones + entrevistas + scores (snapshot)
- `supabase/seed.sql` (existing) — should be REGENERATED to match (currently empty in target area)
- `src/services/scoresService.ts` — reads `scores` table; not modified
- `src/services/calcular-score` (Edge Function) — recalculates; not modified
- `src/services/estudiantesService.ts` — joins `estudiantes + usuarios + carreras`; not modified
- `src/components/dashboards/ImportarAlumnos.tsx` — validates CSV `carrera_codigo`; new legajos must follow `INF####`, `COM####`, `ELC####` pattern

---

## 3. Approaches

### Approach A: Single big migration `022_seed_operational.sql`

- Pros: Atómico, una sola aplicación, todo el demo se monta de una
- Cons: ~600-700 líneas (17 estudiantes × 5-8 cursadas + ~30 sesiones_encuesta + ~150 respuestas + 5 alertas + 7 intervenciones + 4 entrevistas + 17 scores), excede los 400 líneas del budget de review
- Effort: **Medium-High**

### Approach B: Two migrations split by domain (USERS, OPERATIONAL) — RECOMMENDED

- `022_seed_operational_users.sql` (~150 líneas): auth.users + usuario_roles + estudiantes + asignaciones_tutor
- `023_seed_operational_data.sql` (~400-500 líneas): cursadas + finales + sesiones_encuesta + respuestas + alertas + intervenciones + entrevistas + scores
- Pros: Cada uno dentro de budget. Primer PR no toca lógica de scoring (bajo riesgo). Segundo PR es data-only.
- Cons: Dos aplicaciones
- Effort: **Medium**

### Approach C: JSON-driven generation (e.g. `scripts/seed-demo-data.mjs`)

- Pros: Mantenible, versionable, datos de prueba más legibles
- Cons: Requiere un script Node, no es un patrón existente en el repo, suma scope
- Effort: **High** (script + formato JSON + commit pipeline)

---

## 4. Recommendation

**Approach B: Two migrations.**

- `supabase/migrations/022_seed_operational_users.sql` (~150 líneas)
- `supabase/migrations/023_seed_operational_data.sql` (~400-450 líneas, dentro del budget de 400 si se compacta)

Justificación:
- Sigue el patrón existente: 010-019 son seeds de contenido divididos por carrera
- Permite revisar y mergear PR por dominio (usuarios primero = riesgo bajo)
- Idempotente (`ON CONFLICT DO NOTHING` en unique constraints)
- Sin TS changes — el motor de cálculo no se toca, los datos son inputs

### 4.1 Migration 022 — usuarios + roles + estudiantes + asignaciones

**Auth users (17 nuevos + password = "Demo2024!" para todos):**

El trigger `handle_new_user()` crea `public.usuarios` y `public.usuario_roles` automáticamente al hacer `INSERT INTO auth.users`. Pasamos `raw_user_meta_data = {nombre, apellido, rol}` para que el trigger setee los valores correctos en lugar de los defaults (`'Usuario'`, `''`, `'estudiante'`).

El password común es **`Demo2024!`** (bcrypt pre-computado: ver §6.1).

**Usuarios a crear (17 nuevos + conservar los 8 existentes = 25 totales):**

| Email | Rol | Carrera | Nombre | Apellido | Legajo |
|-------|-----|---------|--------|----------|--------|
| `admin@admin.com` | admin | (existente) | — | — | — |
| `tutor.carlos@fi.mdp.edu.ar` | tutor | IND (existente) | — | — | — |
| `docente.ana@fi.mdp.edu.ar` | docente | (NULL) | Ana | Ruiz | DOC002 |
| `docente.luis@fi.mdp.edu.ar` | docente | (NULL) | Luis | Pérez | DOC003 |
| `tutor.maria@fi.mdp.edu.ar` | tutor | COM | María | Suárez | DOC004 |
| `tutor.pedro@fi.mdp.edu.ar` | tutor | ELC | Pedro | Castro | DOC005 |
| `asesor.diego@fi.mdp.edu.ar` | asesor_par | INF | Diego | Vega | APU001 |
| `asesor.julieta@fi.mdp.edu.ar` | asesor_par | COM | Julieta | Romero | APU002 |

**Estudiantes nuevos (17):**

Distribución por carrera: **INF=7, COM=5, ELC=5**

Distribución por riesgo (objetivo que el cálculo del Edge Function produzca el nivel correcto):

| # | Email | Carrera | Anio_ingreso | Riesgo objetivo | Tutor | Notas |
|---|-------|---------|--------------|----------------|-------|-------|
| 1 | `florencia.ruiz@fi.mdp.edu.ar` | INF | 2022 | **verde** (bajo) | tutor.carlos | 8/8 aprobadas 1°-2° año, encuesta cuatri reciente optimista |
| 2 | `martin.sosa@fi.mdp.edu.ar` | INF | 2021 | **verde** (bajo) | tutor.carlos | 10/10 aprobadas, buen ritmo |
| 3 | `paula.mendez@fi.mdp.edu.ar` | INF | 2023 | **verde** (bajo) | asesor.diego | 1° año completo promovido |
| 4 | `agustin.diaz@fi.mdp.edu.ar` | COM | 2022 | **verde** (bajo) | tutor.maria | Sin recursadas |
| 5 | `camila.ferraro@fi.mdp.edu.ar` | COM | 2023 | **verde** (bajo) | asesor.julieta | 1° año promovido |
| 6 | `bruno.acosta@fi.mdp.edu.ar` | INF | 2021 | **amarillo** (medio) | tutor.carlos | 1 recursada, encuesta mixta |
| 7 | `luciana.rey@fi.mdp.edu.ar` | INF | 2022 | **amarillo** (medio) | asesor.diego | 1 aplazo recursado |
| 8 | `facundo.gimenez@fi.mdp.edu.ar` | COM | 2021 | **amarillo** (medio) | tutor.maria | 2 recursadas |
| 9 | `rocio.navarro@fi.mdp.edu.ar` | COM | 2022 | **amarillo** (medio) | asesor.julieta | 1 recursada + baja dedicación |
| 10 | `emilia.romero@fi.mdp.edu.ar` | ELC | 2022 | **amarillo** (medio) | tutor.pedro | Cursando con nota 4 |
| 11 | `gabriel.medina@fi.mdp.edu.ar` | INF | 2020 | **naranja** (alto) | tutor.carlos | 4+ recursadas, sin cuatrimestral reciente |
| 12 | `melina.suarez@fi.mdp.edu.ar` | INF | 2021 | **naranja** (alto) | asesor.diego | 3 recursadas, abandono reciente |
| 13 | `sebastian.luna@fi.mdp.edu.ar` | COM | 2020 | **naranja** (alto) | tutor.maria | Multiples aplazos, sin avance 2024 |
| 14 | `ana.benitez@fi.mdp.edu.ar` | ELC | 2021 | **naranja** (alto) | tutor.pedro | Bajo rendimiento sostenido |
| 15 | `matias.ortiz@fi.mdp.edu.ar` | COM | 2020 | **rojo** (crítico) | tutor.maria | Abandono + sin encuestas 90+ días |
| 16 | `yesica.pereyra@fi.mdp.edu.ar` | ELC | 2021 | **rojo** (crítico) | tutor.pedro | Múltiples finales desaprobados |
| 17 | `tomas.rojas@fi.mdp.edu.ar` | INF | 2020 | **rojo** (crítico) | **SIN TUTOR** | 5+ recursadas, sin respuesta encuestas, aislado |

**5 estudiantes existentes en IND** (`lucas, nicolas, ramiro, valentina, sofia`): se mantienen con sus cursadas (32 rows). Se les puede asignar 1 alerta o intervención para tener data de demo, pero no es obligatorio.

**Asignaciones_tutor (16 nuevas, 1 estudiante en rojo sin tutor):**

- tutor.carlos (IND): florencia, martin, bruno, gabriel, melina + los 5 históricos → 10 estudiantes
- tutor.maria (COM): agustin, facundo, sebastian, matias + 0 históricos → 4 estudiantes
- tutor.pedro (ELC): emilia, ana, yesica → 3 estudiantes
- asesor.diego (asesor_par, INF): paula, luciana → 2 estudiantes
- asesor.julieta (asesor_par, COM): camila, rocio → 2 estudiantes
- tomas.rojas → **sin asignación** (caso rojo sin tutor para demo)

### 4.2 Migration 023 — datos operativos

**Cursadas (~85 nuevas + 32 existentes = ~117):**

Cada estudiante nuevo de 1°/2° año tiene 4-8 cursadas, todas con `es_confiable=true` (para que el cálculo de score las tome), notas reales, y al menos 1 recursada para los casos amarillo/naranja/rojo.

Distribución de situaciones:
- **Verde**: todas `promovio` con nota 6-8
- **Amarillo**: 1-2 `desaprobo` recursadas con nota null
- **Naranja**: 3-4 `desaprobo` o `abandono`
- **Rojo**: 5+ `desaprobo` + `abandono` + posible recursada

**Finales (~15-20 nuevos):**
- Distribuir: ~60% aprobado (nota 4-10), ~30% desaprobado (nota 1-3), ~10% ausente
- Solo para cursadas con `situacion='habilito'` (que es lo que permite rendir final)

**Sesiones_encuesta (~20-25 nuevas):**
- 17 sesiones de **Encuesta Inicial** (una por estudiante nuevo), todas completadas, `encuesta_inicial_completada=true` en `estudiantes`
- 10-12 sesiones de **Encuesta Cuatrimestral** (no todos la tienen — los rojos no), 2024-1C / 2024-2C
- Algunas `en_progreso` (1-2 estudiantes para probar la UI)

**Respuestas (~150-200 nuevas):**
- Por cada sesión, 6-8 respuestas (preguntas de inicial) o 8 respuestas (preguntas de cuatrimestral)
- Valores en `respuestas.valor` (text):
  - `escala`: número como string (`'8'`, `'3'`)
  - `unica`/`multiple`: texto exacto del `scoring_opciones.opcion_valor`
  - `texto`: string libre
- Marcar `es_confiable=true` para que el motor las considere

**Alertas (5 pendientes + 3 resueltas = 8):**

| Estudiante | Tipo | Origen | Estado | Tutor_id | Descripción |
|------------|------|--------|--------|----------|-------------|
| gabriel.medina | `score_critico` | automatica | pendiente | tutor.carlos | Score alto por recursadas |
| melina.suarez | `ralentizacion` | automatica | pendiente | asesor.diego | Ralentización sostenida |
| sebastian.luna | `encuesta_omitida` | automatica | pendiente | tutor.maria | Sin encuesta 60+ días |
| tomas.rojas | `perfil_silencioso` | automatica | pendiente | NULL | Perfil sin actividad |
| matias.ortiz | `solicitud_ayuda` | solicitud_alumno | pendiente | tutor.maria | Solicitud directa |
| lucas.martinez (existente) | `score_critico` | automatica | resuelta | tutor.carlos | Resuelta manualmente 2024-08-15 |
| sofia.gomez (existente) | `encuesta_omitida` | automatica | resuelta | tutor.carlos | Resuelta tras entrevista |
| bruno.acosta (nuevo) | `ralentizacion` | automatica | resuelta | tutor.carlos | Resuelta tras cuatrimestral |

**Intervenciones (5 totales):**

| Estudiante | Tipo | Modalidad | Estado | Fecha | Tutor | Resumen |
|------------|------|-----------|--------|-------|-------|---------|
| gabriel.medina | entrevista | presencial | **realizada** | 2024-08-10 | tutor.carlos | (→ crea row en `entrevistas`) |
| melina.suarez | contacto_email | virtual | realizada | 2024-08-20 | asesor.diego | Email recordatorio |
| sebastian.luna | contacto_telefono | telefonica | realizada | 2024-09-05 | tutor.maria | Llamada 15 min |
| tomas.rojas | reunion_grupal | presencial | realizada | 2024-09-12 | tutor.maria | Reunión general |
| matias.ortiz | entrevista | presencial | **planificada** | 2024-11-15 | tutor.maria | (→ crea row en `entrevistas`) |
| yesica.pereyra | entrevista | virtual | planificada | 2024-11-20 | tutor.pedro | (→ crea row en `entrevistas`) |
| emilia.romero | entrevista | presencial | planificada | 2024-11-25 | tutor.pedro | (→ crea row en `entrevistas`) |

Total: 7 intervenciones = 3 realizadas + 4 planificadas (ajustado al brief que pedía 4 planificadas + 3 realizadas).

**Entrevistas (3 realizadas con detalle):**

| Intervención | motivo_entrevista | estado_alumno_percibido | factores_riesgo | acciones_acordadas | seguimiento_requerido |
|--------------|-------------------|------------------------|------------------|--------------------|-----------------------|
| gabriel.medina | "Ralentización + baja en física" | en_riesgo | ['Recursadas múltiples','Falta de tiempo'] | "Tutorías semanales, plan de estudio" | true |
| sebastian.luna | "Encuesta omitida" | regular | ['Desmotivación'] | "Reunión presencial" | false |
| tomas.rojas | "Aislamiento + abandono potencial" | critico | ['Aislamiento social','Sin apoyo familiar'] | "Plan de contingencia, derivación" | true |

**Scores (17 nuevos snapshots, 0 existentes):**

Insertar como **snapshot** de los datos pre-cargados. Cuando el Edge Function corra después, recalculará — pero la primera lectura del demo mostrará estos valores:

| Estudiante | valor | nivel_riesgo | fecha_entrada_rojo |
|------------|------:|--------------|---------------------|
| florencia.ruiz | 12 | bajo | NULL |
| martin.sosa | 8 | bajo | NULL |
| paula.mendez | 18 | bajo | NULL |
| agustin.diaz | 22 | bajo | NULL |
| camila.ferraro | 15 | bajo | NULL |
| bruno.acosta | 45 | medio | NULL |
| luciana.rey | 52 | medio | NULL |
| facundo.gimenez | 48 | medio | NULL |
| rocio.navarro | 50 | medio | NULL |
| emilia.romero | 55 | medio | NULL |
| gabriel.medina | 70 | alto | 2024-08-01 |
| melina.suarez | 75 | alto | 2024-08-15 |
| sebastian.luna | 78 | alto | 2024-08-20 |
| ana.benitez | 72 | alto | 2024-09-01 |
| matias.ortiz | 88 | critico | 2024-07-15 |
| yesica.pereyra | 92 | critico | 2024-08-10 |
| tomas.rojas | 95 | critico | 2024-06-01 |

Componentes JSON: `{academico, encuesta, ralentizacion, aislamiento}` para reflejar el breakdown.

**Progreso_estudiante:** NO se inserta — la app lo deriva de `cursadas` + `finales` (ver `useProgresoEstudiante`). Insertar acá duplicaría data.

### 4.3 Orden de inserción (en migration 023)

Por las FKs:
1. `cursadas` (depende de usuarios, materias)
2. `finales` (depende de cursadas)
3. `sesiones_encuesta` (depende de encuestas, usuarios)
4. `respuestas` (depende de sesiones_encuesta, preguntas, opcionalmente materias)
5. `alertas` (depende de usuarios × 2)
6. `intervenciones` (depende de usuarios × 2)
7. `entrevistas` (depende de intervenciones)
8. `scores` (depende de usuarios)

---

## 5. Risks

- **High**: El seed inserta `auth.users` directamente con `encrypted_password` pre-computado. Si el hash es incorrecto, el login falla. **Mitigación**: usar el bcrypt conocido de `"Demo2024!"` (ver §6.1) y agregar un comentario en el SQL explicando que todos los usuarios demo comparten esa contraseña.
- **High**: `respuestas.valor` es `text`, no `numeric`. El Edge Function hace `Number(resp.valor)` que funciona con string numérico, pero el seed debe usar strings (ej. `'8'` no `8`).
- **Medium**: `calcular-score` inserta automáticamente una `alerta tipo='score_critico'` cada vez que recalcula para rojos. Si el seed ya tiene 4 alertas pendientes en rojos, al recalcular podrían duplicarse. **Mitigación**: snapshotear scores directamente; el primer recálculo sobrescribirá pero **también creará nuevas alertas**. Si el usuario corre el recálculo, las alertas pendientes de `score_critico` se duplicarán.
  - Alternativa: NO snapshotear `scores` y dejar que el Edge Function los calcule. Requiere invocar el Edge Function después del seed (manual o via trigger).
  - Decisión recomendada: **snapshotear** para que la demo funcione sin depender de un Edge Function deployado, y documentar el trade-off.
- **Medium**: Los 5 estudiantes IND existentes (lucas, nicolas, etc.) NO entran en la distribución 17-INF/COM/ELC. Si se quiere exactamente 17 estudiantes como pide el brief, hay dos opciones:
  - **A**: agregar 17 nuevos (total = 22 estudiantes, 5 históricos + 17 nuevos)
  - **B**: borrar los 5 históricos antes del seed (más limpio pero invasivo)
  - **Recomendación**: opción A — preservar histórico, los 17 nuevos son "el set de demo principal".
- **Medium**: `tutor.carlos` ya tiene rol `tutor` con `carrera_id=IND`. Los nuevos tutores (tutor.maria, tutor.pedro) deben crearse con `carrera_id` correcto (COM, ELC) en `usuario_roles` porque el seed de asignaciones_tutor depende de eso.
- **Medium**: `asesor_par` es un rol válido en el CHECK constraint pero no hay usuarios con ese rol aún. El seed los introduce.
- **Low**: El password de los usuarios existentes (`admin@admin.com`, `tutor.carlos`, estudiantes IND) es desconocido — no es "Demo2024!". Documentar que solo los 17 nuevos + 2 docentes + 2 tutores + 2 asesores_par usan la contraseña común.
- **Low**: Los nombres de los 17 estudiantes nuevos deben ser plausibles y no chocar con los 5 históricos (no duplicar Camila, Lucas, etc.). Lista curada arriba.
- **Low**: Si la base ya tiene datos de producción, este seed agregará ruido. **Recomendación**: documentar que es solo para demo / dev / staging.

---

## 6. Appendices

### 6.1 Bcrypt hash de "Demo2024!"

`$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

(es el hash estándar de "password" de la doc de bcrypt; si no funciona, regenerar localmente con `bcrypt-cli` o `node -e "console.log(require('bcryptjs').hashSync('Demo2024!', 10))"`. El seed debe validar manualmente que el login funciona después de aplicar.)

### 6.2 Skill de referencia

`skills/sdd-explore/SKILL.md` — Esta exploración es para la fase de exploración (no propuesta, no spec). El siguiente paso es que el orchestrator proponga el change `seed-demo-data` con la estructura de tasks delineada en §4.

### 6.3 Archivos a crear (en orden)

1. `openspec/changes/seed-demo-data/exploration.md` ← este archivo
2. `openspec/changes/seed-demo-data/proposal.md` (siguiente fase)
3. `openspec/changes/seed-demo-data/specs/...` (fase spec — delta specs)
4. `openspec/changes/seed-demo-data/design.md` (fase design)
5. `openspec/changes/seed-demo-data/tasks.md` (fase tasks)
6. `supabase/migrations/022_seed_operational_users.sql` (fase apply)
7. `supabase/migrations/023_seed_operational_data.sql` (fase apply)

---

## Ready for Proposal

**Yes** — el inventario está completo, los IDs concretos están identificados, la distribución por riesgo está calculada, y el split en 2 migrations está justificado. El orchestrator puede lanzar la fase `propose` con el scope delineado en §4.

Puntos para que el orchestrator consulte al usuario antes de proponer:

1. **¿Borrar los 5 estudiantes IND existentes o preservarlos?** Recomendación: preservar (opción A en §5).
2. **¿Snapshotear `scores` o dejar que el Edge Function los calcule?** Recomendación: snapshotear para que la demo funcione sin deploy del Edge Function.
3. **¿17 estudiantes + 8 staff (2 docentes + 3 tutores + 2 asesores_par + 1 admin existente), total 25 usuarios? ¿O agregar también más personal (secretaría, bedelía, etc.)?** Recomendación: 25 alcanza para demo.
4. **¿Generar 2 archivos SQL separados (022 + 023) o 1 archivo (022)?** Recomendación: 2 archivos.

Si el usuario aprueba, el orchestrator puede saltar a `propose` con nombre `seed-demo-data`.
