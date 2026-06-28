# Delta for Interview Management

## ADDED Requirements

### Requirement: Tutor Interview List

The system SHALL display a list of interviews for the tutor's assigned students. The list SHALL include both planned and completed interviews, ordered by date descending. Each row SHALL show student name, type, modality, date, and status.

#### Scenario: Tutor views their students' interviews

- GIVEN a tutor with assigned students who have recorded interviews
- WHEN the tutor navigates to the interview page
- THEN all interventions with entrevistas detail for their students are listed
- AND each row shows student name, tipo, modalidad, fecha_realizada, and estado

#### Scenario: Admin views all interviews across tutors

- GIVEN an admin user
- WHEN the admin navigates to the interview page
- THEN all interviews across all tutors are displayed

### Requirement: Interview Creation Form

The system SHALL provide a form to create an interview. The form MUST capture: `fecha_realizada` (date picker), `modalidad` (presencial / virtual / telefonica), `motivo`, `resumen`, `estado_alumno_percibido` (bien / regular / en_riesgo / critico), `factores_riesgo` (multi-select), and `seguimiento_requerido` (boolean). Submission SHALL insert into both `intervenciones` and `entrevistas` tables.

#### Scenario: Tutor creates a complete interview

- GIVEN a tutor opens the interview form for a student
- WHEN the tutor fills all required fields and submits
- THEN a row is inserted into `intervenciones` with `tipo = 'entrevista'`
- AND a linked row is inserted into `entrevistas` with the interview-specific fields
- AND the new interview appears in the list

#### Scenario: Form validates required fields

- GIVEN the interview form is open
- WHEN the tutor attempts to submit without filling `fecha_realizada` or `modalidad`
- THEN the form shows validation errors and does not submit

### Requirement: Interview Form Accessibility

The interview creation form SHALL be accessible from both `IntervencionesPage` (via a "Nueva entrevista" button) and `DashTutor` (replacing the existing inline modal). The form SHALL be a shared component (`InterviewForm`).

#### Scenario: Tutor creates interview from IntervencionesPage

- GIVEN a tutor is on the IntervencionesPage
- WHEN the tutor clicks "Nueva entrevista"
- THEN the shared InterviewForm opens with student selector pre-populated from their assignments

#### Scenario: DashTutor modal uses shared form

- GIVEN a tutor opens the interview modal from DashTutor
- THEN the same InterviewForm component is rendered with the same fields and API contract
