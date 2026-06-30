---
name: frontend-section-skill
description: >-
  Create new frontend sections in travesiafiunmdp-main reusing the existing glassmorphism dark design
  system, shared UI components, and page structure patterns. Covers layout, routing, styling, data
  fetching, animations, and chart integration — everything needed to ship a consistent section.
triggers:
  - "nueva seccion"
  - "new section"
  - "crear seccion"
  - "new page"
  - "nueva pagina"
  - "new screen"
user-invocable: true
---

## Design System Reference (src/index.css:5-16)

### Color Palette

| Token | Variable | Hex | Usage |
|-------|----------|-----|-------|
| `navy` | `--color-navy` | `#0F1B2D` | Page background, card bg |
| `blue-accent` | `--color-blue-accent` | `#3B82F6` | Links, active states, info |
| `teal-pos` | `--color-teal-pos` | `#14B8A6` | Success, primary CTA, positive |
| `amber-warn` | `--color-amber-warn` | `#F59E0B` | Warnings, silent profiles |
| `red-risk` | `--color-red-risk` | `#EF4444` | Errors, risk, critical |
| `gray-crit` | `--color-gray-crit` | `#111827` | Dark surfaces |

### Typography

| Role | Variable | Font | Fallback |
|------|----------|------|----------|
| Display | `--font-display` | Sora | sans-serif |
| Body | `--font-sans` | IBM Plex Sans | sans-serif |
| Mono | `--font-mono` | IBM Plex Mono | monospace |

### Core Patterns

**Glass card** (DashAdmin.tsx:107):
```
bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md
hover:border-white/[0.12] transition-all duration-200
```

**Background blobs** (AppRouter.tsx:282-284):
```html
<div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px]
  bg-[rgba(59,130,246,0.15)] rounded-full blur-[120px]" />
<div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px]
  bg-[rgba(20,184,166,0.15)] rounded-full blur-[100px]" />
```

**Dark input** (AppRouter.tsx:113):
```
bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-slate-100
font-sans text-sm placeholder-slate-600 focus:outline-none
focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
```

---

## Component Catalog

### cn() — `src/lib/utils.ts`
```ts
import { cn } from '../../lib/utils';
```
Merges Tailwind classes with `clsx` + `tailwind-merge`. Use everywhere.

### AuroraBackground — `src/components/ui/aurora-background.tsx`
Full-page animated gradient backdrop. Props: `className`, `showRadialGradient` (default true).

### FloatingDock — `src/components/ui/floating-dock.tsx`
Role-based bottom nav. Props: `items: { title, icon, href }[]`, `desktopClassName`, `mobileClassName`.

### Button (MovingBorder) — `src/components/ui/moving-border.tsx`
Animated-border CTA button. Key props: `borderRadius`, `duration`, `containerClassName`, `className`, `children`.

### CustomSelect — `src/components/ui/CustomSelect.tsx`
Glass-styled dropdown. Props: `value`, `onChange`, `options: { value, label, color? }[]`, `placeholder`, `disabled`.

### Icons
Primary: `lucide-react`. Secondary: `@tabler/icons-react` (only for niche icons like `IconLayoutNavbarCollapse`).

---

## Section Creation Guide

### 1. Route (AppRouter.tsx:317)
```tsx
import { MiSeccion } from './dashboards/MiSeccion';
// Inside <Route path="/" element={<AppLayout />}>:
<Route path="mi-seccion" element={<MiSeccion />} />
```

### 2. Page Shell (DashAdmin.tsx:77)
```tsx
<div className="max-w-7xl mx-auto space-y-6">
  {/* header + content */}
</div>
```

### 3. Section Header (DashAdmin.tsx:78-89)
```tsx
<header className="flex justify-between items-start mb-8">
  <div>
    <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
      <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <MiIcon className="w-5 h-5 text-blue-400" />
      </div>
      Título de Sección
    </h1>
    <p className="text-sm text-slate-500 font-sans mt-2">Subtítulo descriptivo.</p>
  </div>
</header>
```

