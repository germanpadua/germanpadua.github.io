# Content

Validated at build time by `src/content.config.ts`. A missing or invalid field
fails `astro check` and the build, which is the point: the previous site kept its
content in unvalidated YAML and drifted two years out of date silently.

## Locale pairing

Bilingual collections store one file per locale, paired by filename suffix:

```
src/content/projects/telemetry-sentinel.es.md
src/content/projects/telemetry-sentinel.en.md
```

Both files carry the same `slug`. Keeping the pair adjacent is what makes a
missing translation obvious in a diff. The Spanish file is written first and is
the reference for tone; the English file is a translation, not a rewrite.

## Collections

| Directory | Rendering | Notes |
| --- | --- | --- |
| `projects/` | Markdown body is the case study | `visibility` drives whether a repository link may exist |
| `experience/` | Front matter only | `order: 0` is the current role and must have `end: present` |
| `education/` | Front matter only | Degrees, master's, certifications, languages |
| `skills/graph.json` | The skill graph island | One entry, `id: "graph"`, with areas, nodes, and edges |
| `site/*.json` | "Off the clock" and "Now" | `now` may be empty; a stale "now" is worse than none |

## Invariants the schema enforces

- a project marked `public` **must** link its repository, and one marked
  `case-study` **must not** — its repository is private, so a link would 404 for
  the visitor this site exists for
- a project marked `demo-only` must link a demo
- `experience` may mark exactly one entry as current
- every skill-graph edge must reference nodes that exist, node and area ids must
  be unique, and an edge may not be a self-loop. A dangling edge renders as a
  silently missing connection, which in a graph looks like there is nothing to
  see rather than like a bug
- a node's `projects` list uses portfolio slugs, so a claim about where a skill
  was used can be traced to the case study that shows it

## Writing rules

- Numbers must be real and traceable. If a figure comes from a committed
  artifact, cite the artifact. If it is only claimed in prose, do not publish it
  as measured.
- Private work is described at the level of architecture and measured outcome.
  Never client names, client data, or personal data — `gestor-inmuebles` and
  `actas-visitas-obras` both carry third-party material, and `piso-irene` carries
  a real apartment's floor plan.
- `limits` is not optional padding. Every project has something it does not
  claim, and saying so is what makes the rest credible.
