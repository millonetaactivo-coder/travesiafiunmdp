# Tutor Assignment Specification

## Purpose

Admin UI to assign tutors (tutor or asesor_par) to students individually or in batch via `asignaciones_tutor`.

## Requirements

### Requirement: Individual Assignment

The system SHALL allow admin to select a student and assign a tutor (user with rol tutor or asesor_par) via a dropdown.

#### Scenario: Assign tutor to student

- GIVEN an admin selects student "Juan Pérez" and tutor "María López"
- WHEN they click "Asignar"
- THEN a row SHALL be inserted into `asignaciones_tutor` with activa=true

#### Scenario: Reassign existing tutor

- GIVEN a student already has an active tutor assignment
- WHEN admin assigns a new tutor
- THEN the old assignment SHALL be set to activa=false; new row created

### Requirement: Batch Assignment

The system SHALL allow admin to select multiple students (via checkboxes) and assign the same tutor in one action.

#### Scenario: Batch assign 5 students

- GIVEN an admin selects 5 students and tutor "María López"
- WHEN they click "Asignar en lote"
- THEN 5 `asignaciones_tutor` rows SHALL be created with activa=true

### Requirement: Filter Students for Assignment

The system SHALL allow filtering the student list by carrera and nivel_riesgo to facilitate batch assignment.

#### Scenario: Filter by risk level

- GIVEN an admin filters by nivel_riesgo="alto" and carrera="Ing. Civil"
- WHEN the filter applies
- THEN only matching students SHALL appear in the assignment list

### Requirement: View Current Assignments

The system SHALL display each student's current tutor name (or "Sin asignar") in the assignment list.

#### Scenario: Student without tutor

- GIVEN a student with no active `asignaciones_tutor` row
- WHEN the list renders
- THEN the tutor column SHALL display "Sin asignar"
