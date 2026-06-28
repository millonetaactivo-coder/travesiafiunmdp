# Student List Enhanced Specification

## Purpose

Advanced search, multi-filter, and sortable columns on the existing AlumnosPage.

## Requirements

### Requirement: Multi-Filter Support

The system SHALL provide filters for: carrera, anio_ingreso, nivel_riesgo, has_tutor (boolean). Filters combine with AND logic.

#### Scenario: Filter by carrera and risk level

- GIVEN an admin on AlumnosPage
- WHEN they select carrera="Ing. Mecánica" and nivel_riesgo="alto"
- THEN the list SHALL show only students matching both criteria

#### Scenario: Clear all filters

- GIVEN active filters
- WHEN the user clicks "Limpiar filtros"
- THEN all filters SHALL reset and the full list SHALL display

### Requirement: Sortable Columns

The system SHALL allow sorting by apellido, legajo, anio_ingreso, and nivel_riesgo via column headers.

#### Scenario: Sort by risk level descending

- GIVEN the student list is displayed
- WHEN the user clicks the "Riesgo" column header
- THEN students SHALL be ordered: crítico, alto, medio, bajo

### Requirement: Semáforo Risk Badges

The system SHALL display a color-coded badge (verde/amarillo/naranja/rojo) for each student's latest `nivel_riesgo`.

#### Scenario: Student with no score

- GIVEN a student with no entry in `scores`
- WHEN the list renders
- THEN the badge SHALL display "—" with neutral styling

### Requirement: Click-to-Profile Navigation

The system SHALL navigate to `/alumnos/:id` when a student row is clicked, respecting RBAC from `student-unified-profile`.

#### Scenario: Click student row

- GIVEN an admin viewing the list
- WHEN they click a student's name
- THEN the system SHALL navigate to that student's unified profile
