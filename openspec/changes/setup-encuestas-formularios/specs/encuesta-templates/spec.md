# encuesta-templates Specification

## Purpose

Define 3 survey templates (inicial, cuatrimestral, entrevista) with real questions, scoring options, and scoring tramos sourced from domain-expert instruments. Replaces all placeholder seed data.

## Requirements

### Requirement: Three Categorías Pregunta

The system MUST provide exactly 3 `categorias_pregunta` rows matching the document dimensiones:

| Nombre |
|--------|
| Rendimiento Académico |
| Encuestas y Bienestar Emocional |
| Alerta de Aislamiento |

#### Scenario: Three categorías exist

- GIVEN the migration applied
- WHEN querying `SELECT count(*) FROM categorias_pregunta`
- THEN the result MUST equal 3

### Requirement: Encuesta Inicial Template

The `inicial` encuesta MUST have 1 sección ("Contexto Personal") with 5 preguntas:

| Variable | Texto | Tipo | Opciones (value → score) | Categoría |
|----------|-------|------|--------------------------|-----------|
| experiencia_universitaria_previa | ¿Es esta tu primera experiencia universitaria? | multiple | Sí, es la primera→0 / No, inicié otra pero la dejé→2 / No, inicié otra y la curso en paralelo→1 / No, ya tengo título→0 | Rendimiento Académico |
| situacion_convivencia | ¿Con quién vivís actualmente? | multiple | Con mi familia→0 / Con pareja o hijos→1 / Con compañeros o amigos→1 / Solo/a→2 / Otro→1 | Encuestas y Bienestar Emocional |
| dependientes_a_cargo | ¿Tenés hijos o alguien a tu cargo? | multiple | No→0 / Sí→3 | Encuestas y Bienestar Emocional |
| fuente_financiamiento | ¿Quién financia principalmente tus estudios? | multiple | Mi familia→0 / Una beca o subsidio→1 / Yo mismo/a con mi trabajo→2 / Otro→2 | Encuestas y Bienestar Emocional |
| acceso_materiales | ¿Contás con los materiales necesarios para cursar? | multiple | Sí→0 / No→3 | Encuestas y Bienestar Emocional |

#### Scenario: Inicial has 5 preguntas with correct options

- GIVEN the `inicial` encuesta
- WHEN counting its preguntas and their scoring_opciones
- THEN 5 preguntas MUST exist with 4, 5, 2, 4, 2 opciones respectively, each puntaje matching the table above

### Requirement: Encuesta Cuatrimestral Template

The `cuatrimestral` encuesta MUST have 2 secciones with 5 preguntas total:

**Sección "Rendimiento del Cuatrimestre":**

| Variable | Texto | Tipo | Opciones (value → score) | Categoría |
|----------|-------|------|--------------------------|-----------|
| situacion_laboral | ¿Trabajás actualmente? | multiple | No→0 / Sí→1 | Encuestas y Bienestar Emocional |
| horas_trabajo_semanal | ¿Cuántas horas trabajás semanalmente? | multiple | 1-10h→1 / 11-20h→2 / 21-30h→3 / 31-40h→4 / Más de 40h→5 | Encuestas y Bienestar Emocional |
| cambio_vida_personal | ¿Ha ocurrido algún cambio importante en tu vida personal? | multiple | No→0 / Sí→3 | Encuestas y Bienestar Emocional |
| ritmo_estudio | ¿Cómo describirías tu ritmo de estudio? | multiple | Sigo el ritmo y estoy al día→0 / Un poco atrasado/a pero puedo recuperar→2 / Siempre muy perdido/a→4 | Rendimiento Académico |

**Sección "Bienestar y Motivación":**

| Variable | Texto | Tipo | Categoría |
|----------|-------|------|-----------|
| satisfaccion_rendimiento | Del 1 al 10, ¿qué tan satisfecho estás con tu rendimiento? | escala (invertida) | Encuestas y Bienestar Emocional |

