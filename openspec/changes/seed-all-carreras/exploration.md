# Exploration: Seed All 10 Career Plans (Carreras 2–10)

**Date**: 2026-06-27
**Mode**: read-only investigation (no code or SQL written)
**Change name**: `seed-all-carreras`
**Scope**: Seed remaining 9 engineering careers (Informática is already done in migration 009)

---

## Current State

Migration `009_seed_carreras_materias.sql` seeded only **Ingeniería en Informática** (carrera `INF`): 55 `materias` rows + 55 `plan_estudios` rows + ~50 `correlativas` rows, totaling 249 lines. The other 9 careers from `docs/planesdeestudio.md` (Computación, Electrónica, Eléctrica, Electromecánica, Industrial, Mecánica, Química, Alimentos, Materiales) have **no subject data** in `materias` / `plan_estudios`.

The 10 `carreras` rows were already inserted in migration 009 (lines 14–25) using codes `INF, COM, ELC, ELE, EME, IND, MEC, QUI, ALI, MAT`. So the next migrations do NOT need to re-seed `carreras` — only `materias`, `plan_estudios`, and (optionally) `correlativas`.

Schema constraints (from `000_base_de_datos.sql`):
- `materias.UNIQUE(carrera_id, codigo)` — same code can be reused across carreras, no need for global uniqueness
- `plan_estudios.UNIQUE(carrera_id, materia_id)` — one plan row per materia per carrera
- `correlativas.UNIQUE(materia_id, materia_requerida_id)` — same dependency cannot be inserted twice
- All FKs to `carreras(id)` are ON DELETE CASCADE, so reseeding is safe if a carrera is dropped

Next free migration number: **011** (existing applied: 000–007, 009, 010; `008_revert_schema_fixes.sql` lives in `supabase/` root intentionally).

---

## Subject Counts per Career (counted from `docs/planesdeestudio.md`)

> Counting rule: each bullet = 1 subject. "Anual" subjects (e.g. Proyecto Integrador) are counted in the year where they're listed. Unnamed electivas in Industrial are counted as placeholders.

| # | Carrera | Code | Subject Count | Status |
|---|---------|------|---------------|--------|
| 1 | Informática | `INF` | 55 | ✅ seeded (009) |
| 2 | Computación | `COM` | 45 | pending |
| 3 | Electrónica | `ELC` | 48 | pending |
| 4 | Eléctrica | `ELE` | 46 + 1 Proyecto Final (47) | pending — **no ING codes** |
| 5 | Electromecánica | `EME` | 46 + Elementos de Máquinas + Proyecto Final (48) | pending — **no ING codes** |
| 6 | Industrial | `IND` | 48 (incl. 4 anuales; 3 unnamed electivas/optativas) | pending |
| 7 | Mecánica | `MEC` | 52 | pending |
| 8 | Química | `QUI` | 43 | pending |
| 9 | Alimentos | `ALI` | 45 | pending |
| 10 | Materiales | `MAT` | 46 | pending |

**Totals**: 9 pending careers, **~422 subjects** + 1 ING0000-type ingreso placeholder per career (debatable, see Risks).

**Grand total in DB after seeding**: ~477 `materias` rows (55 INF + 422 others) + ~477 `plan_estudios` rows.

---

## Career Detail Breakdown

### 2. Computación (`COM`) — 45 subjects, full codes
Year-by-year: 1° (4+5), 2° (4+5), 3° (5+5), 4° (4+5), 5° (5+3). All codes present (`INGM101-108`, `INGF101-105`, `ING4201-4228`, `ING4301-4327`, `ING6101-6102`, `ING6307`, `ING8401-8412`). Two inline "Optativa I/II" placeholders (`ING4326`, `ING4327`) — already have codes.

### 3. Electrónica (`ELC`) — 48 subjects, full codes
Year-by-year: 1° (5+6), 2° (5+4), 3° (5+5), 4° (5+5), 5° (5+3). All codes present (`INGM101-109`, `ING1103`, `INGF101-105`, `ING4101-4401`, `ING4201-4215`, `ING4301-4308`, `ING6102`, `ING8403-8412`). Three "Electiva I/II/III" and two "Optativa I/II" placeholders — **no codes** in doc.

