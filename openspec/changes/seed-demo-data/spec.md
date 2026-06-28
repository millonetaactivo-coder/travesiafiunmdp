# Spec: seed-demo-data

## Capabilities

### 1. demo-users
- 1 admin (admin@travesia.com)
- 2 docentes, 2 tutores, 2 asesores_par
- 22 students: INF(7), COM(5), ELC(5), IND(5)
- All with auth.users + usuarios + usuario_roles + estudiantes records
- bcrypt password: Demo2024!

### 2. demo-academic
- ~619 cursadas across all students (programmatic via plan_estudios)
- ~156 finales (subset of cursadas)
- 22 score snapshots with risk levels and fecha_entrada_rojo for rojo students

### 3. demo-surveys
- 17 encuesta_inicial sessions (mix completada/en_progreso)
- 10 encuesta_cuatrimestral sessions
- ~141 respuestas with risk-appropriate answer values

### 4. demo-workflows
- 8 alertas (3 score_critico, 2 perfil_silencioso/ralentizacion, 1 encuesta_omitida, 2 resueltas)
- 7 intervenciones (3 realizadas, 4 planificadas)
- 3 entrevistas linked to realizadas intervenciones
- 16 asignaciones_tutor (tomas.rojas intentionally has NO tutor)

## Scenarios

### S1: Admin sees diverse student risk levels
- Dashboard shows students across all 4 risk levels
- Verde students show low scores, rojo students show high scores with fecha_entrada_rojo

### S2: Tutor views assigned students
- Tutor Martinez sees 6 students (COM + 1 INF)
- Tutor Fernandez sees 5 students (ELC)
- tomas.rojas appears in "sin tutor" widget

### S3: Survey responses produce appropriate scores
- Verde students answered surveys positively (high motivation, good study habits)
- Rojo students answered surveys negatively (low motivation, considering leaving)

### S4: Alerts and interventions are actionable
- 3 rojo students have pending score_critico alerts
- 2 naranja students have pending perfil_silencioso/ralentizacion alerts
- 1 student has encuesta_omitida alert
- 2 alerts are already resolved
