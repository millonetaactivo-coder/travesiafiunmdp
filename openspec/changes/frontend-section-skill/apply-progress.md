# Apply Progress: frontend-section-skill

## Status: COMPLETE (with fixes applied)

## Tasks

- [x] 1.1 Frontmatter — name, description, triggers (array), user-invocable: true
- [x] 1.2 Visual Identity & Tokens — color palette, typography, glass pattern, blobs, spacing
- [x] 1.3 Component Catalog — cn(), AuroraBackground, FloatingDock, Button, CustomSelect, icons
- [x] 1.4 Section Creation Guide — route, shell, header, cards, data fetching, animations, charts, buttons, inputs, auth gate
- [x] 1.5 Decision Trees — daisyUI vs glass button, CustomSelect vs native, inline vs extract, lucide vs tabler

## Files Created

| File | Action | Lines |
|------|--------|-------|
| `.agents/skills/frontend-section-skill/SKILL.md` | Created + Fixed | 195 |

## Verification

- Line count: 195 ≤ 250 ✅
- All 11 cited source files verified existing ✅
- No .ts or .sql files modified ✅
- All token values extracted from actual src/index.css ✅
- All patterns sourced from DashAdmin.tsx, AppRouter.tsx, moving-border.tsx, CustomSelect.tsx, useAuth.ts, useScore.ts, scoresService.ts ✅

## Fixes Applied (2026-06-27)

### Fix 1 — Import paths (BLOCKING)
- **Problem**: All `@/` imports were broken. `@/*` maps to project root (`.`), not `src/`. Dashboard files use relative imports.
- **Fix**: Replaced all 4 `@/` imports with correct relative paths:
  - `@/lib/utils` → `../../lib/utils`
  - `@/lib/supabase` → `../../lib/supabase`
  - `@/services/{domain}Service` → `../../services/{domain}Service`
  - `@/components/ui/moving-border` → `../ui/moving-border`
- **Verified**: All target files exist (`src/lib/utils.ts`, `src/lib/supabase.ts`, `src/components/ui/moving-border.tsx`, `src/services/*Service.ts`)

### Fix 2 — Frontmatter (BLOCKING)
- **Problem**: `trigger:` (singular) instead of `triggers:` (array); missing `user-invocable: true`
- **Fix**: Changed to `triggers:` array with 6 entries + added `user-invocable: true`

### Fix 3 — Section structure
- **Problem**: Too many `##` headings (8); spec requires exactly 3
- **Fix**: Reorganized into 3 `##` sections: Design System Reference, Component Catalog, Section Creation Guide. Merged Icons into Component Catalog, Auth Gate into Section Creation Guide. Reduced from 221 to 195 lines.
