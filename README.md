# germanpadua.github.io

Personal portfolio of **Germán Padua** — computer engineer and mathematician
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
pnpm verify           # check + build + payload guard + the skill verifiers
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
src/pages/                    routes, ES at / and EN at /en/, plus 404.astro
src/pages/data/               static JSON endpoints the islands fetch
src/pages/404.astro           served by GitHub Pages for any unknown path
public/                       images, icons, crawler files
scripts/                      screenshot capture, icon and OG rendering, and the
                              verification suite: payload guard, theme behaviour,
                              layout and content, island behaviour, game model
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

## Performance

Measured, not estimated. The method matters more than the number:

- `astro preview` serves with gzip, and Playwright's `response.body()` returns the
  **decompressed** body, so a naive sum overstates the transfer. The figures below
  combine the already-compressed assets as served (images, fonts) with the text assets
  compressed locally at gzip level 9, which is what GitHub Pages does.
- Only the variants one browser actually picks are counted: `<Picture>` emits 18 AVIF and
  18 WebP files across all widths, and a reader downloads one of each.

| Route | Realistic transfer | What dominates |
| --- | --- | --- |
| `/` (cold, nothing scrolled) | ~200 KB | document 132 KB decoded (26 KB gzipped), fonts 135 KB, CSS 54 KB, JS 55 KB |
| `/` (scrolled to the end) | ~450 KB | plus 253 KB of lazy project screenshots |
| A case study | ~180 KB | fonts 135 KB, one screenshot ~50 KB |

Budgets, enforced rather than hoped for:

- JavaScript per route is capped in `scripts/assert-shell-payload.mjs`, which fails the
  build on an undeclared or third-party script and on a total above the declared ceiling.
  The home page is at 68,544 of 72,000 bytes with three islands.
- Fonts: 135 KB across three files. The Newsreader italic face was a fourth file of
  64.5 KB, downloaded on every route for two small uses; it is gone and those two uses
  now read as a quiet rule and a muted colour.
- Images: everything lives in `src/assets/`, never in `public/`, so Astro emits AVIF and
  WebP at the widths the layout asks for. The isometric render is 366 KB as a source JPEG
  and 138 KB as the largest AVIF; the portrait is 151 KB as a source and 6.8 KB at its
  smallest AVIF. Sources went from 3.6 MB of PNG to 1.1 MB by converting the two
  photographic ones.

## Deployment

`main` deploys through the `Deploy to GitHub Pages` workflow, which builds and uploads
`dist/` as a Pages artifact. This repository has no server: every route is a directory
with an `index.html`, the islands fetch static JSON from `/data/`, and `dist/404.html` is
served by Pages for any unknown path.

### Releasing

1. **One-time prerequisite.** The repository's Pages source must be **GitHub Actions**,
   not "Deploy from a branch". It is currently the legacy branch build, which runs Jekyll
   against `main`; with the Jekyll tree gone that build has nothing to build, and
   `actions/deploy-pages` fails while the setting says `legacy`. Change it under
   *Settings → Pages → Build and deployment → Source*, or:

   ```bash
   gh api -X PUT repos/germanpadua/germanpadua.github.io/pages -f build_type=workflow
   ```

2. Merge or push to `main`. The workflow runs `pnpm install --frozen-lockfile`,
   `astro check`, `pnpm build`, the payload guard, and then publishes.
3. Verify the deployed result rather than assuming it:

   ```bash
   pnpm shot --url https://germanpadua.github.io --routes /,/en/,/proyectos/ --viewports desktop,mobile
   pnpm run test:e2e   # then point it at the live URL
   ```

### What CI enforces before anything ships

`.github/workflows/ci.yml` runs on every pull request and on every branch that is not
`main`, and it fails rather than warns:

- `astro check` — TypeScript and the content schemas, so a missing or misspelled field
  cannot reach a page
- the payload guard — no undeclared script, no third-party script, and a per-route
  JavaScript ceiling
- the skill derivation rules and the skill map's layout invariants
- theme behaviour, layout and content across five viewports, island behaviour, the game
  model, and the accessibility audit

All of them are runnable locally: `pnpm verify` covers the first three, and the rest are
`pnpm test:e2e`, `pnpm test:layout`, `pnpm test:islands`, `pnpm test:model`,
`pnpm test:skills`, `pnpm test:skill-layout` and `pnpm test:a11y`.

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

## License and provenance

The code in this repository is available for reference. Written content, project
descriptions, and images are © Germán Padua and are not licensed for reuse.

This site was previously built on the **devfolio** theme, distributed under
Creative Commons Attribution 3.0. No part of that theme remains: the markup, styles,
scripts, and assets were all replaced, and the theme's licence file was removed with
it. The credit is recorded here so the attribution is not lost with the file.
