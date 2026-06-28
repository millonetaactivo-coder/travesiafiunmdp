# Exploration: cierre-checklist

## 1. Frecuencia de encuestas configurable

**Source**: `supabase/migrations/020_configuracion_tramos.sql`

The `configuracion` table is a key-value store (`clave text UNIQUE, valor text`). Only `service_role` and admin (via `is_admin()`) can write. Current keys: `umbral_verde`, `umbral_amarillo`, `umbral_naranja`. NO key for survey dates exists.

**Gap**: No mechanism to store fixed academic calendar dates (e.g., `15/04, 15/07, 15/11`). Solution: add a `fechas_encuesta` config key storing comma-separated ISO dates. The Configuracion.tsx UI (`src/components/dashboards/Configuracion.tsx`) only shows `indicadores` weight sliders — needs a new section for date management.

**Route**: `/configuracion` already exists for admin role (`AppRouter.tsx:371`).

## 2. Inconsistencia escalas score

**Source**: `supabase/functions/calcular-score/index.ts` (lines 300–329)

The Edge Function reads thresholds from `configuracion` and classifies:
- `bajo`: ≤ `umbral_verde` (30) → 0-30
- `medio`: ≤ `umbral_amarillo` (55) → 31-55
- `alto`: ≤ `umbral_naranja` (80) → 56-80
- `critico`: > 80 → 81-100

**This scale IS already implemented.** No code change needed. The issue is documentation: the scale mapping should be reflected in the static `scoreMap` in DashEstudiante.tsx and any admin-facing docs.

## 3. fecha_entrada_rojo

**Source**: `supabase/migrations/000_base_de_datos.sql` (lines 228–238)

`scores` table columns: `id, estudiante_id, valor, nivel_riesgo, cuatrimestre, anio, componentes, calculado_at`. **NO `fecha_entrada_rojo` column exists.**

The `calcular-score` function inserts scores (line 331) but never checks whether the student just crossed into `critico` from a lower level. It doesn't record the transition date.

**Solution**: ALTER TABLE + COLUMN (`fecha_entrada_rojo timestamptz`), update Edge Function to detect transition and set date only on first entry.

## 4. Copy text por nivel de alerta

**Source**: `src/components/dashboards/DashEstudiante.tsx` (lines 63–68)

Current `scoreMap` messages are generic encouragement. The requested specific copy is:

| Nivel | Label | Message |
|-------|-------|---------|
| bajo (verde) | Vigoroso | Sin acción requerida |
| medio (amarillo) | Moderado | Estás en una etapa que requiere atención |
| alto (naranja) | Alto Riesgo | Detectamos que podés estar atravesando dificultades... |
| critico (rojo) | Crítico | Estamos acá para ayudarte... |

Only UI string changes needed. Labels and colors stay the same.

## Summary

4 capability areas mapped to concrete code locations. All are LOW complexity: 1 migration, 1 Edge Function update, 1 UI config form extension, 1 UI string update.
