# Indicator Engine Specification

## Purpose

Admin UI to view and edit existing indicadores and their indicador_componentes (formulas, pesos). MVP scope: edit existing only, no creation of new indicators.

## Requirements

### Requirement: Indicator List View

The system SHALL display all `indicadores` with: nombre, descripcion, peso, activo status, and their componentes.

#### Scenario: Admin opens indicator engine

- GIVEN an admin navigates to the indicator engine section
- WHEN the page loads
- THEN all indicadores SHALL be listed with their componentes nested

#### Scenario: Read-only for non-admin

- GIVEN a user with rol="docente"
- WHEN they access the indicator engine
- THEN all data SHALL be visible but edit controls SHALL be hidden

### Requirement: Edit Indicator Peso and Descripción

The system SHALL allow admin to update `peso` (integer 0-100) and `descripcion` on existing indicadores.

#### Scenario: Update indicator weight

- GIVEN an admin changes indicador "Rendimiento" peso from 30 to 25
- WHEN they click save
- THEN the `indicadores` row SHALL update; active pesos MUST still sum to 100

#### Scenario: Peso sum validation

- GIVEN active indicadores sum to 95%
- WHEN admin attempts to save
- THEN the system SHALL show a validation error and block the save

### Requirement: Edit Component Formula and Peso

The system SHALL allow admin to update `formula` (text) and `peso` on `indicador_componentes` within each indicador.

#### Scenario: Edit component formula

- GIVEN an admin expands indicador "Rendimiento"
- WHEN they edit a component's formula text and peso
- THEN the `indicador_componentes` row SHALL update on save

### Requirement: View-Only Component List

The system SHALL display indicador_componentes as a nested list showing nombre, formula, peso for each component. Creation of new components is out of scope.

#### Scenario: View components

- GIVEN an admin views indicador "Engagement"
- WHEN the component list renders
- THEN each component's nombre, formula, and peso SHALL be displayed
