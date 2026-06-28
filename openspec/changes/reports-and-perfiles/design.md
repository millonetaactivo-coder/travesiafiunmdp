# Design: Reports & Perfiles

## Technical Approach

Add the remaining student-management, grading, indicator, reporting, user, tutor and multi-career capabilities as **additive pages/components** on the existing hook + service architecture. Reuse the project's glassmorphism cards, Framer Motion entrances, `CustomSelect`, `InterviewForm` modal pattern and `sonner` toasts. Introduce a single `CareerContext` so admin/docente views share a selected `carrera_id`; students are auto-scoped to their own career. Heavy report queries are pushed to a Supabase edge function to keep RLS simple and avoid large client-side joins.

## Architecture Decisions

| Decision | Options | Trade-offs | Choice |
|---|---|---|---|
| Career filter scope | Prop drilling vs React Context | Context avoids threading props through layout/dock | `CareerContext` + selector in `AppLayout` |
| Profile data loading | One mega query vs lazy tab hooks | Lazy hooks reduce first-load payload and allow per-tab error states | `PerfilEstudiantePage` mounts hooks only for active tab |
| Manual final grade | Require existing cursada vs create stub | Existing cursada preserves FK integrity | Final type lists student's cursadas for the selected materia |
| Admin user creation | Client `signUp` vs admin edge function | Edge function creates active users without waiting for email confirmation | New `admin-create-user` edge function with service role |
| Report data source | Client joins vs RPC/edge function | Edge function centralises logic, respects career scoping, easy to cap rows | `generar-reporte` edge function; CSV built client-side from its output |
| CSV anonymization | Strip columns after fetch vs omit in query | Post-fetch keeps the query generic; PII removed in export util | `exportCSV(rows, { anonymize })` drops `nombre`/`legajo` |

## Data Flow

```
AppLayout
  └── CareerContext ──> CareerSelector
        ├── AlumnosPage ──useEstudiantes──> estudiantesService ──> Supabase
        ├── PerfilEstudiantePage ──usePerfil/useScore/usePlan/useEncuesta/useEntrevistas──> services ──> Supabase
        ├── CargaNotasPage ──scoresService.createCursada/createFinal──> Supabase
        ├── Configuracion ──configuracionService──> indicadores / indicador_componentes
        ├── ReportesPage ──reportesService──> generar-reporte edge function──> Supabase
        ├── UsuariosPage ──usuariosService──> Supabase (+ admin-create-user edge fn)
        └── AsignarTutoresPage ──tutoresService──> asignaciones_tutor
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/components/dashboards/PerfilEstudiantePage.tsx` | Create | 4-tab unified profile (Datos / Notas / Encuestas / Entrevistas) |
| `src/components/dashboards/AlumnosPage.tsx` | Modify | Filter chips, sortable headers, semáforo badges, row click → profile |
| `src/components/dashboards/CargaNotasPage.tsx` | Create | Manual cursada/final entry form |
| `src/components/dashboards/Configuracion.tsx` | Modify | Add nested `indicador_componentes` editor |
| `src/components/dashboards/ReportesPage.tsx` | Modify | Report type selector, filter builder, table, CSV export, anonymize toggle |
| `src/components/dashboards/UsuariosPage.tsx` | Modify | CRUD table, role dropdown, status toggle |
| `src/components/dashboards/AsignarTutoresPage.tsx` | Create | Batch/individual tutor assignment UI |
| `src/context/CareerContext.tsx` | Create | Global selected career state |
| `src/components/ui/CareerSelector.tsx` | Create | Dropdown shown for admin/docente, hidden for students |
| `src/components/AppRouter.tsx` | Modify | New routes `/alumnos/:id`, `/carga-notas`, `/asignar-tutores`; dock additions |
| `src/hooks/useEstudiantes.ts` | Modify | Accept filter/sort state; flatten service result; include `has_tutor` |
| `src/services/estudiantesService.ts` | Modify | Filtered queries, profile aggregation, tutor check |
| `src/services/scoresService.ts` | Modify | `createCursada`, `createFinal` |
| `src/services/usuariosService.ts` | Create | List/create/update users and roles |
| `src/services/reportesService.ts` | Create | Wrapper for `generar-reporte` |
| `src/services/tutoresService.ts` | Create | Tutor list + assignment CRUD |
| `src/lib/formatters.ts` | Modify | Add `exportCSV` helper |
| `supabase/functions/admin-create-user/index.ts` | Create | Service-role user + role creation |
| `supabase/functions/generar-reporte/index.ts` | Create | Parameterized, career-scoped reports |

