# Proposal: Setup Encuestas y Formularios con Datos Reales

## Intent

Replace generic placeholder questions, sections, and scoring in the 3 encuesta templates with the real survey definitions from `docs/travesia_formularios.md`. Current seeded data does not match the actual instruments designed by domain experts, blocking meaningful risk scoring from encuesta responses.

## Scope

### In Scope
- Replace all `encuesta_secciones`, `preguntas`, `scoring_opciones`, and `scoring_tramos` for the 3 existing encuestas
- Align `categorias_pregunta` with 3 dimensiones (Rendimiento Académico, Encuestas y Bienestar Emocional, Alerta de Aislamiento)
- Score each multiple-choice option per the document's risk-value tables
- Inverted-scale scoring via `scoring_tramos` for `satisfaccion_rendimiento` (numérica 1-10)
- New SQL migration (024) with idempotent DELETE + INSERT logic

### Out of Scope
- Conditional question logic (`horas_trabajo_semanal` depends on `situacion_laboral`) — frontend concern
- Per-materia question rendering — none of the 15 questions use `aplica_por_materia`
- Frontend changes to encuesta rendering components

## Capabilities

### Modified Capabilities
- `encuesta-templates`: Template structure changes from 5 generic categorías / 19 placeholder preguntas to 3 categorías / 15 real preguntas matching the survey instruments. All requirement-level scenarios (question counts, scoring values, categoría mappings) are replaced.

## Approach

**Option A — DELETE + recreate**. Delete `encuesta_secciones` → cascade clears `preguntas` → cascade clears `scoring_opciones` + `scoring_tramos`. Then insert correct structure from `docs/travesia_formularios.md`.

Migration `024_replace_encuesta_templates.sql`:
1. UPSERT `categorias_pregunta`: update/replace 5 existing rows with 3 dimension-matched rows
2. DELETE FROM `encuesta_secciones` WHERE encuesta_id IN (SELECT id FROM encuestas)
3. INSERT secciones: 1 for inicial, 2 for cuatrimestral, 1 for entrevista
4. INSERT 15 preguntas with correct `texto`, `tipo`, `opciones` (JSONB), `categoria_id`
5. INSERT `scoring_opciones` for 13 multiple-choice questions (48 rows total)
6. INSERT `scoring_tramos` for `satisfaccion_rendimiento` — 10 tramos, inverted formula
7. Idempotent guard: DO block checks if data already matches, skips if so

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/024_*.sql` | New | Migration replacing template data |
| `public.categorias_pregunta` | Modified | 5 rows → 3 rows (document dimensiones) |
| `public.encuesta_secciones` | Replaced | 5 placeholder → 4 real rows |
| `public.preguntas` | Replaced | 19 placeholder → 15 real rows |
| `public.scoring_opciones` | Replaced | 28 placeholder → ~48 real rows |
| `public.scoring_tramos` | Replaced | 19 placeholder → 10 real rows |
| `public.encuestas` | Unchanged | 3 existing records preserved |
| `public.indicadores` | Unchanged | 4 indicators already match document |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| FK cascade loses data needed by Edge Functions | Low | Zero production responses exist — only seed data |
| `categorias_pregunta` name change breaks Edge Function queries | Med | Review Edge Functions that join on `categorias_pregunta.nombre`; update if needed |
| `entrevista` needs to stay inactive | Low | Document confirms `activa = false` — unchanged |

## Rollback Plan

`db reset` re-applies all migrations from scratch — revert the file. For live DB, run compensating migration: DELETE new data, re-insert original 010 seed.

## Dependencies

- `docs/travesia_formularios.md` as authoritative source
- `supabase db reset` for clean re-apply testing

## Success Criteria

- [ ] All 15 preguntas from the document exist with correct texto, tipo, and categoria_id
- [ ] All multiple-choice opciones stored as JSONB with matching scoring_opciones rows
- [ ] `satisfaccion_rendimiento` has 10 scoring_tramos with inverted formula `(10 - valor)`
- [ ] Migration is idempotent — double-apply produces identical state
- [ ] `tsc --noEmit` passes (no TypeScript regressions)
- [ ] Edge Functions that join on `categorias_pregunta.nombre` continue to work
