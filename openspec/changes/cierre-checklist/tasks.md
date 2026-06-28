# Tasks: cierre-checklist

## Phase 1: Migration + Edge Function (2 tasks)
- [x] 1.1 Create migration 021 adding fecha_entrada_rojo column to scores
- [x] 1.2 Update calcular-score Edge Function to set fecha_entrada_rojo on first ≥81 transition

## Phase 2: Configuracion page enhancement (2 tasks)
- [x] 2.1 Add "Fechas de Encuesta" section to Configuracion.tsx with date inputs
- [x] 2.2 Save/load from configuracion table via configuracionService

## Phase 3: Alert copy text (2 tasks)
- [x] 3.1 Update DashEstudiante.tsx with level-appropriate messages
- [x] 3.2 Enhance "Pedir ayuda" button prominence when in rojo

## Phase 4: Verify (2 tasks)
- [x] 4.1 Run `tsc --noEmit`
- [x] 4.2 Verify all 4 capabilities: migration applied, config save/load, edge function logic, UI copy
