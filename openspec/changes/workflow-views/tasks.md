# Tasks: Workflow Views

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~405 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Phase 1: alert-center enhancements

- [x] 1.1 Create `src/hooks/useTutores.ts` — fetch active tutors/asesores from `usuarios` + `usuario_roles` where `rol IN ('tutor','asesor_par')` for reassignment dropdown
- [x] 1.2 Modify `src/hooks/useAlertas.ts` — accept optional `role` param; admin fetch skips `tutor_id` filter, returns all alerts
- [x] 1.3 Modify `src/services/alertasService.ts` — add `getAlertas(tutorId?: string)` overload and `reassignAlerta(alertaId, newTutorId)` function
- [x] 1.4 Add filter tabs (todas/pendiente/resuelta) with counts to `src/components/dashboards/AlertasPage.tsx` — state: `filtro` enum, filter logic on alert list
- [x] 1.5 Add inline "Resolver" button on pending alert cards in `AlertasPage.tsx` — calls `alertasService.resolverAlerta(id)`, optimistic update
- [x] 1.6 Add admin overview mode in `AlertasPage.tsx` — when `rol === 'admin'`, show all tutors' alerts with columns: student name, score, tipo, date
- [x] 1.7 Add "Reasignar tutor" dropdown in `AlertasPage.tsx` — uses `useTutores()`, calls `reassignAlerta()`, admin-only

## Phase 2: interview-management enhancements

- [x] 2.1 Create `src/lib/formatters.ts` — `formatAlertType()`, `formatModality()`, `formatRiskLevel()` helper functions
- [x] 2.2 Create `src/hooks/useEntrevistas.ts` — fetch interventions with `entrevistas` detail joined, scoped by role (tutor → own students, admin → all)
- [x] 2.3 Create `src/components/ui/InterviewForm.tsx` — shared modal component with fields: fecha_realizada, modalidad (presencial/virtual/telefonica), motivo, resumen, estado_alumno_percibido, factores_riesgo, seguimiento_requerido. Props: `isOpen`, `onClose`, `onSuccess`, `estudiantes`, `estudianteIdPreseleccionado?`, `tutorId`
- [x] 2.4 Add form validation in `InterviewForm.tsx` — required: estudiante, fecha_realizada, modalidad; date constraint: no past dates blocked (allow future for planned)
- [x] 2.5 Wire `InterviewForm` submit in `InterviewForm.tsx` — sequential insert into `intervenciones` then `entrevistas` via `intervencionesService`; set `estado = 'planificada'` if future date, else `'realizada'`
- [x] 2.6 Add "Nueva entrevista" button + interview list to `src/components/dashboards/IntervencionesPage.tsx` — list shows planned/completed sections with entrevistas detail columns (factores, estado_alumno_percibido)
- [x] 2.7 Replace inline modal in `src/components/dashboards/DashTutor.tsx` with shared `InterviewForm` component — same API contract, no behavior change

## Phase 3: risk-outreach (new page)

- [x] 3.1 Create `src/hooks/useSinContacto.ts` — query students in `scores` where `nivel_riesgo IN ('alto','critico')` LEFT JOIN `intervenciones` with count=0; scoped by role
- [x] 3.2 Create `src/components/dashboards/SinContactoPage.tsx` — glassmorphism page shell, list of at-risk students with: name, score level badge, days since last contact, "Nueva Entrevista" quick action button
- [x] 3.3 Add "Registrar contacto" button per row in `SinContactoPage.tsx` — opens `InterviewForm` with student pre-selected; after submit, student disappears from list (refetch)
- [x] 3.4 Add `/sin-contacto` route in `src/components/AppRouter.tsx` — import `SinContactoPage`, add to router with tutor/admin guard; add to FloatingDock

## Phase 4: verify

- [x] 4.1 Run `tsc --noEmit` — verify zero type errors across all modified/created files
- [x] 4.2 Verify AlertasPage renders with filter tabs, resolve button, admin overview, reassign dropdown
- [x] 4.3 Verify IntervencionesPage renders interview list and "Nueva entrevista" opens InterviewForm modal
- [x] 4.4 Verify SinContactoPage renders at-risk students list, empty state shows "No hay estudiantes en riesgo sin contacto"
- [x] 4.5 Verify DashTutor still works with shared InterviewForm (no regression in existing tutor flow)
