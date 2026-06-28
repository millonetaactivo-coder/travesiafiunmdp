# Placeholder Routes MVP

## Requirements

### Requirement: Real Page Components

The system MUST replace all 7 `<Placeholder>` usages (`/ayuda`, `/alumnos`, `/alertas`, `/intervenciones`, `/materias`, `/reportes`, `/usuarios`) with minimal real page components that render a list shell using existing service hooks.

#### Scenario: User navigates to a formerly-placeholder route

- GIVEN a logged-in tutor visits `/alumnos`
- WHEN the route renders
- THEN a real list page appears (heading + data table or empty state), not skeleton pulse divs

#### Scenario: Route has no data

- GIVEN the underlying query returns zero rows
- WHEN the page renders
- THEN an empty-state message is shown (e.g. "No hay alumnos asignados")
