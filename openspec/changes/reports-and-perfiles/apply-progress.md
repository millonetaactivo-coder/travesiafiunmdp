# Apply Progress: Reports & Perfiles — PR 3/3 (Reports & Tutors) ✅ ALL DONE

## Completed Tasks (PR 1 — Foundations)

### Phase 1: Career Context Foundation
- [x] 1.1 Created `src/context/CareerContext.tsx` — CareerContextValue interface, CareerProvider, useCareer hook
- [x] 1.2 Created `src/components/ui/CareerSelector.tsx` — CustomSelect dropdown for admin/docente
- [x] 1.3 Modified `src/components/AppRouter.tsx` — CareerProvider, CareerSelector, new routes

### Phase 2: Student Profile Page
- [x] 2.1 Created `src/components/dashboards/PerfilEstudiantePage.tsx` — 4-tab layout
- [x] 2.2 Tab sub-components: ProfileDatosTab, ProfileNotasTab, ProfileEncuestasTab, ProfileEntrevistasTab
- [x] 2.3 Wired InterviewForm modal for new entrevista creation
- [x] 2.4 Role gate: estudiante self-view only, tutor assigned only, admin all

### Phase 3: Enhanced Student List
- [x] 3.1 Modified `src/hooks/useEstudiantes.ts` — typed EstudianteRow[], StudentFilters
- [x] 3.2 Modified `src/services/estudiantesService.ts` — filtering, profile queries
- [x] 3.3 Modified `src/components/dashboards/AlumnosPage.tsx` — filters, sorting, badges, row navigation
- [x] 3.4 Modified `src/components/AppRouter.tsx` — /alumnos/:estudianteId route

### Additional PR1 Fixes
- [x] Fixed DashDocente.tsx, DashTutor.tsx, IntervencionesPage.tsx, SinContactoPage.tsx
- [x] Fixed PerfilEstudiantePage.tsx estudiantes relation casting
- [x] Fixed estudiantesService.ts usuarios relation casting

## Completed Tasks (PR 2 — Admin Tools)

### Phase 4: Manual Grade Entry
- [x] 4.1 Created `src/services/gradesService.ts` — createCursada, createFinal
- [x] 4.2 Created `src/components/dashboards/CargaNotasPage.tsx` — form with validation
- [x] 4.3 Modified `src/components/AppRouter.tsx` — /carga-notas route

### Phase 5: Indicator Engine
- [x] 5.1 Created `src/services/configuracionService.ts` — CRUD for indicadores/indicador_componentes
- [x] 5.2 Modified `src/components/dashboards/Configuracion.tsx` — nested editor, sum-to-100 validation
- [x] 5.3 Role gate: admin=edit, docente=read-only

### Phase 6: User Role Management
- [x] 6.1 Created `src/services/usuariosService.ts` — list/create/update/delete users
- [x] 6.2 Modified `src/components/dashboards/UsuariosPage.tsx` — CRUD table, role dropdown
- [x] 6.3 Created `supabase/functions/admin-create-user/index.ts` — service-role user creation

### Verification
- [x] 9.1 `tsc --noEmit` — zero errors

## Completed Tasks (PR 3 — Reports & Tutors)

### Phase 7: Report Generator
- [x] 7.1 Created `src/services/reportesService.ts` — getReporteCohorte, getReporteMateria, getReportePeriodo, getReporteRiesgo, getRankingMaterias. Parameterized career-scoped queries with typed return data.
- [x] 7.2 Service handles all data fetching via Supabase client (cursadas, scores, asignaciones_tutor joins). No separate edge function needed — client-side queries keep RLS simple.
- [x] 7.3 Created `src/lib/exportCsv.ts` — exportToCsv(data, filename, { anonymize }). Handles CSV escaping, BOM for Excel, Blob download. Drops nombre/legajo when anonymize=true.
- [x] 7.4 Rewrote `src/components/dashboards/ReportesPage.tsx` — Full report builder with: 4 report type selector grid (cohorte, materia, periodo, nivel_riesgo), contextual filter builder per type, results table with typed columns, anonymize toggle, CSV export button, loading/error/empty states, framer-motion animations, glassmorphism styling.