### 4. Eléctrica (`ELE`) — 47 subjects, **NO codes** ⚠️
The doc has only subject names + CG count; no ING code for any subject. We must assign placeholder codes. Suggested scheme (extending `Ingeniería Eléctrica` department prefix `ING3###` would be natural, but careful not to collide with existing `ING3204` from Mecánica):
- 1° año 2° cuat "Fundamentos de la Programación" — assign `ING6101` (same code as Industrial/Química/etc. is allowed because UNIQUE is per-carrera)
- 2° año "Inglés I/II" — assign `ING8408` / `ING8409`
- All other subjects: synthesize new `INGELExxx` codes (e.g. `INGELE101`, `INGELE102`...) to avoid collision with codes reserved by other departments. **Requires human review** before commit.
- Proyecto Final: 10 CG, no code → assign `INGELE999`.

### 5. Electromecánica (`EME`) — 48 subjects, **NO codes** ⚠️
Same situation as Eléctrica. Every subject is a placeholder. Suggested scheme: `INGEME###` codes (e.g. `INGEME101`–`INGEME148`). Includes:
- "Elementos de Máquinas" (6 CG, anual) — assign `INGEME020`
- "Proyecto Final" (10 CG) — assign `INGEME999`

### 6. Industrial (`IND`) — 48 subjects, full codes (mostly)
Special structure: **4 anual subjects** (Proyecto de Ingeniería Industrial I–IV) interleaved with cuatrimestral. The doc lists them as `Anual: ...` lines. They are 1 subject per line, total 4 subjects.
- 3 unnamed placeholders: `Electiva 2`, `Electiva 3`, `Optativa 1` (8° cuat, 9° cuat, 10° cuat) — need codes. Suggest `INGIND901`, `INGIND902`, `INGIND903` (or follow Industrial dept pattern `ING8###` → `ING8901/2/3` to match existing `ING8301-8312` and `ING8405`).

### 7. Mecánica (`MEC`) — 52 subjects, full codes
Largest career after Informática. Two anual subjects: "Introducción a la Ingeniería Mecánica" (1° cuat, 4 CG, `ING2401`) and "Elementos de Máquinas" (4° cuat, 6 CG, `ING2301`). Five electivas have codes (`ING2314-ING2318`); one optativa (`ING2325`).

### 8. Química (`QUI`) — 43 subjects, full codes
Four "Taller de Ingeniería" anual subjects (1°–4° año). Codes `ING1501-ING1506`. Standard Química 1xxx-2xxx-3xxx-4xxx prefix scheme.

### 9. Alimentos (`ALI`) — 45 subjects, full codes
Similar to Química — shares `ING1101`, `ING1201-1206`, `ING1301-1315`, `ING1501-1507` codes. Five anual: Taller I-III + Proyecto Integrador.

### 10. Materiales (`MAT`) — 46 subjects, full codes
Distinct `ING51xx-53xx` department prefix (no overlap with other careers). One anual: "Trabajo Final" (`ING5316`).

---

## Code-Availability Matrix

| Career | % of subjects with codes | Action needed |
|--------|--------------------------|---------------|
| 1. INF | 100% | none (done) |
| 2. COM | 100% | none |
| 3. ELC | ~92% (3 electivas, 2 optativas without codes) | assign codes to 5 placeholders |
| 4. ELE | 0% | synthesize all ~47 codes |
| 5. EME | 0% | synthesize all ~48 codes |
| 6. IND | ~94% (3 unnamed placeholders) | assign codes to 3 placeholders |
| 7. MEC | 100% | none |
| 8. QUI | 100% | none |
| 9. ALI | 100% | none |
| 10. MAT | 100% | none |

