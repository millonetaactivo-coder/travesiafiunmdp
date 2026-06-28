# Design: Dashboard Fidelity Pass

## Technical Approach

Wire the four dashboards and `AppRouter` to existing Supabase hooks and a small set of new service queries. Replace all hardcoded MOCK values with live data, swap the seven `<Placeholder>` routes for minimal list-shell pages, move `calcular-score` thresholds into a `configuracion` table, and guard every empty/partial-data path.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Score data for student lists | Extend `estudiantesService` to `JOIN` the latest `scores` row | Call `useScore` per table row (N+1) | One query per list; avoids hook cascade and keeps `useEstudiantes` simple. |
| Count queries (KPIs, badges) | New thin `estadisticasService` using Supabase `.select(..., { count: 'exact' })` and date filters | New RPCs for every count | Counts are simple `WHERE` filters; RPCs add migration overhead for little gain. |
| Materias críticas bar chart | Service query aggregating `cursadas.situacion = 'abandono'` per `materias` row | Pre-computed RPC | Keeps migration count low; can be promoted to RPC if dataset grows. |
| Threshold config storage | `configuracion` table with `clave`/valor JSONB | `configuracion_tramos` table or hardcoded env vars | Matches the spec scenario (`score_thresholds` JSON row) and leaves room for future config keys. |
| Placeholder replacements | New `src/pages/*` list-shell components imported by `AppRouter` | Inline components in `AppRouter.tsx` | Cleaner separation of route pages from router wiring. |
| Help duplicate guard | Check existing pending `solicitud_ayuda` row before insert | Unique partial index | Explicit check gives a user-friendly message without schema changes. |

## Data Flow

```
DashAdmin
  useScore(undefined, carreraId) ──→ get_distribucion_cohorte RPC
  estadisticasService ─────────────→ perfilesSilenciosos, intervencionesMes, materiasCriticas, sinTutor

DashDocente
  useAuth + useEstudiantes(userId, 'docente', carreraId)
    └─→ getEstudiantesPorCarreraConScore ──→ counters + radar + traffic-light list

DashTutor
  useAuth + useEstudiantes(userId, 'tutor')
    └─→ getEstudiantesDelTutorConScore ──→ table with real score/nivel_riesgo
  useAlertas(userId) ──→ AppRouter dock badge + "solicitó ayuda" flags

DashEstudiante
  useScore(userId) ──→ ultimoScore.valor ──→ radial chart
  crearAlertaAyuda + duplicate check ──→ Pedir Ayuda

AppRouter
  useAlertas(usuario.id) ──→ alertCount on tutor dock bell icon
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/dashboards/DashAdmin.tsx` | Modify | Real KPIs, real `materiasCriticas` bar chart, empty-state guards. |
| `src/components/dashboards/DashDocente.tsx` | Modify | Real student list with score JOIN; counters; empty states. |
| `src/components/dashboards/DashTutor.tsx` | Modify | Real `score`/`nivel_riesgo` per row; pending entrevistas counter; "Sin datos" cell. |
| `src/components/dashboards/DashEstudiante.tsx` | Modify | Radial chart value from `ultimoScore.valor`; duplicate help guard. |
| `src/components/AppRouter.tsx` | Modify | `alertCount` from `useAlertas`; replace 7 placeholders with real page imports; remove inline `Placeholder`. |
| `src/hooks/useEstudiantes.ts` | Modify | Pass `withScores` option; route to new service variants. |
| `src/services/estudiantesService.ts` | Modify | Add `getEstudiantesDelTutorConScore` and `getEstudiantesPorCarreraConScore` (latest score JOIN). |
| `src/services/alertasService.ts` | Modify | Add `getAlertasPendientesCount`, `existeAlertaAyudaPendiente`. |
| `src/services/intervencionesService.ts` | Modify | Add `getIntervencionesMesCount`, `getEntrevistasPendientesCount`. |
| `src/services/estadisticasService.ts` | Create | Count helpers: perfiles silenciosos, sin tutor, materias críticas. |
| `src/pages/AyudaPage.tsx` | Create | Student help page shell with request history. |
| `src/pages/AlumnosPage.tsx` | Create | Tutor student list shell. |
| `src/pages/AlertasPage.tsx` | Create | Alert list + resolve action shell. |
| `src/pages/IntervencionesPage.tsx` | Create | Intervention list shell. |
| `src/pages/MateriasPage.tsx` | Create | Docente materias list shell. |
| `src/pages/ReportesPage.tsx` | Create | Reportes list shell. |
| `src/pages/UsuariosPage.tsx` | Create | Users list shell. |
| `supabase/functions/calcular-score/index.ts` | Modify | Read `configuracion` thresholds with fallback to 30/55/80. |
| `supabase/migrations/020_configuracion_thresholds.sql` | Create | Create `configuracion` table and seed `score_thresholds`. |

## Interfaces / Contracts

```typescript
// src/services/estudiantesService.ts
export const getEstudiantesDelTutorConScore = async (tutorId: string) =>
  supabase.from('asignaciones_tutor').select(`
    estudiante_id,
    usuarios!estudiante_id (id, nombre, apellido, email, legajo),
    estudiantes!estudiante_id (carrera_id, anio_ingreso),
    scores!inner(estudiante_id, valor, nivel_riesgo, calculado_at)
  `).eq('tutor_id', tutorId).eq('activa', true)
    .order('calculado_at', { foreignTable: 'scores', ascending: false });
```

```sql
-- supabase/migrations/020_configuracion_thresholds.sql
CREATE TABLE IF NOT EXISTS public.configuracion (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  clave text NOT NULL UNIQUE,
  valor jsonb NOT NULL,
  descripcion text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracion TO authenticated;

INSERT INTO public.configuracion (clave, valor, descripcion) VALUES (
  'score_thresholds',
  '{"bajo": 30, "medio": 55, "alto": 80}'::jsonb,
  'Umbrellas de nivel de riesgo para calcular-score'
) ON CONFLICT (clave) DO NOTHING;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type check | No TS errors after hook/service changes | `tsc --noEmit` |
| Manual | Empty DB render of each dashboard | Local dev with fresh seed |
| Manual | Alert badge updates on new alert | Supabase realtime + UI |
| Manual | Help duplicate guard | Click Pedir Ayuda twice |
| Edge function | Threshold fallback | Run function without config row |

## Migration / Rollout

1. Apply migration `020_configuracion_thresholds.sql`.
2. Deploy updated `calcular-score` edge function.
3. Merge TS changes; dashboards will show live data on next load.
4. Rollback: revert TS files; drop `configuracion` row or function if needed.

## Open Questions

- [ ] **Carrera for docente/admin**: `DashAdmin` currently hardcodes a carrera UUID and `useAuth` does not expose `carrera_id`. Should we derive it from `usuario_roles` or add it to `useAuth`?
- [ ] **Materias críticas metric**: The spec says "real percentage" but does not define the formula. Is it `% cursadas.situacion='abandono' / total cursadas per materia`?
- [ ] **Table naming**: The spec uses `configuracion`; the task summary mentioned `configuracion_tramos`. Confirm final table name before applying.
