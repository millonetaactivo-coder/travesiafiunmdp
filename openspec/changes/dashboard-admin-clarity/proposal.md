# Proposal: dashboard-admin-clarity

## Problem
El DashAdmin mezcla métricas globales con métricas por carrera sin distinción visual clara. El usuario no sabe qué cards aplican al sistema completo vs la carrera seleccionada.

## Solution
Reorganizar el DashAdmin en dos secciones visualmente distintas:

**Sección 1: "Vista Global"** (siempre visible, no cambia con el selector de carrera)
- Total de alumnos en el sistema
- Total en riesgo alto/crítico (cross-carrera)
- Intervenciones del mes
- Widget "Alumnos sin tutor asignado"

**Sección 2: "Por Carrera: [nombre]"** (cambia con el selector)
- Distribución de riesgo (pie chart 4 colores)
- Ranking de materias críticas (bar chart)

## Scope
- Single file change: `src/components/dashboards/DashAdmin.tsx`
- Data fetching split into two useEffects (global + per-career)
- Visual reorganization with section headers and divider

## Rollback
Revert the single file to its previous state.
