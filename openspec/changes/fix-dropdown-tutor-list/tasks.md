# Tasks: fix-dropdown-tutor-list

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 20-25 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Fix desktop portal + position clamp + mobile portal + verify | PR 1 | Single commit, ~20 lines in 1 file |

## Phase 1: Desktop Portal Fix

- [x] 1.1 Wrap desktop `motion.div` in `<AnimatePresence>`. File: `src/components/dashboards/AsignarTutoresPage.tsx`, lines 552-589. Change: add `<AnimatePresence>` around the `<motion.div>` (line 553) and close it before `document.body` (line 588). Add `exit={{ opacity: 0, y: -4 }}` and `transition={{ duration: 0.15 }}` to the `motion.div`. `AnimatePresence` is already imported at line 18. Mirror AlertasPage pattern (lines 275-300).

- [x] 1.2 Clamp desktop dropdown position. File: `src/components/dashboards/AsignarTutoresPage.tsx`. Change lines 526 and 543 from `left: rect.right - 200` to: `const left = Math.min(rect.left, window.innerWidth - 220); setDropdownPos({ top: rect.bottom + 4, left })`. This prevents overflow on rightmost cards.

## Phase 2: Mobile Portal

- [x] 2.1 Add `createPortal` to mobile section. File: `src/components/dashboards/AsignarTutoresPage.tsx`, after line 637 (closing `</div>` of mobile button container). Insert identical portal block gated by `isDropdownOpen && dropdownPos`, wrapped in `<AnimatePresence>`, with `data-tutor-dropdown` attribute. Reuses existing state — CSS `md:hidden` / `hidden md:grid` prevents double-render.

- [x] 2.2 Clamp mobile dropdown position. File: `src/components/dashboards/AsignarTutoresPage.tsx`, line 629. Change from `left: rect.right - 180` to: `const left = Math.min(rect.left, window.innerWidth - 220); setDropdownPos({ top: rect.bottom + 4, left })`.

## Phase 3: Verification

- [x] 3.1 Verify outside-click + Escape dismissal. Confirm the new `motion.div` wrappers and mobile portal both carry `data-tutor-dropdown` attribute. The existing `useEffect` (lines 127-145) uses `target.closest('[data-tutor-dropdown]')` — no handler changes needed.

- [x] 3.2 Run `tsc --noEmit` to confirm zero TypeScript errors after all edits.

- [ ] 3.3 Manual browser verification. Start `npm run dev`, navigate to `/admin/asignar-tutores`. Desktop: click "Cambiar" and "Asignar tutor" — confirm portal appears above all cards, animates in, dismisses on selection / outside-click / Escape. Right-edge card: confirm dropdown stays inside viewport. Mobile (< 768px): tap "Cambiar"/"Asignar" — confirm portal renders and is interactive.
