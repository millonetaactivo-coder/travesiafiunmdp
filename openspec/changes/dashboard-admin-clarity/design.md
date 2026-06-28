# Design: dashboard-admin-clarity

## Architecture
Split the monolithic DashAdmin component into two logical sections with independent data fetching:

### Data Flow
```
Global useEffect (runs once):
  → GET /estudiantes (count) → totalGlobal
  → GET /scores WHERE nivel_riesgo IN ('alto','critico') → enRiesgoGlobal
  → GET /intervenciones WHERE created_at >= firstDayOfMonth → intervencionesMes
  → GET /asignaciones_tutor (active, high-risk) → alumnosSinTutor

Per-Career useEffect (re-fetches on carreraId change):
  → GET /cursadas JOIN materias JOIN estudiantes WHERE carrera_id = selected → materiasCriticas
```

### Visual Structure
```
┌─ Page Header (unchanged) ─────────────────────────────┐
│ Panel de Administración                    [Importar]  │
└────────────────────────────────────────────────────────┘

┌─ Vista Global (blue accent, Globe icon) ──────────────┐
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│ │ Total   │ │En Riesgo│ │Interv.  │                   │
│ │Sistema  │ │ Global  │ │Mes      │                   │
│ └─────────┘ └─────────┘ └─────────┘                   │
│ ┌──────────────────────────────────────┐               │
│ │ Alumnos sin Tutor    [Asignar]       │               │
│ └──────────────────────────────────────┘               │
└────────────────────────────────────────────────────────┘

            · · · (gradient divider) · · ·

┌─ Por Carrera: [nombre] (teal accent, BookOpen icon) ─┐
│ ┌──────────────────┐ ┌──────────────────┐             │
│ │ Pie Chart Riesgo │ │ Bar Chart Mater. │             │
│ │ 4 colores        │ │ Críticas         │             │
│ └──────────────────┘ └──────────────────┘             │
│                                                        │
│ (or empty state: "Seleccioná una carrera")             │
└────────────────────────────────────────────────────────┘
```

## Key Decisions
1. **Two separate useEffects**: Global data runs once on mount; career data re-fetches on carreraId change. This avoids unnecessary re-fetches and makes the data flow explicit.
2. **Career join for materias criticas**: The original query fetched ALL cursadas without filtering by carrera. Now uses `estudiantes!inner(carrera_id)` to filter properly.
3. **CareerContext.carreras**: Used to resolve career ID → name for the section header.
4. **Loading states separated**: `adminLoading` for global data, `careerLoading` for per-career data — each section shows its own spinner.