### 4. KPI Cards (DashAdmin.tsx:105-146)
```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: i * 0.08 }}
  whileHover={{ y: -2 }}
  className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md
    hover:border-white/[0.12] transition-all duration-200"
>
  <div className="flex justify-between items-start mb-4">
    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-sans">Label</span>
    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-400/10">
      <Icon className="w-4 h-4 text-blue-400" />
    </div>
  </div>
  <div className="font-display text-3xl font-bold text-white mb-2">42</div>
  <div className="text-xs font-sans text-slate-600">Subtitle</div>
</motion.div>
```

### 5. Data Fetching Pattern (useScore.ts + scoresService.ts)
**Service** (`src/services/{domain}Service.ts`):
```ts
import { supabase } from '../../lib/supabase';
export const getSomething = async (id: string) => {
  return await supabase.from('table').select('col1, col2').eq('id', id).single();
};
```
**Hook** (`src/hooks/use{Domain}.ts`):
```ts
import { useEffect, useState } from 'react';
import { getSomething } from '../../services/{domain}Service';
export const useSomething = (id?: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      try { setLoading(true); const { data } = await getSomething(id); setData(data); }
      catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [id]);
  return { data, loading, error };
};
```

### 6. Stagger Animations (framer-motion)
```tsx
import { motion } from 'framer-motion';
// Container:
{items.map((item, i) => (
  <motion.div key={item.id} initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
```

### 7. Charts (recharts dark theme — DashAdmin.tsx:178-179)
```tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
// Tooltip style:
contentStyle={{ backgroundColor: 'rgba(15,27,45,0.95)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px', padding: '8px 12px' }}
itemStyle={{ color: '#2dd4bf', fontWeight: 600, fontFamily: 'IBM Plex Sans', fontSize: '12px' }}
// Grid:
<CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
```

### 8. Primary Button (moving-border.tsx — DashAdmin.tsx:92-100)
```tsx
import { Button } from '../ui/moving-border';
<Button borderRadius="0.5rem" duration={2500}
  containerClassName="h-10 w-auto text-white flex items-center"
  className="px-4 py-2 text-sm font-semibold text-white bg-[#0F1B2D]/90 flex items-center gap-2">
  <Icon className="w-4 h-4 text-teal-400" /> Label
</Button>
```

### 9. Form Inputs (AppRouter.tsx:108-115)
```tsx
<input className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3
  text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none
  focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
  transition-all duration-200" placeholder="..." />
```

### 10. Auth Gate (useAuth.ts:62-82)
```tsx
const { usuario, rol, loading } = useAuth();
// usuario: User | null (Supabase)
// rol: 'estudiante' | 'tutor' | 'asesor_par' | 'docente' | 'admin' | null
// loading: boolean
```
Gate sections with `if (loading) return <Skeleton />;` then role-check.

### Decision Trees

| Situation | Choice | Reason |
|-----------|--------|--------|
| Need animated CTA | `Button` (moving-border) | Hover effect + glass bg match the design system |
| Simple link/action | daisyUI `btn btn-outline` | Lighter, for secondary actions (sign out, cancel) |
| Dropdown with colors/status | `CustomSelect` | Consistent glass style, supports `color` dot per option |
| Simple 2-3 option dropdown | Native `<select>` | Less boilerplate, acceptable when no color needed |
| Quick inline icon | `lucide-react` | Pre-installed, tree-shakeable, matches all dashboard icons |
| Niche layout icon | `@tabler/icons-react` | Only when lucide lacks the specific icon (e.g., `IconLayoutNavbarCollapse`) |
| Small reusable widget (< 50 lines) | Extract to `src/components/ui/` | Keeps dashboards focused on layout/data |
| One-off layout tweak | Inline pattern | Don't over-extract; match DashAdmin's inline style |