### Phase 8: Tutor Assignment
- [x] 8.1 Created `src/services/asignacionesService.ts` — getTutores (from usuarios_roles), getAsignaciones, assignTutor (deactivate old + insert new), batchAssignTutor, unassignTutor (set activa=false).
- [x] 8.2 Created `src/components/dashboards/AsignarTutoresPage.tsx` — Glassmorphism page with: filterable student list (by year, risk level, tutor status), select-all checkbox, batch assign dropdown with tutor selection, individual assign per student row with dropdown, unassign option, loading/error/empty states, framer-motion animations, mobile responsive.
- [x] 8.3 Modified `src/components/AppRouter.tsx` — Added /asignar-tutores route (admin-only). Added "Reportes" and "Asignar Tutores" dock items for admin. Reportes already in docente dock.

### Phase 9: Final Verification
- [x] 9.1 `tsc --noEmit` — zero errors
- [x] 9.2 All 8 capabilities render without TypeScript errors (career context, student profile, enhanced list, manual grades, indicator engine, user CRUD, report generator, tutor assignment)
- [x] 9.3 Empty states verified: ReportesPage shows message when no data, AsignarTutoresPage shows message when no students match filters
- [x] 9.4 Role gates verified: admin sees all pages + Reportes/AsignarTutores dock; docente sees Reportes dock; tutor sees assigned students; estudiante sees own profile only
- [x] 9.5 `tsc --noEmit` — zero errors (confirmed at end of PR3)

## Files Changed (PR 3 only)

| File | Action | Description |
|------|--------|-------------|
| `src/services/reportesService.ts` | Created | Report queries (cohorte, materia, periodo, riesgo, ranking) with typed interfaces |
| `src/lib/exportCsv.ts` | Created | CSV export utility with anonymize support and BOM encoding |
| `src/components/dashboards/ReportesPage.tsx` | Rewritten | Full report builder: type selector, filters, table, CSV, anonymize toggle |
| `src/services/asignacionesService.ts` | Created | Tutor assignment CRUD (getTutores, assign, batch, unassign) |
| `src/components/dashboards/AsignarTutoresPage.tsx` | Created | Batch/individual tutor assignment with filters and selection |
| `src/components/AppRouter.tsx` | Modified | Added /asignar-tutores route, Reportes + Asignar Tutores dock items |
| `openspec/changes/reports-and-perfiles/tasks.md` | Modified | All tasks marked [x] complete |

## All Files Changed (cumulative)

| File | Action | Description |
|------|--------|-------------|
| `src/context/CareerContext.tsx` | Created | CareerContext provider + useCareer hook |
| `src/components/ui/CareerSelector.tsx` | Created | Career dropdown for admin/docente |
| `src/components/dashboards/PerfilEstudiantePage.tsx` | Created | 4-tab unified student profile |
| `src/hooks/useEstudiantes.ts` | Modified | Typed EstudianteRow, StudentFilters, flattening |
| `src/services/estudiantesService.ts` | Modified | Filtering, profile queries, new exports |
| `src/components/dashboards/AlumnosPage.tsx` | Modified | Filters, sorting, badges, row navigation |
| `src/components/AppRouter.tsx` | Modified | All routes, dock items, CareerProvider |
| `src/components/dashboards/DashDocente.tsx` | Modified | Flattened EstudianteRow usage |
| `src/components/dashboards/DashTutor.tsx` | Modified | Flattened EstudianteRow usage |
| `src/components/dashboards/IntervencionesPage.tsx` | Modified | Flattened EstudianteRow usage |
| `src/components/dashboards/SinContactoPage.tsx` | Modified | Flattened EstudianteRow usage |
| `src/services/gradesService.ts` | Created | Manual cursada/final entry |
| `src/components/dashboards/CargaNotasPage.tsx` | Created | Grade entry form |
| `src/services/configuracionService.ts` | Created | Indicadores CRUD |
| `src/components/dashboards/Configuracion.tsx` | Modified | Nested indicador editor |
| `src/services/usuariosService.ts` | Created | User CRUD |
| `src/components/dashboards/UsuariosPage.tsx` | Created | User management table |
| `supabase/functions/admin-create-user/index.ts` | Created | Service-role user creation |
| `src/services/reportesService.ts` | Created | Report queries |
| `src/lib/exportCsv.ts` | Created | CSV export with anonymize |
| `src/components/dashboards/ReportesPage.tsx` | Rewritten | Full report builder |
| `src/services/asignacionesService.ts` | Created | Tutor assignment CRUD |
| `src/components/dashboards/AsignarTutoresPage.tsx` | Created | Batch/individual tutor assignment |

## Status
All 24 implementation tasks + 5 verification tasks complete. PR 3/3 of reports-and-perfiles is done. Ready for sdd-verify or sdd-archive.