**Critical gap**: Carreras 4 (ELE) and 5 (EME) have ZERO ING codes in the source doc. This is a blocking decision: we either (a) wait for the Secretaría Académica to publish codes, or (b) assign synthetic codes (e.g. `INGELE###` / `INGEME###`) and flag in a comment that they need real codes before any cross-carrera correlation logic ships. **Recommend (b)** with explicit `-- TODO: confirm codes with Secretaría Académica` comments.

---

## Shared Subjects Across Careers

Same `codigo` may appear in multiple carreras (the `UNIQUE(carrera_id, codigo)` constraint is per-carrera, not global). Counting how many careers use the same ING code is a useful cross-carrera check, but it does NOT reduce row count — each career has its own `materias` row even if the code matches.

High-frequency shared codes (heuristic count from reading the doc):

| Code | Subject | Used in (count) |
|------|---------|-----------------|
| `INGM101` | Análisis Matemático I | 9–10 (all except maybe one) |
| `INGM102` | Análisis Matemático II | 9–10 |
| `INGM103` | Análisis Matemático III | 7 |
| `INGM104` | Álgebra I-A | 5 (COM, ELC, ELE, EME, MEC, MAT) |
| `INGM105` | Álgebra I-B | 4 (INF, IND, QUI, ALI) |
| `INGM106` | Álgebra II | 8–9 |
| `INGM107` | Introducción a la Matemática Discreta | 1–2 (INF, COM) |
| `INGM108` | Probabilidad y Estadística | 7 |
| `INGM109` | Métodos Numéricos | 4 (ELC, QUI, ALI, MAT) |
| `INGF101` | Física A | 10 (all) |
| `INGF102` | Física B-I | 5 (COM, ELC, ELE, EME, MAT) |
| `INGF103` | Física B-II | 5 (INF, IND, MEC, QUI, ALI) |
| `INGF104` | Física C-I | 3 (ELC, ELE, EME, MAT) |
| `INGF105` | Física C-II | 4 (COM, IND, MEC, QUI, ALI) |
| `INGF106` | Física Experimental A | 3 (IND, MEC, MAT) |
| `ING1103` | Fundamentos de Química | 5 |
| `ING1101` | Química General e Inorgánica | 2 (QUI, ALI) |
| `ING2207` | Estática I | 2 (MEC, MAT) — note: `EME` and `IND` use the name but no code |
| `ING2208` | Estática II | 2 (MEC, MAT) — same caveat |
| `ING6101` | Fundamentos de la Programación | 4 (IND, MEC, QUI, ALI, MAT) — `ELE` and `EME` lack code |
| `ING6102` | Informática Básica | 2 (INF, ELC) |
| `ING8408` / `ING8409` | Inglés I/II | 6 (INF, COM, ELC, IND, MEC, MAT) + 2 missing-code (ELE, EME) |
| `ING8405` | Ética, Legislación y Propiedad Intelectual | 7 |
| `ING8412` | Seguridad y Salud Ocupacional | 10 (all) |
| `ING8411` | Organización Empresarial e Industrial | 6 (COM, ELC, ELE, EME, MEC, QUI, ALI, MAT, IND = 8) |

**Implication for code generation**: careers 4 (ELE) and 5 (EME) need `Inglés I/II` codes too — they should use the shared `ING8408`/`ING8409` to match the pattern. Same for "Seguridad y Salud Ocupacional" → `ING8412` and "Organización Empresarial e Industrial" → `ING8411`. This makes the synthetic codes for ELE/EME partly real (where the code is universal) and partly synthetic (where the code is career-specific).

---

## Line Estimates per Migration

Using Informática (009) as the reference: **249 lines for 55 subjects, including ~50 correlativas**. Stripping correlativas (not in the source doc for other careers, and not required for plan display) and adapting to per-carrera scope, the per-career line budget is:

