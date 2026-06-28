# Exploration: fix-dropdown-tutor-list

## User-Reported Regression

> "Desde la vista de admin en asignar-tutores, al apretar en 'cambiar' en una card de alumno, para cambiar su tutor NO visualizo la lista. Antes la visualizaba por debajo la card (por lo que era tapada), pero al intentar arreglarlo la dejé de visualizar."

Translation: When pressing "Cambiar" on a student card in the admin view, the tutor list is not visible. Previously it rendered below the card but was covered (z-index issue). A fix attempt removed the list visibility entirely.

---

## Current State (as of investigation)

### "Cambiar tutor" UI flow

Located in `src/components/dashboards/AsignarTutoresPage.tsx`.

- **Desktop trigger button** (lines 519-533): renders inside the 180px tutor column when an `asignacion` exists. onClick sets `dropdownPos` + `dropdownOpen(est.id)`.
- **Desktop portal** (lines 552-589): conditionally rendered via `createPortal(<motion.div ...>, document.body)` when `isDropdownOpen && dropdownPos`.
- **Mobile trigger button** (lines 622-636): renders inside the mobile layout (`md:hidden`). onClick also sets `dropdownPos` + `dropdownOpen(est.id)`.
- **Mobile portal**: **MISSING.** No `createPortal` block exists in the mobile section. The dropdown state is set but never rendered.

### State management

- `dropdownOpen: string | null` (line 122) — id of the student whose dropdown is open.
- `dropdownPos: { top, left } | null` (line 123) — button bounding rect at click time.
- `dropdownBtnRefs: Record<string, HTMLButtonElement | null>` (line 124) — refs to trigger buttons.
- Outside-click handler (lines 127-145) attached to `document`; checks `target.closest('[data-tutor-dropdown]')` to avoid closing when clicking inside the portal.

### Rendering condition (line 552)

```tsx
{isDropdownOpen && dropdownPos && createPortal(
  <motion.div
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed z-[9999] bg-[#0F1B2D] border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[200px]"
    data-tutor-dropdown
    style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
  >
    ...
  </motion.div>,
  document.body
)}
```

No `AnimatePresence`, no `exit`, no `transition` prop. Just `initial` + `animate`.

### Data fetch (verified working)

`getTutores()` in `src/services/asignacionesService.ts` (lines 35-65) queries `usuario_roles` with `rol IN ('tutor', 'asesor_par')` and joins `usuarios` for name/email. Returns `{ data: TutorInfo[], error: string | null }`. Mapped to `tutorOptions` on line 285 of the page. The Supabase query is correct and the data path is sound — this is **not** an empty-data issue.

---

## Prior Fix Context (from engram)

### Mem #85 — CustomSelect z-index fix
Replaced `position: absolute` + `z-50` with `createPortal` to `document.body` + `position: fixed` + `z-index: 9999`. Reason: `backdrop-blur-md` on cards creates a stacking context that traps `z-50`. This fix is applied and working in `CustomSelect.tsx`.

### Mem #86 — AnimatePresence removal in AsignarTutoresPage
**What**: Removed `AnimatePresence` from inside the `createPortal` in AsignarTutoresPage.
**Why**: Reasoning was that AnimatePresence inside a conditionally rendered portal unmounts before exit animations can play.
**Where**: `src/components/dashboards/AsignarTutoresPage.tsx` lines 552-590.
**Learned**: "For simple dropdowns rendered via createPortal, use motion.div with initial/animate only (no exit animation needed — unmounting handles dismissal)."

### Mem #87 — Session summary
Lists the accomplishment as "✅ Fixed AsignarTutoresPage dropdown (portal, e.currentTarget, sin AnimatePresence)" but then immediately flags: "⚠️ AsignarTutores 'Cambiar' dropdown still has rendering issue."
Next step noted: "el portal se renderiza pero no se ve la lista. Posibles causas: el cálculo de posición (left: rect.right - 200) puede estar mal, o el dropdownPos se resetea antes de renderizar. Probar con valores hardcodeados para diagnosticar."

### Contradiction with AlertasPage (working pattern)

`src/components/dashboards/AlertasPage.tsx` (lines 275-300) uses the **same conditional-portal pattern but wraps the `motion.div` in `AnimatePresence`** — and it works. The structural difference:

| Component | AnimatePresence? | Works? |
|-----------|-----------------|--------|
| `CustomSelect.tsx` (lines 85-132) | YES | ✅ Yes |
| `AlertasPage.tsx` (lines 275-300) | YES | ✅ Yes (per session summary) |
| `AsignarTutoresPage.tsx` (lines 552-589) | NO | ❌ No (current bug) |

The prior fix #86 removed AnimatePresence based on a theory that didn't hold up in practice — the portal mounts and the motion.div renders, but the dropdown is invisible.

---

## Candidate Root Causes (ranked by likelihood)

### #1 — HIGH: `motion.div` `initial={{ opacity: 0 }}` never transitions to `animate={{ opacity: 1 }}` (HIGH likelihood)

