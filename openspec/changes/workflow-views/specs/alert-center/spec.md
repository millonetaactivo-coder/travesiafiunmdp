# Delta for Alert Center

## ADDED Requirements

### Requirement: Alert List with Status Filter

The system SHALL display alerts in a list with three status tabs: todas, pendiente, resuelta. Each tab SHALL show the count of matching alerts. The list SHALL be ordered by `created_at` descending.

#### Scenario: Tutor filters pending alerts

- GIVEN a tutor is on the alert center page
- WHEN the tutor clicks the "Pendientes" tab
- THEN only alerts with `estado = 'pendiente'` are displayed
- AND the tab badge shows the correct pending count

#### Scenario: Admin views all alerts across tutors

- GIVEN an admin is on the alert center page
- WHEN the page loads
- THEN alerts for ALL tutors are displayed, not filtered by `tutor_id`

### Requirement: Alert Resolve Action

The system SHALL allow a tutor or admin to resolve a pending alert. Resolving SHALL set `estado = 'resuelta'`, `resuelta_at`, and `resuelta_por`.

#### Scenario: Tutor resolves a pending alert

- GIVEN a pending alert is displayed in the list
- WHEN the tutor clicks "Resolver"
- THEN the alert status changes to "resuelta" immediately (optimistic update)
- AND the alert moves to the "Resueltas" tab

#### Scenario: No resolve button on resolved alerts

- GIVEN an alert with `estado = 'resuelta'`
- THEN no "Resolver" button is shown for that alert

### Requirement: Alert Tutor Reassignment

The system SHALL allow admin (and the assigned tutor) to reassign an alert to a different tutor via a dropdown of active tutors. Reassignment SHALL update `tutor_id` on the alert row.

#### Scenario: Admin reassigns alert to another tutor

- GIVEN an admin is viewing a pending alert
- WHEN the admin selects a different tutor from the reassign dropdown
- THEN the alert's `tutor_id` is updated
- AND the alert appears under the new tutor's list

### Requirement: Alert Detail Display

Each alert row MUST display: student full name (from `usuarios!estudiante_id`), alert type (`tipo`), description, creation date, and current status.

#### Scenario: Alert row shows complete information

- GIVEN an alert with all fields populated
- WHEN the alert is rendered in the list
- THEN student name, tipo, descripcion, formatted date, and status badge are visible
