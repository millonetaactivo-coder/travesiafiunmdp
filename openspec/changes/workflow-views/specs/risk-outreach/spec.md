# Delta for Risk Outreach

## ADDED Requirements

### Requirement: At-Risk Never Contacted View

The system SHALL display a list of students whose risk level is `alto` or `critico` (from `scores` table) AND who have zero records in the `intervenciones` table. The view SHALL be accessible via a dedicated route (`/sin-contacto`).

#### Scenario: View shows at-risk students with no interventions

- GIVEN a student has `nivel_riesgo = 'alto'` in scores and 0 rows in intervenciones
- WHEN a tutor or admin navigates to the risk outreach view
- THEN that student appears in the list with name, career, risk level, and days since enrollment

#### Scenario: Student with one intervention is excluded

- GIVEN a student has `nivel_riesgo = 'critico'` but has 1 intervention record
- WHEN the risk outreach view loads
- THEN that student does NOT appear in the list

#### Scenario: Empty state when no at-risk students exist

- GIVEN no students have `alto`/`critico` risk or all have interventions
- WHEN the view loads
- THEN an empty state message is shown: "No hay estudiantes en riesgo sin contacto"

### Requirement: Days Since Last Contact Attempt

For each student in the list, the system SHALL display the number of days since the last contact attempt. If no contact was ever attempted, the system SHALL show "Nunca contactado" with the total days since enrollment.

#### Scenario: Student with no interventions shows days since enrollment

- GIVEN a student enrolled 15 days ago with 0 interventions
- WHEN the risk outreach view renders
- THEN the row shows "Nunca contactado — 15 dias"

### Requirement: Outreach Action from Risk View

The system SHALL provide a "Registrar contacto" action button per student row that opens the InterviewForm pre-populated with the selected student.

#### Scenario: Tutor initiates contact from risk view

- GIVEN a tutor sees an at-risk student in the list
- WHEN the tutor clicks "Registrar contacto"
- THEN the InterviewForm opens with the student pre-selected
- AND upon submission, the student disappears from the risk list
