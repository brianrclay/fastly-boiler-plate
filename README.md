# Fastly Prototype Kit

A ready-to-use prototype boilerplate for designers and product managers at Fastly. Clone it, set it up once, then use an AI coding tool like [Claude Code](https://claude.ai/code) to build and publish your prototypes.

---

## What's Included

- Full Fastly control panel UI (home, CDN, compute, observability, billing, service config, etc.)
- 136 SVG icons from the Fastly icon library
- 153 design tokens extracted from Figma (colors, spacing, typography, radii)
- Light and dark theme support
- Prototype controls toolbar (role switcher, brand new user mode)
- A `CLAUDE.md` file that teaches AI tools our design system rules automatically

---

## One-Time Setup

You only need to do this once. After that, you'll use Claude Code for everything.

### 1. Install Prerequisites

You need three things on your computer. Open **Terminal** (Mac) or **Command Prompt** (Windows) and check:

| Tool | Check if installed | Install from |
|------|-------------------|--------------|
| **Git** | `git --version` | [git-scm.com](https://git-scm.com) |
| **Node.js 20+** | `node --version` | [nodejs.org](https://nodejs.org) (pick the LTS version) |
| **Claude Code** | `claude --version` | [claude.ai/code](https://claude.ai/code) |

### 2. Create a folder for your prototypes

For example, create a folder on your desktop called "Prototypes". Then open your terminal and use this command:

```bash
cd desktop/prototypes
```

> You only do this once. You can name the folder whatever you want or put it wherever you like (Desktop, Documents, etc.).

### 3. Clone the repo

```bash
git clone https://github.com/fastly/product-prototypes.git
cd product-prototypes
```

### 4. Install dependencies

```bash
cd app
npm install
```

### 5. Verify it works

```bash
npm run dev
```

Open the URL shown in your terminal (usually http://localhost:5173). You should see the Fastly control panel. Press `Ctrl+C` to stop the server.

You're done with setup.

---

## Building a Prototype

### 1. Open the project in Claude Code

From your `product-prototypes` folder, run:

```bash
claude
```

This opens Claude Code with full knowledge of the project and design system.

### 2. Tell Claude to create a branch

Say something like:

> "Create a new branch called `my-prototype-name`"

### 3. Describe what you want to build

You can be as specific or as general as you want. Some examples:

> "Add a new page that shows a service creation wizard with a 3-step form"

> "Update the home page to show a banner promoting our new AI Accelerator product"

> "Build this Figma design: [paste Figma URL]"

> "Change the CDN services page to show a grid view instead of a table"

Claude will write the code, follow the design system tokens, and use the existing component patterns automatically.

### 4. Preview your changes

Ask Claude:

> "Start the dev server so I can preview"

Or run it yourself:

```bash
cd app
npm run dev
```

### 5. Iterate

Keep telling Claude what to change until it looks right. You can paste screenshots, Figma URLs, or just describe what you want in plain English.

---

## Publishing Your Prototype

When you're ready to share, ask Claude:

> "Commit my changes and push the branch to GitHub"

Then deploy it on Netlify or Vercel:

### Netlify (Recommended)

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click **"Add new site"** > **"Import an existing project"**
3. Select the **fastly/product-prototypes** repo
4. Set these values:
   - **Branch:** your branch name (e.g., `my-prototype-name`)
   - **Base directory:** `app`
   - **Build command:** `npm run build`
   - **Publish directory:** `app/dist`
5. Click **Deploy**

Your prototype will be live at a `.netlify.app` URL in about a minute. Share that link with anyone.

### Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Import Project"** and select the repo
3. Set **Root directory** to `app` and **Branch** to your branch name
4. Click **Deploy**

---

## Tips

- **Always work on a branch** - don't commit to `main`. That way the base prototype stays clean for everyone.
- **You can have multiple prototypes** - just create a new branch for each one and deploy each branch separately.
- **Paste Figma URLs** directly into Claude Code - it can read Figma designs and implement them.
- **The prototype controls toolbar** at the top of the app lets you switch user roles and toggle "brand new user" mode.
- **Dark mode** is available via the avatar menu (top right corner).

---

## Reference

These are here if you need them, but Claude Code knows all of this already.

| What | Where |
|------|-------|
| Pages | `app/src/pages/` |
| Components | `app/src/components/` |
| Mock data (services, etc.) | `app/src/data/` |
| Design tokens | `app/src/styles/tokens.css` |
| Icons | `app/public/icons/` |
| Design system rules | `CLAUDE.md` |
| Dev server | `cd app && npm run dev` |
| Production build | `cd app && npm run build` |
