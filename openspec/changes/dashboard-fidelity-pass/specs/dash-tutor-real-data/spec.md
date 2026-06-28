# DashTutor Real Data

## Requirements

### Requirement: Real Score Per Student

The system MUST display each student's real `score` and `nivel_riesgo` from the database, replacing the fallback `score || 50` and `riskLevel || 'medio'`.

#### Scenario: Student has a computed score

- GIVEN a student with a row in `scores` table
- WHEN DashTutor table renders that row
- THEN the badge and numeric value match the DB record

#### Scenario: Student has no score yet

- GIVEN a student with no row in `scores`
- WHEN DashTutor table renders that row
- THEN the cell shows "Sin datos" instead of a fake default
