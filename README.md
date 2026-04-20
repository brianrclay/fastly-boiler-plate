# Fastly Prototype Kit

A ready-to-use prototype boilerplate for designers and product managers at Fastly. Clone it, branch it, build your prototype, and publish it.

**Built with:** React + TypeScript + Vite + Fastly Design Tokens

---

## What's Included

- Full Fastly control panel UI (home, CDN, compute, observability, billing, service config, etc.)
- 136 SVG icons from the Fastly icon library
- 153 design tokens extracted from Figma (colors, spacing, typography, radii)
- Light and dark theme support
- Prototype controls toolbar (role switcher, brand new user mode)
- Figma MCP integration via CLAUDE.md

---

## Quick Start (5 minutes)

### 1. Prerequisites

You need these installed on your computer:

| Tool | How to check | How to install |
|------|-------------|----------------|
| **Git** | `git --version` | [git-scm.com](https://git-scm.com) |
| **Node.js 20+** | `node --version` | [nodejs.org](https://nodejs.org) (LTS version) |
| **npm** | `npm --version` | Comes with Node.js |

### 2. Create a folder for your projects

Pick a place on your computer to keep your prototype work. Open **Terminal** (Mac) or **Command Prompt** (Windows) and run:

```bash
mkdir ~/prototypes
cd ~/prototypes
```

> This creates a `prototypes` folder in your home directory. You only need to do this once. You can name it whatever you like or put it wherever you prefer (e.g., your Desktop).

### 3. Clone the repo

From inside your `prototypes` folder, run:

```bash
git clone https://github.com/fastly/product-prototypes.git
cd product-prototypes
```

### 4. Install dependencies

```bash
cd app
npm install
```

### 5. Start the dev server

```bash
npm run dev
```

Open the URL shown in your terminal (usually http://localhost:5173). You should see the Fastly control panel.

### 6. Create your branch

```bash
git checkout -b my-prototype-name
```

Now you're ready to build!

---

## Building Your Prototype

### Project Structure

```
app/
  src/
    pages/          <-- Add or edit pages here
    components/     <-- Reusable UI components
    data/           <-- Mock data (services, navigation)
    context/        <-- App state (prototype controls)
    styles/         <-- Design tokens + global styles
  public/
    icons/          <-- All Fastly SVG icons
  index.html        <-- HTML entry point
```

### Where to Start

**Editing an existing page:** Open any file in `app/src/pages/` - e.g., `HomePage.tsx`, `CdnPage.tsx`, `ServiceSummaryPage.tsx`

**Creating a new page:**
1. Create `app/src/pages/MyPage.tsx` and `app/src/pages/MyPage.module.css`
2. Add a route in `app/src/App.tsx` inside the `renderPage()` function
3. Add the page ID to `VALID_PAGE_IDS` and `pageTitles` in App.tsx

### Using the Design System

All styles use CSS custom properties (design tokens). Never hardcode colors.

```css
/* Good */
.myCard {
  color: var(--text-primary);
  background: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  font-family: var(--font-family-inter);
}

/* Bad - don't do this */
.myCard {
  color: #3a424a;
  background: white;
  border-radius: 8px;
  padding: 24px;
}
```

**Common tokens:**

| Token | Value | Use for |
|-------|-------|---------|
| `--text-primary` | Dark gray | Main text |
| `--text-secondary` | Medium gray | Subtle text |
| `--text-action` | Blue | Links, buttons |
| `--border-primary` | Light gray | Card borders |
| `--surface-primary` | White | Backgrounds |
| `--surface-selected` | Light blue | Selected states |
| `--surface-hover` | Very light gray | Hover states |
| `--radius-lg` | 8px | Cards |
| `--radius-md` | 4px | Buttons, inputs |
| `--spacing-3` | 8px | Tight spacing |
| `--spacing-5` | 16px | Default spacing |
| `--spacing-6` | 24px | Section gaps |
| `--spacing-7` | 32px | Page padding |
| `--font-family-inter` | Inter | UI text |
| `--font-family-mono` | IBM Plex Mono | Code/data |

### Using Icons

```tsx
import { Icon } from '../components/Icon';

// In your JSX:
<Icon name="add" size={20} />
<Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
```

Browse all available icons in `app/public/icons/`. Icon names are the filenames without `.svg` and in lowercase-hyphenated format (e.g., `Chevron down.svg` becomes `chevron-down`).

### Using AI (Claude Code)

This repo includes a `CLAUDE.md` file with the full design system. When using Claude Code:

1. Claude will automatically follow the design token rules
2. You can paste Figma URLs and Claude will implement the designs
3. The Figma MCP server integration is pre-configured

---

## Publishing Your Prototype

### Option A: Netlify (Recommended)

1. **Push your branch to GitHub:**
   ```bash
   git add -A
   git commit -m "My prototype"
   git push origin my-prototype-name
   ```

2. **Go to [netlify.com](https://netlify.com)** and sign in with GitHub

3. **Click "Add new site" > "Import an existing project"**

4. **Select your repo** and configure:
   - **Branch:** `my-prototype-name`
   - **Base directory:** `app`
   - **Build command:** `npm run build`
   - **Publish directory:** `app/dist`

5. **Click Deploy.** Your prototype will be live at a `.netlify.app` URL in about a minute.

### Option B: Vercel

1. **Push your branch to GitHub** (same as above)

2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

3. **Click "Import Project"** and select your repo

4. **Configure:**
   - **Root directory:** `app`
   - **Framework:** Vite
   - **Branch:** `my-prototype-name`

5. **Click Deploy.**

---

## Tips for Non-Engineers

- **You only need to edit files in `app/src/`** - everything else is config
- **CSS Modules** - each `.module.css` file is scoped to its component. You can't accidentally break other pages
- **Hot reload** - save a file and the browser updates instantly. No need to refresh
- **TypeScript errors** will show in the terminal. If you see red squiggles in your editor, the build might fail
- **Don't edit `node_modules/`** - those are external libraries
- **Commit often** - you can always go back to a previous version with `git checkout .`

---

## Common Tasks

### Change the company name on the home page
Edit `app/src/pages/HomePage.tsx`, search for "Acme Co." and replace it.

### Add a new service to the list
Edit `app/src/data/services.ts` and add a new entry to the `services` array.

### Change the navigation items
Edit `app/src/data/navigation.ts` for the main nav, or the respective nav data file for L2 navigation.

### Toggle dark mode
Click the avatar (top right) > Dark theme toggle. Or use the prototype controls toolbar at the top.

### Test the "brand new user" experience
Toggle "Brand new user" in the prototype controls toolbar at the top of the page.

---

## Commands Reference

Run these from the `app/` directory:

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check code for errors |

---

## Need Help?

- **Design system reference:** See `CLAUDE.md` in the repo root
- **Full token list:** See `app/src/styles/tokens.css`
- **Icon list:** Browse `app/public/icons/`
