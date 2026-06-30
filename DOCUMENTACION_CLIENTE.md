# Travesía — Documentación Completa del Sistema

> **Puerto Byte | Sistema de Seguimiento de Alumnos en Riesgo de Deserción**
> Facultad de Ingeniería — Universidad Nacional de Mar del Plata
> Departamento de Ingeniería Industrial
>
> Documento preparado para explicar todas las funcionalidades desarrolladas y la lógica del sistema a un cliente no técnico. Versión actualizada: Junio 2026.

---

## Índice

1. [¿Qué es Travesía?](#1-qué-es-travesía)
2. [El problema que resuelve](#2-el-problema-que-resuelve)
3. [Tipos de usuarios y qué puede hacer cada uno](#3-tipos-de-usuarios-y-qué-puede-hacer-cada-uno)
4. [Cómo funciona el motor de riesgo (Score)](#4-cómo-funciona-el-motor-de-riesgo-score)
5. [El sistema de semáforo](#5-el-sistema-de-semáforo)
6. [El sistema de alertas](#6-el-sistema-de-alertas)
7. [Encuestas y formularios](#7-encuestas-y-formularios)
8. [Dashboard del Estudiante](#8-dashboard-del-estudiante)
9. [Dashboard del Tutor / Asesor Par](#9-dashboard-del-tutor--asesor-par)
10. [Dashboard del Docente](#10-dashboard-del-docente)
11. [Dashboard del Administrador](#11-dashboard-del-administrador)
12. [Carreras y planes de estudio cargados](#12-carreras-y-planes-de-estudio-cargados)
13. [Funciones automáticas del servidor](#13-funciones-automáticas-del-servidor)
14. [Privacidad y seguridad](#14-privacidad-y-seguridad)
15. [Tecnologías utilizadas](#15-tecnologías-utilizadas)
16. [Estado actual del proyecto](#16-estado-actual-del-proyecto)
17. [Lo que sigue (roadmap)](#17-lo-que-sigue-roadmap)

---

## 1. ¿Qué es Travesía?

**Travesía** es una plataforma web diseñada para acompañar a los estudiantes de Ingeniería de la UNMdP a lo largo de toda su carrera, desde el ingreso hasta el egreso. Su objetivo principal es **detectar a tiempo situaciones de riesgo de abandono** y permitir que tutores, docentes y asesores pares intervengan antes de que sea tarde.

No es una plataforma académica tradicional (eso ya lo cubre Moodle/SIU-Guaraní). Travesía es un **sistema de alerta temprana y acompañamiento personalizado** que funciona como complemento del sistema académico existente.

### ¿Qué hace Travesía?

1. **Monitorea** el avance académico de cada estudiante comparándolo con el plan de estudios ideal.
2. **Recopila** información cualitativa mediante encuestas sobre el bienestar emocional, situación laboral, motivación y condiciones de estudio.
3. **Calcula** un puntaje de riesgo (0 a 100) para cada estudiante usando un algoritmo determinístico basado en reglas y pesos configurables.
4. **Alerta** a los tutores cuando un estudiante entra en zona de riesgo o deja de interactuar con el sistema.
5. **Facilita** la intervención permitiendo registrar entrevistas, contactos y acuerdos entre tutores y alumnos.
6. **Informa** a los administradores con estadísticas de cohorte, gráficos de tendencias y reportes exportables.

---

## 2. El problema que resuelve

### Las cifras que motivaron el sistema

| Problema | 
|----------|
| Deserción temprana (1° año) | 
| Deserción tardía (4° año en adelante) | 
| Ralentización (atraso en el plan) |

### Cómo Travesía ataca cada problema

- **Deserción temprana**: Detecta el shock del primer año mediante la encuesta inicial (factores de riesgo como trabajo, traslado, financiamiento) y encuestas cuatrimestrales que registran cómo se siente el alumno en cada materia.
- **Deserción tardía**: Identifica cambios de prioridades con preguntas sobre motivación, proyección a futuro y satisfacción con el rendimiento.
- **Ralentización**: Compara automáticamente las materias que el alumno aprobó con las que "debería" tener según su año de ingreso. Si la brecha supera el 20%, se dispara una alerta.
- **Aislamiento**: Detecta al "alumno fantasma" — aquel que deja de responder encuestas y no registra contacto con tutores por más de 60 días.

---

## 3. Tipos de usuarios y qué puede hacer cada uno

El sistema tiene **5 roles** distintos, cada uno con permisos y vistas diferentes. Al iniciar sesión, el sistema identifica automáticamente el rol del usuario y muestra el menú y las pantallas correspondientes.

### 3.1 Estudiante

**Misión**: Mantenerse al día con sus encuestas, ver su progreso y pedir ayuda si la necesita.

**Lo que puede hacer**:

| Funcionalidad | Descripción |
|---------------|-------------|
| Ver su panel de inicio | Saludo personalizado, estado actual (semáforo) y encuestas pendientes |
| Ver su progreso en el plan de estudios | Visualiza cada materia con su estado: aprobada, cursando, pendiente, recursando |
| Completar encuesta inicial | Obligatoria, una sola vez al ingresar al sistema. Preguntas sobre situación personal, laboral y educativa |
| Completar encuesta cuatrimestral | Cada cuatrimestre. Evalúa materias cursadas, cómo le fue, cómo se sintió |
| Botón "Pedir ayuda" | Botón destacado color teal que genera una alerta inmediata a su tutor |

**Lo que NUNCA ve el estudiante**:
- El puntaje numérico de riesgo (ej: "75/100"). Solo ve el color del semáforo (🟢🟡🟠🔴) y un mensaje constructivo.
- Datos de otros estudiantes.
- El indicador de "datos no confiables" (es transparente para él).

### 3.2 Tutor

**Misión**: Acompañar a los alumnos asignados, revisar alertas y registrar intervenciones.

**Lo que puede hacer**:

| Funcionalidad | Descripción |
|---------------|-------------|
| Ver sus alumnos asignados | Tabla con nombre, legajo, score exacto, último contacto y nivel de riesgo |
| Filtrar alumnos | Por nivel de riesgo, año, estado de encuesta |
| Ver perfil completo de un alumno | Datos personales, historial académico, scores anteriores, encuestas respondidas, intervenciones registradas |
| Ver panel de alertas | Todas las alertas pendientes y resueltas, con filtros |
| Panel "Sin Contacto" | Lista de alumnos asignados que no han tenido intervención en los últimos 60 días |
| Registrar intervención | Tipos: entrevista, contacto por email, teléfono o reunión grupal. Con modalidad, motivo, resumen y compromisos acordados |
| Registrar entrevista formal | Datos adicionales: estado percibido del alumno, factores de riesgo, acciones acordadas, derivaciones |
| Resolver alertas | Marcar una alerta como resuelta |

**Diferencia con el Asesor Par**: El Asesor Par (estudiante avanzado) tiene un tono de interfaz más coloquial y cercano. El Tutor (docente o graduado) recibe un tono más formal y estructurado.

### 3.3 Docente

**Misión**: Monitorear estadísticas globales de su cohorte o materia.

**Lo que puede hacer**:

| Funcionalidad | Descripción |
|---------------|-------------|
| Dashboard de cohorte | Gráficos de distribución de riesgo, evolución y tendencias |
| Ver alumnos de su carrera | Tabla con datos anonimizados (sin ver información personal identificable) |
| Ver materias | Listado de materias de la carrera |
| Cargar notas | Registro manual de notas por alumno y materia |
| Ver reportes | Estadísticas, ranking de materias por tasa de abandono, exportación a CSV |

### 3.4 Administrador

**Misión**: Gestionar toda la configuración del sistema, usuarios, planes de estudio y datos.

**Lo que puede hacer**:

| Funcionalidad | Descripción |
|---------------|-------------|
| Dashboard principal | KPIs de la cohorte: total alumnos, distribución de riesgo, alertas activas, materias críticas |
| Gestión de alumnos | Ver todos los alumnos, sus perfiles completos y scores |
| Gestión del plan de estudios | Alta, baja y modificación de materias, años, cuatrimestres y correlatividades |
| Gestión de encuestas | Crear, editar y configurar encuestas con secciones, preguntas, opciones y pesos de riesgo |
| Gestión de indicadores | Configurar los 4 pilares del score y sus pesos porcentuales |
| Gestión de categorías de preguntas | Organizar preguntas en categorías con topes máximos de puntaje |
| Gestión de usuarios | Altas, bajas, roles y carreras |
| Asignación de tutores | Vincular tutores con estudiantes |
| Panel de alertas | Todas las alertas del sistema |
| Reportes | Estadísticas completas con gráficos (barras, torta, evolución temporal) |
| Importación de alumnos | Carga masiva desde archivos CSV |
| Panel "Sin Contacto" | Estudiantes sin intervención registrada |
| Configuración general | Ajustes del sistema: tramos del semáforo, pesos, contactos |

---

## 4. Cómo funciona el motor de riesgo (Score)

El corazón del sistema es un **algoritmo determinístico** — es decir, basado completamente en reglas matemáticas, sin inteligencia artificial — que calcula un puntaje de riesgo de 0 a 100 para cada estudiante. **A mayor puntaje, mayor riesgo de abandono**.

### 4.1 Los 4 pilares del cálculo

El score se compone de **4 dimensiones**, cada una con un peso porcentual que puede ser ajustado por el administrador:

| Pilar | Peso por defecto | Qué mide |
|-------|------------------|----------|
| **Rendimiento Académico** | 40% | Qué tan atrasado está respecto al plan ideal, cuántas materias aprobó vs. las que debería, historial de recursadas |
| **Encuestas y Bienestar Emocional** | 35% | Estado anímico, estrés, motivación, situación laboral y personal según las respuestas de sus encuestas |
| **Ralentización** | 15% | Brecha entre el plan teórico y la realidad: materias esperadas vs. materias aprobadas. Penalización acelerada cuando la brecha supera el 20% |
| **Aislamiento** | 10% | Detecta alumnos desconectados: sin encuesta en 60 días (+40 pts), sin intervención en 90 días (+30 pts), sin encuesta inicial (+30 pts), alerta silenciosa previa (+20 pts) |

### 4.2 Cómo se calcula cada pilar

Cada pilar genera una "nota parcial" de 0 a 100. Luego, esa nota se multiplica por su peso para sumar al score total.

**Ejemplo simplificado**: Un alumno saca 50 puntos en Rendimiento Académico. Con 40% de peso, eso representa 20 puntos reales para el score total.

#### Pilar 1: Rendimiento Académico

- El sistema calcula cuántas materias debería tener aprobadas según su año de ingreso y el plan de estudios.
- Por cada punto porcentual de atraso, suma puntos de riesgo.
- Penalizaciones extra: 2° recursada (+5 pts), 3° o más recursadas (+10 pts, tope 30 pts).

#### Pilar 2: Encuestas y Bienestar Emocional

- Cada respuesta del alumno tiene un valor de riesgo predefinido (ej: "Trabajo +40h semanales" = 5 puntos).
- La suma se limita por "topes máximos" por categoría de preguntas para evitar que un alumno acumule demasiado riesgo por una sola dimensión.

#### Pilar 3: Ralentización

- Si la brecha entre materias aprobadas y esperadas es ≤ 20%, el riesgo crece de forma gradual.
- Si la brecha supera el 20%, el riesgo aumenta de forma acelerada.

#### Pilar 4: Aislamiento

- Puntajes fijos por cada condición (no responde encuestas, no tiene intervenciones, no completó la inicial, tiene alerta silenciosa previa).

### 4.3 Cuándo se recalcula el score

- **Automáticamente** cada vez que un estudiante completa una encuesta (inicial o cuatrimestral).
- **Manualmente** cuando el administrador lo solicita desde el panel.

El cálculo se ejecuta **siempre en el servidor** (nunca en la computadora del usuario) para garantizar consistencia y seguridad.

---

## 5. El sistema de semáforo

El puntaje numérico se traduce en un **semáforo visual** con 4 niveles:

| Nivel | Rango de score | Color | Significado |
|-------|---------------|-------|-------------|
| **Vigoroso** | 0–30 puntos | 🟢 Verde | Riesgo bajo. Estudiante saludable, no requiere intervención inmediata. |
| **Moderado** | 31–55 puntos | 🟡 Amarillo | Riesgo medio. Seguimiento a largo plazo, sin urgencia. |
| **Alto** | 56–80 puntos | 🟠 Naranja | Riesgo alto. Requiere contacto del tutor y atención. |
| **Crítico** | 81–100 puntos | 🔴 Rojo oscuro | Riesgo crítico. Probable abandono inminente. Intervención urgente. |

### Reglas de visualización

- **El estudiante solo ve el color** del semáforo y un mensaje motivacional. **Nunca ve el número.**
- **El tutor, docente y administrador ven el número exacto** además del color.

### ¿Qué dispara el paso a Alto o Crítico?

Cuando un estudiante cruza el umbral de 56 puntos (naranja) o 81 puntos (rojo), el sistema automáticamente:
1. Genera una **alerta tipo "score_critico"**.
2. La alerta aparece en el panel del tutor asignado a ese estudiante.
3. El tutor recibe una notificación visual (badge en el ícono de alertas).

---

## 6. El sistema de alertas

### 6.1 Tipos de alertas

| Tipo | ¿Quién la genera? | ¿Cuándo? |
|------|-------------------|----------|
| **Score crítico** | Automática (servidor) | Cuando el score supera 55 puntos (Alto o Crítico) |
| **Perfil silencioso** | Automática (servidor, cada lunes) | Alumno con riesgo medio/alto/crítico que no completó encuestas ni tuvo intervención en 60 días |
| **Encuesta omitida** | Automática (servidor) | Alumno que debía completar la encuesta cuatrimestral y no lo hizo |
| **Ralentización** | Automática (servidor) | Brecha de materias > 20% respecto al plan ideal |
| **Pedido de ayuda** | Manual (botón del estudiante) | El alumno presiona "Pedir ayuda" en su dashboard |
| **Cambio de plan** | Automática | Cuando se registra un cambio de plan de estudios para un alumno |

### 6.2 Flujo de una alerta

1. Se genera la alerta (por cualquiera de las vías anteriores).
2. El tutor asignado al estudiante la ve en su panel de alertas en **tiempo real** (sin necesidad de recargar la página).
3. El tutor puede revisar el perfil del alumno, ver su historial y decidir la acción.
4. Al intervenir, el tutor registra la acción y marca la alerta como **resuelta**.
5. La alerta pasa al historial de resueltas.

### 6.3 Alertas en tiempo real

El sistema usa **Supabase Realtime** para que cuando se genera una nueva alerta, el tutor la vea instantáneamente. No requiere refrescar la página manualmente.

---

## 7. Encuestas y formularios

El sistema maneja **3 tipos de encuestas**, cada una con sus secciones, preguntas y lógica de aplicación:

### 7.1 Encuesta Inicial (Única vez)

Se completa **una sola vez** al ingresar al sistema. Es obligatoria — hasta que no la completa, el estudiante no puede acceder a la encuesta cuatrimestral.

**Secciones y preguntas**:

| Sección | Preguntas |
|---------|-----------|
| **Experiencia universitaria** | ¿Es tu primera carrera? ¿Dejaste otra? ¿Ya tenés título? |
| **Situación personal** | ¿Con quién vivís? ¿Tenés hijos o personas a cargo? ¿Quién financia tus estudios? |
| **Condiciones de estudio** | ¿Contás con los materiales necesarios? |

**Lógica**: Cada respuesta tiene un valor de riesgo. Por ejemplo:
- Vivir solo → 2 puntos de riesgo
- Tener hijos a cargo → 3 puntos
- Financiar los estudios uno mismo → 2 puntos

### 7.2 Encuesta Cuatrimestral (Cada cuatrimestre)

Se completa **al final de cada cuatrimestre**. El sistema muestra dinámicamente solo las materias que el alumno tiene habilitadas para cursar (según sus correlativas aprobadas).

**Flujo completo**:

1. El sistema crea una sesión de encuesta.
2. Se muestran las secciones en orden, comenzando por las preguntas generales.
3. Luego, se muestra la lista de **materias habilitadas** (calculadas con las correlativas).
4. El alumno marca cuáles cursó este cuatrimestre.
5. Por cada materia marcada, responde preguntas específicas.
6. Las respuestas se guardan automáticamente al avanzar (si el alumno cierra el navegador, puede retomar donde dejó).
7. Al finalizar, el sistema recalcula el score y actualiza el semáforo.

**Secciones de la encuesta cuatrimestral**:

| Sección | Qué pregunta |
|---------|-------------|
| **Situación laboral** | ¿Trabajás? ¿Cuántas horas? |
| **Vida personal** | ¿Hubo cambios importantes este cuatrimestre? |
| **Ritmo de estudio** | ¿Seguís el ritmo de clases o estás perdido? |
| **Satisfacción** | Del 1 al 10, ¿qué tan satisfecho estás con tu rendimiento? |
| **Por cada materia** | Situación (promovió/habilitó/desaprobó/abandonó), nota, cómo se sintió, dificultades, dedicación |

**Preguntas por materia**:
1. ¿Cuál fue tu situación en esta materia? (promovió / habilitó / desaprobó / abandonó)
2. Si promovió o habilitó → ¿Nota de cursada? (1-10)
3. Si habilitó → ¿Rendiste el final? (sí/no)
4. Si rindió final → ¿Nota y resultado?
5. ¿Cómo te sentiste cursando esta materia? (texto libre)
6. ¿Cuál fue tu principal dificultad? (opciones múltiples)
7. ¿Cómo calificarías tu dedicación? (escala)
8. ¿Cómo describirías tu ritmo de estudio? (opción única)

### 7.3 Formulario de Entrevista

Completado por el tutor **durante o después de una entrevista** con el alumno.

**Campos**:
- Alumno entrevistado
- Fecha y modalidad (presencial / virtual / telefónica)
- Motivo de la entrevista
- Estado percibido del alumno (bien / regular / en riesgo / crítico)
- Factores de riesgo detectados
- Resumen cualitativo de la conversación
- Compromisos acordados
- Acciones pactadas para el seguimiento
- ¿Requiere seguimiento posterior?
- Derivaciones (si corresponde)
- Próxima acción planificada

El formulario de entrevista incluye preguntas adicionales sobre:
- ¿Qué te hace dudar de continuar? (desinterés, estrés, problemas personales, económicos)
- ¿A quién recurrís cuando tenés dificultades?
- ¿Qué tan posible ves aprobar?
- ¿Qué harías si no pudieras continuar?
- ¿Qué te mantiene hoy en la carrera?

### 7.4 Confiabilidad de los datos

Todo dato ingresado por el alumno se marca como **"no confiable"** (`es_confiable = false`). Esto es clave para cuando en el futuro se integre con el sistema SIU-Guaraní:

- Datos del alumno → `es_confiable = false`
- Datos importados desde XLS/CSV → `es_confiable = true`
- Si hay contradicción → **gana el dato oficial**, pero se conserva lo que dijo el alumno para auditoría
- El tutor ve un ⚠️ cuando un dato no es confiable
- El estudiante nunca ve este indicador

---

## 8. Dashboard del Estudiante

### Lo que ve al entrar

1. **Saludo personalizado** con animaciones sutiles.
2. **Semáforo de riesgo**: su color actual, sin el número. Por ejemplo: "Tu situación es favorable, seguí así 💪".
3. **Encuestas pendientes**: aviso visible si debe completar alguna.
4. **Acceso rápido** a:
   - Su plan de estudios con progreso
   - Encuestas
   - Botón de ayuda
   - Perfil

### Menú de navegación (FloatingDock)

| Ítem | Descripción |
|------|-------------|
| Inicio | Dashboard principal |
| Mi plan | Progreso visual de cada materia |
| Encuestas | Acceso a las encuestas pendientes o historial |
| Pedir ayuda | Botón teal — genera alerta instantánea |
| Salir | Cierra sesión |

### Pantalla de Plan de Estudios

- Muestra todas las materias de la carrera organizadas por año y cuatrimestre.
- Cada materia se colorea según su estado: aprobada, cursando, pendiente, recursando.
- Indica cuáles son materias críticas (las que más correlativas tienen).
- Muestra las correlativas: si una materia requiere tener otra aprobada antes.

---

## 9. Dashboard del Tutor / Asesor Par

### Pantalla principal

- **KPIs rápidos**: total de alumnos asignados, cuántos en cada nivel de riesgo, alertas pendientes.
- **Tabla de alumnos**: nombre, legajo, score, último contacto, nivel de riesgo.
- **Filtros** por nivel de riesgo, año, estado de encuesta.
- Al hacer clic en un alumno, se accede a su **perfil completo**.

### Perfil del alumno (vista del tutor)

El tutor puede ver TODO sobre el alumno:

- Datos personales (nombre, legajo, email, año de ingreso)
- Score actual e historial de scores (gráfico de evolución)
- Progreso en el plan de estudios
- Últimas encuestas respondidas (con todas las respuestas)
- Historial de intervenciones previas
- Alertas relacionadas al alumno
- Indicador visual ⚠️ cuando los datos no son confiables

### Registro de intervención

Desde el perfil del alumno, el tutor puede registrar:

- **Tipo de contacto**: entrevista, email, teléfono, reunión grupal
- **Modalidad**: presencial, virtual, telefónica
- **Fecha**
- **Motivo** de la intervención
- **Resumen** cualitativo
- **Compromisos** acordados
- **Próxima acción**

Si es una entrevista formal, además registra:
- Estado del alumno percibido por el tutor
- Factores de riesgo identificados
- Acciones acordadas
- Si requiere seguimiento posterior

### Panel de Alertas

- Lista de todas las alertas (pendientes y resueltas)
- Badge rojo animado en el ícono de alertas cuando hay pendientes
- Actualización en tiempo real
- Posibilidad de resolver alertas

### Panel "Sin Contacto"

- Lista de alumnos asignados que **no han tenido intervención en los últimos 60 días**
- Crucial para detectar alumnos que se están "desconectando" del sistema

---

## 10. Dashboard del Docente

### Pantalla principal

- **Estadísticas de cohorte**: gráficos con distribución de niveles de riesgo, evolución temporal.
- **Vista de alumnos**: datos anonimizados (no ve datos personales excepto que sea configuración especial de administración).

### Reportes

- **Distribución de riesgo**: gráfico de torta con porcentajes por nivel.
- **Ranking de materias**: gráfico de barras con tasas de abandono/reprobación por materia.
- **Evolución temporal**: gráfico de líneas con tendencias de scores.
- **Exportación a CSV**: para análisis externo.

### Materias

- Listado completo de materias de la carrera.
- Acceso a detalles de cada materia.

### Carga de Notas

- Permite al docente registrar notas manualmente por alumno y materia.
- Interface de tabla con búsqueda y filtrado.

---

## 11. Dashboard del Administrador

### Pantalla principal

- **KPIs de la cohorte**:

| Indicador | Descripción |
|-----------|-------------|
| Total alumnos | Cantidad de estudiantes en el sistema |
| Distribución de riesgo | Cuántos en cada nivel (bajo, medio, alto, crítico) |
| Alertas activas | Cantidad de alertas sin resolver |
| Sin contacto | Alumnos sin intervención en 60 días |
| Materias críticas | Materias con mayor tasa de problemas |

- **Gráficos**: torta (distribución de riesgo), barras (materias problemáticas), líneas (evolución).

### Gestión del Plan de Estudios

El admin puede cargar y editar el plan completo:

- **Materias**: nombre, código, créditos, año teórico, cuatrimestre, tipo (obligatoria, electiva, optativa).
- **Correlativas**: definir qué materias hay que tener aprobadas o cursadas antes de poder cursar otra.
- **Materias críticas**: marcar materias que son "cuello de botella" en la carrera.

**Plan de estudios actual**: Cargado el plan completo de Ingeniería Industrial (Plan 2024), y también Computación, Electrónica, y otras 7 carreras con sus materias y correlativas.

### Gestión de Encuestas

- **Crear encuestas**: tipo (inicial, cuatrimestral, entrevista), título, descripción.
- **Secciones**: agrupar preguntas en secciones con orden.
- **Preguntas**: texto, tipo (texto libre, opción múltiple, opción única, escala numérica), opciones de respuesta, si es obligatoria.
- **Pesos de riesgo**: asignar a cada opción de respuesta un valor de riesgo para el cálculo del score.
- **Preguntas por materia**: marcar si una pregunta aplica por cada materia (se repetirá en la encuesta cuatrimestral por cada materia que el alumno marque).

### Gestión de Indicadores

- Configurar los **4 pilares del score** (Rendimiento Académico, Bienestar, Ralentización, Aislamiento).
- Ajustar los **pesos porcentuales** de cada pilar.
- Configurar las **categorías de preguntas** y sus topes máximos de puntaje para que ninguna dimensión individual domine el score.

### Gestión de Usuarios

- Altas, bajas y modificación de usuarios.
- Asignación de roles (estudiante, tutor, asesor_par, docente, admin).
- Vinculación con carreras.
- Asignación de tutores a estudiantes.

### Importación de Alumnos

- Carga masiva desde archivo **CSV** (formato: legajo, nombre, apellido, email, carrera, año de ingreso).
- Procesamiento automático con creación de usuarios en bloque.
- Feedback de registros creados exitosamente y errores.

### Configuración General

- **Tramos del semáforo**: ajustar los umbrales (por defecto: 0-30 verde, 31-55 amarillo, 56-80 naranja, 81-100 rojo).
- **Frecuencia de encuestas**: configurar cada cuánto se pide la encuesta cuatrimestral.
- **Pesos generales del algoritmo**.

### Reportes

- Exportación de datos a **CSV**.
- Gráficos interactivos con posibilidad de filtrar por período, carrera, materia.

---

## 12. Carreras y planes de estudio cargados

Actualmente el sistema tiene cargados los planes de estudio completos (con materias, códigos, créditos, correlativas y años/cuatrimestres) de las siguientes carreras:

| # | Carrera | Plan | Materias |
|---|---------|------|----------|
| 1 | Ingeniería en Informática | Plan 2024 | 46 obligatorias + optativas |
| 2 | Ingeniería en Computación | Plan 2024 | 50+ obligatorias + optativas |
| 3 | Ingeniería Electrónica | Plan 2024 | 55+ obligatorias + electivas + optativas |
| 4 | Ingeniería Eléctrica | Plan 2024 | 45+ obligatorias + optativas |
| 5 | Ingeniería Electromecánica | Plan 2024 | 50+ obligatorias + optativas |
| 6 | **Ingeniería Industrial** | Plan 2024 | ~40 obligatorias + electivas + optativas + Proyectos I-IV |
| 7 | Ingeniería Mecánica | Plan 2024 | 55+ obligatorias + electivas + optativas |
| 8 | Ingeniería Química | Plan 2024 | 45+ obligatorias + optativas |
| 9 | Ingeniería en Alimentos | Plan 2024 | 45+ obligatorias + optativas |
| 10 | Ingeniería en Materiales | Plan 2024 | 50+ obligatorias + optativas |

Para las carreras con Plan 2024, están cargadas todas las materias con sus códigos oficiales, créditos, año teórico, cuatrimestre, tipo de materia y correlatividades (qué materias requieren tener aprobadas o cursadas previamente).

### Datos de prueba (seed data)

El sistema incluye datos demo para testing:
- 10 estudiantes en Ingeniería en Computación (COM)
- Usuarios de prueba para cada rol (admin, docente, tutor, asesor_par, estudiante)
- Scores calculados en diferentes niveles para validar gráficos y KPIs
- Encuestas de prueba completadas

---

## 13. Funciones automáticas del servidor

El sistema tiene procesos que se ejecutan automáticamente **en los servidores de Supabase**, sin intervención humana:

### 13.1 `calcular-score`

**Cuándo corre**: Cada vez que un alumno completa una encuesta o cuando el admin lo solicita manualmente.

**Qué hace**:
1. Lee los indicadores activos y sus pesos desde la base de datos.
2. Recopila todas las cursadas del estudiante (solo las más recientes por materia).
3. Lee las respuestas de su última encuesta completada.
4. Calcula los 4 pilares: rendimiento, bienestar, ralentización, aislamiento.
5. Suma el score total (0-100).
6. Guarda el resultado en el historial de scores.
7. Si el nivel es Alto o Crítico → genera alerta automática.
8. Si hay ralentización detectada → genera alerta de ralentización.
9. Actualiza el progreso del estudiante (tabla `progreso_estudiante`).

### 13.2 `detectar-perfil-silencioso`

**Cuándo corre**: Automáticamente **cada lunes a las 9:00 AM** (tarea programada).

**Qué hace**:
1. Busca estudiantes con nivel de riesgo medio, alto o crítico.
2. Filtra los que **no** completaron ninguna encuesta en los últimos 60 días.
3. Filtra los que **no** tuvieron ninguna intervención registrada en los últimos 60 días.
4. Para los que cumplen las 3 condiciones → crea alerta de "perfil silencioso".
5. También detecta estudiantes que debían completar la encuesta cuatrimestral y no lo hicieron → alerta de "encuesta omitida".

### 13.3 `guardar-preguntas`

Procesa la configuración de preguntas de encuestas que el admin define desde la interfaz.

### 13.4 `importar-alumnos`

Procesa la importación masiva de alumnos desde archivos CSV cargados por el admin.

### 13.5 `admin-create-user`

Permite al administrador crear nuevos usuarios en el sistema de autenticación.

---

## 14. Privacidad y seguridad

### 14.1 Niveles de acceso por rol (Row Level Security)

El sistema implementa seguridad a nivel de base de datos (RLS en PostgreSQL). Esto significa que **cada usuario solo puede ver lo que su rol le permite**, y es imposible que un estudiante espíe los datos de otro aunque intente manipular consultas.

| Regla | Detalle |
|-------|---------|
| Un estudiante solo ve sus propios datos | No puede ver scores, encuestas ni datos de otros alumnos |
| Un tutor solo ve sus alumnos asignados | No puede acceder a alumnos de otros tutores |
| Un docente ve datos anonimizados | Sin información personal identificable de alumnos |
| El admin tiene acceso total | Pero siempre bajo registro de acciones |

### 14.2 Datos sensibles

- El score numérico **nunca se muestra al estudiante** en ninguna pantalla ni reporte.
- El estudiante solo ve el color del semáforo y mensajes constructivos.
- Los tutores y docentes firman acuerdos de confidencialidad sobre los datos que visualizan.
- El sistema **no realiza diagnósticos psicológicos ni médicos**. Si un alumno manifiesta crisis en las encuestas, el sistema solo alerta al tutor.

### 14.3 Autenticación

- Login con **email y contraseña** gestionado por Supabase Auth (estándar de la industria).
- Sesiones seguras con tokens JWT.
- Posibilidad de registro con confirmación por correo electrónico.
- Cada rol se asigna en la base de datos (no es elegible por el usuario).

---

## 15. Tecnologías utilizadas

Aunque el cliente no necesita entrar en detalles técnicos, estas son las tecnologías que sostienen el sistema:

### Frontend (lo que ve el usuario)

| Tecnología | Para qué se usa |
|------------|-----------------|
| **React 19** | Framework principal para construir la interfaz de usuario |
| **Vite** | Herramienta de compilación ultrarrápida |
| **TypeScript** | Lenguaje de programación con tipado seguro |
| **Tailwind CSS v4** | Sistema de estilos por utilidades |
| **DaisyUI v5** | Componentes visuales pre-armados (badges, tablas, modales, botones) |
| **Framer Motion** | Animaciones fluidas (transiciones entre pantallas, entradas de elementos) |
| **Recharts** | Gráficos interactivos (torta, barras, líneas, radar) |
| **Lucide React** | Librería de íconos consistente |
| **Aceternity UI** | Componentes visuales premium gratuitos (dock flotante, fondos animados, bordes con efecto) |

### Backend y Base de Datos

| Tecnología | Para qué se usa |
|------------|-----------------|
| **Supabase** | Plataforma integral de backend |
| **PostgreSQL** | Base de datos relacional robusta |
| **Supabase Auth** | Sistema de autenticación y gestión de sesiones |
| **Supabase Realtime** | Actualizaciones en tiempo real (alertas que aparecen sin recargar) |
| **Edge Functions (Deno)** | Funciones que corren en el servidor (cálculo de score, detección de perfiles) |
| **Row Level Security** | Seguridad a nivel de fila en base de datos |

### Diseño Visual

- **Paleta de colores**: Fondo navy oscuro (#0F1B2D) con acentos azul (#3B82F6) y teal (#14B8A6).
- **Estilo**: Glassmorphism — paneles con efecto vidrio esmerilado, bordes sutiles, fondos con blur.
- **Tipografías**: 3 familias tipográficas (display, sans, mono) para jerarquía visual.
- **Modo oscuro**: La interfaz completa es dark mode, optimizada para largas sesiones de uso.
- **Responsive**: Funciona en computadoras de escritorio, tablets y celulares con menú adaptativo.
- **Accesibilidad**: Las animaciones se desactivan si el usuario configuró "prefers-reduced-motion" en su sistema operativo.

---

## 16. Estado actual del proyecto

### 16.1 Lo que ya está implementado y funcionando

| Componente | Estado |
|------------|--------|
| **Base de datos completa** (24+ tablas) | ✅ Listo |
| **27 migraciones SQL aplicadas** | ✅ Listo |
| **Sistema de autenticación** (login, registro, sesiones) | ✅ Listo |
| **5 roles de usuario** con permisos diferenciados | ✅ Listo |
| **Planes de estudio de 10 carreras** cargados | ✅ Listo |
| **Encuesta inicial** (formulario único) | ✅ Listo |
| **Encuesta cuatrimestral** (por materia, dinámica) | ✅ Listo |
| **Formulario de entrevista** | ✅ Listo |
| **Motor de cálculo de score** (4 pilares) | ✅ Listo |
| **5 Edge Functions** (calcular-score, detectar-perfil-silencioso, guardar-preguntas, importar-alumnos, admin-create-user) | ✅ Listo |
| **Dashboard de Estudiante** (inicio, plan, encuestas, ayuda) | ✅ Listo |
| **Dashboard de Tutor** (alumnos, alertas, intervenciones, sin contacto) | ✅ Listo |
| **Dashboard de Docente** (cohorte, materias, reportes) | ✅ Listo |
| **Dashboard de Admin** (KPIs, gestión plan, encuestas, indicadores, usuarios, reportes, importación, configuración) | ✅ Listo |
| **Panel de Alertas** con actualización en tiempo real | ✅ Listo |
| **Sistema de intervenciones** (registro y consulta) | ✅ Listo |
| **Perfil completo del alumno** (vista tutor/admin) | ✅ Listo |
| **Gestión de indicadores y pesos** del score | ✅ Listo |
| **Gestión de categorías de preguntas** con topes | ✅ Listo |
| **Gráficos estadísticos** (torta, barras, líneas) | ✅ Listo |
| **Reportes exportables** a CSV | ✅ Listo |
| **Importación masiva de alumnos** desde CSV | ✅ Listo |
| **Asignación de tutores a estudiantes** | ✅ Listo |
| **Datos de prueba (seed data)** para testing | ✅ Listo |
| **Seguridad RLS** en todas las tablas | ✅ Listo |
| **Selector de carrera** para admin y docente | ✅ Listo |
| **Carga de notas por docente/admin** | ✅ Listo |

### 16.2 Resumen de pantallas implementadas

El sistema tiene **27 pantallas/dashboards**:

1. **Login / Registro** — Autenticación con email/contraseña
2. **Dashboard Estudiante** — Inicio con saludo, semáforo, encuestas pendientes
3. **Plan del Estudiante** — Progreso visual de materias
4. **Encuestas (estudiante)** — Completar encuesta cuatrimestral
5. **Encuesta Inicial** — Formulario único de ingreso
6. **Pedir Ayuda** — Botón de alerta inmediata
7. **Dashboard Tutor** — KPIs y tabla de alumnos asignados
8. **Alumnos (tutor/admin)** — Tabla filtrable con scores
9. **Perfil del Alumno** — Vista completa con historial
10. **Alertas** — Panel de alertas pendientes y resueltas
11. **Intervenciones** — Registro y consulta de intervenciones
12. **Sin Contacto** — Alumnos sin intervención en 60 días
13. **Dashboard Docente** — Estadísticas de cohorte
14. **Materias** — Listado de materias
15. **Reportes** — Gráficos y exportación CSV
16. **Cargar Notas** — Registro manual de notas
17. **Dashboard Admin** — KPIs y métricas generales
18. **Plan de Estudios (admin)** — Gestión de materias y correlativas
19. **Encuestas (admin)** — Creación y edición de encuestas
20. **Indicadores** — Configuración de pesos del score
21. **Gestión de Categorías** — Categorías de preguntas
22. **Usuarios** — Altas, bajas, roles
23. **Asignar Tutores** — Vinculación tutor-estudiante
24. **Importar Alumnos** — Carga masiva CSV
25. **Configuración** — Tramos del semáforo, pesos, ajustes generales
26. **Perfil (estudiante/tutor)** — Datos personales del usuario autenticado
27. **Dashboard Selector** — Redirección automática según rol

---

## 17. Lo que sigue (roadmap)

Lo detallado en este documento corresponde a la **Fase 2** del proyecto (MVP completamente funcional con backend real en Supabase). Ya se completó la migración desde datos mock a datos reales. Lo que queda pendiente para fases futuras:

| Funcionalidad | Estado actual | Plan futuro |
|---------------|---------------|-------------|
| **Login con Moodle SSO** | ❌ No implementado | Fase 3 — El sistema se incrustará como iframe en Moodle y usará el login de Moodle automáticamente |
| **Importación real desde SIU-Guaraní** | ❌ Soportado en CSV manual | Fase 3 — Conexión directa con el sistema académico para sincronizar notas oficiales |
| **Notificaciones por email** | ❌ No implementado | Fase 3 — Envío automático de resúmenes y alertas por correo |
| **Exportación PDF** | ❌ No implementado | Fase 3 — Reportes en PDF para imprimir |
| **Fórmulas de indicadores custom** | ❌ No implementado | Fase 3 — Permitir al admin crear fórmulas personalizadas |
| **Cronograma de encuestas automático** | ✅ Manual | Fase 3 — Disparo automático de encuestas según calendario académico |
| **Multi-carrera por estudiante** | ❌ Una carrera por alumno | Fase 3 — Para alumnos que cursan dos carreras |
| **Aplicación móvil nativa** | ❌ Web responsive | Fase 4 — Apps para iOS y Android |

---

## Resumen ejecutivo

**Travesía** es un sistema de alerta temprana y acompañamiento estudiantil que ya está **completamente funcional** en su versión MVP. Permite:

- Que los **estudiantes** completen encuestas y vean su progreso de forma motivacional.
- Que los **tutores** monitoreen el riesgo de sus alumnos asignados y registren intervenciones.
- Que los **docentes** vean estadísticas de su cohorte y carguen notas.
- Que los **administradores** gestionen completamente el sistema (planes de estudio, encuestas, indicadores, usuarios).

Todo respaldado por un motor de riesgo determinístico basado en 4 pilares (rendimiento académico, bienestar emocional, ralentización y aislamiento), un sistema de alertas en tiempo real y una arquitectura de seguridad que garantiza la privacidad de los datos de cada estudiante.

El sistema está preparado para escalar a las **10 carreras de la Facultad de Ingeniería** cuyos planes de estudio ya están cargados, con integración futura a Moodle y SIU-Guaraní en las próximas fases.

---

*Documento generado automáticamente a partir de la base de conocimiento del proyecto (código fuente, planificación, documentación técnica, migraciones y memoria de desarrollo). Junio 2026.*
