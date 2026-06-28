# alert-copy-text Specification

## Purpose

Display level-appropriate alert messages in the student dashboard (DashEstudiante) based on risk level.

## Requirements

### Requirement: Risk-Level Alert Messages

DashEstudiante MUST display the following messages per `nivel_riesgo`:

| nivel_riesgo | Message |
|---|---|
| bajo (verde) | "Sin acción requerida por el momento" |
| medio (amarillo) | "Estás en una etapa que requiere atención" |
| alto (naranja) | "Detectamos que podés estar atravesando dificultades, tu tutor se va a comunicar con vos pronto" |
| critico (rojo) | "Estamos acá para ayudarte, podés pedir asistencia ahora" + prominent help button |

#### Scenario: Verde level message

- GIVEN a student with `nivel_riesgo = 'bajo'`
- WHEN DashEstudiante renders the alert section
- THEN the message displayed is "Sin acción requerida por el momento"

#### Scenario: Rojo level with help button

- GIVEN a student with `nivel_riesgo = 'critico'`
- WHEN DashEstudiante renders the alert section
- THEN the message displayed is "Estamos acá para ayudarte, podés pedir asistencia ahora" AND a prominent help/assistance button is visible
