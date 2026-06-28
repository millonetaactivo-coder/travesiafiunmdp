# Proposal: Workflow Views

## Intent

Tutors and admins need operational views to act on alerts, manage interviews end-to-end, and reach at-risk students. The dashboard-fidelity-pass delivered the alert center shell (`AlertasPage`) and a read-only intervention list (`IntervencionesPage`). This change completes the workflow: alert assignment, full interview creation (entrevistas table), and the "at-risk never contacted" view.

## Scope

### In Scope
- Alert assignment: manual reassign `tutor_id` via dropdown (admin + tutor)
- Admin-wide alert view (all alerts across tutors, not just own)
- Full interview form: date picker, modality, result, estado_alumno_percibido, factores_riesgo, seguimiento_requerido → writes to both `intervenciones` and `entrevistas`
- Enhanced interview list: show entrevistas detail columns (factores, derivaciones)
- "At-risk never contacted" view: students in `alto`/`critico` with 0 interventions
- Replace `DashTutor` modal with shared interview form component

### Out of Scope
- Full CRUD for interviews (update/delete) — MVP = create + list
- Notification system (push/email) — this is UI-only
- Calendar/scheduling widget — simple date picker only
- Report generation from alert/interview data

## Capabilities

### New Capabilities
- `alert-center`: alert list with status filter, resolve, and manual tutor reassignment (admin + tutor views)
- `interview-management`: create interview (full entrevistas fields), list interventions with entrevistas detail
- `risk-outreach`: "at-risk students never contacted" view — students in alto/critico with 0 interventions

### Modified Capabilities
- None (no main specs exist in `openspec/specs/`)

## Approach

Enhance existing pages. Backend (tables, hooks, services) is complete — this is UI wiring.

1. **Alert center**: extend `AlertasPage` with admin mode (query all alerts when `rol==='admin'`) and a "Reasignar tutor" dropdown using existing `asignaciones_tutor` table
2. **Interview form**: build a shared `<InterviewForm>` component with date picker, modalidad selector, and the 6 entrevistas-specific fields. Replace `DashTutor` modal with it. Add form trigger to `IntervencionesPage`
3. **Risk outreach**: new `<SinContactoPage>` component — query `scores.nivel_riesgo IN ('alto','critico')` LEFT JOIN `intervenciones` WHERE count=0, with optional tutor assignment action
4. **Shared utilities**: `formatearAlertaTipo()`, `formatearModalidad()`, `formatearRiesgo()` helpers

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/dashboards/AlertasPage.tsx` | Modified | Admin view + reassign dropdown |
| `src/components/dashboards/IntervencionesPage.tsx` | Modified | Add create button, entrevistas columns |
| `src/components/dashboards/DashTutor.tsx` | Modified | Replace inline modal with shared InterviewForm |
| `src/components/dashboards/SinContactoPage.tsx` | New | At-risk never contacted view |
| `src/components/AppRouter.tsx` | Modified | Route for `/sin-contacto` |
| `src/components/forms/InterviewForm.tsx` | New | Shared interview creation form |
| `src/services/alertasService.ts` | Modified | `reassignAlerta()`, `getAlertasAdmin()` |
| `src/services/intervencionesService.ts` | Modified | `getSinContacto()` query |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `scores` table has 0 rows (no students scored yet) | Med | Mock 2-3 scores in dev; risk-outreach view shows empty state gracefully |
| Admin alert view performance (no pagination) | Low | Current data volume is trivially small; add pagination later if needed |
| InterviewForm replaces DashTutor modal, breaking existing flow | Low | Extract to shared component, keep same API contract; tutor workflow unchanged |

## Rollback Plan

Revert commit. No DB migrations. If InterviewForm breaks DashTutor, revert to old inline modal (already in git).

## Dependencies

- `dashboard-fidelity-pass` completed (AlertasPage, IntervencionesPage shells + realtime alerts exist)
- `useAlertas`, `useEstudiantes`, `useAuth` hooks (all exist)
- `scores` table must have data for risk-outreach view (mock if empty)

## Success Criteria

- [ ] Tutor can create an interview with date, modality, and full entrevistas detail from both `DashTutor` and `IntervencionesPage`
- [ ] Admin sees all alerts across tutors and can reassign `tutor_id`
- [ ] "At-risk never contacted" view lists students with `alto`/`critico` risk and 0 interventions
- [ ] Alert count badge on dock reflects real count (already working from fidelity pass)
