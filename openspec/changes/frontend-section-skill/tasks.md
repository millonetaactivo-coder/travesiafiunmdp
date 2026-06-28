# Tasks: Frontend Section Skill

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Create SKILL.md with all sections | PR 1 | Single file, no code changes |

## Phase 1: Create SKILL.md

- [ ] 1.1 Write YAML frontmatter: `name: frontend-section-skill`, description, triggers `["nueva seccion", "new section", "crear seccion"]`, `user-invocable: true`
- [ ] 1.2 Write `## Visual Identity & Tokens` section — 6 color tokens (navy, blue-accent, teal-pos, amber-warn, red-risk, gray-crit) with hex values from `src/index.css:5-16`, 3 font families (display/sans/mono), glass pattern class string
- [ ] 1.3 Write `## Component Reference` section — 4 UI components (AuroraBackground, FloatingDock, Button, CustomSelect) with `@/src/components/ui/*` import paths, props, minimal usage
- [ ] 1.4 Write `## Creating a New Section` guide — 6 steps: route & layout, page shell template, data & hooks, build UI (glass cards/charts/forms), wire up animations (framer-motion stagger), verify with `tsc --noEmit`
- [ ] 1.5 Write `## Decision Trees` section — daisyUI vs custom glass guidance (controls → daisyUI, surfaces → glass), extract vs inline threshold (3+ files → extract)
- [ ] 1.6 Verify: line count ≤250, all referenced paths exist (`src/index.css`, `src/components/ui/*`, `src/components/dashboards/DashAdmin.tsx`, `src/components/AppRouter.tsx`), no code changes so `tsc --noEmit` not needed

## Phase 2: Verification

- [ ] 2.1 Validate YAML frontmatter parses correctly (name, description, triggers array, user-invocable)
- [ ] 2.2 Confirm all 6 color tokens match `src/index.css` hex values exactly
- [ ] 2.3 Confirm all 4 component import paths resolve to existing files in `src/components/ui/`
- [ ] 2.4 Confirm code templates use `@/src/*` alias (not relative paths) and cite source files
- [ ] 2.5 Confirm file is ≤250 lines total