## Interfaces / Contracts

```ts
interface StudentFilters {
  carreraId?: string;
  anioIngreso?: number;
  nivelRiesgo?: 'bajo' | 'medio' | 'alto' | 'critico';
  hasTutor?: boolean;
  search?: string;
  sortBy: 'apellido' | 'legajo' | 'anio_ingreso' | 'nivel_riesgo';
  sortDir: 'asc' | 'desc';
}

interface CareerContextValue {
  carreraId: string | null;
  setCarreraId: (id: string) => void;
  carreras: { id: string; nombre: string; codigo: string }[];
}
```

## Capability Matrix

| Capability | Components | Route | Role Gate | State / UI Patterns |
|---|---|---|---|---|
| student-unified-profile | `PerfilEstudiantePage`, tab sub-components | `/alumnos/:id` | admin all; tutor assigned only; student own | Lazy-load tabs; per-tab loading/empty/error; `InterviewForm` modal for new entrevista |
| student-list-enhanced | `AlumnosPage` + filter chips | `/alumnos` | admin/docente by career; tutor assigned | `useState` filters/sort; `CustomSelect` chips; clickable rows; motion list |
| manual-grade-entry | `CargaNotasPage` | `/carga-notas` | admin/docente only | Form validation (0-10, future date, materia in career); toast success/error |
| indicator-engine | `Configuracion` extended | `/configuracion` | admin edit; docente read-only | Local edit state; sum-to-100 validation; save disables on invalid |
| report-generator | `ReportesPage` | `/reportes` | admin/docente | Type + filter state; edge function fetch; table sort; CSV export; anonymize toggle |
| user-role-management | `UsuariosPage` | `/usuarios` | admin only | Inline edit/select; create modal; status toggle; duplicate email guard |
| tutor-assignment | `AsignarTutoresPage` | `/asignar-tutores` | admin only | Multi-select rows; batch assign; filter by career/risk; "Sin asignar" fallback |
| multi-career-scale | `CareerContext`, `CareerSelector` | global layout | admin/docente selector; student auto-scope | Persist in context; scope all service queries by selected `carrera_id` |

## Testing Strategy

| Layer | What to test | Approach |
|---|---|---|
| Unit | CSV export, filter/sort helpers, peso-sum validation | Pure functions; exercise via `tsc --noEmit` |
| Integration | Services return expected shapes | Manual smoke against local Supabase |
| E2E / smoke | Role gates, profile tabs, report CSV, user CRUD | Manual UI walkthrough (no test runner configured) |

## Migration / Rollout

No breaking schema changes. Deploy two additive edge functions (`admin-create-user`, `generar-reporte`) before the frontend PRs. All new pages and routes are additive; rollback is `git checkout` on modified files plus deletion of new files. If report RPCs are preferred over the edge function, replace `generar-reporte` with a migration containing `SECURITY DEFINER` RPCs.

## Open Questions

- [ ] Should `generar-reporte` be an edge function or a set of RPCs? Edge function is preferred for row caps and CSV pre-processing.
- [ ] For manual finals, if the student has no cursada for the selected materia, should the UI block the action or create a stub cursada? Decision: block until a cursada exists.
- [ ] Which admin user sees the "Carga Notas" and "Asignar Tutores" dock items? Proposed: admin dock gets both; docente dock gets "Carga Notas" only.
