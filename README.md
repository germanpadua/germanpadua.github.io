# germanpadua.github.io

Personal portfolio of **German Padua** — computer engineer and mathematician
working on applied machine learning, data science, and data-driven systems.

Live site: <https://germanpadua.github.io>

## What this repository is

A static, bilingual (ES/EN) portfolio built with **Astro 7** and **TypeScript**.
It is deliberately split into three layers:

| Layer | What it is | JavaScript cost |
| --- | --- | --- |
| **Document** | The site a recruiter reads: profile, projects, experience, case studies. Static HTML and CSS. | no external JavaScript |
| **Terminal** | A REPL you can navigate the site with, history, completion, and themes. | one island, `client:idle` |
| **Playground** | An interactive skill graph and an F1 qualifying-lap mini-game. | two islands, `client:visible` |

The document layer loads **no external JavaScript**. It does carry a single
synchronous inline script of about 2.2 KB (907 bytes gzipped), and it has to: a
theme system that must not flash the wrong palette has to set its attribute
before first paint. `scripts/assert-shell-payload.mjs` enforces this in CI:
every route declares the inline budget and the exact island entry scripts it may
load, and a route that starts shipping an undeclared or third-party script fails
the build.

## Stack

- **Astro 7** static output, deployed to GitHub Pages by GitHub Actions
- **TypeScript** strict, with Zod-validated content collections — a missing or
  misspelled field fails the build instead of silently rendering an empty section
- **Preact** islands, used only for the terminal, the skill graph, and the game.
  Preact rather than React on purpose: React 19 emits a ~220 KB client chunk,
  Preact the same JSX ergonomics for roughly 11 KB, and these three islands are
  self-contained features that need no React DOM
- Design tokens with four switchable themes (`atlas`, `tinta`, `phosphor`,
  `nebula`); themes override token values, never token names
- Self-hosted fonts resolved at build time, so the site makes no third-party
  request at runtime
- **pnpm** with `allowBuilds` pinned, so no dependency runs scripts unreviewed

## Commands

```bash
pnpm install          # install dependencies
pnpm dev              # dev server on http://localhost:4321
pnpm check            # astro check: TypeScript + content schema validation
pnpm build            # static build into dist/
pnpm preview          # serve dist/ locally
pnpm verify           # check + build + payload guard (what CI runs)
pnpm shot             # screenshot routes and report Web Vitals
pnpm icons            # rebuild the PNG icon set from public/favicon.svg
pnpm og-image         # re-render public/og-default.png from the /og/ route
```

`pnpm shot` accepts `--routes`, `--viewports`, `--theme`, `--color-scheme`,
`--reduced-motion`, and `--url`. Forcing a theme drives the real theme switch,
so a capture also exercises the control:

```bash
pnpm shot --routes /,/en/ --viewports desktop,mobile --theme atlas
pnpm shot --color-scheme light --reduced-motion --routes /
pnpm shot --url https://germanpadua.github.io --routes /          # audit the live site
```

Captures and a `report.json` with FCP/load timings land in `.screenshots/`.

## Layout

```
astro.config.mjs              static output, sitemap, i18n routing (es default, en at /en/), fonts
src/content.config.ts         Zod schemas for projects, experience, education, skills, now
src/content/                  content, per locale where needed
src/i18n/ui.ts                UI strings; Spanish is the source of truth for the shape
src/styles/tokens.css         the semantic token contract
src/styles/themes/            one file per theme; values only, never new names
src/components/               static shell components (Nav, Hero, Profile, Footer, ...)
src/components/islands/       the only hydrated code: Terminal, SkillGraph, Game
src/pages/                    routes, ES at / and EN at /en/
public/                       images, icons, crawler files
scripts/                      screenshot capture, icon and OG rendering, payload guard
.github/workflows/            ci.yml (pull requests) and deploy.yml (main)
```

### Adding a theme

Add `src/styles/themes/<name>.css` with a `[data-theme="<name>"]` block that
fills in the full token contract, then register the name in `themeIds`
(`src/i18n/ui.ts`) and in the `THEMES` array of `ThemeScript.astro`. The selectors
match any element, not only `:root`, which is what lets `/lab/` render all four
themes side by side on one page.

### Adding an island

Route the island under `src/components/islands/`, hydrate it with
`client:visible` or `client:idle`, and add its entry script to the matching route
in `ROUTE_BUDGETS` inside `scripts/assert-shell-payload.mjs`. If the guard fails,
that is the guard working: the declaration is the point.

## Deployment

`main` deploys through the `Deploy to GitHub Pages` workflow. The repository's
Pages source must be set to **GitHub Actions** (not "Deploy from a branch") for
that workflow to publish.

## Content

Project case studies will live in `src/content/projects/`. Each entry declares a
`visibility`:

- `public` — the repository is public, so the entry links to it
- `case-study` — the work is real but the repository is private; the entry carries
  architecture, decisions, and measured results instead of a link
- `demo-only` — no repository access, but a running demo is linked

Private work is described at the level of architecture and measured outcome only.
No client or personal data appears anywhere in this repository.

## Working routes

`/lab/` renders the full token system in all four themes over identical markup,
and `/og/` is the social card that `pnpm og-image` screenshots. Both are
`noindex`, both are excluded from the sitemap, and both are disallowed in
`robots.txt`.

## License

The code in this repository is available for reference. Written content, project
descriptions, and images are © German Padua and are not licensed for reuse.
