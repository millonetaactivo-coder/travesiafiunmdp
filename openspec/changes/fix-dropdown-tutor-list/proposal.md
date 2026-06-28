# Proposal: fix-dropdown-tutor-list

## Intent

Bugfix for regression in `AsignarTutoresPage.tsx`: clicking "Cambiar" on a student card does not show the tutor-selection dropdown. This broke after a prior fix attempt (#86) removed `AnimatePresence` from the desktop portal. Mobile has a parallel bug — no portal exists at all.

## Scope

### In Scope
- Restore `AnimatePresence` inside the desktop `createPortal` (lines 552–589), matching the `AlertasPage.tsx` pattern at lines 275–300.
- Add a `createPortal` to the mobile section (lines 593–639) so the dropdown renders on narrow viewports.
- Clamp dropdown position to `left: rect.left` instead of `left: rect.right - 200` to avoid off-screen rendering on right-edge cards.

### Out of Scope
- Redesigning card layout or tutor column.
- New shared dropdown component — keep fix localized.
- Animation polish beyond the working reference pattern.
- Adding test coverage (no test framework configured per `config.yaml`).

## Capabilities

### New Capabilities
None — this is a bugfix restoring existing functionality.

### Modified Capabilities
None — no spec-level behavior change; only rendering fix.

## Approach

Mirror the **two confirmed working patterns** in the same codebase:

| Reference | Lines | Key pattern |
|-----------|-------|-------------|
| `AlertasPage.tsx` | 275–300 | `createPortal(<AnimatePresence><motion.div ... /></AnimatePresence>, document.body)` |
| `CustomSelect.tsx` | 85–132 | Same structure; also uses `left: rect.left` positioning |

**Desktop fix**: Wrap the existing `motion.div` (line 553) in `<AnimatePresence>`. Add `exit={{ opacity: 0, y: -4 }}` for consistent dismiss. The `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}` will now fire because `AnimatePresence` guarantees the animation lifecycle.

**Mobile fix**: Add an identical `createPortal` block inside the mobile button container, gated by `isDropdownOpen && dropdownPos`. CSS gating (`md:hidden` / `hidden md:grid`) prevents double-render.

**Position fix**: Change `left: rect.right - 200` to `left: rect.left` in both `handleDropdownClick` invocations (lines 526, 629).

Estimated diff: ~15 lines added, ~3 modified, 1 file.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/dashboards/AsignarTutoresPage.tsx` | Modified | Desktop portal (AnimatePresence), mobile portal (new), position calc |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `AnimatePresence` still fails under React 19 concurrent rendering | Low | Fallback: remove `initial` prop, use `transition={{ duration: 0.15 }}` |
| Mobile portal duplicates desktop (both visible) | None | CSS `md:hidden` / `hidden md:grid` mutually exclusive |
| Manual-only verification misses edge-case regressions | Medium | Test both viewports; test right-edge card position |

## Rollback Plan

Revert the single file to HEAD. No database changes, no API changes.

## Dependencies

None. Pure frontend fix, no Supabase schema or API changes.

## Success Criteria

- [ ] Desktop: clicking "Cambiar" shows tutor list as a fixed-position portal overlay above all cards.
- [ ] Mobile: clicking "Cambiar"/"Asignar" shows the same dropdown on viewports < 768px.
- [ ] Dropdown is fully visible when triggered from rightmost student cards.
- [ ] Clicking a tutor option closes the dropdown and updates the assignment.
- [ ] Clicking outside the dropdown closes it without errors.
- [ ] `tsc --noEmit` passes with zero errors.
