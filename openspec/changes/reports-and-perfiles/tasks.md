# Tasks: Reports & Perfiles

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1050 (3 PRs x ~350) |
| 400-line budget risk | High (overall), Low (per PR) |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (foundations) → PR 2 (admin tools) → PR 3 (reports) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | CareerContext + PerfilPage + AlumnosPage + routes | PR 1 | Base: main. Foundation for all downstream. |
| 2 | CargaNotas + Indicadores + Usuarios CRUD + admin-create-user fn | PR 2 | Base: PR 1 branch. Depends on CareerContext. |
| 3 | ReportesPage + AsignarTutores + generar-reporte fn | PR 3 | Base: PR 2 branch. Depends on services from PR 2. |

---

## Phase 1: Career Context Foundation (PR 1)

- [x] 1.1 Create `src/context/CareerContext.tsx` — `CareerContextValue` interface, provider, `useCareer` hook
- [x] 1.2 Create `src/components/ui/CareerSelector.tsx` — dropdown for admin/docente; hidden for student role
- [x] 1.3 Modify `src/components/AppLayout.tsx` — wrap children with `CareerContextProvider`, render `CareerSelector` in header

## Phase 2: Student Profile Page (PR 1)

- [x] 2.1 Create `src/components/dashboards/PerfilEstudiantePage.tsx` — 4-tab layout (Datos / Notas / Encuestas / Entrevistas) with lazy tab hooks
- [x] 2.2 Create tab sub-components: `ProfileDatosTab`, `ProfileNotasTab`, `ProfileEncuestasTab`, `ProfileEntrevistasTab`
- [x] 2.3 Wire `InterviewForm` modal for new entrevista creation from Entrevistas tab
- [x] 2.4 Add role gate: admin=all, tutor=assigned only, student=self only

## Phase 3: Enhanced Student List (PR 1)

- [x] 3.1 Modify `src/hooks/useEstudiantes.ts` — accept `StudentFilters` param, include `has_tutor` field
- [x] 3.2 Modify `src/services/estudiantesService.ts` — filtered queries by carrera/año/riesgo/tutor, profile aggregation
- [x] 3.3 Modify `src/components/dashboards/AlumnosPage.tsx` — filter chips (`CustomSelect`), sortable headers, semáforo badges, row click → `/alumnos/:id`
- [x] 3.4 Modify `src/components/AppRouter.tsx` — add route `/alumnos/:id` → `PerfilEstudiantePage`; add dock items

## Phase 4: Manual Grade Entry (PR 2)

- [x] 4.1 Modify `src/services/scoresService.ts` — add `createCursada()` and `createFinal()` methods
- [x] 4.2 Create `src/components/dashboards/CargaNotasPage.tsx` — form with materia select, nota (0-10), estado, fecha; validation; toast feedback
- [x] 4.3 Modify `src/components/AppRouter.tsx` — add route `/carga-notas` → `CargaNotasPage`; dock item for admin/docente

## Phase 5: Indicator Engine Admin (PR 2)

- [x] 5.1 Create `src/services/configuracionService.ts` — CRUD for `indicadores` and `indicador_componentes`
- [x] 5.2 Modify `src/components/dashboards/Configuracion.tsx` — nested editor: list indicadores, expand to edit componentes, sum-to-100 validation, save button disabled on invalid
- [x] 5.3 Add role gate: admin=edit, docente=read-only

## Phase 6: User Role Management (PR 2)

- [x] 6.1 Create `src/services/usuariosService.ts` — list/create/update/delete users, assign roles
- [x] 6.2 Modify `src/components/dashboards/UsuariosPage.tsx` — CRUD table, inline role dropdown, create modal, status toggle, duplicate email guard
- [x] 6.3 Create `supabase/functions/admin-create-user/index.ts` — service-role user creation + role insert (no email confirmation wait)
- [x] 6.4 Test: admin creates user → appears in list → role assigned → status toggle works

## Phase 7: Report Generator (PR 3)

- [x] 7.1 Create `src/services/reportesService.ts` — wrapper for `generar-reporte` edge function
- [x] 7.2 Create `supabase/functions/generar-reporte/index.ts` — parameterized career-scoped queries, row cap, CSV-ready output
- [x] 7.3 Modify `src/lib/formatters.ts` — add `exportCSV(rows, { anonymize })` helper (drops nombre/legajo when anonymize=true)
- [x] 7.4 Modify `src/components/dashboards/ReportesPage.tsx` — report type selector, filter builder, results table, CSV download button, anonymize toggle

## Phase 8: Tutor Assignment (PR 3)

- [x] 8.1 Create `src/services/tutoresService.ts` — tutor list, assignment CRUD via `asignaciones_tutor`
- [x] 8.2 Create `src/components/dashboards/AsignarTutoresPage.tsx` — multi-select student rows, batch assign tutor, filter by career/risk, "Sin asignar" fallback
- [x] 8.3 Modify `src/components/AppRouter.tsx` — add route `/asignar-tutores` → `AsignarTutoresPage`; dock item for admin only

## Phase 9: Integration & Verification (All PRs)

- [x] 9.1 Run `tsc --noEmit` — zero errors
- [x] 9.2 Verify CareerContext scopes all service queries by selected `carrera_id`
- [x] 9.3 Smoke test: admin views student profile → tabs load → filters work → CSV exports
- [x] 9.4 Smoke test: admin creates user → assigns tutor → generates report → downloads CSV
- [x] 9.5 Verify role gates: student sees own profile only; tutor sees assigned only; admin sees all
