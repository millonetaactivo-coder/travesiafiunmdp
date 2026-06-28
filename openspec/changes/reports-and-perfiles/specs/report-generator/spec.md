# Report Generator Specification

## Purpose

Parameterized report builder in ReportesPage: type selection, filters, table output, CSV export, anonymization toggle, and ranking report type.

## Requirements

### Requirement: Report Type Selection

The system SHALL provide report types: cohorte (risk distribution), materia (pass/fail rates), período (score trends), ranking (subject difficulty ranking).

#### Scenario: Select cohorte report

- GIVEN an admin on ReportesPage
- WHEN they select "Cohorte" and a carrera
- THEN the system SHALL display risk distribution table for that carrera

#### Scenario: Select ranking report

- GIVEN an admin selects "Ranking de materias"
- WHEN they choose a carrera and período
- THEN the system SHALL display materias ranked by failure rate

### Requirement: Filter Builder

The system SHALL provide filters per report type: carrera (all), anio_ingreso (cohorte/período), materia (materia/ranking), cuatrimestre+anio (all).

#### Scenario: Filter materia report by subject

- GIVEN the admin selects "Materia" report type
- WHEN they pick materia="Álgebra" and carrera="Ing. Civil"
- THEN the table SHALL show pass/fail counts for that subject

### Requirement: Table Output

The system SHALL render results as a sortable data table with column headers appropriate to the report type.

#### Scenario: Empty result set

- GIVEN filters that match no data
- WHEN the report runs
- THEN the system SHALL display "Sin datos para los filtros seleccionados"

### Requirement: CSV Export

The system SHALL provide a "Exportar CSV" button that downloads the current report table as a `.csv` file.

#### Scenario: Export cohorte report

- GIVEN a cohorte report is displayed with 50 rows
- WHEN the user clicks "Exportar CSV"
- THEN a CSV file SHALL download with all visible columns and rows

### Requirement: Anonymization Toggle

The system SHALL provide a toggle "Anonimizar" that, when enabled, removes nombre and legajo columns from the output and CSV.

#### Scenario: Anonymized export

- GIVEN the anonymization toggle is ON
- WHEN the user exports CSV
- THEN the CSV SHALL NOT contain nombre or legajo columns
