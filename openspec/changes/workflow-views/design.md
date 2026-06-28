# Design: Workflow Views

## Technical Approach

Build on the existing `dashboard-fidelity-pass` pages. Keep the current glassmorphism cards, Tailwind color tokens, and Framer Motion entrance animations. Add role-aware branching (`rol === 'admin'`) for admin-wide views, introduce a shared `InterviewForm` modal, and add a dedicated `/sin-contacto` route. All changes are UI wiring on top of existing Supabase tables; no migrations are required.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|---|---|---|---|
| Alert resolve action | Inline button vs. confirmation modal | Inline is one click and already implemented; modal adds friction for an irreversible-but-safe action | Inline "Resolver" button with optimistic update |
| Interview form presentation | Modal vs. separate page | Modal preserves dashboard context and matches the current `DashTutor` flow; a page would require back-navigation for three entry points | Shared modal component (`InterviewForm`) |
| At-risk never contacted view | Tab in `AlertasPage` vs. dedicated page | A tab mixes unrelated concepts; the spec explicitly requests `/sin-contacto` | Dedicated `SinContactoPage` route |
| Data fetching | Inline page queries vs. reusable hooks | Hooks keep pages declarative and match the existing `useAlertas` / `useEstudiantes` pattern | Extend `useAlertas`; add `useEntrevistas`, `useSinContacto`, `useTutores` |
| Reassignment dropdown data | All tutors/asesores vs. only assigned to student | All tutors gives admins flexibility; RLS already scopes what each user can update | Query `usuarios` joined with `usuario_roles` where `rol IN ('tutor','asesor_par')` |
| Future interview date | Block future dates vs. create planned interview | The spec requires planned + completed interviews; blocking would prevent planning | Allow future dates; set `estado = 'planificada'` if `fecha_realizada > now()`, else `'realizada'` |
| Interview creation atomicity | Single RPC transaction vs. sequential inserts | No RPC exists today; sequential is acceptable for MVP and orphan-row risk is mitigated by surfacing errors | Sequential insert into `intervenciones` then `entrevistas`, with manual cleanup on failure |

## Data Flow

```
AlertasPage
  ├─ useAlertas(role) ──→ alertasService.getAlertas() ──→ Supabase alertas
  └─ resolve / reassign ──→ alertasService ──→ UPDATE alertas

IntervencionesPage / DashTutor
  ├─ useEntrevistas(role) ──→ intervencionesService.getIntervenciones() ──→ Supabase
  ├─ useEstudiantes() ──→ estudiantesService ──→ student selector
  └─ InterviewForm submit ──→ crearIntervencion() + crearEntrevista() ──→ Supabase

SinContactoPage
  ├─ useSinContacto(role) ──→ intervencionesService.getSinContacto() ──→ scores / intervenciones
  └─ "Registrar contacto" ──→ InterviewForm with pre-selected student
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/components/forms/InterviewForm.tsx` | Create | Shared interview creation modal with all `intervenciones` + `entrevistas` fields |
| `src/components/dashboards/SinContactoPage.tsx` | Create | `/sin-contacto` view for at-risk students with zero interventions |
| `src/hooks/useEntrevistas.ts` | Create | Fetch interventions with `entrevistas` detail, scoped by role |
| `src/hooks/useSinContacto.ts` | Create | Fetch at-risk students without interventions, scoped by role |
| `src/hooks/useTutores.ts` | Create | Fetch active tutors/asesores for reassignment dropdown |
| `src/lib/formatters.ts` | Create | `formatearAlertaTipo`, `formatearModalidad`, `formatearRiesgo` helpers |
| `src/components/dashboards/AlertasPage.tsx` | Modify | Admin mode, status tabs with counts, inline resolve, reassignment dropdown |
| `src/components/dashboards/IntervencionesPage.tsx` | Modify | "Nueva entrevista" button, `InterviewForm` trigger, admin list, entrevistas detail columns |
| `src/components/dashboards/DashTutor.tsx` | Modify | Replace inline intervention modal with `InterviewForm` |
| `src/components/AppRouter.tsx` | Modify | Add `/sin-contacto` route and dock item for tutor/admin |
| `src/services/alertasService.ts` | Modify | `getAlertas(tutorId?)`, `reassignAlerta()` |
| `src/services/intervencionesService.ts` | Modify | `getIntervenciones()`, `getSinContacto()`, combined interview insert helper |
| `src/hooks/useAlertas.ts` | Modify | Accept optional `role`; admin fetch skips `tutor_id` filter |

## Interfaces / Contracts

`InterviewForm` is the primary new contract. It receives a student list, an optional pre-selected student, and callbacks:

```ts
interface InterviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estudiantes: Array<{ id: string; nombre: string; apellido: string }>;
  estudianteIdPreseleccionado?: string;
  tutorId: string;
}
```

Service helpers:

```ts
// alertasService
getAlertas(tutorId?: string): Promise<Alerta[]>
reassignAlerta(alertaId: string, newTutorId: string): Promise<void>

// intervencionesService
getIntervenciones(tutorId?: string): Promise<IntervencionConEntrevista[]>
getSinContacto(tutorId?: string): Promise<SinContactoItem[]>
crearEntrevistaCompleta(payload: EntrevistaCompleta): Promise<void>
```

`EntrevistaCompleta` joins the `intervenciones` and `entrevistas` fields, validated inside `InterviewForm` before submission.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Formatter helpers | Add vitest specs once the recommended test runner is installed |
| Integration | Alert resolve, reassignment, interview create | Manual end-to-end flow with tutor and admin accounts |
| E2E | None | No E2E runner configured |

Run `tsc --noEmit` before each PR to catch type regressions.

## Migration / Rollout

No database migrations. The new `/sin-contacto` route and `InterviewForm` fields rely on existing tables and RLS policies. Rollback is a code revert.

## Open Questions

- Should `SinContactoPage` for tutors be restricted to their assigned students? This design assumes yes for consistency with other tutor views.
- Should alert reassignment list only tutors currently assigned to that student, or all active tutors? This design uses all active tutors/asesores for admin flexibility.
- Should selecting a future date in `InterviewForm` create a `planificada` intervention, or should future dates be blocked entirely? This design creates a planned intervention.
