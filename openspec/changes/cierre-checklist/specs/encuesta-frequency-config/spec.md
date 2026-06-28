# encuesta-frequency-config Specification

## Purpose

Admin-configurable academic calendar dates for cuatrimestral surveys, stored in the `configuracion` key-value table.

## Requirements

### Requirement: Survey Date Storage

The system SHALL store cuatrimestral survey dates as a JSON array of ISO 8601 date strings under the `configuracion` key `fechas_encuesta_cuatrimestral`.

#### Scenario: Admin sets 3 survey dates

- GIVEN the `configuracion` table has no row with `clave = 'fechas_encuesta_cuatrimestral'`
- WHEN admin saves dates `["2026-04-15", "2026-07-15", "2026-11-15"]`
- THEN a row is upserted with `valor = '["2026-04-15","2026-07-15","2026-11-15"]'`

#### Scenario: Empty state

- GIVEN no `fechas_encuesta_cuatrimestral` row exists
- WHEN admin opens the survey schedule section
- THEN the UI displays "No hay fechas configuradas"

### Requirement: Admin UI Section

The `ConfiguracionPage` MUST include a dedicated section for managing survey schedule dates with add/remove controls.

#### Scenario: Admin adds and removes dates

- GIVEN admin is on the Configuracion page
- WHEN admin adds date `2026-04-15` and removes date `2026-07-15`
- THEN the saved `fechas_encuesta_cuatrimestral` array contains `2026-04-15` but not `2026-07-15`
