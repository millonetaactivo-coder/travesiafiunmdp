# Proposal: Reports & Perfiles

## Intent

Complete the remaining ~12 checklist items from the implementation audit. This is the third and final change covering student management, grades, indicator engine, reports, user management, tutor assignment, and multi-career scalability. The first two changes (dashboard-fidelity-pass, workflow-views) connected dashboards to live data and built operational workflows. This change fills the gap: per-student deep profiles, administrative CRUD, and analytical reporting.

## Scope

### In Scope
- **Student unified profile**: single page combining scores, grade history, surveys, interviews per student — with role-based access (admin full, tutor assigned, student self-only)
- **Enhanced student list**: advanced search, multi-filter (carrera, año, materia, riesgo, tutor), sortable columns on AlumnosPage
- **Manual grade entry**: form to add single cursada/final record (materia, nota, estado, fecha)
- **Indicator engine admin UI**: view/edit indicadores and their formulas from indicadores + indicador_componentes tables
- **Report generator**: type selection (cohorte, materia, período, riesgo), filters, table/chart output, anonymized global reports, CSV export
- **User role management**: UsuariosPage CRUD (create/update/delete users, assign roles)
- **Tutor assignment**: admin UI to assign/bulk-assign tutor_id on estudiantes via asignaciones_tutor
- **Multi-career scale**: carrera selector on filtering views; ensure all queries filter by carrera_id

### Out of Scope
- PDF export (heavy dependency) — CSV only
- Drag-and-drop formula builder — text-based editing for MVP
- Bulk grade import redesign — ImportarAlumnos.tsx already handles CSV
- Push notifications
- Encuesta frequency config UI (backend config exists; UI deferred)

## Capabilities

### New Capabilities
- `student-unified-profile`: per-student dashboard (scores, grades, surveys, interviews) — role-gated
- `student-list-enhanced`: advanced filters, sorting, semáforo badges on AlumnosPage
- `manual-grade-entry`: single-record cursada/final form
- `indicator-engine`: admin UI for indicadores + indicador_componentes CRUD with formula editing
- `report-generator`: parameterized report builder with CSV export
- `user-role-management`: admin CRUD on usuarios
- `tutor-assignment`: admin batch/individual tutor-to-student assignment
- `multi-career-scale`: carrera selector filter; carrera_id in all relevant queries

## Approach

Build on existing patterns: glassmorphism cards, Tailwind tokens, Framer Motion entrance, hooks + services architecture. Each capability is a new page or panel within an existing page. New routes for profile (`/alumnos/:id`) and grade entry. New service queries for cross-table aggregation (reports). Leverage existing `usePerfil`, `useScore`, `usePlan`, `useEncuesta`, `useEntrevistas` hooks for the unified profile. `useEstudiantes` extended for filtering/sorting.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/dashboards/AlumnosPage.tsx` | Modified | Filters, sorting, semáforo, click→profile |
| `src/components/dashboards/PerfilEstudiantePage.tsx` | New | Unified student profile |
| `src/components/dashboards/UsuariosPage.tsx` | Modified | CRUD: create, edit, delete, role assignment |
| `src/components/dashboards/ReportesPage.tsx` | Modified | Report builder + CSV export |
| `src/components/dashboards/Configuracion.tsx` | Modified | Add indicador_componentes formula editor |
| `src/components/dashboards/GradeEntryPage.tsx` | New | Manual grade entry form |
| `src/components/dashboards/TutorAssignmentPanel.tsx` | New | Admin tutor assignment UI |
| `src/components/AppRouter.tsx` | Modified | New routes, carrera selector |
| `src/hooks/useEstudiantes.ts` | Modified | Extended filtering |
| `src/services/estudiantesService.ts` | Modified | New queries (profile aggregation, reports) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| 8+ capability scope exceeds single PR | High | 3 chained PRs: profile+grades, admin-config, reports |
| Cross-table JOINs for reports slow with growth | Medium | Materialize via edge function; paginate results |
| Perfil page over-fetches data | Medium | Lazy-load sections; individual hooks per section |
| CSV export on large datasets crashes browser | Low | Stream via edge function; client-side cap at 5K rows |

## Rollback Plan

All new pages are additive — new files, new routes. Revert by removing routes and files. Modified pages (AlumnosPage, UsuariosPage, ReportesPage, Configuracion) revert via `git checkout`. New service functions are additive; no existing query contracts change.

## Dependencies

- Supabase backend operational (RLS already configured)
- `calcular-score` edge function deployed
- carrera table seeded (10 carreras in DB)
- usuarios, estudiantes tables with data

## Success Criteria

- [ ] Admin can view any student's unified profile; tutor sees only assigned; student sees own
- [ ] AlumnosPage filters by carrera, año, nivel_riesgo, has_tutor; sorts by columns
- [ ] Admin can create/update/delete users and assign roles via UsuariosPage
- [ ] Admin can assign tutor to student(s) individually or in batch
- [ ] ReportesPage generates tables for at least 3 report types with CSV export
- [ ] Indicator engine shows indicadores + component formulas; admin can edit
- [ ] Manual grade entry creates valid cursada or final row
- [ ] Carrera selector filters views where applicable
- [ ] `tsc --noEmit` passes