| Career | Subject count | Est. lines (materias + plan_estudios + comments) |
|--------|---------------|--------------------------------------------------|
| COM | 45 | ~180–220 |
| ELC | 48 | ~190–230 |
| ELE | 47 | ~200–240 (synthetic codes need extra comments) |
| EME | 48 | ~210–250 (synthetic codes + 2 named-but-codeless finales) |
| IND | 48 | ~200–240 (anual subjects need explicit comments) |
| MEC | 52 | ~210–250 |
| QUI | 43 | ~170–210 |
| ALI | 45 | ~180–220 |
| MAT | 46 | ~180–220 |
| **TOTAL** | **422** | **~1,720–2,060 lines** |

Each individual migration fits the **400-line PR review budget** (best case: QUI at 170 lines; worst case: EME at 250 lines). The aggregate (1,720+ lines) does NOT fit.

**Correlativas**: not included in estimates above. The source doc for carreras 2–10 has NO correlativa data. If correlativas are in scope, the per-career line count could double (matching Informática's pattern of ~1 correlativa row per ~1 materia). For now, plan_estudios is enough to ship the admin UI; correlativas can be a follow-up change once Secretaría Académica provides the data.

---

## Migration Strategy — Approaches Compared

### Approach A — 9 separate migrations (one per carrera)
- Files: `011_seed_carrera_COM.sql`, `012_seed_carrera_ELC.sql`, ..., `019_seed_carrera_MAT.sql`
- Pros: each file ~170–250 lines (under 400 budget); per-carrera reviewability; per-carrera rollback; matches the "domain per migration" pattern from 009/010
- Cons: 9 PRs (or 1 chained PR with 9 slices); admin sees 9 successive apply events
- Effort: **Medium** (9 SQL files, chained PR)

### Approach B — 2 grouped migrations (with/without codes)
- Files: `011_seed_carreras_with_codes.sql` (COM, ELC, IND, MEC, QUI, ALI, MAT = 7 careers, ~1,300–1,500 lines) and `012_seed_carreras_synthetic_codes.sql` (ELE + EME = 2 careers, ~410–490 lines)
- Pros: groups the problematic code-synthesis work in one isolated PR; first PR is "ready to ship", second PR awaits code-confirmation review
- Cons: 011 is over the 400-line budget (~3–4× over); hard to bisect
- Effort: **Medium** (2 SQL files, 2 PRs)

### Approach C — 1 single migration (all 9 careers, ~1,800 lines)
- Pros: atomic; one apply; matches "domain per migration" pattern (the domain is "all carreras")
- Cons: **1,800 lines is way over the 400-line review budget**; one typo blocks the whole apply
- Effort: **Low** (1 file, 1 PR) — but high review/rollback cost

### Approach D — 5 migrations grouped by structure
- Group 1: "Tecnológicas puras con códigos completos" (COM + ELC, ~400 lines) → `011`
- Group 2: "Carreras 2003 sin códigos" (ELE + EME, ~450 lines) → `012`
- Group 3: "Industrial con anuales" (IND, ~220 lines) → `013`
- Group 4: "Mecánica" (MEC, ~250 lines) → `014`
- Group 5: "Química + Alimentos" (QUI + ALI, ~400 lines) → `015`
- Group 6: "Materiales" (MAT, ~200 lines) → `016`
- Pros: each file is small; reviewable in 5–10 min; logical grouping
- Cons: 6 PRs; some are tiny (Materiales 200 lines, Industrial 220 lines)
- Effort: **Medium-High** (6 files, 6 PRs)

### Approach E — 2 migrations (split by code availability, balanced)
- File 1: `011_seed_carreras_con_codigos_completos.sql` — COM, MEC, QUI, ALI, MAT (5 careers with 100% codes, ~960–1,150 lines). **Over budget**.
- File 2: `012_seed_carreras_codigos_parciales_o_sinteticos.sql` — ELC, ELE, EME, IND (4 careers needing code work, ~810–960 lines). **Over budget**.

---

## Recommendation: Approach A (9 separate migrations, one per carrera)

**Why**:
1. **Each file fits the 400-line review budget** (170–250 lines). Every career is a self-contained review unit.
2. **Matches existing project convention**: 009 = Informática, then 011–019 = remaining 9 carreras. Per-carrera files mirror the per-carrera scoping in `docs/planesdeestudio.md`.
3. **Per-carrera rollback**: if a synthetic code in EME turns out wrong, only `019_seed_carrera_MAT.sql`... wait, `EME` would be `014_seed_carrera_EME.sql`. Only that one migration needs reverting, not the whole batch.
4. **Parallel work possible**: 9 PRs can be drafted in parallel; reviewers see a clean diff per career.
5. **Idempotent**: each is `ON CONFLICT DO NOTHING`, so applying any subset is safe.
6. **Most important reason**: synthetic codes for ELE/EME need human review. Isolating them in their own PR (`013_seed_carrera_ELE.sql` and `014_seed_carrera_EME.sql`) means that review conversation doesn't block the other 7.

**Concrete file plan**:

```
supabase/migrations/
├── 009_seed_carreras_materias.sql          ← already applied (Informática)
├── 010_seed_indicadores_encuestas.sql      ← already applied
├── 011_seed_carrera_COM.sql                ← Computación
├── 012_seed_carrera_ELC.sql                ← Electrónica (5 placeholders need codes)
├── 013_seed_carrera_ELE.sql                ← Eléctrica (synthetic codes ⚠️)
├── 014_seed_carrera_EME.sql                ← Electromecánica (synthetic codes ⚠️)
├── 015_seed_carrera_IND.sql                ← Industrial (3 unnamed + 4 anuales)
├── 016_seed_carrera_MEC.sql                ← Mecánica (largest after INF)
├── 017_seed_carrera_QUI.sql                ← Química
├── 018_seed_carrera_ALI.sql                ← Alimentos
└── 019_seed_carrera_MAT.sql                ← Materiales
```

**Chained PR strategy**: ship as one PR with 9 commits (one per migration) for atomic merge, OR as 9 separate PRs if reviewers prefer incremental approval. Given the synthetic-codes risk in ELE/EME, the safest workflow is:

1. **PR 1** (independent): 011, 012, 015, 016, 017, 018, 019 (7 careers, all codes real) — ready to merge immediately.
2. **PR 2** (gated): 013 (ELE) and 014 (EME) — blocked until Secretaría Académica confirms synthetic codes.

**Rollback**: optional `supabase/020_revert_seed_all_carreras.sql` (mirror the `008_revert_schema_fixes.sql` pattern: DELETE in reverse order, only for rows added by 011–019). Skip unless user explicitly requests.

---

## Affected Areas

- `supabase/migrations/` — 9 new SQL files (011–019)
- `supabase/seed.sql` — currently empty/manual; could be regenerated as a single concatenated file but NOT required (out of scope)
- `docs/planesdeestudio.md` — source of truth; no edits needed
- `src/services/planService.ts` — already supports all 10 carreras via `carrera_id` param; no TS changes needed
- `src/components/dashboards/DashPlanAdmin.tsx` — already lists all 10 carreras from DB; will gain 9 more UI targets automatically
- `src/components/dashboards/DashEstudiante.tsx` — `PlanSelector` will show 9 new plans; no code change required
- `src/components/dashboards/ImportarAlumnos.tsx` — CSV import validates `carrera_codigo` against `carreras.codigo`; codes already inserted in 009, no change

---

## Risks

- **High**: Carreras 4 (ELE) and 5 (EME) have **zero ING codes** in `docs/planesdeestudio.md`. Synthetic code assignment (`INGELE###` / `INGEME###`) is a STOP-GAP — Secretaría Académica needs to provide the official codes. If the official codes later conflict with the synthetic ones, the migration will need a renaming pass (UPDATE statements are doable but messy). Recommend shipping with `-- TODO: confirm with Secretaría Académica` comments at the top of files 013 and 014.
- **High**: Carreras 3 (ELC) and 6 (IND) have 5 + 3 = 8 placeholder subjects (electivas/optativas) without codes. Need human assignment.
- **Medium**: Carrera 6 (IND) has **4 anual subjects** (Proyecto de Ingeniería Industrial I–IV) that the source doc places BETWEEN cuatrimestres. The `plan_estudios` schema only has `cuatrimestre INT` (1 or 2) — it does not natively model "anual". Recommended mapping: anual subjects get `cuatrimestre = 1` (first semester) + a comment, OR introduce a new column `es_anual BOOLEAN` (schema change — out of scope). For now, use `cuatrimestre = 1` + a `tipo = 'anual'` or use `tipo = 'obligatoria'` and accept that the UI will show them in 1° cuat only. **Flag for human decision** before migration 015.
- **Medium**: Carrera 5 (EME) has "Elementos de Máquinas" and "Proyecto Final" listed AFTER the cuatrimestre breakdown, not in any year. Similar to Industrial's anual pattern. Same `cuatrimestre` issue applies.
- **Medium**: Correlativas are not in scope for this change (no source data). The plan display will work without them, but `getMateriasHabilitadas` RPC will return all subjects as always-enabled. Flag as a follow-up change.
- **Low**: Migration file count. 9 new migrations is more than the project has today (8 applied). Convention-wise, this is fine but it bumps the migration list. If the user prefers fewer files, fall back to Approach D (6 files, logical groups).
- **Low**: Carrera codes already seeded in 009 use `ELC` for Electrónica and `ELE` for Eléctrica (not `ELE`/`ELC` as initially explored in `seed-template-data/exploration.md`). The seed 009 final decision is the source of truth — no need to revisit.
- **Low**: Long-running apply. ~422 INSERTs across 9 migrations should complete in <2 seconds on Supabase. Not a concern.

---

## Verification Plan (for the apply/verify phase)

Per migration:
1. `tsc --noEmit` — no TS changes → must still pass.
2. After applying, `SELECT COUNT(*) FROM materias WHERE carrera_id = '<UUID>'` returns the expected count (e.g. 45 for COM).
3. `SELECT COUNT(*) FROM plan_estudios WHERE carrera_id = '<UUID>'` matches the materia count (1:1).
4. `getPlanEstudios(carreraId)` RPC returns the rows ordered by year/semester.
5. UI: `DashPlanAdmin` for the new carrera shows the year/semester grid; `PlanSelector` lists the new carrera.
6. End-to-end: a test `estudiantes` row with `carrera_id` for the new carrera sees the correct plan in `DashPlanEstudiante`.

Aggregate (after all 9):
- `SELECT COUNT(*) FROM materias` ≈ 477.
- `SELECT COUNT(*) FROM plan_estudios` ≈ 477.
- `SELECT COUNT(DISTINCT codigo) FROM materias` ≈ 280–320 (many shared codes).

---

## Ready for Proposal

**Yes** — the inventory is complete, the line estimates are within budget per file, the strategy is decided (Approach A: 9 separate migrations), and the only blocking decision is **whether to ship ELE/EME with synthetic codes** (gating PR 2). The orchestrator should propose a change named `seed-all-carreras` with:

1. **Scope**: 9 new SQL migrations (011–019). No TS changes. No `correlativas`. No `carreras` re-insertion (already done in 009).
2. **Approach**: Approach A (9 individual migrations). Fallback to Approach D (6 grouped migrations) if 9 files is too many.
3. **Code synthesis**: propose `INGELE###` for Eléctrica and `INGEME###` for Electromecánica, with TODO comments. User must confirm or supply real codes.
4. **Annual subjects**: propose mapping `cuatrimestre = 1` for Industrial's 4 anuales + EME's 2 final works, with `tipo = 'anual'` (allowed by `tipo TEXT` column) or new `tipo = 'obligatoria'`. User must confirm.
5. **Rollback**: optional `supabase/020_revert_seed_all_carreras.sql` (only if user requests).
6. **Verification**: per-migration `SELECT COUNT` checks; aggregate after all applied; UI smoke test in `DashPlanAdmin`.
7. **Excluded**: NO `correlativas` (no source data); NO `usuarios` / `estudiantes` / `progreso_estudiante` (per-deployment data); NO `carreras` re-INSERT (already in 009); NO schema changes (no `es_anual` column).
