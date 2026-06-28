# DashDocente Real Data

## Requirements

### Requirement: Real Student Metrics

The system MUST replace all MOCK data (student count "42", progress bars 72%/88%/45%, radar chart) with real data from `useEstudiantes` joined with score data.

#### Scenario: Docente has students with scores

- GIVEN a docente is assigned to a materia with enrolled students
- WHEN DashDocente renders
- THEN student count, progress bars, and radar chart reflect real aggregated metrics

#### Scenario: No students assigned

- GIVEN a docente with no enrolled students
- WHEN DashDocente renders
- THEN all counters show `0` and charts display an empty-state message
