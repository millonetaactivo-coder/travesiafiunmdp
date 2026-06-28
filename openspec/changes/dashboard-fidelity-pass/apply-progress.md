# Apply Progress — dashboard-fidelity-pass (PR 1/2 + PR 2/2 COMPLETE)

**Date**: 2026-06-28
**Mode**: Standard
**PR**: 1 of 2 + 2 of 2 — All phases complete
**Status**: All 8 phases complete. Ready for verify.

---

## Phase 1: score-threshold-config (foundational)

- [x] 1.1 Create migration `supabase/migrations/020_configuracion_tramos.sql` — creates `configuracion` table with RLS (authenticated read, admin write), seeded with default thresholds (umbral_verde=30, umbral_amarillo=55, umbral_naranja=80)
- [x] 1.2 Create service `src/services/configuracionService.ts` with `getThresholds()` function — queries configuracion table, returns `ScoreThresholds` type, falls back to hardcoded defaults on error
- [x] 1.3 Update Edge Function `supabase/functions/calcular-score/index.ts` — reads thresholds from `configuracion` table dynamically, hardcoded 30/55/80 kept as FALLBACK when DB returns empty

## Phase 2: dash-admin-real-data

- [x] 2.1 `DashAdmin.tsx`: Replaced `perfilesSilenciosos = 12` with real count from Supabase (students with nivel_riesgo IN ('alto', 'critico')). Replaced `intervencionesMes = 24` with real count from `intervenciones` table (this month). Kept `useScore` for distribucion data.
- [x] 2.2 Replaced static `abandonoData` bar chart with real query — joins `cursadas` with `materias` to show top 5 materias by failure/desaprobación rate
- [x] 2.3 Added "Alumnos sin tutor asignado" widget — queries students in alto/critico risk, checks `asignaciones_tutor` for NULL assignments, shows count + link to action
- [x] 2.4 Wired distribucion to use 4 colors: verde (bajo/#22C55E), amarillo (medio/#FBBF24), naranja (alto/#F97316), rojo (critico/#EF4444)

## Phase 3: dash-docente-real-data

- [x] 3.1 Full rewrite of `DashDocente.tsx` — was 100% mock. Now uses `useEstudiantes` for real student list with batch-fetched scores from `scores` table
- [x] 3.2 Added filters: año de cursada (dropdown from unique anio_ingreso values), estado de riesgo (dropdown)
- [x] 3.3 Added KPI counters: "alumnos en riesgo sin tutor" (queries asignaciones_tutor for high-risk students) and "intervenciones activas" (this month count)

## Phase 4: dash-tutor-real-data

- [x] 4.1 Replaced `student.score || 50` with real score from `scores` table — batch fetches latest score per student via `useEstudiantes` data + supabase query
- [x] 4.2 Replaced `student.riskLevel || 'medio'` with real `scoreData.nivel_riesgo` from scores table
- [x] 4.3 Added "entrevistas pendientes" count — queries `entrevistas` where `seguimiento_requerido = true` for tutor's students

## Phase 5: dash-estudiante-real-data

- [x] 5.1 Replaced hardcoded `data = [{ value: 75 }]` with real `ultimoScore.valor` from `useScore`
- [x] 5.2 Added duplicate guard on "Pedir ayuda" button — checks `alertas` table for existing `solicitud_ayuda` with `estado = 'pendiente'` before creating new one. Button shows "Solicitud Enviada" state when pending.

## Phase 6: app-router-alert-badge

- [x] 6.1 Replaced `const alertCount = 0` with real count from `useAlertas(usuario?.id || '')` — only computes count for tutor/asesor_par roles
- [x] 6.2 Badge already shows only when count > 0 (existing conditional `{alertCount > 0 && ...}`)

## Phase 7: placeholder-routes-mvp (PR 2)

- [x] 7.1 Create `src/components/dashboards/AyudaPage.tsx` — static help center with FAQ items and contact CTA, glassmorphism cards, framer-motion stagger
- [x] 7.2 Create `src/components/dashboards/AlumnosPage.tsx` — tutor student list using `useEstudiantes`, search bar, student cards with email link
- [x] 7.3 Create `src/components/dashboards/AlertasPage.tsx` — alert list with status filter tabs (todas/pendiente/resuelta), resolve action via `resolverAlerta`
- [x] 7.4 Create `src/components/dashboards/IntervencionesPage.tsx` — intervention list for tutors (queries their students' intervenciones) and students (own intervenciones)
- [x] 7.5 Create `src/components/dashboards/MateriasPage.tsx` — materias list from `usePlan`, shows code/year/semester/crítica badge
- [x] 7.6 Create `src/components/dashboards/ReportesPage.tsx` — pure "Próximamente" placeholder with icon and description
- [x] 7.7 Create `src/components/dashboards/UsuariosPage.tsx` — admin-gated user list, role badge, lock screen for non-admins
- [x] 7.8 Modify `src/components/AppRouter.tsx` — replaced 7 `<Placeholder>` elements with real page imports; removed `Placeholder` component
- [x] 7.9 Verify: all 7 routes render real list pages; no `<Placeholder>` references remain

## Phase 8: empty-state-handling (All Dashboards)

- [x] 8.1 All new pages include loading spinner, error state (where applicable), and empty-state UI
- [x] 8.2 Consistent empty-state pattern: icon + descriptive text + contextual guidance per page
- [x] 8.3 All pages handle empty arrays gracefully (0 count, friendly messages)
- [x] 8.4 `tsc --noEmit` passes clean across all files

---

## Files Changed (PR 1)

| File | Action | What Was Done |
|------|--------|---------------|
| `supabase/migrations/020_configuracion_tramos.sql` | Created | configuracion table with RLS + seed data |
| `src/services/configuracionService.ts` | Created | getThresholds() service with fallback |
| `supabase/functions/calcular-score/index.ts` | Modified | Dynamic threshold lookup from DB |
| `src/components/dashboards/DashAdmin.tsx` | Rewritten | Real queries for all KPIs, 4-color distribution, materias criticas, alumnos sin tutor |
| `src/components/dashboards/DashDocente.tsx` | Rewritten | Real student list with scores, filters, KPI counters |
| `src/components/dashboards/DashTutor.tsx` | Rewritten | Real scores per student, entrevistas pendientes counter |
| `src/components/dashboards/DashEstudiante.tsx` | Rewritten | Real score in radial chart, duplicate help alert guard |
| `src/components/AppRouter.tsx` | Modified | Real alert count from useAlertas for tutor badge |

## Files Changed (PR 2)

| File | Action | What Was Done |
|------|--------|---------------|
| `src/components/dashboards/AyudaPage.tsx` | Created | Help center with FAQ and contact CTA |
| `src/components/dashboards/AlumnosPage.tsx` | Created | Student list shell with search and email links |
| `src/components/dashboards/AlertasPage.tsx` | Created | Alert list with filter tabs and resolve action |
| `src/components/dashboards/IntervencionesPage.tsx` | Created | Intervention list for tutors and students |
| `src/components/dashboards/MateriasPage.tsx` | Created | Materias list from plan de estudios |
| `src/components/dashboards/ReportesPage.tsx` | Created | "Próximamente" placeholder |
| `src/components/dashboards/UsuariosPage.tsx` | Created | Admin-gated user list with role badges |
| `src/components/AppRouter.tsx` | Modified | 7 route swaps + Placeholder component removed |

## Deviations from Design

None — implementation matches design.

## Issues Found

None.

## Verification

- ✅ `tsc --noEmit` passes clean
- ✅ All 8 phases checked off
- ✅ All glassmorphism patterns maintained (bg-white/[0.04], border-white/[0.07], rounded-2xl, backdrop-blur-md)
- ✅ All pages use framer-motion entrance animations (opacity: 0, y: 16 → opacity: 1, y: 0)
- ✅ All pages handle loading, empty, and error states
- ✅ Relative imports used consistently (../../hooks, ../../services, ../../lib)
- ✅ cn() used for class merging where needed
- ✅ Font classes match design system: font-display for headings, font-sans for body
- ✅ No `<Placeholder>` references remain in AppRouter
