# Student Unified Profile Specification

## Purpose

Single page combining all student data (perfil, scores, grades, surveys, interviews) with role-based access control.

## Requirements

### Requirement: Profile Data Aggregation

The system SHALL display a unified profile page at `/alumnos/:id` aggregating data from `usePerfil`, `useScore`, `useEntrevistas`, cursadas/finales, and encuesta sessions.

#### Scenario: Admin views any student profile

- GIVEN an admin is authenticated
- WHEN they navigate to `/alumnos/{studentId}`
- THEN the system SHALL display all five data sections

#### Scenario: Student views own profile only

- GIVEN a student is authenticated
- WHEN they navigate to `/alumnos/{otherId}`
- THEN the system SHALL deny access and redirect to their own profile

### Requirement: Role-Based Section Visibility

The system MUST enforce: admin sees all sections; tutor sees assigned students' profiles; student sees own profile only.

#### Scenario: Tutor accesses assigned student

- GIVEN a tutor with an active `asignaciones_tutor` row for the student
- WHEN they open the student's profile
- THEN all sections SHALL be visible

#### Scenario: Tutor accesses unassigned student

- GIVEN a tutor with no `asignaciones_tutor` row for the student
- WHEN they attempt to open the student's profile
- THEN the system SHALL return an access-denied state

### Requirement: Tabbed Layout

The system SHALL organize profile data into four tabs: Datos Personales, Notas (cursadas + finales), Encuestas, Entrevistas.

#### Scenario: Tab navigation

- GIVEN a user with profile access
- WHEN they click the "Encuestas" tab
- THEN the system SHALL display `sesiones_encuesta` and `respuestas` for that student

### Requirement: Lazy-Load Sections

The system SHOULD lazy-load each tab's data on first activation to prevent over-fetching.

#### Scenario: Initial load

- GIVEN a user opens a profile
- WHEN the page renders
- THEN only the "Datos Personales" tab data SHALL be fetched; other tabs load on click