**Where**: `src/components/dashboards/AsignarTutoresPage.tsx` lines 553-555.

The `motion.div` has `initial={{ opacity: 0, y: -4 }}` and `animate={{ opacity: 1, y: 0 }}` but **no `transition` prop** and **no `AnimatePresence` wrapper**. When a `motion.div` mounts inside a `createPortal` that is itself conditionally rendered, framer-motion v12 may fail to register the enter animation under certain timing conditions (especially with React 19's concurrent rendering and the portal mount happening in the same render tick as the conditional becoming true).

Evidence:
- The user says the portal renders (mem #87) but the list is not visible.
- The only thing that could make a rendered `fixed z-[9999]` element invisible is: opacity 0, display:none, visibility:hidden, or off-screen position.
- `opacity: 0` is the `initial` value. If the animation doesn't fire, the element stays at opacity 0.
- The working components (CustomSelect, AlertasPage) all use `AnimatePresence` which guarantees the animation lifecycle.

**Fix direction**: Either restore `AnimatePresence` inside the `createPortal` (matching AlertasPage's working pattern), or add `transition={{ duration: 0.15 }}` to the motion.div, or remove `initial` entirely so the dropdown appears at full opacity immediately.

### #2 — MEDIUM: Mobile section has no portal at all (MEDIUM likelihood)

**Where**: `src/components/dashboards/AsignarTutoresPage.tsx` lines 593-639.

The mobile layout (`md:hidden`) includes a "Cambiar"/"Asignar" button whose onClick correctly sets `dropdownOpen` and `dropdownPos`, but **there is no `createPortal` block** to render the dropdown list. On any viewport narrower than 768px (Tailwind `md` breakpoint), the button toggles state but nothing appears.

This is a **separate, independent bug** from the desktop opacity issue. The user is probably on desktop, but this must be fixed too.

**Fix direction**: Add a `createPortal(<motion.div ...>, document.body)` block inside the mobile section's button container, gated on `isDropdownOpen && dropdownPos`.

### #3 — LOW-MEDIUM: Position calculation places dropdown off-screen (LOW-MEDIUM likelihood)

**Where**: `src/components/dashboards/AsignarTutoresPage.tsx` line 526 (desktop) and line 629 (mobile).

```tsx
setDropdownPos({ top: rect.bottom + 4, left: rect.right - 200 });
```

The "Cambiar" button is in the last column of a 6-column grid (180px wide). The button's right edge is the right edge of the card. `rect.right - 200` places the dropdown's left edge 200px to the left of the card's right edge. The dropdown is `min-w-[200px]` so it could extend to the right of the card.

If the card is near the right edge of the viewport, the dropdown could extend beyond the viewport's right edge and be clipped. This would make the dropdown partially or fully invisible depending on viewport width.

**Fix direction**: Use `rect.left` instead of `rect.right - 200` (align dropdown's left to button's left), matching CustomSelect's pattern (line 39: `left: rect.left`).

---

## Affected Areas

- `src/components/dashboards/AsignarTutoresPage.tsx`
  - Lines 552-589: desktop portal — candidate #1 (opacity stuck at 0)
  - Lines 593-639: mobile section — candidate #2 (missing portal entirely)
  - Lines 526, 629: position calculation — candidate #3 (potential off-screen)

- `src/components/dashboards/AlertasPage.tsx` (lines 275-300): reference working pattern with AnimatePresence.

- `src/components/ui/CustomSelect.tsx` (lines 84-133): reference working pattern with AnimatePresence + `left: rect.left`.

---

## Recommendation

Fix in this order:
1. **Restore `AnimatePresence` inside the desktop `createPortal`** (matching AlertasPage's working pattern at lines 275-300). This is the most likely single fix.
2. **Add the missing `createPortal` to the mobile section** (lines 593-639). Independent bug.
3. **Optionally change position to `left: rect.left`** for consistency with CustomSelect and to avoid edge-clipping.

All three are LOW complexity and can ship in a single change. Estimated diff: ~15 lines added, ~3 lines modified.

---

## Risks

- **React 19 + framer-motion 12 portal timing**: If the root cause is a framer-motion/React 19 concurrent rendering edge case, restoring AnimatePresence might not fully fix it. Mitigation: test with hardcoded `transition={{ duration: 0.15 }}` and `initial={false}` as fallbacks.
- **No test framework configured** (per `openspec/config.yaml`: `framework: none`). Fix must be manually verified in browser.
- **Double-portal on desktop**: If both desktop and mobile portals exist in the DOM (they won't, due to `md:hidden` / `hidden md:grid`), there could be a duplicate. Verified: each is gated by its own CSS class, so only one is visible at a time.

---

## Ready for Proposal

Yes. Root cause is identified with high confidence. Fix is small and isolated to one file. Proceed to `sdd-propose` to define the change scope, then `sdd-spec` for requirements/scenarios, then `sdd-tasks` for implementation steps.
