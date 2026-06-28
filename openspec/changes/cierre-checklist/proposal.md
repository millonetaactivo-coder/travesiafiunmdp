# Proposal: Checklist de Cierre — Travesía

## Intent

Resolve 4 pending items from the Travesía implementation checklist: admin-configurable survey dates, score scale documentation, automatic red-zone entry tracking, and alert-level copy text for the student dashboard.

## Scope

### In Scope
- Add `fechas_encuesta` config key to `configuracion` table + admin UI to set academic calendar dates
- Add `fecha_entrada_rojo` column to `scores` table + update `calcular-score` Edge Function to record red-zone entry date
- Update `DashEstudiante.tsx` alert messages per specified copy
- Document the 0-30/31-55/56-80/81-100 score scale in scoreMap comments

### Out of Scope
- Scheduled jobs or automatic survey triggers (fechas are config only; dispatch is manual or future work)
- Threshold editing UI (already exists via `configuracion` table; admin can use SQL)
- Any backend notification or email on red-zone entry

## Capabilities

### New Capabilities
- `survey-date-config`: Admin UI to set fixed academic calendar survey dates stored in `configuracion` table
- `red-entry-tracking`: Automatic `fecha_entrada_rojo` timestamp recorded when a student's score first crosses into `critico`

### Modified Capabilities
- `dash-estudiante-real-data`: Alert messages per risk level changed to the specified copy text
- `score-threshold-config`: Scale documentation updated (implementation unchanged — scale is already correct)

## Approach

**Migration**: New migration `021_cierre_checklist.sql` adds `fecha_entrada_rojo timestamptz` to `scores` and seeds `fechas_encuesta` config key.

**Edge Function**: `calcular-score` — before inserting a new score, query the student's previous score. If previous `nivel_riesgo != 'critico'` and new `nivel_riesgo = 'critico'`, set `fecha_entrada_rojo = now()`. Otherwise preserve existing value (or leave null).

**UI — Config**: Add a date-picker section in `Configuracion.tsx` for `fechas_encuesta`. Persist as comma-separated ISO dates via `supabase.from('configuracion').upsert()`.

**UI — DashEstudiante**: Replace `scoreMap` messages. No structural changes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/` | New | Migration 021 for column + seed |
| `supabase/functions/calcular-score/` | Modified | Red-zone transition detection |
| `src/components/dashboards/Configuracion.tsx` | Modified | New section for survey dates |
| `src/components/dashboards/DashEstudiante.tsx` | Modified | Alert copy text update |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Migration fails on existing data | Low | `fecha_entrada_rojo` defaults null; no backfill needed |
| Edge Function timeout with extra query | Low | Previous score query uses same estudiante_id index |
| Config date format ambiguity | Low | Store ISO 8601 dates; parse in UI with `<input type="date">` |

## Rollback Plan

1. Roll back migration (drop column, delete config key) via Supabase dashboard
2. Redeploy previous `calcular-score` version
3. Revert DashEstudiante strings and Configuracion changes via git revert
4. No data loss: `fecha_entrada_rojo` is additive only

## Dependencies

None — all changes are self-contained within existing tables and functions.

## Success Criteria

- [ ] Admin can add/remove survey dates via UI and they persist in `configuracion`
- [ ] `fecha_entrada_rojo` is set exactly once when a student's score first crosses into `critico`
- [ ] Student dashboard shows the specified alert messages per risk level
- [ ] Existing scoring behavior and thresholds remain unchanged
