# Design: fix-dropdown-tutor-list

## Architecture decision

Use `createPortal` to `document.body` plus `AnimatePresence` wrapping the animated `motion.div`, mirroring the two confirmed working dropdowns in this repo: `AlertasPage.tsx` (lines 275–300) and `CustomSelect.tsx` (lines 85–132). `AnimatePresence` guarantees that framer-motion registers the mount animation lifecycle even when the portal is rendered conditionally in the same React 19 render tick. The fix is intentionally localized to one file; no new shared component or card redesign is introduced.

## Components affected

| File | Action |
|------|--------|
| `src/components/dashboards/AsignarTutoresPage.tsx` | Modify only |

`AlertasPage.tsx`, `CustomSelect.tsx`, and all other files remain untouched.

## Detailed change list

### 1. Desktop tutor dropdown portal (lines 552–589)

Current:

```tsx
{isDropdownOpen && dropdownPos && createPortal(
  <motion.div
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed z-[9999] ..."
    data-tutor-dropdown
    style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
  >
    ...
  </motion.div>,
  document.body
)}
```

Target:

```tsx
{isDropdownOpen && dropdownPos && createPortal(
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[9999] bg-[#0F1B2D] border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[200px]"
      data-tutor-dropdown
      style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
    >
      ...
    </motion.div>
  </AnimatePresence>,
  document.body
)}
```

`AnimatePresence` is already imported at line 18.

### 2. Position clamp (lines 526, 543, 629)

Change from:

```tsx
setDropdownPos({ top: rect.bottom + 4, left: rect.right - 200 });
```

To:

```tsx
const left = Math.min(rect.left, window.innerWidth - 220);
setDropdownPos({ top: rect.bottom + 4, left });
```

Use `220` to keep the 200px `min-w` dropdown fully inside the viewport with a small buffer. Apply this clamp to both desktop triggers (lines 526 and 543) and the mobile trigger (line 629; use `rect.right - 180` baseline currently, replace with the same clamp).

### 3. Mobile tutor dropdown portal (lines 593–639)

Currently the mobile `md:hidden` section sets the same `dropdownOpen`/`dropdownPos` state on button click but has no `createPortal`. Add the identical portal block after the mobile button container (after line 637), gated by `isDropdownOpen && dropdownPos`:

```tsx
{isDropdownOpen && dropdownPos && createPortal(
  <AnimatePresence>
    <motion.div ...>...</motion.div>
  </AnimatePresence>,
  document.body
)}
```

**State sharing justification**: Reuse the existing `dropdownOpen` and `dropdownPos` state. Only one dropdown can be open at a time, and CSS (`hidden md:grid` vs `md:hidden`) ensures only one of the desktop or mobile DOM branches is ever visible for a given viewport, so a single state model is sufficient and avoids duplication.

### 4. Outside-click dismiss

The existing `useEffect` at lines 127–145 already handles outside click (checks `data-tutor-dropdown`) and Escape. It remains the single dismiss mechanism; both portals use `data-tutor-dropdown`, so the handler works for desktop and mobile without modification.

## Edge cases

| Case | Handling |
|------|----------|
| Right-edge viewport | `Math.min(rect.left, window.innerWidth - 220)` prevents the 200px dropdown from overflowing the right edge. |
| Mobile keyboard | Portal is `position: fixed` on `document.body`; it is not affected by card reflow from virtual keyboards. |
| Scroll while open | Position is computed once at click time via `getBoundingClientRect`. This matches existing behavior in `AlertasPage` and is acceptable for a transient dropdown. |
| Both desktop/mobile portals in DOM | Impossible at runtime because the two sections are mutually exclusive via Tailwind responsive display classes. |

## Risk mitigation

- **framer-motion + React 19 concurrent rendering**: Restoring `AnimatePresence` matches the proven `AlertasPage` pattern. If the mount animation still fails in any environment, the documented fallback is to set `initial={false}` on the `motion.div` (or remove `initial`) so the dropdown renders at full opacity immediately.
- **No regression on other dropdowns**: The edit is scoped to `AsignarTutoresPage.tsx`; `AlertasPage.tsx` and `CustomSelect.tsx` are not touched.
- **Manual-only verification**: The project has no test framework configured. Verification will be manual in the dev server plus `tsc --noEmit`.

## Verification approach

1. Start the dev server (`npm run dev`).
2. **Desktop**: Click "Cambiar" and "Asignar tutor" on student cards; confirm the tutor list portal appears above cards, animates in, and closes on option click, outside click, or Escape.
3. **Right-edge card**: Trigger the dropdown from the rightmost column; confirm it stays fully inside the viewport.
4. **Mobile**: Resize to < 768px, tap "Cambiar"/"Asignar"; confirm the same portal renders and is interactive.
5. Run `tsc --noEmit` and confirm zero errors.
