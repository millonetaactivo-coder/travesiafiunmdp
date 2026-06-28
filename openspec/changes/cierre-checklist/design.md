# Design: cierre-checklist

## Migration: 021_fecha_entrada_rojo.sql
- Add `fecha_entrada_rojo timestamptz` to `scores` table (nullable, no backfill)
- GRANT SELECT for authenticated (INSERT already covered by existing RLS)

## Edge Function: calcular-score/index.ts
- After determining nivel_riesgo, check if score >= 81 AND existing fecha_entrada_rojo IS NULL
- If so, set fecha_entrada_rojo = NOW() on the INSERT
- Uses `.not('fecha_entrada_rojo', 'is', null)` with `.maybeSingle()` to check prior state

## Configuracion page: Configuracion.tsx
- Add "Fechas de Encuesta" section with Calendar icon
- Allow admin to add/remove date inputs (Plus, Trash2 icons)
- Save as JSON array in configuracion table with key `fechas_encuesta`
- Uses upsert on `clave` to handle both insert and update

## DashEstudiante: DashEstudiante.tsx
- Read nivel_riesgo from ultimoScore
- Show level-appropriate message text (medio/alto/critico have specific guidance)
- Enhanced "Pedir ayuda" button: ring-2, animate-pulse, "Pedir Ayuda Ahora" when alto/critico
