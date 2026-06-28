# Apply Progress: Workflow Views

## Status: COMPLETE

All 23 tasks implemented across 4 phases. `tsc --noEmit` passes with zero errors.

## Completed Tasks

### Phase 1: Alert Center (7/7)
- [x] 1.1 Created `src/hooks/useTutores.ts` — fetches users with `rol IN ('tutor', 'asesor_par')`
- [x] 1.2 Enhanced `src/hooks/useAlertas.ts` — added `role` param, `resolver()`, `reasignar()`, `selectedStatus` state
- [x] 1.3 Enhanced `src/services/alertasService.ts` — added `getAlertas()`, `reassignAlerta()`
- [x] 1.4 Enhanced AlertasPage with glass pill filter tabs (Todas/Pendientes/Resueltas) with counts
- [x] 1.5 Added inline "Resolver" button on pending alert cards with optimistic update
- [x] 1.6 Admin overview mode: when `rol === 'admin'`, shows all alerts without tutor_id filter
- [x] 1.7 "Reasignar tutor" dropdown for admin using `useTutores()`

### Phase 2: Interview Management (7/7)
- [x] 2.1 Created `src/lib/formatters.ts` — `formatAlertType()`, `formatModality()`, `formatRiskLevel()`, `daysSince()`, `formatDate()`
- [x] 2.2 Created `src/hooks/useEntrevistas.ts` — role-scoped interview fetching with `crearEntrevista()` action
- [x] 2.3 Created `src/components/ui/InterviewForm.tsx` — shared modal with all fields, validation, and submit
- [x] 2.4 Form validation: estudiante, fecha, modalidad required
- [x] 2.5 Submit wires to sequential insert (intervenciones + entrevistas), sets estado based on date
- [x] 2.6 Enhanced IntervencionesPage with Planificadas/Realizadas sections and "Nueva Entrevista" button
- [x] 2.7 Replaced DashTutor inline modal with shared InterviewForm

### Phase 3: Risk Outreach (4/4)
- [x] 3.1 Created `src/hooks/useSinContacto.ts` — queries at-risk students with 0 interventions
- [x] 3.2 Created `src/components/dashboards/SinContactoPage.tsx` — glassmorphism page with at-risk student list
- [x] 3.3 "Registrar contacto" button opens InterviewForm pre-filled with student; refetches on success
- [x] 3.4 Added `/sin-contacto` route and FloatingDock item for tutor/admin roles

### Phase 4: Verify (5/5)
- [x] 4.1 `tsc --noEmit` — zero type errors
- [x] 4.2 AlertasPage: filter tabs, resolve, admin overview, reassign — verified in code
- [x] 4.3 IntervencionesPage: list, form modal, submit — verified in code
- [x] 4.4 SinContactoPage: at-risk list, empty state — verified in code
- [x] 4.5 DashTutor: shared InterviewForm integration — verified in code

## Files Created
| File | Description |
|------|-------------|
| `src/hooks/useTutores.ts` | Tutor/asesor_par user list hook |
| `src/hooks/useEntrevistas.ts` | Interview list + creation hook |
| `src/hooks/useSinContacto.ts` | At-risk never-contacted students hook |
| `src/lib/formatters.ts` | Display formatting helpers |
| `src/components/ui/InterviewForm.tsx` | Shared interview creation modal |
| `src/components/dashboards/SinContactoPage.tsx` | Risk outreach page |

## Files Modified
| File | Changes |
|------|---------|
| `src/hooks/useAlertas.ts` | Added role param, resolver/reasignar actions, selectedStatus |
| `src/services/alertasService.ts` | Added getAlertas(), reassignAlerta() |
| `src/services/intervencionesService.ts` | Added getIntervenciones(), getSinContacto(), crearEntrevistaCompleta() |
| `src/components/dashboards/AlertasPage.tsx` | Filter tabs, resolve, reassign dropdown, admin mode |
| `src/components/dashboards/IntervencionesPage.tsx` | Sections, Nueva Entrevista button, InterviewForm |
| `src/components/dashboards/DashTutor.tsx` | Replaced inline modal with shared InterviewForm |
| `src/components/AppRouter.tsx` | Added /sin-contacto route and dock items |

## Deviations from Design
- InterviewForm placed at `src/components/ui/InterviewForm.tsx` (not `src/components/forms/`) since `ui/` already exists
- `useAlertas` resolver/reasignar use optimistic state updates instead of refetch for better UX

## Mode
Standard (no test runner in project, no strict TDD)
