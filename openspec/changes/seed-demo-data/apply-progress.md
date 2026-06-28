# Apply Progress: seed-demo-data

## Status: COMPLETE

## Tasks
- [x] 1.1 Created `022_seed_demo_users.sql` with SECURITY DEFINER helper functions
- [x] 1.2 Inserted 29 auth users (1 admin + 6 staff + 22 students) via helper functions
- [x] 1.3 Created usuarios, usuario_roles (with carrera_id), and estudiantes records
- [x] 2.1 Created `023_seed_demo_data.sql` with dynamic ID lookups
- [x] 2.2 Generated survey sessions with risk-appropriate responses
- [x] 2.3 Generated ~619 cursadas via temp table approach
- [x] 2.4 Generated ~156 finales from cursada subset
- [x] 2.5 Created 22 score snapshots with correct nivel_riesgo
- [x] 2.6 Created 16 tutor assignments (tomas.rojas unassigned)
- [x] 2.7 Created 8 alertas (mix of pendiente/resuelta)
- [x] 2.8 Created 7 intervenciones (3 realizadas + 4 planificadas)
- [x] 2.9 Created 3 entrevistas linked to intervenciones
- [x] 3.1 Applied both migrations via docker exec as supabase_admin
- [x] 3.2 Verified all data counts and risk distribution

## Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| `supabase/migrations/022_seed_demo_users.sql` | Created | Auth users, usuarios, usuario_roles, estudiantes |
| `supabase/migrations/023_seed_demo_data.sql` | Created | Cursadas, finales, scores, surveys, alerts, interventions |

## Verified Counts
- 29 users (1 admin + 6 staff + 22 students)
- 22 students: INF(7), COM(5), ELC(5), IND(5)
- Risk: bajo(6), medio(7), alto(5), critico(4)
- 619 cursadas, 156 finales, 22 scores
- 32 sesiones_encuesta, 141 respuestas
- 8 alertas, 7 intervenciones, 3 entrevistas, 16 asignaciones_tutor

## Next
Ready for verify phase.
