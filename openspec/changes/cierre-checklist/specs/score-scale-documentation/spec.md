# score-scale-documentation Specification

## Purpose

Document and enforce the official 4-color risk score scale across all score-related UI.

## Requirements

### Requirement: Official Scale Definition

The system SHALL define and document the risk scale as: 0–30 verde (bajo), 31–55 amarillo (medio), 56–80 naranja (alto), 81–100 rojo (critico). All score-to-color mappings MUST use these thresholds.

#### Scenario: Score 25 maps to verde

- GIVEN a student with `valor = 25`
- WHEN the UI renders the score label
- THEN the label color is green (verde) and text reads "Vigoroso"

#### Scenario: Score 45 maps to amarillo

- GIVEN a student with `valor = 45`
- WHEN the UI renders the score label
- THEN the label color is yellow (amarillo) and text reads "Moderado"

#### Scenario: Score 70 maps to naranja

- GIVEN a student with `valor = 70`
- WHEN the UI renders the score label
- THEN the label color is orange (naranja) and text reads "Alto Riesgo"

#### Scenario: Score 90 maps to rojo

- GIVEN a student with `valor = 90`
- WHEN the UI renders the score label
- THEN the label color is red (rojo) and text reads "Crítico"