#### Scenario: Cuatrimestral structure and scale question

- GIVEN the `cuatrimestral` encuesta
- WHEN inspecting its secciones, preguntas, and scoring
- THEN 2 secciones MUST exist with 4 multiple-choice preguntas (2, 5, 2, 3 opciones) and 1 escala pregunta with 10 scoring_tramos

### Requirement: Encuesta Entrevista Template

The `entrevista` encuesta MUST have 1 sección ("Entrevista de Tutoría") with 5 preguntas:

| Variable | Texto | Tipo | Opciones (value → score) | Categoría |
|----------|-------|------|--------------------------|-----------|
| motivo_duda_continuidad | ¿Qué es lo que hoy te hace dudar más sobre seguir adelante? | multiple | Desinterés por contenidos→3 / Exceso presión académica→2 / Problemas personales/familiares→3 / Dificultades económicas→3 / No estoy aprendiendo/avanzando→2 | Encuestas y Bienestar Emocional |
| red_de_apoyo | ¿Quién es la primera persona a la que recurrís? | multiple | Profesor→0 / Compañeros→0 / Nadie, resuelvo solo/a→2 / Nadie, me rindo→4 | Alerta de Aislamiento |
| expectativa_aprobacion | ¿Qué tan posible ves aprobar al menos una evaluación? | multiple | Muy posible→0 / Posible con ayuda extra→2 / Poco probable→3 / Imposible, ya decidí dejar→5 | Rendimiento Académico |
| plan_alternativo | Si no pudieras continuar, ¿qué harías? | multiple | Buscaría trabajo→2 / Me cambiaría a carrera más corta→3 / No tengo plan definido→4 | Alerta de Aislamiento |
| motivacion_continuidad | ¿Qué te mantiene hoy inscripto en la carrera? | multiple | La carrera en sí→0 / Su grupo de amigos→2 | Encuestas y Bienestar Emocional |

#### Scenario: Entrevista has 5 preguntas with correct categories

- GIVEN the `entrevista` encuesta
- WHEN counting its preguntas by categoría
- THEN 5 preguntas MUST exist: 2 Alerta de Aislamiento, 3 Encuestas y Bienestar Emocional or Rendimiento Académico

### Requirement: Scoring Opciones for Multiple-Choice

Every `multiple`-type pregunta MUST have `scoring_opciones` rows with integer `puntaje` matching the tables above. Each opción MUST link to its pregunta and the correct `categoria_pregunta`.

#### Scenario: All scoring options have valid puntaje

- GIVEN all multiple-choice preguntas
- WHEN joining `scoring_opciones` ⋈ `preguntas` ⋈ `categorias_pregunta`
- THEN every opción MUST have a non-null `puntaje` and a valid `categoria_id`

### Requirement: Inverted-Scale Scoring Tramos

`satisfaccion_rendimiento` (escala 1–10) MUST have 10 `scoring_tramos` where `valor_riesgo = 10 - respuesta`:

| Respuesta | 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 |
|-----------|----|---|---|---|---|---|---|---|---|---|
| Riesgo | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |

#### Scenario: Inverted scale produces correct risk

- GIVEN `satisfaccion_rendimiento` scoring_tramos
- WHEN a student answers 1 (lowest satisfaction)
- THEN the risk score MUST be 9; an answer of 10 MUST yield 0

### Requirement: Data Integrity and Idempotency

The migration MUST NOT recreate the 3 existing `encuestas` rows — only their child data (secciones, preguntas, scoring) is replaced. Re-applying the migration MUST produce identical row counts with no errors or duplicates.

#### Scenario: Existing encuestas persist

- GIVEN the 3 `encuestas` rows already exist
- WHEN the migration runs
- THEN the `encuestas` table MUST retain exactly 3 rows with the same ids

#### Scenario: Double apply produces same state

- GIVEN the migration applied once
- WHEN re-applied
- THEN all row counts MUST remain identical and no duplicate rows exist
