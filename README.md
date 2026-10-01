# germanpadua.github.io

Personal portfolio of **German Padua** — computer engineer and mathematician
working on applied machine learning, data science, and data-driven systems.

Live site: <https://germanpadua.github.io>

## What this repository is

A static, bilingual (ES/EN) portfolio built with **Astro 7** and **TypeScript**.
It is deliberately split into three layers:

| Layer | What it is | JavaScript cost |
| --- | --- | --- |
| **Document** | The site a recruiter reads: experience, education, projects, case studies. Static HTML and CSS. | none |
| **Terminal** | A REPL you can navigate the site with, with history, completion, and themes. | one island, `client:idle` |
| **Playground** | An interactive skill graph and an F1 qualifying-lap mini-game. | two islands, `client:visible` |

The document layer ships **zero JavaScript**. `scripts/assert-shell-payload.mjs`
enforces that in CI: every route declares which islands it is allowed to load, and
a route that starts shipping an undeclared script fails the build.

## Stack

- **Astro 7** static output, deployed to GitHub Pages by GitHub Actions
- **TypeScript** strict, with Zod-validated content collections — a missing or
  misspelled field fails the build instead of silently rendering an empty section
- **React 19** islands, used only for the terminal, the skill graph, and the game
- Design tokens with four switchable themes (`atlas`, `phosphor`, `nebula`, `papel`)
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
```

`pnpm shot` accepts `--routes`, `--viewports`, `--theme`, and `--url`:

```bash
pnpm shot --routes /,/en/,/proyectos/telemetry-sentinel --viewports desktop,mobile
pnpm shot --theme phosphor --routes /
```

Captures and a `report.json` with FCP/load timings land in `.screenshots/`.

## Layout

```
astro.config.mjs              static output, sitemap, i18n routing (es default, en at /en/)
src/content.config.ts         Zod schemas for projects, experience, education, skills, now
src/content/                  content, per locale where needed
src/i18n/                     UI strings and terminal copy
src/styles/tokens.css         semantic design tokens
src/styles/themes/            one file per theme
src/components/               static shell components
src/components/islands/       the only hydrated code: Terminal, SkillGraph, Game
src/pages/                    routes, ES at / and EN at /en/
public/                       images, icons, crawler files
scripts/                      screenshot capture and the payload guard
.github/workflows/            ci.yml (pull requests) and deploy.yml (main)
```

## Deployment

`main` deploys through the `Deploy to GitHub Pages` workflow. The repository's
Pages source must be set to **GitHub Actions** (not "Deploy from a branch") for
that workflow to publish.

## Content

Project case studies live in `src/content/projects/`. Each entry declares a
`visibility`:

- `public` — the repository is public, so the entry links to it
- `case-study` — the work is real but the repository is private; the entry carries
  architecture, decisions, and measured results instead of a link
- `demo-only` — no repository access, but a running demo is linked

Private work is described at the level of architecture and measured outcome only.
No client or personal data appears anywhere in this repository.

## License

The code in this repository is available for reference. Written content, project
descriptions, and images are © German Padua and are not licensed for reuse.
