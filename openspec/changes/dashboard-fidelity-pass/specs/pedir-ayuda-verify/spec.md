# Pedir Ayuda Verify

## Requirements

### Requirement: Help Button Functional

The "Pedir Ayuda" button in DashEstudiante MUST create an `alertas` row via `crearAlertaAyuda` and display user feedback. The existing implementation (line 108) SHALL be verified end-to-end.

#### Scenario: Student requests help

- GIVEN a logged-in student with a tutor assigned
- WHEN the student clicks "Pedir Ayuda"
- THEN an alerta row is inserted with `tipo = 'solicitud_ayuda'` and a confirmation message appears

#### Scenario: Duplicate request

- GIVEN an unresolved `solicitud_ayuda` alerta already exists for this student
- WHEN the student clicks "Pedir Ayuda" again
- THEN the system shows "Ya se envió tu solicitud" without creating a duplicate or crashing
