# Delta for Tutor Assignment — Dropdown Rendering

## ADDED Requirements

### Requirement: Desktop Tutor Dropdown Portal Visibility

The system SHALL render the tutor-selection dropdown as a `createPortal` to `document.body` wrapped in `<AnimatePresence>` with `initial`, `animate`, `exit`, and `transition` props on the `motion.div`, matching the working pattern in `AlertasPage.tsx` (lines 275–300) and `CustomSelect.tsx` (lines 84–133). The dropdown MUST appear at `z-index: 9999` with `position: fixed` when the user clicks "Cambiar" or "Asignar tutor" on a desktop student card.

#### Scenario: Desktop dropdown appears on "Cambiar" click

- GIVEN a student card has an existing tutor assignment on desktop viewport (>= 768px)
- WHEN the admin clicks the "Cambiar" button
- THEN a dropdown portal SHALL render at `document.body` containing all available tutors
- AND the dropdown SHALL be visible (opacity 1) above all card stacking contexts

#### Scenario: Desktop dropdown appears on "Asignar tutor" click

- GIVEN a student card has no tutor assignment on desktop viewport
- WHEN the admin clicks "Asignar tutor"
- THEN the same portal dropdown SHALL render with all available tutors

### Requirement: Mobile Tutor Dropdown Portal

The system SHALL render an identical `createPortal` dropdown in the mobile layout section (`md:hidden`). The mobile portal MUST be gated by the same `isDropdownOpen && dropdownPos` condition and use `data-tutor-dropdown` attribute for the outside-click handler. CSS mutual exclusion (`md:hidden` vs `hidden md-grid`) SHALL prevent both portals from rendering simultaneously.

#### Scenario: Mobile dropdown appears on "Cambiar"/"Asignar" click

- GIVEN a student card on mobile viewport (< 768px) with the "Cambiar" or "Asignar" button visible
- WHEN the admin taps the button
- THEN a dropdown portal SHALL render at `document.body` with the tutor list
- AND the dropdown SHALL be fully visible and interactive

### Requirement: Dropdown Dismissal

The system SHALL close the dropdown when: (a) a tutor option is selected, (b) the user clicks outside the dropdown (detected via `data-tutor-dropdown` attribute), or (c) the user presses Escape. The existing `useEffect` handler at lines 127–145 SHALL remain the single dismissal mechanism for both desktop and mobile portals.

#### Scenario: Dismiss on tutor selection

- GIVEN the dropdown is open for student "Juan Perez"
- WHEN the admin clicks a tutor name in the dropdown
- THEN the dropdown SHALL close and the assignment SHALL update

#### Scenario: Dismiss on outside click

- GIVEN the dropdown is open
- WHEN the admin clicks anywhere outside the dropdown and outside the trigger button
- THEN the dropdown SHALL close without side effects

### Requirement: Viewport-Clamped Position

The system SHALL calculate dropdown `left` position as `rect.left` (the trigger button's left edge), not `rect.right - 200`. This ensures the dropdown does not extend beyond the viewport's right edge when triggered from rightmost cards.

#### Scenario: Right-edge card dropdown fully visible

- GIVEN a student card in the rightmost column of the grid
- WHEN the admin clicks "Cambiar"
- THEN the dropdown's left edge SHALL align with the button's left edge
- AND the dropdown SHALL NOT extend beyond the viewport right boundary

### Requirement: No Regression on Existing Dropdowns

The fix SHALL NOT alter the rendering behavior of dropdowns in `AlertasPage.tsx`, `CustomSelect.tsx`, or any other component. Only `AsignarTutoresPage.tsx` SHALL be modified.

#### Scenario: AlertasPage dropdown still works

- GIVEN the AlertasPage reassign-dropdown is functioning before the fix
- WHEN the AsignarTutoresPage fix is deployed
- THEN the AlertasPage dropdown SHALL continue to render and dismiss correctly
