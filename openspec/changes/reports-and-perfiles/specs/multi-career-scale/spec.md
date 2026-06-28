# Multi-Career Scale Specification

## Purpose

Global carrera selector component that filters all relevant views by carrera_id. Ensures all data queries respect the selected career context.

## Requirements

### Requirement: Global Career Selector Component

The system SHALL provide a reusable `<CareerSelector>` component in the dashboard layout, visible to admin and docente roles.

#### Scenario: Admin selects a career

- GIVEN the dashboard loads with no career selected
- WHEN the admin selects "Ing. Electrónica" from the dropdown
- THEN the selected `carrera_id` SHALL be stored in context and propagated to all child views

#### Scenario: Default to first career

- GIVEN an admin with access to multiple carreras
- WHEN the dashboard first loads
- THEN the selector SHALL default to the first available carrera

### Requirement: Career-Scoped Data Queries

The system SHALL filter all data-fetching queries (estudiantes, scores, cursadas, finales, reportes) by the selected `carrera_id`.

#### Scenario: AlumnosPage respects career filter

- GIVEN carrera "Ing. Civil" is selected
- WHEN AlumnosPage loads
- THEN only students with `estudiantes.carrera_id` matching SHALL appear

#### Scenario: ReportesPage respects career filter

- GIVEN carrera "Ing. Mecánica" is selected
- WHEN a report is generated
- THEN the report data SHALL be scoped to that carrera

### Requirement: Student Role Sees Own Career

The system SHALL NOT show the career selector to students; their views are automatically scoped to their own `estudiantes.carrera_id`.

#### Scenario: Student login

- GIVEN a student with carrera_id for "Ing. Electrónica"
- WHEN they access the dashboard
- THEN all their data SHALL be filtered to that carrera without a visible selector

### Requirement: Career Selector Persists Across Navigation

The system SHALL persist the selected carrera across page navigations within the same session (React context or URL param).

#### Scenario: Navigate from Alumnos to Reportes

- GIVEN an admin has "Ing. Civil" selected on AlumnosPage
- WHEN they navigate to ReportesPage
- THEN "Ing. Civil" SHALL remain selected; report data SHALL reflect that carrera
