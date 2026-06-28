# Tasks: Setup Encuestas y Formularios con Datos Reales

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 150–200 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

## Phase 1: Migration File Creation

- [x] 1.1 Create `supabase/migrations/024_replace_encuesta_templates.sql` with transaction wrapper (`BEGIN` / `COMMIT`)
- [x] 1.2 Add idempotency guard: `DO $$` block that checks `categorias_pregunta` has 3 expected names AND `preguntas` has 15 expected texts; if both true, `RETURN` early
- [x] 1.3 Add `categorias_pregunta` reconciliation: DELETE rows not matching the 3 target names, then INSERT 3 rows (Rendimiento Académico, Encuestas y Bienestar Emocional, Alerta de Aislamiento) — no unique constraint on `nombre`, so DELETE + INSERT instead of UPSERT
- [x] 1.4 Add `DELETE FROM encuesta_secciones WHERE encuesta_id IN (SELECT id FROM public.encuestas WHERE tipo IN ('inicial','cuatrimestral','entrevista'))` — CASCADE clears preguntas, scoring_opciones, scoring_tramos
- [x] 1.5 INSERT 4 secciones: "Contexto Personal" for inicial, "Rendimiento del Cuatrimestre" + "Bienestar y Motivación" for cuatrimestral, "Entrevista de Tutoría" for entrevista — use subqueries on `encuestas.tipo`
- [x] 1.6 INSERT 15 preguntas with correct `texto`, `tipo`, `opciones` (JSONB arrays), and `categoria_id` (via subquery on `categorias_pregunta.nombre`) — 5 inicial, 5 cuatrimestral, 5 entrevista
- [x] 1.7 INSERT 47 `scoring_opciones` rows for all multiple-choice preguntas, joining on `preguntas.texto` to get `pregunta_id`, with correct `score` values matching the spec tables
- [x] 1.8 INSERT 10 `scoring_tramos` for `satisfaccion_rendimiento` (escala 1–10, inverted): `condicion_tipo = 'igual'`, `condicion_valor` 1–10, `formula = 10 - condicion_valor`

## Phase 2: Apply Migration to Local Supabase

- [x] 2.1 Apply migration via `supabase-local_apply_migration` MCP tool — clean execution with no errors

## Phase 3: Verify Migration

- [x] 3.1 Query `SELECT count(*) FROM categorias_pregunta` → 3 ✅
- [x] 3.2 Query `SELECT count(*) FROM encuesta_secciones` → 4 ✅
- [x] 3.3 Query `SELECT count(*) FROM preguntas` → 15 ✅
- [x] 3.4 Query `SELECT count(*) FROM scoring_opciones` → 47 ✅
- [x] 3.5 Query `SELECT count(*) FROM scoring_tramos` → 10 ✅
- [x] 3.6 Query `SELECT count(*) FROM encuestas` → 3 (existing rows untouched) ✅
- [x] 3.7 Verify `satisfaccion_rendimiento` tramos: answer=1 → risk=9, answer=10 → risk=0 ✅
- [x] 3.8 Re-apply migration (idempotency test) — same row counts, no errors or duplicates ✅
- [x] 3.9 Run `npx tsc --noEmit` — clean, no TypeScript regressions ✅
