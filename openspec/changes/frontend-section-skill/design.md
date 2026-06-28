# Design: Frontend Section Skill

## Technical Approach

Create one project-root `SKILL.md` as an OpenCode skill. It is pure documentation — no TSX/TS changes, no dependencies. Tokens, components, and templates are extracted from existing source files so any agent following the skill produces structurally identical dashboard sections.

The file uses skill-creator YAML frontmatter followed by exactly three top-level sections: `## Design System Reference`, `## Component Catalog`, and `## Section Creation Guide`. Every code template is a fenced TSX block with `@/src/*` imports and a `// Source: file.tsx:line` citation.

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| File form | Single root `SKILL.md` | One LLM context; ≤250-line budget. |
| Import style | `@/src/*` alias | `vite.config.ts:11` maps `@` to project root. |
| Token layout | Markdown table | Compact variable/value/usage rows. |
| Component docs | Path + props table + example | Spec requirement; reduces prop hallucination. |
| Source citations | `// Source: path:line` | Enables verification and drift detection. |
| daisyUI vs custom | daisyUI for controls/layout, glass for surfaces | Matches existing dashboards. |
| Extraction threshold | Extract after 3+ files | Avoids premature abstraction. |

## File Changes

| File | Action | Description |
|---|---|---|
| `SKILL.md` | Create | Skill file with tokens, components, templates, guide. |

## Reference Formats

### Frontmatter

```yaml
---
name: frontend-section-skill
description: "Create consistent React dashboard sections using the project's design system."
triggers: ["frontend section", "new dashboard", "dashboard page"]
user-invocable: true
---
```

Templates use `tsx`, `@/src/*` imports, `<PascalCase>` placeholders, and a `// Source: path:line` citation.

### Design tokens

Table with name, CSS variable, and value/usage. Values from `src/index.css:5-16`.

| Token | Variable | Value / Usage |
|---|---|---|
| Navy | `--color-navy` | `#0F1B2D` — page background |
| Blue accent | `--color-blue-accent` | `#3B82F6` — primary actions/links |
| Teal positive | `--color-teal-pos` | `#14B8A6` — positive indicators |
| Amber warning | `--color-amber-warn` | `#F59E0B` — warnings |
| Red risk | `--color-red-risk` | `#EF4444` — errors/high risk |
| Gray critical | `--color-gray-crit` | `#111827` — critical text/badges |
| Display font | `--font-display` | `Sora` — headings |
| Body font | `--font-sans` | `IBM Plex Sans` — body text |
| Mono font | `--font-mono` | `IBM Plex Mono` — code/data |

### Glass pattern

Literal class string: `bg-white/[0.04] border border-white/[0.07] rounded-2xl backdrop-blur-md hover:border-white/[0.12] transition-all duration-200`. Sources: `DashAdmin.tsx:113`, `DashAdmin.tsx:156`.

### Component reference

Each entry lists name, `@/src/components/ui/*` import path, props table, and minimal usage example. Document all four: `AuroraBackground`, `FloatingDock`, `Button` (`moving-border.tsx`), `CustomSelect`.

## Template Examples

### Page shell

```tsx
// Source: src/components/AppRouter.tsx:287 + src/components/dashboards/DashAdmin.tsx:77
<div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
  <header className="flex justify-between items-start mb-8">
    <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
      <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <ICON className="w-5 h-5 text-blue-400" />
      </div>
      <SECTION_TITLE>
    </h1>
  </header>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
</div>
```

### Glass card / KPI tile

```tsx
// Source: src/components/dashboards/DashAdmin.tsx:107-146
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: i * 0.08 }}
  whileHover={{ y: -2 }}
  className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 md:p-6 backdrop-blur-md hover:border-white/[0.12] transition-all duration-200"
/>
```

### Chart tooltip

```tsx
// Source: src/components/dashboards/DashAdmin.tsx:178-182
<Tooltip
  contentStyle={{ backgroundColor: 'rgba(15,27,45,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px' }}
  itemStyle={{ color: '#2dd4bf', fontWeight: 600, fontFamily: 'IBM Plex Sans', fontSize: '12px' }}
  labelStyle={{ display: 'none' }}
/>
```

### Dark form input

```tsx
// Source: src/components/AppRouter.tsx:108-115
<input
  className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 pl-10 text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all duration-200"
  placeholder="<PLACEHOLDER>"
/>
```

### Buttons

- daisyUI CTA: `src/components/dashboards/DashEstudiante.tsx:108-121`.
- Moving-border custom: `src/components/ui/moving-border.tsx:12` with usage from `src/components/AppRouter.tsx:170-186`.

## Section Creation Workflow

1. **Page shell** — `max-w-7xl mx-auto p-4 md:p-8` (`AppRouter.tsx:287`, `DashAdmin.tsx:77`).
2. **Header** — `font-display text-2xl ...` heading plus icon container (`DashAdmin.tsx:80`).
3. **Grid** — responsive grid from `DashAdmin.tsx:105` or `DashDocente.tsx:22`.
4. **Cards** — glass KPI tile wrapper (`DashAdmin.tsx:107`).
5. **Content** — charts (`DashAdmin.tsx:152`), tables (`DashTutor.tsx:78`), forms (`AppRouter.tsx:95`), CTAs.
6. **Animate & verify** — staggered `motion.div`, `framer-motion`, `lucide-react`, `@/src/*` imports.

## Edge Case Guidance

- **daisyUI vs custom glass**
  - Use `btn`, `input`, `textarea`, `select`, `badge`, `table`, `stats`, `progress`, `alert` for standard controls and data tables (`DashTutor.tsx:79`, `DashDocente.tsx:46`).
  - Use glass utilities for card containers, modals, decorative surfaces (`DashAdmin.tsx:113`, `AppRouter.tsx:76`).

- **Extract component vs inline**
  - 3+ files → extract to `src/components/ui/` with props table.
  - 1–2 files → keep inline with a comment such as `/* Glass card pattern — see DashAdmin.tsx:113 */`.

## Testing Strategy

- `SKILL.md` ≤250 lines with valid frontmatter.
- Assemble templates into a throwaway dashboard and run `tsc --noEmit`.
- Compare generated wrapper classes/animations against `DashAdmin.tsx`.

## Migration / Rollout

No migration. Add `SKILL.md` to the project root only.

## Open Questions

None.
