# red-entry-tracking Specification

## Purpose

Automatically record the timestamp when a student's score first crosses into the red (critico) zone.

## Requirements

### Requirement: Red Zone Entry Timestamp

The `scores` table SHALL include a `fecha_entrada_rojo timestamptz` nullable column. When a student's score transitions to `nivel_riesgo = 'critico'` (score ≥ 81) for the first time, the system MUST set `fecha_entrada_rojo = now()`.

#### Scenario: First entry into rojo

- GIVEN a student whose previous score had `nivel_riesgo = 'alto'`
- WHEN `calcular-score` computes a new score of 82 (`nivel_riesgo = 'critico'`)
- THEN the inserted row has `fecha_entrada_rojo` set to the current timestamp

#### Scenario: Already in rojo — no overwrite

- GIVEN a student whose previous score had `nivel_riesgo = 'critico'` and `fecha_entrada_rojo = '2026-05-01T10:00:00Z'`
- WHEN `calcular-score` computes a new score of 85
- THEN the inserted row preserves `fecha_entrada_rojo = '2026-05-01T10:00:00Z'` (first entry date)

#### Scenario: Score drops below rojo

- GIVEN a student with `fecha_entrada_rojo = '2026-05-01T10:00:00Z'` and current `nivel_riesgo = 'critico'`
- WHEN `calcular-score` computes a new score of 60 (`nivel_riesgo = 'alto'`)
- THEN the inserted row has `fecha_entrada_rojo = null` (no longer in red zone)
