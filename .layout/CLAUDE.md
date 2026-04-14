## Design System — Figma Extraction

This project uses the **Figma Extraction** design system.
AI coding agents: follow all rules in this section precisely.
Violations will produce inconsistent, off-brand output.

### Critical Rules (always apply)
**Stack:** CSS custom properties from Figma (extracted, high confidence, 153 tokens). Use Inter for UI text, IBM Plex Mono for code/data. Apply tokens as `var(--token-name)` in CSS, `style={{ prop: 'var(--token-name)' }}` in JSX, or `bg-[var(--token-name)]` in Tailwind.

**Token source:** `extracted-from-figma` — values are authoritative design intent.

**Theme switching:** `[data-theme="light"]` / `[data-theme="dark"]` / `[data-theme="admin-light"]` / `[data-theme="admin-dark"]`

```css
/* ── CORE TOKENS (paste into :root) ── */
:root {
  /* Colours — Primitives */
  --color-blue-50: #0580ff;        /* Primary brand blue */
  --color-blue-60: #0067d1;        /* Hover state for primary actions */
  --color-gray-0:  #ffffff;        /* Pure white surface */
  --color-gray-10: #f3f4f6;        /* Subtle background */
  --color-gray-90: #24282d;        /* Near-black text */
  --color-gray-100: #121417;       /* Darkest surface / scrim */
  --color-green-50: #39b52f;       /* Success */
  --color-red-50:  #e9190c;        /* Error / destructive */
  --color-yellow-50: #ffa800;      /* Warning */

  /* Spacing */
  --spacing-spacing-3: 8px;        /* Base unit */
  --spacing-spacing-5: 16px;       /* Component inner padding */
  --spacing-spacing-6: 24px;       /* Section gap */
  --spacing-spacing-7: 32px;       /* Layout gap */

  /* Border Radius */
  --borderradius-borderradius-xs: 0px;
  --borderradius-borderradius-sm: 2px;
  --borderradius-borderradius-md: 4px;
  --borderradius-borderradius-lg: 8px;
  --borderradius-borderradius-xl: 16px;

  /* Typography — key composites */
  --font-family-inter: Inter, system-ui, sans-serif;
  --font-family-ibm-plex-mono: 'IBM Plex Mono', monospace;

  /* Semantic signals */
  --surface-surface--scrim: #121417;
  --signal-signal--custom: #ffddde;     /* light mode */
  --signal-signal--attack: #e4d3f1;     /* light mode */
  --signal-signal--informational: #b8e8de; /* light mode */
  --signal-signal--anomaly: #f8d4be;    /* light mode */
}
```

```tsx
// ONE real component example — Variable Value (default state)
<div
  style={{
    fontFamily: 'var(--font-family-inter)',
    fontSize: '14px',       // --font-size-type-md
    fontWeight: 400,
    lineHeight: '20px',     // --line-height-type-md
    letterSpacing: '0.07px',
    color: 'var(--color-gray-90)',
    backgroundColor: 'var(--color-gray-10)',
    borderRadius: 'var(--borderradius-borderradius-md)',
    padding: 'var(--spacing-spacing-2) var(--spacing-spacing-3)',
    border: '1px solid var(--color-gray-20)',
  }}
>
  variable-value
</div>
```

**NEVER rules:**
- NEVER hardcode hex colours — always use a `var(--color-*)` token
- NEVER use font families other than Inter or IBM Plex Mono
- NEVER use border-radius values not in the `--borderradius-*` scale
- NEVER add spacing values not in the `--spacing-spacing-*` scale
- NEVER omit hover, focus, and disabled states on interactive components
- NEVER mix light/dark mode tokens manually — switch via `[data-theme]` attribute
- NEVER use `!important` to override token values

**Full design system → see layout.md**

---

### Design System Context

If the **layout** MCP server is connected, use these tools:
- `get-design-system` — full layout.md or a specific section (colours, typography, spacing, components)
- `get-tokens` — design tokens in CSS or JSON format
- `list-components` / `get-component` — component inventory and specs
- `check-compliance` — validate code against design system rules
- `design-in-figma` — create Figma mockups using the design system (requires Figma MCP)

Otherwise, read the local files in `.layout/`:
- `.layout/layout.md` — complete design system specification
- `.layout/tokens.css` — CSS custom properties
- `.layout/tokens.json` — W3C DTCG token format

**Before building any UI component, read the design system first.**
