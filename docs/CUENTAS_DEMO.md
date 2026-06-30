# Cuentas Demo — Travesía FI UNMDP

> **Contraseña universal:** `Demo2024!`
>
> **URL:** [https://travesiafiunmdp.vercel.app](https://travesiafiunmdp.vercel.app)
>
> Todas las cuentas usan emails del dominio `@fi.mdp.edu.ar` (simulado). Cada cuenta tiene datos precargados realistas que muestran distintos escenarios del sistema de acompañamiento estudiantil.

---

## Resumen rápido del sistema

| Métrica | Valor |
|---|---|
| Estudiantes totales | 22 |
| Carreras | 4 (Informática, Computación, Electrónica, Industrial) |
| Niveles de riesgo | 5 bajo · 7 medio · 5 alto · 4 crítico · 1 sin score |
| Alertas activas | 6 |
| Intervenciones registradas | 7 |
| Entrevistas documentadas | 3 |
| Encuestas completadas | 22 |
| Estudiantes sin tutor asignado | 6 (¡3 en riesgo alto/crítico!) |
| Sin contacto (riesgo alto/crítico) | 4 |

---

## 👑 ADMIN

### `admin@travesia.com`
**Rol:** Administrador global
**Vista:** Dashboard Admin con selector de carrera, KPIs de cohorte, y acceso a todas las secciones.

**Qué mostrar:**
- **Dashboard Admin** → KPIs globales, distribución de riesgo por carrera, gráfico de cohorte
- **Selector de carrera** → Cambiar entre Informática, Computación, Electrónica, Industrial y ver cómo cambian los datos
- **Alumnos** → Listado filtrable con riesgo, año de ingreso, tutor asignado. Probar filtros combinados: `Riesgo: Crítico + Sin tutor = Tomás Rojas y Miguel Navarro`
- **Asignar Tutores** → Ver estudiantes sin tutor en cada carrera. Asignar/desasignar tutores
- **Reportes** → Reporte de Cohorte, Materia, Alumno. Filtrar por año y nivel de riesgo
- **Sin Contacto** → 4 estudiantes en riesgo alto/crítico sin intervenciones (José López, Paula Ortiz, Pedro Torres, Carlos Reyes)
- **Materias** → Plan de estudios completo por carrera (478 materias cargadas)
- **Carga de Notas** → Cursadas y finales por carrera/materia
- **Encuestas** → Ver encuesta inicial y cuatrimestral con datos precargados
- **Plan de estudios** → Vista administrativa del plan

---

## 👩‍🏫 DOCENTES

### `profesora.lopez@fi.mdp.edu.ar` ⭐ RECOMENDADA
**Nombre:** María López · **Legajo:** DOC-002
**Vista:** Dashboard Docente con KPIs de su cohorte
**Particularidad:** No tiene carrera asignada explícitamente → el sistema auto-selecciona la primera con datos. **Perfecta para mostrar el comportamiento real del sistema.**

**Qué mostrar:**
- **Dashboard Docente** → KPIs: Alumnos Activos, En Riesgo sin Tutor, Intervenciones Activas. Tabla con scores de cada alumno
- **Filtros** → Año de ingreso y nivel de riesgo (probar: filtrar solo Críticos → 4 resultados)
- **Alumnos en riesgo sin tutor** → Identificar gaps de cobertura
- **Reportes** → Mismos que admin pero con datos de la carrera seleccionada
- **Materias** → Plan de estudios de la carrera

### `profesor.garcia@fi.mdp.edu.ar`
**Nombre:** Carlos Garcia · **Legajo:** DOC-001
**Vista:** Dashboard Docente (misma experiencia que López)
**Usar para:** Segundo docente, demostrar que cada uno ve datos de cualquier carrera (sin restricción fuerte)

---

## 🧑‍🏫 TUTORES

### `tutor.martinez@fi.mdp.edu.ar` ⭐ RECOMENDADO
**Nombre:** Roberto Martínez · **Legajo:** TUT-001
**Carrera:** Ingeniería en Computación
**Estudiantes asignados:** 6 · **Intervenciones:** 4

**Qué mostrar:**
- **Dashboard Tutor** → Lista de sus 6 estudiantes asignados con nivel de riesgo. KPI de alertas pendientes
- **Alertas** → 6 alertas activas en el sistema, filtrar por estado (pendiente/en_proceso/resuelta). El tutor ve las alertas de SUS estudiantes
- **Intervenciones** → 4 intervenciones ya registradas. Crear una nueva entrevista para un estudiante en riesgo
- **Entrevistas** → 3 entrevistas documentadas con estado del alumno, factores de riesgo, seguimiento requerido
- **Perfil del estudiante** → Click en cualquier alumno → ver historial académico completo, scores, cursadas, finales, encuestas
- **Sin Contacto** → Muestra estudiantes en riesgo de SU carrera sin intervenciones (Pedro Torres en Computación)

### `tutor.fernandez@fi.mdp.edu.ar`
**Nombre:** Ana Fernández · **Legajo:** TUT-002
**Carrera:** Ingeniería Electrónica
**Estudiantes asignados:** 5 · **Intervenciones:** 2

**Usar para:** Mostrar cómo un tutor de otra carrera ve datos diferentes. Menos intervenciones registradas = más trabajo pendiente por hacer.

---

## 🤝 ASESORES PARES

### `asesor.gonzalez@fi.mdp.edu.ar` ⭐ RECOMENDADO
**Nombre:** Luis González · **Legajo:** AP-001
**Estudiantes asignados:** 5 · **Intervenciones:** 1

**Qué mostrar:**
- **Dashboard Tutor** → Misma interfaz que tutores, pero con rol "asesor_par". 5 estudiantes asignados
- **Intervenciones** → Solo 1 intervención registrada — mucho espacio para registrar nuevas
- **Alertas** → Ver las alertas de sus estudiantes
- **Perfil del estudiante** → Misma profundidad de datos que un tutor

### `asesora.diaz@fi.mdp.edu.ar`
**Nombre:** Elena Díaz · **Legajo:** AP-002
**Estudiantes asignados:** 0 · **Intervenciones:** 0

**Usar para:** Mostrar un asesor "nuevo" sin asignaciones todavía. Ideal para demostrar el flujo de asignación desde el panel de admin.

---

## 🎓 ESTUDIANTES — Casos interesantes

### 🟢 Bajo riesgo (verde) — "Todo bajo control"

| Estudiante | Carrera | Score | Año |
|---|---|---|---|
| `maria.gomez@fi.mdp.edu.ar` | Electrónica | 8 | 2022 |
| `andres.ramos@fi.mdp.edu.ar` | Industrial | 10 | 2022 |
| `lucia.perez@fi.mdp.edu.ar` | Informática | 12 | 2022 |
| `ana.martinez@fi.mdp.edu.ar` | Computación | 15 | 2023 |
| `martin.sosa@fi.mdp.edu.ar` | Informática | 18 | 2022 |

**Qué mostrar con `maria.gomez@fi.mdp.edu.ar`:**
- Dashboard de estudiante con bajo riesgo — rendimiento estable
- **Plan de Estudios** → Ver progreso en su carrera (Electrónica)
- **Encuesta Cuatrimestral** → Completar una encuesta y ver cómo se refleja
- **Perfil** → Datos académicos, cursadas aprobadas, finales rendidos

---

### 🟡 Medio riesgo (amarillo) — "Requiere seguimiento"

| Estudiante | Carrera | Score | Año | ¿Tiene tutor? |
|---|---|---|---|---|
| `natalia.flores@fi.mdp.edu.ar` | Industrial | 35 | 2023 | ✅ |
| `camila.ruiz@fi.mdp.edu.ar` ⭐ | Informática | 38 | 2023 | ✅ |
| `sofi.ramirez@fi.mdp.edu.ar` | Computación | 42 | 2024 | ✅ |
| `fer.diaz@fi.mdp.edu.ar` | Informática | 45 | 2023 | ✅ |
| `diego.hernandez@fi.mdp.edu.ar` | Computación | 55 | 2023 | ✅ |

**Recomendada `camila.ruiz@fi.mdp.edu.ar`** — score 38, año 2023, tiene tutor asignado. Mostrar el "punto medio" del sistema.

---

### 🟠 Alto riesgo (naranja) — "⚠️ Intervención necesaria"

| Estudiante | Carrera | Score | Año | ¿Tiene tutor? |
|---|---|---|---|---|
| `carlos.reyes@fi.mdp.edu.ar` | Electrónica | 62 | 2024 | ✅ |
| `val.garcia@fi.mdp.edu.ar` | Informática | 65 | 2024 | ❌ |
| `pedro.torres@fi.mdp.edu.ar` | Computación | 68 | 2024 | ✅ |
| `paula.ortiz@fi.mdp.edu.ar` | Industrial | 70 | 2024 | ❌ |
| `jose.lopez@fi.mdp.edu.ar` ⭐ | Informática | 72 | 2024 | ❌ |

**⭐ Recomendado `jose.lopez@fi.mdp.edu.ar`** — Alto riesgo (72), **sin tutor**, **sin intervenciones**. Es el caso perfecto para mostrar la sección **Sin Contacto** y demostrar por qué el sistema alerta sobre estos estudiantes.

---

### 🔴 Crítico (rojo) — "🚨 Emergencia académica"

| Estudiante | Carrera | Score | Año | ¿Tiene tutor? |
|---|---|---|---|---|
| `rodrigo.mendoza@fi.mdp.edu.ar` | Electrónica | 85 | 2025 | ✅ |
| `tomas.rojas@fi.mdp.edu.ar` ⭐ | Informática | 88 | 2025 | ❌ |
| `lautaro.castro@fi.mdp.edu.ar` | Computación | 90 | 2025 | ✅ |
| `miguel.navarro@fi.mdp.edu.ar` | Industrial | 92 | 2025 | ❌ |

**⭐ Recomendado `tomas.rojas@fi.mdp.edu.ar`** — Crítico (88), ingresante 2025, **sin tutor**. Caso de libro: alumno nuevo que ya está en zona roja y nadie lo está acompañando. Perfecto para demostrar el flujo completo: ver en Sin Contacto → asignar tutor → registrar intervención.

---

## 🎬 Flujos de demo recomendados

### Demo para autoridades / admins (10 min)
1. Login como `admin@travesia.com`
2. Dashboard Admin → mostrar KPIs y distribución de riesgo
3. Cambiar entre carreras con el selector
4. **Sin Contacto** → mostrar los 4 estudiantes en riesgo sin intervenciones
5. **Alumnos** → filtrar "Crítico + Sin tutor" → Tomás Rojas y Miguel Navarro
6. **Asignar Tutores** → asignar un tutor a Tomás Rojas
7. **Reportes** → Reporte de Cohorte de Informática, filtrar por críticos

### Demo para docentes (5 min)
1. Login como `profesora.lopez@fi.mdp.edu.ar`
2. Dashboard Docente → KPIs de la cohorte, tabla de alumnos con scores
3. Filtrar por nivel "Crítico" → ver los 4 casos graves
4. **Materias** → mostrar el plan de estudios cargado

### Demo para tutores (7 min)
1. Login como `tutor.martinez@fi.mdp.edu.ar`
2. Dashboard Tutor → 6 estudiantes asignados con sus niveles de riesgo
3. **Alertas** → 6 alertas activas, mostrar el detalle de una
4. **Intervenciones** → 4 ya registradas, crear una nueva para un estudiante crítico
5. Click en un estudiante → **Perfil** con historial completo: scores, cursadas, finales, progreso en el plan
6. **Sin Contacto** → Pedro Torres en Computación (alto riesgo, sin intervenciones)

### Demo para mostrar el valor del sistema (8 min)
1. Login como `tomas.rojas@fi.mdp.edu.ar` → estudiante crítico sin tutor
2. Mostrar su dashboard: score 88, sin tutor, sin intervenciones
3. Cambiar a `admin@travesia.com` → Sin Contacto → ahí está Tomás
4. Asignarle un tutor desde el panel de admin
5. Login como `tutor.martinez@fi.mdp.edu.ar` → ahora Tomás aparece en sus asignados
6. Registrar una intervención/entrevista para Tomás
7. Volver a `admin@travesia.com` → Sin Contacto → Tomás ya no aparece

---

## 📊 Datos curiosos para mencionar en la demo

- **4 carreras** con datos: Informática (7 alumnos), Computación (5), Electrónica (5), Industrial (5)
- **478 materias** cargadas en el plan de estudios entre todas las carreras
- **606 cursadas** y **155 finales** registrados (datos históricos simulados)
- **22 encuestas completadas** por los estudiantes
- **16 asignaciones tutor-estudiante activas**
- Los puntajes de riesgo siguen una distribución realista: pocos muy bien, pocos muy mal, la mayoría en el medio
- **6 estudiantes en riesgo medio/alto/crítico sin tutor** — oportunidades de intervención que el sistema hace visibles
- El score combña indicadores académicos (cursadas, finales, correlatividades) con factores de encuestas
