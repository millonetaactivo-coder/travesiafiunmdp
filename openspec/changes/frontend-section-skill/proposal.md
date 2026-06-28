# Proposal: Frontend Section Skill

## Intent

15 dashboard screens exist with zero documented conventions. Every new section/page is created by copy-pasting an existing dashboard, guessing which patterns matter. A single `SKILL.md` documents all visual tokens, shared components, layout patterns, and provides copy-paste code templates extracted from actual project code — no invention.

## Scope

### In Scope
- All design tokens: `@theme` colors (navy, blue-accent, teal-pos, amber-warn, red-risk, gray-crit), font families (Sora/display, IBM Plex Sans/body, IBM Plex Mono/mono)
- Glassmorphism dark pattern: `bg-white/[0.04] border border-white/[0.07] rounded-2xl backdrop-blur-md`
- 4 shared UI components: `AuroraBackground`, `FloatingDock`, `Button` (moving-border), `CustomSelect` — usage, props, import paths
- 6 code templates: page shell (both variants), glass card, section header, KPI/stat tile, pill/badge, form inputs (dark), button styles (daisyUI + custom), chart wrappers (recharts), animation wrappers (framer-motion staggered)
- Icon convention: lucide-react primary, @tabler/icons-react only for `IconLayoutNavbarCollapse`
- Import paths: `@/src/*` alias (mapped to project root per vite.config.ts)
- Step-by-step section-creation guide: 6 ordered steps from layout choice → header → grid → cards → animations → imports

### Out of Scope
- Backend/supabase service layer docs (separate skill)
- Testing patterns (no test framework installed)
- Auth/permission routing logic
- Edge Functions or database schema
- Individual hook or service API documentation
- Two-skill split — one comprehensive skill is sufficient

## Capabilities

> No `openspec/specs/` exist — all are new.

### New Capabilities
- `frontend-section-skill`: OpenCode/LLM skill file documenting the project's visual design system, shared components, code templates, and a step-by-step guide for creating consistent frontend sections

### Modified Capabilities
None (no existing specs).

## Approach

**Single `SKILL.md` file** (~200 lines) at project root. Three logical sections:

1. **Design System Reference** — tokens, fonts, glass pattern, color usage conventions extracted from `src/index.css` and 4+ dashboards
2. **Component Catalog** — 4 shared UI components with props tables, `@/src/*` import paths, and real usage examples from `DashAdmin`, `DashEstudiante`, `AppRouter`
3. **Section Creation Guide** — 6 ordered steps producing a new dashboard page, each with a copy-paste code template. Templates sourced from actual files (not invented): page shell from `DashAdmin.tsx` + `DashDocente.tsx`, glass card from `DashAdmin.tsx:113`, stat tile from `DashAdmin.tsx:107`, form inputs from `AppRouter.tsx:109`, charts from `DashAdmin.tsx:152+203`, buttons from `DashEstudiante.tsx:110` + `DashTutor.tsx:125`

All template imports use `@/src/*` (correcting existing relative imports where appropriate). References include file:line citations so AI agents can verify against source.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `SKILL.md` (project root) | New | Single skill file with tokens, components, templates, guide |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Templates drift from evolving codebase | Low | Every template cites source file:line; SKILL.md header states "last verified against" |
| Skill too long for effective LLM context | Low | ~200 lines, well within typical context windows |
| `@/src/*` alias confusion (maps to root, not `src/`) | Medium | Explicit note with vite.config.ts reference; all template imports verified against actual alias config |

## Rollback Plan

Delete `SKILL.md`. No other files touched.

## Dependencies

- Access to 4 reference files for pattern extraction: `src/index.css`, `src/components/ui/*`, `src/components/dashboards/DashAdmin.tsx`, `src/components/dashboards/DashEstudiante.tsx`, `src/components/AppRouter.tsx`, `vite.config.ts`
- Existing skills: `skill-creator` (for valid frontmatter)

## Success Criteria

- [ ] `SKILL.md` exists at project root with valid YAML frontmatter (`name`, `description`, `triggers`, `user-invocable: true`)
- [ ] All 5 design tokens documented with hex values and semantic usage
- [ ] All 4 shared UI components documented with import paths, props, usage example
- [ ] 6 code templates are copy-paste ready with `@/src/*` imports
- [ ] Step-by-step guide produces a valid TSX file matching existing dashboard conventions
- [ ] Every template cites its source file:line
- [ ] `tsc --noEmit` still passes (no TS changes)
