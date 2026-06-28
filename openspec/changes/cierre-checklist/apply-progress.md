# Apply Progress: cierre-checklist

## Status: COMPLETE

### Completed Tasks
- [x] 1.1 Created migration 021 adding `fecha_entrada_rojo` column to scores table
- [x] 1.2 Updated calcular-score Edge Function to set fecha_entrada_rojo on first ≥81 transition
- [x] 2.1 Added "Fechas de Encuesta" section to Configuracion.tsx with date inputs (Plus/Trash2 icons, date picker, empty state)
- [x] 2.2 Save/load from configuracion table via upsert on `clave = 'fechas_encuesta'`
- [x] 3.1 Updated DashEstudiante.tsx with level-appropriate messages (medio: study plan, alto: urgent tutor contact, critico: no estás solo/a)
- [x] 3.2 Enhanced "Pedir ayuda" button for rojo: ring-2, animate-pulse, "Pedir Ayuda Ahora" label
- [x] 4.1 tsc --noEmit passes clean (0 errors)
- [x] 4.2 All 4 capabilities verified

### Files Changed
| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/021_fecha_entrada_rojo.sql` | Created | Adds nullable `fecha_entrada_rojo timestamptz` to scores |
| `supabase/functions/calcular-score/index.ts` | Modified | Sets fecha_entrada_rojo on first score ≥ 81 |
| `src/components/dashboards/Configuracion.tsx` | Modified | Fechas de Encuesta section with CRUD |
| `src/components/dashboards/DashEstudiante.tsx` | Modified | Enhanced alert copy + rojo help button |
| `src/services/scoresService.ts` | Modified | Added fecha_entrada_rojo to getUltimoScore select |

### Deviations from Design
None — implementation matches design exactly.

### Issues Found
None.

### Remaining Tasks
None. Ready for sdd-verify.
