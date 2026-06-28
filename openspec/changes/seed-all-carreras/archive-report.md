# Archive Report: seed-all-carreras

**Status**: Complete
**Date**: 2026-06-27
**Verdict**: PASS

## Summary
Created 9 seed migrations (011-019) seeding all 10 engineering career plans at FI-UNMdP. Total: ~478 subjects across all careers.

## Migrations Created
| Migration | Carrera | Subjects |
|-----------|---------|----------|
| 011 | Ingeniería en Computación | 45 |
| 012 | Ingeniería Electrónica | 48 |
| 013 | Ingeniería Eléctrica | 47 (syn codes INGELE) |
| 014 | Ingeniería Electromecánica | 48 (syn codes INGEME) |
| 015 | Ingeniería Industrial | 49 |
| 016 | Ingeniería Mecánica | 52 |
| 017 | Ingeniería Química | 43 |
| 018 | Ingeniería en Alimentos | 45 |
| 019 | Ingeniería en Materiales | 46 |

## Applied
- Local: ✅ 19/19 migrations (000-019)
- Cloud: ✅ `supabase db push` all 9 new migrations (011-019)

## Notes
- Eléctrica and Electromecánica use synthetic codes (INGELE###, INGEME###) — no official codes in source doc
- Correlativas NOT seeded for carreras 2-10 (no data in planesdeestudio.md)
- Annual subjects assigned cuatrimestre=1
- Admin user recreated post-reset
