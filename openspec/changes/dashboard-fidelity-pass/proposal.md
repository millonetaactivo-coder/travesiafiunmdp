# Proposal: Dashboard Fidelity Pass

## Intent

Replace all MOCK data in 4 dashboards with real Supabase data. Every dashboard currently shows hardcoded numbers and fake counts. This change connects them to the live backend (hooks, services, and `get_distribucion_cohorte` RPC) so admins, tutors, students, and docentes see real metrics.

## Scope

### In Scope
- **DashAdmin**: real KPI counts (perfiles silenciosos, intervenciones), real bar-chart data, "sin tutor" widget
- **DashTutor**: real score + risk level per student; real pending-entrevistas count
- **DashDocente**: replace 100% MOCK with real filterable student list and traffic-light indicators; "en riesgo sin tutor" and "intervenciones activas" counters
- **DashEstudiante**: radial chart shows real score value (risk level already real)
- **AppRouter**: `alertCount` from DB (not `0`); `Placeholder` wrappers removed from 7 routes for minimal real pages
- **Backend**: new service queries for students-without-tutor, pending entrevistas count; `calcular-score` thresholds moved to `configuracion` table

### Out of Scope
- Full ABM on /usuarios, /alertas-intervenciones, /reportes pages (deferred to `workflow-views` change)
- Asignación manual de alerta a tutor UI (deferred)
- `scoringService.ts` completion (deferred; edge function handles scoring)
- Encuesta/plan pages (already real)

## Capabilities

### New Capabilities
- `admin-kpi-real`: DashAdmin KPIs + bar chart from live data
- `sin-tutor-widget`: students in naranja/rojo with no `tutor_id` assignment
- `docente-list-real`: DashDocente real data replacing 100% MOCK
- `tutor-scores-real`: DashTutor score + risk level per student from DB
- `tutor-entrevistas-count`: pending entrevistas counter for tutor dashboard
- `estudiante-radial-real`: DashEstudiante radial chart reflects real score value
- `alert-count-approuter`: alertBadge count from `useAlertas` hook
- `placeholder-to-real`: 7 route placeholders → minimal functional pages
- `threshold-config`: `calcular-score` reads thresholds from `configuracion` table

## Approach

1. **Backend queries**: Add RPC or service functions for: count of students in naranja/rojo without tutor; pending entrevistas count per tutor; count interventions this month. Add a `configuracion` row for score thresholds.
2. **Update hooks**: Extend `useEstudiantes` to optionally JOIN scores per student. Create `useAlertas` variant for global pending count (not filtered by tutor).
3. **Replace MOCKs**: In each dashboard TSX, replace hardcoded values with hook/service calls. Keep existing layout, animations, and chart config.
4. **Placeholder pages**: Wrap each route in a minimal CRUD shell (list + filter) using existing service functions — enough to remove blank `<Placeholder>`.
5. **Thresholds**: Add migration inserting threshold values into `configuracion`. Update `calcular-score` edge function to read from DB at runtime.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/dashboards/DashAdmin.tsx` | Modified | Real KPIs + bar data + sin-tutor widget |
| `src/components/dashboards/DashTutor.tsx` | Modified | Real scores per student |
| `src/components/dashboards/DashDocente.tsx` | Modified | Real student list + counters |
| `src/components/dashboards/DashEstudiante.tsx` | Modified | Radial chart value → real score |
| `src/components/AppRouter.tsx` | Modified | alertCount real; placeholder routes → real |
| `src/hooks/useEstudiantes.ts` | Modified | Optional score JOIN |
| `src/services/estudiantesService.ts` | Modified | New queries (sin-tutor, with-scores) |
| `supabase/functions/calcular-score/index.ts` | Modified | Read thresholds from configuracion |
| `supabase/migrations/` | New | configuracion threshold seed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| DB empty (no scores) → dashboards show zero | High | Graceful empty state; seed script included |
| `getEstudiantesDelTutor` perf with score join | Low | Batch or edge function call; cohort is <500 students |
| Placeholder pages exceed scope budget | Medium | Start with list-only MVP; full CRUD deferred to `workflow-views` |

## Rollback Plan

Each dashboard change is a single-file TSX edit. Revert file by file via `git checkout`. Backend RPCs are additive (new functions) — rollback by dropping the function. Threshold migration is reversible (drop config row, restore hardcoded values).

## Dependencies

- Edge function `calcular-score` v2 deployed and active
- `get_distribucion_cohorte` RPC exists in Supabase
- At least one carrera with students seeded in DB

## Success Criteria

- [ ] All 4 dashboards show values from Supabase, not hardcoded constants
- [ ] `alertCount` badge updates when alertas rows change
- [ ] 7 `/ayuda`, `/alumnos`, `/alertas`, `/intervenciones`, `/materias`, `/reportes`, `/usuarios` routes render real pages (not `<Placeholder>`)
- [ ] `calcular-score` reads thresholds from `configuracion`, not inline constants
- [ ] `tsc --noEmit` passes (no type errors)
- [ ] 0 remaining `// MOCK` or `/* Fake */` comments in dashboard files
