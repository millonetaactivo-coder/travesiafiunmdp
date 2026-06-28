# Tasks: Dashboard Fidelity Pass

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~535 |
| 400-line budget risk | Medium |
| 800-line budget | Within limit |
| Chained PRs recommended | Yes (2 PRs) |
| Suggested split | PR 1: backend + dashboards (~290 lines) · PR 2: placeholder pages (~210 lines) |
| Delivery strategy | auto-forecast |

```
Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium
```

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Migration + Edge Function + service queries + all 4 dashboard rewrites + AppRouter alert badge | PR 1 | Backend foundation + dashboard wiring; depends on nothing |
| 2 | 7 placeholder page components + AppRouter route swap | PR 2 | Independent of PR 1 data wiring; imports only |

---

## Phase 1: score-threshold-config (Foundation)

- [ ] 1.1 Create `supabase/migrations/020_configuracion_thresholds.sql` — `configuracion` table with `clave`/`valor` JSONB, RLS policy, seed row `score_thresholds` = `{bajo:30, medio:55, alto:80}`
- [ ] 1.2 Update `supabase/functions/calcular-score/index.ts` — read thresholds from `configuracion` table at startup; fall back to 30/55/80 if row missing; log warning on fallback
- [ ] 1.3 Verify: `tsc --noEmit` passes; edge function reads thresholds from DB

## Phase 2: dash-admin-real-data

- [ ] 2.1 Create `src/services/estadisticasService.ts` — `getPerfilesSilenciososCount()`, `getIntervencionesMesCount()`, `getMateriasCriticas()`, `getSinTutorCount()` using Supabase `.select(..., { count: 'exact' })` with date/role filters
- [ ] 2.2 Modify `src/services/alertasService.ts` — add `getAlertasPendientesCount(userId)` returning count of `estado='pendiente'` rows
- [ ] 2.3 Modify `src/components/dashboards/DashAdmin.tsx` — replace hardcoded KPI values with `estadisticasService` calls; replace `abandonoData` bar chart with `getMateriasCriticas()`; add empty-state guards (show `0`, not NaN)
- [ ] 2.4 Verify: DashAdmin renders real KPIs; empty DB shows `0` on all cards

## Phase 3: dash-docente-real-data

- [ ] 3.1 Modify `src/services/estudiantesService.ts` — add `getEstudiantesPorCarreraConScore(carreraId)` joining latest `scores` row per student
- [ ] 3.2 Modify `src/hooks/useEstudiantes.ts` — accept `withScores` option; route to new service variant when true
- [ ] 3.3 Rewrite `src/components/dashboards/DashDocente.tsx` — replace all MOCK data (count "42", progress bars, radar) with `useEstudiantes(userId, 'docente', carreraId, { withScores: true })`; compute real aggregated metrics; add empty-state for no students
- [ ] 3.4 Verify: Docente dashboard shows real student count and traffic-light indicators

## Phase 4: dash-tutor-real-data

- [ ] 4.1 Modify `src/services/estudiantesService.ts` — add `getEstudiantesDelTutorConScore(tutorId)` joining latest `scores` row
- [ ] 4.2 Modify `src/services/intervencionesService.ts` — add `getEntrevistasPendientesCount(tutorId)`
- [ ] 4.3 Modify `src/components/dashboards/DashTutor.tsx` — replace `score || 50` and `riskLevel || 'medio'` fallbacks with real DB values; show "Sin datos" when no score exists; wire pending entrevistas counter
- [ ] 4.4 Verify: Tutor table shows real scores; students without score show "Sin datos"

## Phase 5: dash-estudiante-real-data + pedir-ayuda-verify

- [ ] 5.1 Modify `src/components/dashboards/DashEstudiante.tsx` — set radial chart `data[0].value` to `ultimoScore.valor` replacing hardcoded `75`; show "Sin datos aún" when no score
- [ ] 5.2 Modify `src/services/alertasService.ts` — add `existeAlertaAyudaPendiente(userId)` checking for existing pending `solicitud_ayuda` row
- [ ] 5.3 Modify `src/components/dashboards/DashEstudiante.tsx` — wrap "Pedir Ayuda" handler with duplicate guard; show "Ya se envió tu solicitud" on repeat click
- [ ] 5.4 Verify: radial chart reflects real score; double-click on Pedir Ayuda shows duplicate message, no extra row

## Phase 6: app-router-alert-badge

- [ ] 6.1 Modify `src/components/AppRouter.tsx` — import `useAlertas`; compute `alertCount` from `alertas.filter(a => a.estado === 'pendiente').length`; pass to dock bell icon
- [ ] 6.2 Verify: alert badge shows real count; zero alertas hides badge

## Phase 7: placeholder-routes-mvp

- [x] 7.1 Create `src/pages/AyudaPage.tsx` — student help request history list using `getAlertasByUser(userId)`
- [x] 7.2 Create `src/pages/AlumnosPage.tsx` — tutor student list using `useEstudiantes(userId, 'tutor')`
- [x] 7.3 Create `src/pages/AlertasPage.tsx` — alert list with resolve action using `getAlertas()`
- [x] 7.4 Create `src/pages/IntervencionesPage.tsx` — intervention list using `getIntervenciones()`
- [x] 7.5 Create `src/pages/MateriasPage.tsx` — docente materias list using `getMaterias()`
- [x] 7.6 Create `src/pages/ReportesPage.tsx` — reportes list shell (placeholder card grid)
- [x] 7.7 Create `src/pages/UsuariosPage.tsx` — users list using `getUsuarios()`
- [x] 7.8 Modify `src/components/AppRouter.tsx` — replace 7 `<Placeholder>` imports with real page component imports; remove `Placeholder` component reference
- [x] 7.9 Verify: all 7 routes render real list pages; no `<Placeholder>` references remain

## Phase 8: empty-state-handling (All Dashboards)

- [ ] 8.1 Audit all 4 dashboards for NaN/null/throw paths when DB returns empty arrays or zero counts
- [ ] 8.2 Add consistent empty-state UI: descriptive message + illustration/icon per dashboard section
- [ ] 8.3 Verify: each dashboard renders cleanly with fresh empty DB; no console errors, no NaN displays
- [ ] 8.4 Run `tsc --noEmit` — confirm zero type errors across all modified files
