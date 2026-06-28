# Design: Setup Encuestas y Formularios con Datos Reales

## Technical Approach

Deliver a single SQL migration `024_replace_encuesta_templates.sql` that replaces all placeholder child data of the three existing `encuestas` records with the real instruments defined in `docs/travesia_formularios.md`. The migration uses a transaction, deletes child rows through `ON DELETE CASCADE`, re-aligns `categorias_pregunta` to the three document dimensiones, then inserts secciones, preguntas, scoring_opciones, and scoring_tramos. An idempotency guard at the top skips work when the expected final state is already present.

## Architecture Decisions

### Decision: DELETE + CASCADE vs. UPDATE in place

**Choice**: Delete `encuesta_secciones` for the 3 encuestas and let cascading FKs remove preguntas, scoring_opciones, and scoring_tramos, then re-insert clean data.
**Alternatives considered**: UPDATE each existing row in place.
**Rationale**: The placeholder structure has wrong secciones, wrong questions, wrong categorías, and wrong scores. An UPDATE path would be more fragile and harder to verify. DELETE + INSERT is deterministic and matches the spec's "replace all placeholder seed data" intent.

### Decision: Idempotency via row-count guard

**Choice**: Wrap the work in a `DO $$` block that checks whether `categorias_pregunta` already has exactly the 3 expected names and `preguntas` has the 15 expected texts. If yes, the migration returns without mutating data.
**Alternatives considered**: `ON CONFLICT DO NOTHING` on every insert.
**Rationale**: Because UUIDs are regenerated for secciones and preguntas, a naive re-run would create duplicate child rows. The guard prevents the DELETE/INSERT cycle from running twice.

### Decision: Categorías aligned by `nombre`

**Choice**: Truncate/replace `categorias_pregunta` so exactly 3 rows remain, keyed by `nombre`. Use subqueries `(SELECT id FROM categorias_pregunta WHERE nombre = ...)` when assigning `categoria_id` to preguntas.
**Alternatives considered**: Upsert by ID.
**Rationale**: The document names are the stable contract; IDs are synthetic. The proposal notes Edge Functions may join on `nombre`, so preserving those exact names is safer.

### Decision: Conditional question still inserted

**Choice**: Insert `horas_trabajo_semanal` unconditionally as a normal `multiple` question. The dependency on `situacion_laboral` = "Sí" is handled by the frontend.
**Alternatives considered**: Skip it or add a metadata flag.
**Rationale**: Out of scope per the proposal. The simplest design that satisfies the spec is to store the question and let rendering logic decide visibility.

## Data Flow

```
Migration starts
    │
    ▼
Idempotency guard ──No──▶ BEGIN transaction
    │Yes                       │
    ▼                          ▼
Return                  Reconcile categorias_pregunta
                               │
                               ▼
                    DELETE encuesta_secciones
                    (cascade → preguntas → scoring_*)
                               │
                               ▼
                    INSERT secciones (4 rows)
                               │
                               ▼
                    INSERT preguntas (15 rows)
                               │
                               ▼
                    INSERT scoring_opciones (~47 rows)
                               │
                               ▼
                    INSERT scoring_tramos (10 rows)
                               │
                               ▼
                           COMMIT
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/024_replace_encuesta_templates.sql` | Create | Idempotent migration replacing template child data |

## Interfaces / Contracts

No new TypeScript interfaces. The existing schema contracts are:

- `public.encuestas(tipo)` values: `inicial`, `cuatrimestral`, `entrevista`.
- `public.preguntas(tipo)` values: `texto`, `multiple`, `unica`, `escala`, `numerica`.
- `public.scoring_tramos(condicion_tipo)` values: `menor`, `menor_igual`, `mayor`, `mayor_igual`, `igual`, `entre`.
- `scoring_opciones.score` and `scoring_tramos.formula` are `numeric(5,2)`.

Migration SQL shape:

```sql
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.categorias_pregunta
    WHERE nombre IN ('Rendimiento Académico','Encuestas y Bienestar Emocional','Alerta de Aislamiento')
    HAVING count(*) = 3
  ) AND (
    SELECT count(*) FROM public.preguntas
    WHERE texto IN (...15 expected texts...)
  ) = 15 THEN
    RETURN;
  END IF;
END $$;

BEGIN;

-- 1. Reconcile categorias_pregunta
DELETE FROM public.categorias_pregunta
WHERE nombre NOT IN (...3 names...);

INSERT INTO public.categorias_pregunta (nombre, descripcion, score_maximo, color, activa)
VALUES (...) ON CONFLICT (nombre) DO UPDATE SET ...;

-- 2. Delete child data for the 3 encuestas
DELETE FROM public.encuesta_secciones
WHERE encuesta_id IN (SELECT id FROM public.encuestas WHERE tipo IN ('inicial','cuatrimestral','entrevista'));

-- 3. Insert secciones with gen_random_uuid(), via subqueries on encuestas.tipo
-- 4. Insert preguntas with JSONB opciones arrays, via subqueries on encuesta_secciones and categorias_pregunta.nombre
-- 5. Insert scoring_opciones by joining on preguntas.texto
-- 6. Insert scoring_tramos for satisfaccion_rendimiento (10 rows, condicion_tipo='igual', formula = 10 - condicion_valor)

COMMIT;
```

### `satisfaccion_rendimiento` tramos

The pregunta is `tipo = 'escala'`, `escala_min = 1`, `escala_max = 10`. Insert 10 tramos with `condicion_tipo = 'igual'` and `condicion_valor` from 1 to 10, formula `10 - condicion_valor`:

| Respuesta | 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 |
|-----------|----|---|---|---|---|---|---|---|---|---|
| `formula` | 0  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Migration | Idempotency and row counts | `supabase db reset`, then apply migration twice; assert 3 categorías, 4 secciones, 15 preguntas, 47 scoring_opciones, 10 scoring_tramos |
| Data integrity | Text, tipo, opciones, scores match document | SQL verification queries per spec scenarios |
| TypeScript | No regressions | `npm run tsc --noEmit` or `npx tsc --noEmit` |

## Migration / Rollout

1. Create `supabase/migrations/024_replace_encuesta_templates.sql`.
2. Run `supabase db reset` locally to verify clean apply.
3. Re-run the migration script manually in the local SQL Editor to verify idempotency.
4. In production, apply via Supabase CLI/MCP migration tool.

**Rollback**: `supabase db reset` re-applies from scratch after reverting the file. For a live database, a compensating migration can `DELETE` the new child rows and re-insert the original seed from migration `010`.

## Open Questions

- None.
