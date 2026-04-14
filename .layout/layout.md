# layout.md — Aspen Foundations Design System

---

## 0. Quick Reference

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

## 1. Design Direction & Philosophy

### Character & Mood
Aspen Foundations is a **professional, data-dense enterprise UI system** built for security and infrastructure tooling (Fastly, Signal Sciences). The aesthetic is precise, restrained, and functional — prioritising clarity and information density over decoration. The system must scale from simple forms to complex dashboards with signal/anomaly data visualisation.

### Explicit Aesthetic Choices
- **Neutral-first palette:** Blue (#0580ff) is the single accent colour. All other colours are semantic (signal states, data-viz, status) — not decorative.
- **Sharp-to-subtle radius scale:** Maximum border-radius is 16px (`--borderradius-borderradius-xl`). No pill buttons, no heavy rounding.
- **Two-typeface system:** Inter for all UI text; IBM Plex Mono exclusively for code, data values, and technical strings.
- **Controlled elevation:** Depth is implied through border and background contrast, not dramatic shadows.
- **Dark mode is first-class:** Four explicit theme modes (`light`, `dark`, `admin-light`, `admin-dark`) are designed together, not afterthoughts.

### What This Design Explicitly Rejects
- Decorative gradients or glassmorphism
- Rounded/pill-shaped buttons
- Warm or playful typography (no display typefaces)
- Bright, saturated backgrounds
- Animations for their own sake — motion only communicates state change
- Generic sans-serif fallbacks (Arial, Helvetica, Roboto, system-ui standing alone)

---

## 2. Colour System

### Tier 1 — Primitive Values

```css
:root {
  /* Blue scale — extracted */
  --color-blue-10: #f0f7ff;   /* Lightest blue tint, hover backgrounds */
  --color-blue-20: #d1e8ff;   /* Selected/active tints */
  --color-blue-30: #9eceff;   /* Decorative accent, disabled states */
  --color-blue-40: #51a7ff;   /* Secondary interactive elements */
  --color-blue-50: #0580ff;   /* Primary action colour */
  --color-blue-60: #0067d1;   /* Primary hover/pressed */
  --color-blue-70: #004e9e;   /* Dark mode primary */
  --color-blue-80: #00356b;   /* Deeply pressed/active */
  --color-blue-90: #002142;   /* Near-black blue, dark backgrounds */

  /* Gray scale — extracted */
  --color-gray-0:   #ffffff;  /* Pure white — default surface */
  --color-gray-10:  #f3f4f6;  /* Subtle background, zebra rows */
  --color-gray-20:  #dce0e4;  /* Borders, dividers */
  --color-gray-30:  #bac1c9;  /* Disabled borders */
  --color-gray-40:  #9ea8b2;  /* Placeholder text */
  --color-gray-50:  #818e9c;  /* Tertiary text */
  --color-gray-60:  #677483;  /* Secondary text */
  --color-gray-70:  #515b66;  /* Body text (light mode) */
  --color-gray-80:  #3a424a;  /* Strong body text */
  --color-gray-90:  #24282d;  /* Headings (light mode) */
  --color-gray-100: #121417;  /* Darkest — scrim, dark surface base */

  /* Green scale — extracted */
  --color-green-10: #f2fcf2;
  --color-green-20: #c1eebd;
  --color-green-30: #8fe088;
  --color-green-40: #5dd354;
  --color-green-50: #39b52f;  /* Success primary */
  --color-green-60: #2f9527;
  --color-green-70: #25741e;
  --color-green-80: #1a5416;
  --color-green-90: #10330d;

  /* Red scale — extracted */
  --color-red-10: #fef1f1;
  --color-red-20: #fcbfbb;
  --color-red-30: #f87f77;
  --color-red-40: #f65a50;
  --color-red-50: #e9190c;   /* Error / destructive primary */
  --color-red-60: #bd140a;
  --color-red-70: #921008;
  --color-red-80: #660b05;
  --color-red-90: #3a0603;

  /* Yellow scale — extracted */
  --color-yellow-10: #fff5e0;
  --color-yellow-20: #ffe1a8;
  --color-yellow-30: #ffce70;
  --color-yellow-40: #ffbb38;
  --color-yellow-50: #ffa800;  /* Warning primary */
  --color-yellow-60: #cc8600;
  --color-yellow-70: #996500;
  --color-yellow-80: #664300;
  --color-yellow-90: #332200;

  /* Brand — extracted */
  --color-brand-fastly: #ff282d;           /* Fastly red — logo/brand only */
  --color-brand-signal-sciences: #fa6b0a; /* Signal Sciences orange — logo/brand only */

  /* Data Visualisation — extracted */
  --color-data-viz-1:  #0088b5;
  --color-data-viz-2:  #33bda0;
  --color-data-viz-3:  #fddfb3;
  --color-data-viz-4:  #ff9da0;
  --color-data-viz-5:  #88dbf2;
  --color-data-viz-6:  #008a6d;
  --color-data-viz-7:  #b280d8;
  --color-data-viz-8:  #006a8d;
  --color-data-viz-9:  #dcb9f6;
  --color-data-viz-10: #ea8446;
  --color-data-viz-11: #a24271;
  --color-data-viz-12: #98eda1;
}
```

### Tier 2 — Semantic Aliases

```css
/* ── LIGHT MODE (default) ── */
[data-theme="light"],
:root {
  /* Surface */
  --surface-surface--scrim: #121417; /* Modal/overlay scrim */

  /* Signal states */
  --signal-signal--custom:         #ffddde; /* Custom rule highlight */
  --signal-signal--attack:         #e4d3f1; /* Attack signal badge background */
  --signal-signal--informational:  #b8e8de; /* Informational signal badge background */
  --signal-signal--anomaly:        #f8d4be; /* Anomaly signal badge background */
}

/* ── DARK MODE ── */
[data-theme="dark"] {
  --surface-surface--scrim: #121417; /* Scrim unchanged in dark mode */

  --signal-signal--custom:         #654447;
  --signal-signal--attack:         #4a3a5b;
  --signal-signal--informational:  #1e4f47;
  --signal-signal--anomaly:        #5e3b27;
}

/* ── ADMIN LIGHT MODE ── */
[data-theme="admin-light"] {
  --surface-surface--scrim: #121417;

  --signal-signal--custom:         #ffddde;
  --signal-signal--attack:         #e4d3f1;
  --signal-signal--informational:  #b8e8de;
  --signal-signal--anomaly:        #f8d4be;
}

/* ── ADMIN DARK MODE ── */
[data-theme="admin-dark"] {
  --surface-surface--scrim: #121417;

  --signal-signal--custom:         #654447;
  --signal-signal--attack:         #4a3a5b;
  --signal-signal--informational:  #1e4f47;
  --signal-signal--anomaly:        #5e3b27;
}
```

### Colour Usage Table

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--color-blue-50` | `#0580ff` | `#0580ff` | Primary CTA, links |
| `--color-blue-60` | `#0067d1` | `#0067d1` | Hover on primary |
| `--color-gray-0` | `#ffffff` | — | Default surface |
| `--color-gray-10` | `#f3f4f6` | — | Subtle background |
| `--color-gray-20` | `#dce0e4` | — | Borders, dividers |
| `--color-gray-70` | `#515b66` | — | Body text |
| `--color-gray-90` | `#24282d` | — | Headings |
| `--color-green-50` | `#39b52f` | — | Success state |
| `--color-red-50` | `#e9190c` | — | Error / destructive |
| `--color-yellow-50` | `#ffa800` | — | Warning state |
| `--surface-surface--scrim` | `#121417` | `#121417` | Overlay scrim |
| `--signal-signal--attack` | `#e4d3f1` | `#4a3a5b` | Attack signal badge |
| `--signal-signal--informational` | `#b8e8de` | `#1e4f47` | Info signal badge |
| `--signal-signal--anomaly` | `#f8d4be` | `#5e3b27` | Anomaly signal badge |
| `--signal-signal--custom` | `#ffddde` | `#654447` | Custom rule signal |

---

## 3. Typography System

**Font stacks:**
- UI: `Inter, system-ui, -apple-system, sans-serif`
- Code/Data: `'IBM Plex Mono', 'Courier New', monospace`

**Weight map:**
| Token name | Figma label | CSS value |
|---|---|---|
| `--font-weight-regular` | Regular | `400` |
| `--font-weight-semi-bold` | Semi Bold | `600` |
| `--font-weight-bold` | Bold | `700` |
| `--font-weight-extra-bold` | Extra Bold | `800` |

### Composite Typography Groups

```css
/* ─── HEADER STYLES ─── */

/* Header/H1 (XXXL) — Page title, desktop only */
.text-h1 {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 32px;          /* --font-size-header-h1-(xxl)-desktop */
  font-weight: 800;         /* --font-weight-extra-bold */
  line-height: 40px;        /* --line-height-header-h1-(xxl)-desktop */
  letter-spacing: 0.048px;
}
/* Tablet/Mobile: font-size: 24px; line-height: 28px */

/* Header/H2 (XXL) — Section heading */
.text-h2 {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 24px;          /* --font-size-header-h2-(xl)-desktop */
  font-weight: 700;         /* --font-weight-bold */
  line-height: 32px;        /* --line-height-header-h2-(xl)-desktop */
  letter-spacing: 0.036px;
}
/* Tablet/Mobile: font-size: 20px; line-height: 28px */

/* Header/H3 (XL) — Card/panel heading */
.text-h3 {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 20px;          /* --font-size-header-h3-(lg)-desktop */
  font-weight: 700;         /* --font-weight-bold */
  line-height: 28px;        /* --line-height-header-h3-(lg)-desktop */
  letter-spacing: 0.030px;
}
/* Tablet/Mobile: font-size: 18px; line-height: 24px */

/* Header/H4 (LG) — Sub-section, table heading */
.text-h4 {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 16px;          /* --font-size-header-h4-(md)-desktop */
  font-weight: 700;         /* --font-weight-bold */
  line-height: 24px;        /* --line-height-header-h4-(md)-desktop */
  letter-spacing: 0.024px;
}

/* Header/H5 (Med) — Label-level heading, sidebar item */
.text-h5 {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 14px;          /* --font-size-header-h5-(sm)-desktop */
  font-weight: 700;         /* --font-weight-bold */
  line-height: 20px;        /* --line-height-header-h5-(sm)-desktop */
  letter-spacing: 0.028px;
}

/* Header/H6 (Small) — Eyebrow, metadata label */
.text-h6 {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 12px;          /* --font-size-header-h6-(xs)-desktop */
  font-weight: 700;         /* --font-weight-bold */
  line-height: 16px;        /* --line-height-header-h6-(xs)-desktop */
  letter-spacing: 0.024px;
}

/* ─── BODY / TYPE STYLES ─── */

/* Type/XL (Reg) — Introductory body copy */
.text-type-xl-reg {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 18px;          /* --font-size-type-xl */
  font-weight: 400;         /* --font-weight-regular */
  line-height: 28px;        /* --line-height-type-xl */
  letter-spacing: 0.045px;
}

/* Type/XL (Semi-bold) — Introductory body, emphasised */
.text-type-xl-semibold {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 18px;
  font-weight: 600;         /* --font-weight-semi-bold */
  line-height: 28px;
  letter-spacing: 0.045px;
}

/* Type/LG (Reg) — Standard body text */
.text-type-lg-reg {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 16px;          /* --font-size-type-lg */
  font-weight: 400;
  line-height: 24px;        /* --line-height-type-lg */
  letter-spacing: 0.08px;
}

/* Type/LG (Semi-bold) — Emphasised body, button label */
.text-type-lg-semibold {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.08px;
}

/* Type/Med (Reg) — Default UI text, form labels */
.text-type-md-reg {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 14px;          /* --font-size-type-md */
  font-weight: 400;
  line-height: 20px;        /* --line-height-type-md */
  letter-spacing: 0.07px;
}

/* Type/Med (Semi-bold) — Form labels (active), data labels */
.text-type-md-semibold {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.07px;
}

/* Type/Small (Reg) — Caption, helper text */
.text-type-sm-reg {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 12px;          /* --font-size-type-sm */
  font-weight: 400;
  line-height: 20px;        /* --line-height-type-sm */
  letter-spacing: 0.09px;
}

/* Type/Small (Semi-bold) — Badge text, tags */
.text-type-sm-semibold {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.09px;
}

/* Type/XSmall (Reg) — Metadata, timestamps, legal text */
.text-type-xs-reg {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 10px;          /* --font-size-type-xs */
  font-weight: 400;
  line-height: 16px;        /* --line-height-type-xs */
  letter-spacing: 0.075px;
}

/* Type/XSmall (Semi-bold) — Overline labels, version numbers */
.text-type-xs-semibold {
  font-family: var(--font-family-inter), system-ui, sans-serif; /* extracted */
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.075px;
}

/* ─── MONOSPACE STYLES ─── */

/* Monospace/LG — Large code value display */
.text-mono-lg {
  font-family: var(--font-family-ibm-plex-mono), 'Courier New', monospace; /* extracted */
  font-size: 16px;          /* --font-size-monospace-lg */
  font-weight: 400;
  line-height: 28px;        /* --line-height-monospace-lg */
  letter-spacing: normal;
}

/* Monospace/Med — Inline code, data values */
.text-mono-md {
  font-family: var(--font-family-ibm-plex-mono), 'Courier New', monospace; /* extracted */
  font-size: 14px;          /* --font-size-monospace-md */
  font-weight: 400;
  line-height: 24px;        /* --line-height-monospace-md */
  letter-spacing: normal;
}

/* Monospace/Small — Compact code snippets */
.text-mono-sm {
  font-family: var(--font-family-ibm-plex-mono), 'Courier New', monospace; /* extracted */
  font-size: 12px;          /* --font-size-monospace-sm */
  font-weight: 400;
  line-height: 20px;        /* --line-height-monospace-sm */
  letter-spacing: normal;
}

/* Monospace/XSmall — Dense log output, metadata */
.text-mono-xs {
  font-family: var(--font-family-ibm-plex-mono), 'Courier New', monospace; /* extracted */
  font-size: 10px;          /* --font-size-monospace-xs */
  font-weight: 400;
  line-height: 16px;        /* --line-height-monospace-xs */
  letter-spacing: normal;
}
```

### Typography Pairing Rules
- **Headings + body:** H4 (16px/700) with Type/Med (14px/400) is the default card pattern.
- **Labels + values:** Type/Med (Semi-bold) for label, Monospace/Med for technical values.
- **NEVER** use IBM Plex Mono for headings or UI labels.
- **NEVER** use Inter for code blocks or command output.
- The responsive scale drops H1 from 32px → 24px on tablet/mobile. All other headers match desktop at 14px+ sizes.

---

## 4. Spacing & Layout

**Base unit: 8px** (`--spacing-spacing-3`). All spacing values are multiples or explicit steps from this base.

```css
:root {
  /* Spacing scale — extracted, values in px */
  --spacing-spacing-0:  0px;   /* No spacing — intentional collapse */
  --spacing-spacing-1:  2px;   /* Micro spacing — icon gap, tight insets */
  --spacing-spacing-2:  4px;   /* XS — badge padding, tight row gap */
  --spacing-spacing-3:  8px;   /* SM — base unit, input vertical padding */
  --spacing-spacing-4:  12px;  /* MD-SM — compact component padding */
  --spacing-spacing-5:  16px;  /* MD — standard component padding, grid gutter */
  --spacing-spacing-6:  24px;  /* LG — card padding, section internal gap */
  --spacing-spacing-7:  32px;  /* XL — between card rows, panel margin */
  --spacing-spacing-8:  40px;  /* 2XL — section top/bottom padding */
  --spacing-spacing-9:  48px;  /* 3XL — major section breaks */
  --spacing-spacing-10: 64px;  /* 4XL — hero vertical padding */
  --spacing-spacing-11: 80px;  /* 5XL — large section separation */
  --spacing-spacing-12: 96px;  /* 6XL — page-level vertical rhythm */
  --spacing-spacing-13: 160px; /* Max — hero/landing landmark spacing */

  /* Border Radius scale — extracted */
  --borderradius-borderradius-xs: 0px;   /* Sharp — data tables, dividers */
  --borderradius-borderradius-sm: 2px;   /* Subtle — tags, badges, chips */
  --borderradius-borderradius-md: 4px;   /* Default — buttons, inputs, cards */
  --borderradius-borderradius-lg: 8px;   /* Large — modal corners, popovers */
  --borderradius-borderradius-xl: 16px;  /* Max — feature cards, callout panels */
}
```

### Spacing Usage Guidelines

| Token | Value | Primary Usage |
|---|---|---|
| `--spacing-spacing-1` | 2px | Icon-to-label gap, micro insets |
| `--spacing-spacing-2` | 4px | Badge padding, dense table cell gap |
| `--spacing-spacing-3` | 8px | Input vertical padding, row gap |
| `--spacing-spacing-4` | 12px | Compact form field padding |
| `--spacing-spacing-5` | 16px | Standard component padding, gutter |
| `--spacing-spacing-6` | 24px | Card internal padding |
| `--spacing-spacing-7` | 32px | Between card rows |
| `--spacing-spacing-8` | 40px | Section padding top/bottom |
| `--spacing-spacing-9` | 48px | Major section breaks |
| `--spacing-spacing-10` | 64px | Hero vertical rhythm |

### Grid & Layout

> **Note:** Grid breakpoints and container widths are not specified in the Figma token set — document as [TBD - extract manually] from implemented layout.

- **Breakpoints:** [TBD - extract manually]
- **Container max-width:** [TBD - extract manually]
- **Column grid:** [TBD - extract manually]
- **Responsive pattern:** The type scale has explicit `desktop`, `tablet`, and `mobile` token variants. Tablet and mobile share values; desktop diverges at H1–H3 sizes.

---

## 6. Component Patterns

### 6.1 Variable Value Component

This is the only explicitly inventoried component from Figma. It displays a data variable's value in a styled container — common in security dashboards for showing request counts, IP addresses, configuration values, etc.

**Anatomy:**
- Container `div` — background, border, border-radius, padding
- Value text — Monospace or Type/Med font, primary text colour
- Optional label — Type/Small above or beside the value
- Optional icon — leading or trailing icon slot

**Token-to-Property Mappings:**

```css
/* Variable Value Component — all states */

/* DEFAULT */
.variable-value {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-spacing-2);           /* 4px — icon-to-text gap */
  padding: var(--spacing-spacing-2) var(--spacing-spacing-3); /* 4px 8px */
  background-color: var(--color-gray-10);  /* #f3f4f6 — subtle surface */
  border: 1px solid var(--color-gray-20);  /* #dce0e4 — border */
  border-radius: var(--borderradius-borderradius-md); /* 4px */
  font-family: var(--font-family-ibm-plex-mono), monospace;
  font-size: 14px;      /* --font-size-monospace-md */
  font-weight: 400;     /* --font-weight-regular */
  line-height: 24px;    /* --line-height-monospace-md */
  color: var(--color-gray-90); /* #24282d — primary text */
  cursor: default;
  transition: background-color 150ms ease, border-color 150ms ease;
}

/* HOVER */
.variable-value:hover {
  background-color: var(--color-blue-10);  /* #f0f7ff */
  border-color: var(--color-blue-40);      /* #51a7ff */
}

/* FOCUS (keyboard accessible) */
.variable-value:focus,
.variable-value:focus-visible {
  outline: 2px solid var(--color-blue-50); /* #0580ff */
  outline-offset: 2px;
  background-color: var(--color-blue-10);
  border-color: var(--color-blue-50);
}

/* ACTIVE / PRESSED */
.variable-value:active {
  background-color: var(--color-blue-20);  /* #d1e8ff */
  border-color: var(--color-blue-60);      /* #0067d1 */
}

/* DISABLED */
.variable-value[aria-disabled="true"],
.variable-value:disabled {
  background-color: var(--color-gray-10);  /* #f3f4f6 */
  border-color: var(--color-gray-20);      /* #dce0e4 */
  color: var(--color-gray-40);             /* #9ea8b2 — reduced contrast */
  cursor: not-allowed;
  pointer-events: none;
}

/* LOADING */
.variable-value[data-loading="true"] {
  background-color: var(--color-gray-10);
  border-color: var(--color-gray-20);
  color: var(--color-gray-40);
  cursor: wait;
  /* Skeleton shimmer applied to inner text span */
}

/* ERROR */
.variable-value[data-error="true"] {
  background-color: var(--color-red-10);   /* #fef1f1 */
  border-color: var(--color-red-40);       /* #f65a50 */
  color: var(--color-red-60);              /* #bd140a */
}
```

**Production TSX Example:**

```tsx
import React from 'react';

type VariableValueState = 'default' | 'hover' | 'focus' | 'active' | 'disabled' | 'loading' | 'error';

interface VariableValueProps {
  value: string;
  label?: string;
  state?: VariableValueState;
  isDisabled?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onClick?: () => void;
}

export const VariableValue: React.FC<VariableValueProps> = ({
  value,
  label,
  isDisabled = false,
  isLoading = false,
  hasError = false,
  errorMessage,
  onClick,
}) => {
  const getContainerStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--spacing-spacing-2)',            /* 4px */
      padding: 'var(--spacing-spacing-2) var(--spacing-spacing-3)', /* 4px 8px */
      borderRadius: 'var(--borderradius-borderradius-md)', /* 4px */
      border: '1px solid var(--color-gray-20)',   /* #dce0e4 */
      backgroundColor: 'var(--color-gray-10)',    /* #f3f4f6 */
      fontFamily: 'var(--font-family-ibm-plex-mono), monospace',
      fontSize: '14px',                           /* --font-size-monospace-md */
      fontWeight: 400,
      lineHeight: '24px',                         /* --line-height-monospace-md */
      color: 'var(--color-gray-90)',              /* #24282d */
      transition: 'background-color 150ms ease, border-color 150ms ease',
      cursor: isDisabled ? 'not-allowed' : isLoading ? 'wait' : onClick ? 'pointer' : 'default',
    };

    if (isDisabled || isLoading) {
      return {
        ...base,
        color: 'var(--color-gray-40)',            /* #9ea8b2 */
        pointerEvents: 'none',
      };
    }

    if (hasError) {
      return {
        ...base,
        backgroundColor: 'var(--color-red-10)',   /* #fef1f1 */
        borderColor: 'var(--color-red-40)',        /* #f65a50 */
        color: 'var(--color-red-60)',             /* #bd140a */
      };
    }

    return base;
  };

  const loadingSkeletonStyle: React.CSSProperties = {
    display: 'inline-block',
    width: '80px',
    height: '14px',
    borderRadius: 'var(--borderradius-borderradius-sm)', /* 2px */
    backgroundColor: 'var(--color-gray-20)',
    animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
  };

  return (
    <div>
      {label && (
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-family-inter), system-ui, sans-serif',
            fontSize: '12px',       /* --font-size-type-sm */
            fontWeight: 600,        /* --font-weight-semi-bold */
            lineHeight: '20px',     /* --line-height-type-sm */
            letterSpacing: '0.09px',
            color: 'var(--color-gray-60)', /* #677483 */
            marginBottom: 'var(--spacing-spacing-1)', /* 2px */
          }}
        >
          {label}
        </span>
      )}
      <div
        style={getContainerStyle()}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !isDisabled ? 0 : undefined}
        aria-disabled={isDisabled || isLoading}
        data-loading={isLoading}
        data-error={hasError}
        onClick={!isDisabled && !isLoading ? onClick : undefined}
        onKeyDown={(e) => {
          if (onClick && !isDisabled && !isLoading && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {isLoading ? (
          <span style={loadingSkeletonStyle} aria-label="Loading…" />
        ) : (
          <span>{value}</span>
        )}
      </div>
      {hasError && errorMessage && (
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-family-inter), system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '20px',
            letterSpacing: '0.09px',
            color: 'var(--color-red-50)', /* #e9190c */
            marginTop: 'var(--spacing-spacing-1)', /* 2px */
          }}
          role="alert"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};
```

---

## 7. Elevation & Depth

> **Note:** No explicit shadow tokens were extracted from the Figma file. Aspen Foundations uses border + background contrast as its primary depth signal rather than drop shadows. The following are synthesised from the design direction.

```css
:root {
  /* Border tokens — primary depth signal */
  --border-default:   1px solid var(--color-gray-20);  /* #dce0e4 — standard component border */
  --border-strong:    1px solid var(--color-gray-30);  /* #bac1c9 — elevated border, hover */
  --border-subtle:    1px solid var(--color-gray-10);  /* #f3f4f6 — ghost/barely visible */
  --border-focus:     2px solid var(--color-blue-50);  /* #0580ff — focus ring */
  --border-error:     1px solid var(--color-red-40);   /* #f65a50 — error state */
  --border-disabled:  1px solid var(--color-gray-20);  /* #dce0e4 — same as default, de-emphasised by colour */

  /* Z-index scale — synthesised from common enterprise UI patterns */
  --z-index-base:     0;    /* Document flow */
  --z-index-raised:   10;   /* Cards, popovers baseline */
  --z-index-dropdown: 100;  /* Dropdowns, select menus */
  --z-index-sticky:   200;  /* Sticky headers, table headers */
  --z-index-overlay:  300;  /* Overlays, drawers */
  --z-index-modal:    400;  /* Modal dialogs */
  --z-index-scrim:    390;  /* Scrim sits below modal */
  --z-index-toast:    500;  /* Toast notifications — always on top */
  --z-index-tooltip:  600;  /* Tooltips — highest interactive layer */
}
```

### Layering Principles
- **Depth via contrast, not shadow.** Use background-colour steps (`--color-gray-0` → `--color-gray-10` → `--color-gray-20`) to create visual hierarchy between surface layers.
- **Scrim:** Always `--surface-surface--scrim` (`#121417`) at ~50% opacity when overlaying content behind modals.
- **Focus rings:** Always `--border-focus` (2px solid `#0580ff`) with 2px offset — never remove focus indicators.

---

## 8. Motion

> **Note:** No explicit animation tokens were extracted from Figma. The following are synthesised from the design direction (enterprise, functional, non-decorative) and the component state transitions implied by the token set.

```css
:root {
  /* Duration — synthesised, moderate confidence */
  --duration-instant:    0ms;     /* State changes with no animation (reduced-motion fallback) */
  --duration-fast:       100ms;   /* Micro-interactions: button active press, checkbox tick */
  --duration-default:    150ms;   /* Standard: hover transitions, colour changes */
  --duration-moderate:   250ms;   /* Popover/dropdown entry, tooltip appear */
  --duration-slow:       400ms;   /* Modal entry, slide-in panels */
  --duration-skeleton:   1500ms;  /* Loading skeleton shimmer loop */

  /* Easing — synthesised */
  --ease-default:     ease;                        /* Colour/opacity transitions */
  --ease-in-out:      ease-in-out;                 /* Enter + exit symmetric */
  --ease-out:         cubic-bezier(0.0, 0, 0.2, 1); /* Element entering viewport */
  --ease-in:          cubic-bezier(0.4, 0, 1, 1);   /* Element leaving viewport */

  /* Composite motion tokens */
  --transition-color:    color var(--duration-default) var(--ease-default),
                         background-color var(--duration-default) var(--ease-default),
                         border-color var(--duration-default) var(--ease-default); /* Hover colour swap */
  --transition-opacity:  opacity var(--duration-moderate) var(--ease-out);         /* Fade in/out */
  --transition-transform: transform var(--duration-moderate) var(--ease-out);       /* Slide/scale entry */
}

/* Skeleton shimmer keyframe */
@keyframes skeleton-shimmer {
  0%   { opacity: 1; }
  50%  { opacity: 0.4; }
  100% { opacity: 1; }
}

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: var(--duration-instant) !important;
    animation-duration: var(--duration-instant) !important;
  }
}
```

### When to Animate
- **DO animate:** hover colour changes, focus ring appearance, skeleton loading, modal/overlay entry, dropdown open/close.
- **DO NOT animate:** data refreshes in tables, badge text changes, error messages appearing — these must be immediate and legible.
- **ALWAYS** include `prefers-reduced-motion` override. Security dashboards are used in high-stress contexts where motion can be distracting.

---

## 9. Anti-Patterns & Constraints

**1. Hardcoded hex colours**
**Rule:** Never write a hex colour value directly in a component. **Why it fails:** When a theme mode changes (`[data-theme="dark"]`), hardcoded values don't update. The component breaks visually in dark/admin modes, and the colour change requires a code search instead of a token update. **What to do instead:** Always reference a CSS custom property: `color: var(--color-gray-90)` — never `color: #24282d`.

**2. Arbitrary spacing values**
**Rule:** Never use spacing values outside the `--spacing-spacing-*` scale. **Why it fails:** AI agents default to convenient round numbers (10px, 15px, 20px) that sit between scale steps and create visual inconsistency. A 10px gap looks like an 8px gap gone wrong. The rhythm breaks across components. **What to do instead:** Choose the nearest scale token — `--spacing-spacing-3` (8px) or `--spacing-spacing-4` (12px). If neither fits, the design needs review, not a new value.

**3. Wrong font family for context**
**Rule:** Never use Inter for code/data values; never use IBM Plex Mono for UI labels or headings. **Why it fails:** AI agents default to the primary font stack for everything, rendering IP addresses, config values, and request counts in Inter — which looks unprofessional and breaks the established visual language. Conversely, using monospace for button labels makes copy look broken. **What to do instead:** Use `var(--font-family-ibm-plex-mono)` for any value that is a code string, hash, IP, URL, or technical identifier. Use `var(--font-family-inter)` for all UI chrome.

**4. Pill/full-radius borders on buttons or inputs**
**Rule:** Never use `border-radius` values above `--borderradius-borderradius-xl` (16px). **Why it fails:** AI agents associate "modern UI" with pill-shaped buttons (border-radius: 9999px) and apply them by default, which directly contradicts Aspen Foundations' precise, enterprise aesthetic. The rounded style reads as consumer software, not infrastructure tooling. **What to do instead:** Default to `--borderradius-borderradius-md` (4px) for buttons and inputs. Use `--borderradius-borderradius-lg` (8px) for modals/panels. `--borderradius-borderradius-xl` (16px) for feature callouts only.

**5. Missing interaction states**
**Rule:** Never ship an interactive component with only a default state. **Why it fails:** AI agents generate the visible/happy-path state and omit hover, focus, active, disabled, loading, and error. In security dashboards, users navigate almost entirely by keyboard and rely on visible focus states. Missing `:focus-visible` is both an accessibility violation and a regression risk. **What to do instead:** For every interactive element, implement all six states before considering the component complete: default → hover → focus → active → disabled → error/loading.

**6. Dynamic Tailwind class construction**
**Rule:** Never construct Tailwind class names by string interpolation (e.g. `` `bg-${color}-500` ``). **Why it fails:** Tailwind's JIT compiler only includes classes it can see as complete strings at build time. Dynamically constructed classes are purged and produce invisible/broken styles in production — often silently. **What to do instead:** Use complete, static class names, or apply the token directly via `style={{ backgroundColor: 'var(--color-blue-50)' }}` for truly dynamic values.

**7. Inline styles for theme-sensitive values**
**Rule:** Never hardcode theme-sensitive colour or spacing as inline `style` props. **Why it fails:** Inline styles bypass the CSS custom property cascade. If `[data-theme="dark"]` updates `--color-gray-90`, but the element has `style={{ color: '#24282d' }}`, it stays light-mode grey in dark contexts — the hardcoded value wins. **What to do instead:** Inline styles are acceptable ONLY when the value is a CSS variable reference: `style={{ color: 'var(--color-gray-90)' }}`.

**8. Using `!important` to override tokens**
**Rule:** Never use `!important` to override design token values. **Why it fails:** `!important` breaks the specificity cascade that token overrides rely on. Theme switching via `[data-theme]` attributes and component-level overrides become unreliable — some properties update and others don't, producing half-themed components. **What to do instead:** Increase selector specificity correctly, or restructure the component to accept a `variant` prop that applies the correct token set.

**9. Omitting `prefers-reduced-motion` in animations**
**Rule:** Never add CSS animations or transitions without a `prefers-reduced-motion: reduce` override. **Why it fails:** Enterprise security dashboards are used in high-stress, time-sensitive environments. Persistent motion (skeleton shimmers, hover transitions) is actively harmful for users with vestibular disorders and distracting for focused work. Omitting the override is both an accessibility failure and a usability regression. **What to do instead:** Always pair any `transition` or `animation` with a `@media (prefers-reduced-motion: reduce)` block that sets duration to `0ms`.

**10. Using signal tokens decoratively**
**Rule:** Never use `--signal-signal--attack`, `--signal-signal--anomaly`, etc. for decorative colour. **Why it fails:** These tokens communicate security meaning (attack patterns, anomalies, informational events) in the Signal Sciences product context. Using them for visual interest in unrelated UI elements trains users to misread them and erodes the signal vocabulary. **What to do instead:** Use the blue (`--color-blue-*`) or gray (`--color-gray-*`) scales for decorative and structural colour. Reserve signal tokens strictly for security event indicators.

---

## Appendix A: Complete Token Reference

### Colour Primitives

| Token | Value | Usage |
|---|---|---|
| `--color-blue-10` | `#f0f7ff` | Hover background tint |
| `--color-blue-20` | `#d1e8ff` | Selected/active tint |
| `--color-blue-30` | `#9eceff` | Decorative, disabled |
| `--color-blue-40` | `#51a7ff` | Secondary interactive |
| `--color-blue-50` | `#0580ff` | **Primary action** |
| `--color-blue-60` | `#0067d1` | Primary hover/pressed |
| `--color-blue-70` | `#004e9e` | Dark mode primary |
| `--color-blue-80` | `#00356b` | Deeply pressed |
| `--color-blue-90` | `#002142` | Dark blue surface |
| `--color-gray-0` | `#ffffff` | Default surface |
| `--color-gray-10` | `#f3f4f6` | Subtle background |
| `--color-gray-20` | `#dce0e4` | Borders, dividers |
| `--color-gray-30` | `#bac1c9` | Disabled borders |
| `--color-gray-40` | `#9ea8b2` | Placeholder text |
| `--color-gray-50` | `#818e9c` | Tertiary text |
| `--color-gray-60` | `#677483` | Secondary text |
| `--color-gray-70` | `#515b66` | Body text |
| `--color-gray-80` | `#3a424a` | Strong body text |
| `--color-gray-90` | `#24282d` | **Headings** |
| `--color-gray-100` | `#121417` | Darkest surface |
| `--color-green-10` | `#f2fcf2` | Success tint |
| `--color-green-20` | `#c1eebd` | Success light |
| `--color-green-30` | `#8fe088` | — |
| `--color-green-40` | `#5dd354` | — |
| `--color-green-50` | `#39b52f` | **Success primary** |
| `--color-green-60` | `#2f9527` | Success hover |
| `--color-green-70` | `#25741e` | Success dark |
| `--color-green-80` | `#1a5416` | — |
| `--color-green-90` | `#10330d` | — |
| `--color-red-10` | `#fef1f1` | Error tint |
| `--color-red-20` | `#fcbfbb` | Error light |
| `--color-red-30` | `#f87f77` | — |
| `--color-red-40` | `#f65a50` | Error border |
| `--color-red-50` | `#e9190c` | **Error primary** |
| `--color-red-60` | `#bd140a` | Error hover |
| `--color-red-70` | `#921008` | Error dark |
| `--color-red-80` | `#660b05` | — |
| `--color-red-90` | `#3a0603` | — |
| `--color-yellow-10` | `#fff5e0` | Warning tint |
| `--color-yellow-20` | `#ffe1a8` | Warning light |
| `--color-yellow-30` | `#ffce70` | — |
| `--color-yellow-40` | `#ffbb38` | — |
| `--color-yellow-50` | `#ffa800` | **Warning primary** |
| `--color-yellow-60` | `#cc8600` | Warning hover |
| `--color-yellow-70` | `#996500` | Warning dark |
| `--color-yellow-80` | `#664300` | — |
| `--color-yellow-90` | `#332200` | — |
| `--color-brand-fastly` | `#ff282d` | Fastly logo/brand only |
| `--color-brand-signal-sciences` | `#fa6b0a` | Signal Sciences logo/brand only |

### Data Visualisation

| Token | Value | Usage |
|---|---|---|
| `--color-data-viz-1` | `#0088b5` | Series 1 |
| `--color-data-viz-2` | `#33bda0` | Series 2 |
| `--color-data-viz-3` | `#fddfb3` | Series 3 |
| `--color-data-viz-4` | `#ff9da0` | Series 4 |
| `--color-data-viz-5` | `#88dbf2` | Series 5 |
| `--color-data-viz-6` | `#008a6d` | Series 6 |
| `--color-data-viz-7` | `#b280d8` | Series 7 |
| `--color-data-viz-8` | `#006a8d` | Series 8 |
| `--color-data-viz-9` | `#dcb9f6` | Series 9 |
| `--color-data-viz-10` | `#ea8446` | Series 10 |
| `--color-data-viz-11` | `#a24271` | Series 11 |
| `--color-data-viz-12` | `#98eda1` | Series 12 |

### Semantic Surface & Signal Tokens

| Token | Light | Dark | Admin-Light | Admin-Dark | Usage |
|---|---|---|---|---|---|
| `--surface-surface--scrim` | `#121417` | `#121417` | `#121417` | `#121417` | Modal overlay scrim |
| `--signal-signal--custom` | `#ffddde` | `#654447` | `#ffddde` | `#654447` | Custom rule highlight |
| `--signal-signal--attack` | `#e4d3f1` | `#4a3a5b` | `#e4d3f1` | `#4a3a5b` | Attack signal badge |
| `--signal-signal--informational` | `#b8e8de` | `#1e4f47` | `#b8e8de` | `#1e4f47` | Informational signal |
| `--signal-signal--anomaly` | `#f8d4be` | `#5e3b27` | `#f8d4be` | `#5e3b27` | Anomaly signal badge |

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `--spacing-spacing-0` | `0px` | Intentional collapse |
| `--spacing-spacing-1` | `2px` | Micro spacing |
| `--spacing-spacing-2` | `4px` | XS padding |
| `--spacing-spacing-3` | `8px` | Base unit |
| `--spacing-spacing-4` | `12px` | Compact padding |
| `--spacing-spacing-5` | `16px` | Standard padding |
| `--spacing-spacing-6` | `24px` | Card padding |
| `--spacing-spacing-7` | `32px` | Row gap |
| `--spacing-spacing-8` | `40px` | Section padding |
| `--spacing-spacing-9` | `48px` | Major section break |
| `--spacing-spacing-10` | `64px` | Hero rhythm |
| `--spacing-spacing-11` | `80px` | Large section gap |
| `--spacing-spacing-12` | `96px` | Page rhythm |
| `--spacing-spacing-13` | `160px` | Max landmark spacing |

### Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `--borderradius-borderradius-xs` | `0px` | Sharp — tables, dividers |
| `--borderradius-borderradius-sm` | `2px` | Subtle — tags, chips |
| `--borderradius-borderradius-md` | `4px` | Default — buttons, inputs |
| `--borderradius-borderradius-lg` | `8px` | Large — modals, popovers |
| `--borderradius-borderradius-xl` | `16px` | Max — feature callouts |

### Typography — Font Families & Weights

| Token | Value | Usage |
|---|---|---|
| `--font-family-inter` | `Inter` | All UI text |
| `--font-family-ibm-plex-mono` | `IBM Plex Mono` | Code, data values |
| `--font-weight-regular` | `Regular` / `400` | Body text |
| `--font-weight-semi-bold` | `Semi Bold` / `600` | Emphasis, labels |
| `--font-weight-bold` | `Bold` / `700` | Headings |
| `--font-weight-extra-bold` | `Extra Bold` / `800` | H1 only |

### Typography — Size & Line Height (Desktop)

| Token | Value |
|---|---|
| `--font-size-header-h1-(xxl)-desktop` | `32px` |
| `--line-height-header-h1-(xxl)-desktop` | `40px` |
| `--font-size-header-h2-(xl)-desktop` | `24px` |
| `--line-height-header-h2-(xl)-desktop` | `32px` |
| `--font-size-header-h3-(lg)-desktop` | `20px` |
| `--line-height-header-h3-(lg)-desktop` | `28px` |
| `--font-size-header-h4-(md)-desktop` | `16px` |
| `--line-height-header-h4-(md)-desktop` | `24px` |
| `--font-size-header-h5-(sm)-desktop` | `14px` |
| `--line-height-header-h5-(sm)-desktop` | `20px` |
| `--font-size-header-h6-(xs)-desktop` | `12px` |
| `--line-height-header-h6-(xs)-desktop` | `16px` |
| `--font-size-type-xl-desktop` | `18px` |
| `--line-height-type-xl-desktop` | `28px` |
| `--font-size-type-lg-desktop` | `16px` |
| `--line-height-type-lg-desktop` | `24px` |
| `--font-size-type-md-desktop` | `14px` |
| `--line-height-type-md-desktop` | `20px` |
| `--font-size-type-sm-desktop` | `12px` |
| `--line-height-type-sm-desktop` | `20px` |
| `--font-size-type-xs-desktop` | `10px` |
| `--line-height-type-xs-desktop` | `16px` |
| `--font-size-monospace-lg-desktop` | `16px` |
| `--line-height-monospace-lg-desktop` | `28px` |
| `--font-size-monospace-md-desktop` | `14px` |
| `--line-height-monospace-md-desktop` | `24px` |
| `--font-size-monospace-sm-desktop` | `12px` |
| `--line-height-monospace-sm-desktop` | `20px` |
| `--font-size-monospace-xs-desktop` | `10px` |
| `--line-height-monospace-xs-desktop` | `16px` |

*(Tablet and mobile values follow the same pattern with `-tablet` / `-mobile` suffixes. Tablet/mobile values match each other; desktop diverges for H1–H3.)*

---

## Appendix B: Token Source Metadata

```
tokenSource:        extracted-from-figma
confidence:         high
totalTokens:        153
extractionDate:     [TBD - record at extraction time]
figmaFileId:        [TBD - record Figma file ID]
figmaPageName:      Aspen Foundations

Authoritative:      YES — tokens are extracted directly from Figma design intent,
                    not reverse-engineered from computed styles.

Annotation convention:
  /* extracted */   — directly from Figma token set, high confidence
  /* synthesised */ — derived from design direction, not in Figma token set
                      (applies to: shadow tokens, z-index scale, motion tokens,
                       border composite tokens, font stack fallbacks)

Synthesised tokens in this file:
  - --border-default, --border-strong, --border-subtle,
    --border-focus, --border-error, --border-disabled
    (synthesised from colour primitives + design direction)
  - --z-index-* scale
    (synthesised from common enterprise UI patterns, no Figma source)
  - --duration-*, --ease-*, --transition-*
    (synthesised from design direction: functional, minimal motion)
  - Font stack fallbacks (system-ui, monospace)
    (synthesised — Figma names fonts without fallbacks)

Figma font weight mapping:
  "Regular"    → 400 (confirmed by @font-face extraction)
  "Semi Bold"  → 600 (confirmed by @font-face extraction)
  "Bold"       → 700 (confirmed by @font-face extraction)
  "Extra Bold" → 800 (confirmed by @font-face extraction)

Responsive breakpoints:  [TBD - not in Figma token set, extract from implementation]
Container widths:        [TBD - not in Figma token set, extract from implementation]
Grid column count:       [TBD - not in Figma token set, extract from implementation]

Theme modes documented:
  light        → default consumer product
  dark         → dark consumer product
  admin-light  → admin console, light
  admin-dark   → admin console, dark
  Note: scrim colour (#121417) is identical across all four modes.
  Note: signal token values mirror light↔admin-light and dark↔admin-dark.
```