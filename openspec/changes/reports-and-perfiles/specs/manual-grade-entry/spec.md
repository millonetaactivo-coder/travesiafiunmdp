# Manual Grade Entry Specification

## Purpose

Form to add a single cursada or final record for a student, gated to admin and docente roles.

## Requirements

### Requirement: Grade Entry Form

The system SHALL provide a form with fields: materia (select from plan_estudios), nota (numeric 0-10), estado (aprobado/reprobado/ausente/promocionado), fecha (date), tipo (cursada/final).

#### Scenario: Admin adds a final grade

- GIVEN an admin on the grade entry page
- WHEN they fill materia="Análisis I", nota=7, estado="aprobado", tipo="final", fecha="2026-06-15"
- THEN a row SHALL be inserted into `finales` with matching values

#### Scenario: Docente adds a cursada record

- GIVEN a docente with a valid session
- WHEN they submit the form with tipo="cursada"
- THEN a row SHALL be inserted into `cursadas`

### Requirement: Role Gate

The system MUST restrict grade entry to users with rol `admin` or `docente`. Tutors and students SHALL NOT access the form.

#### Scenario: Tutor attempts access

- GIVEN a user with rol="tutor"
- WHEN they navigate to the grade entry route
- THEN the system SHALL display an access-denied message

### Requirement: Validation

The system MUST validate: nota is 0-10 integer, fecha is not future, materia belongs to student's carrera.

#### Scenario: Invalid nota value

- GIVEN the form is filled with nota=15
- WHEN the user submits
- THEN the system SHALL show a validation error and NOT submit

### Requirement: Materias Filtered by Student Carrera

The system SHALL populate the materia dropdown with only materias from the selected student's carrera via `plan_estudios`.

#### Scenario: Student in Ing. Electrónica

- GIVEN the selected student's carrera_id maps to Ing. Electrónica
- WHEN the materia dropdown renders
- THEN only materias for that carrera SHALL appear
