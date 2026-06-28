# Frontend Section Skill Specification

## Purpose

Defines the structure and content requirements for a single `SKILL.md` file that documents the project's visual design system, shared components, code templates, and step-by-step guide for creating consistent frontend sections. The skill enables any AI agent or developer to produce new dashboard pages that are visually indistinguishable from existing ones.

## Requirements

### Requirement: Skill File Structure

The SKILL.md file MUST exist at the project root and contain valid YAML frontmatter with `name`, `description`, `triggers`, and `user-invocable: true`. The body MUST be organized into exactly three top-level sections: (1) Design System Reference, (2) Component Catalog, (3) Section Creation Guide.

#### Scenario: Valid frontmatter and section structure

- GIVEN a new or existing SKILL.md at project root
- WHEN the file is parsed for YAML frontmatter and markdown headings
- THEN frontmatter contains `name`, `description`, `triggers` (array), and `user-invocable: true`
- AND the body contains exactly three `##` headings: Design System Reference, Component Catalog, Section Creation Guide

#### Scenario: File size within LLM context budget

- GIVEN the completed SKILL.md
- WHEN total line count is measured
- THEN the file MUST NOT exceed 250 lines

---

### Requirement: Design Token Documentation

The Design System Reference section MUST document every token defined in `src/index.css` `@theme` block. This includes all 6 semantic colors with hex values and usage semantics, and all 3 font families with their CSS variable names and display names.

#### Scenario: All color tokens documented

- GIVEN the `@theme` block in `src/index.css` defines 6 color tokens
- WHEN the Design System Reference section is inspected
- THEN each of these tokens appears with its hex value and semantic purpose: `--color-navy` (#0F1B2D, page background), `--color-blue-accent` (#3B82F6, primary actions/links), `--color-teal-pos` (#14B8A6, positive indicators), `--color-amber-warn` (#F59E0B, warnings), `--color-red-risk` (#EF4444, errors/risk), `--color-gray-crit` (#111827, critical text)

#### Scenario: All font tokens documented

- GIVEN the `@theme` block defines 3 font families
- WHEN the Design System Reference section is inspected
- THEN each font appears: `--font-display` ('Sora', headings), `--font-sans` ('IBM Plex Sans', body text), `--font-mono` ('IBM Plex Mono', code/data)

#### Scenario: Glassmorphism base pattern documented

- GIVEN the project uses a consistent glass card pattern
- WHEN the Design System Reference section is inspected
- THEN the base glass utility classes are documented: `bg-white/[0.04] border border-white/[0.07] rounded-2xl backdrop-blur-md hover:border-white/[0.12] transition-all duration-200`

---

### Requirement: Shared Component Reference

The Component Catalog section MUST document all 4 shared UI components in `src/components/ui/`. Each component entry MUST include: import path using `@/src/*` alias, props table, and a minimal usage example.

#### Scenario: All 4 components documented with import paths

- GIVEN the project has 4 shared UI components
- WHEN the Component Catalog section is inspected
- THEN each component has an entry with: AuroraBackground, FloatingDock, Button (moving-border), CustomSelect — each with its `@/src/components/ui/*` import path

#### Scenario: Component props are documented

- GIVEN a shared component accepts props
- WHEN its catalog entry is inspected
- THEN a props table lists prop name, type, required/optional, and description

---

### Requirement: Code Templates

The Section Creation Guide section MUST provide copy-paste-ready code templates for at least 8 patterns: page shell, glass card, section header, stat/KPI tile, pill/badge, button styles, dark form inputs, and chart wrapper. Each template MUST use `@/src/*` import paths and cite its source file.

#### Scenario: Page shell template exists

- GIVEN a developer needs to create a new dashboard page
- WHEN they consult the page shell template
- THEN the template includes `max-w-7xl mx-auto p-4 md:p-8` wrapper, a section header, and a responsive grid container

#### Scenario: Glass card template exists

- GIVEN a developer needs a content card
- WHEN they consult the glass card template
- THEN the template includes the full glass utility class string and hover state

#### Scenario: Chart wrapper template uses dark tooltip

- GIVEN a developer needs to embed a recharts chart
- WHEN they consult the chart wrapper template
- THEN the template includes `contentStyle` with `backgroundColor: 'rgba(15,27,45,0.95)'` and matching text/border colors

#### Scenario: Animation wrapper template uses staggered framer-motion

- GIVEN a developer needs animated list entry
- WHEN they consult the animation template
- THEN the template uses `motion.div` with `initial={{ opacity: 0, y: 16 }}`, `animate={{ opacity: 1, y: 0 }}`, and `transition={{ delay: i * 0.08 }}`

---

### Requirement: Section Creation Guide

The guide MUST provide numbered step-by-step instructions (minimum 5 steps) that produce a valid dashboard page when followed in order. Steps MUST reference the templates from the Code Templates requirement.

#### Scenario: Guide produces a valid page

- GIVEN a developer follows the guide from step 1 to the last step
- WHEN the resulting TSX file is compiled
- THEN the file passes `tsc --noEmit` with zero errors
- AND the rendered page matches the visual conventions of existing dashboards

---

### Requirement: Edge Case Guidance

The skill MUST document when to use daisyUI utility classes vs custom glass classes, and when to extract a new shared component vs keeping inline JSX.

#### Scenario: daisyUI vs custom guidance exists

- GIVEN a developer is unsure whether to use daisyUI or custom classes
- WHEN they consult the edge case section
- THEN guidance states: use daisyUI for form controls (`btn`, `input`, `select`, `badge`) and layout; use custom glass classes for card containers and decorative surfaces

#### Scenario: Component extraction guidance exists

- GIVEN a developer is building a repeated UI pattern
- WHEN they consult the edge case section
- THEN guidance states: extract to `src/components/ui/` only when the pattern appears in 3+ files; otherwise keep inline with a comment referencing the pattern name

---

### Requirement: Idempotent Output

Any section generated following this skill MUST produce structurally identical output — same wrapper classes, same animation pattern, same import conventions — regardless of which agent or developer generates it.

#### Scenario: Two agents produce structurally equivalent pages

- GIVEN two different agents each follow the skill to create a new dashboard page
- WHEN their output files are compared structurally
- THEN both use `max-w-7xl mx-auto` wrapper, `font-display` headings, `motion.div` staggered animations, and `@/src/*` imports
