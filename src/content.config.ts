/**
 * Content collections.
 *
 * Content is validated at build time, so a missing or misspelled field fails the
 * build instead of quietly rendering an empty section. That is the whole reason
 * these collections exist: the previous site kept its content in unvalidated YAML
 * and drifted two years out of date without anyone noticing.
 *
 * Beyond shape, the schemas enforce a few invariants that matter in production:
 *
 *   - a project marked `public` must link its repository, and a project marked
 *     `case-study` must NOT (its repository is private, so a link would be a 404
 *     for the visitor this site exists for)
 *   - every skill-graph edge must reference nodes that exist, and node ids must be
 *     unique, because a dangling edge renders as a silently missing connection
 *
 * Locale handling: entries are paired by filename suffix, `foo.es.md` and
 * `foo.en.md`, and both carry the same `slug`. Keeping the pair adjacent in the
 * tree is what makes it obvious when one translation is missing.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* ------------------------------------------------------------------ shared */

const locale = z.enum(['es', 'en']);
const localized = z.object({ es: z.string().min(1), en: z.string().min(1) });
const isoMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'expected a YYYY-MM month');
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'expected a lowercase kebab-case slug');

/**
 * Loader for the four bilingual collections.
 *
 * The glob loader strips the whole extension chain by default, so `foo.es.md` and
 * `foo.en.md` both became the id `foo` and one silently overwrote the other. The
 * symptom was a build that generated fifteen case-study pages instead of thirty,
 * with the locale split varying between runs, because the winner of each collision
 * depended on iteration order. `generateId` strips only the final extension, which
 * keeps the locale in the id and makes the pairing real.
 */
const bilingualLoader = (base: string) =>
  glob({
    base,
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/i, ''),
  });

/* ---------------------------------------------------------------- projects */

/**
 * Metric and headline values are display text, not arithmetic. YAML turns an
 * unquoted `452` into a number, so accept both and normalise: the alternative is
 * remembering to quote every numeric-looking value by hand, which is exactly the
 * kind of rule that gets broken six months later.
 */
const displayValue = z.union([z.string(), z.number()]).transform((value) => String(value));

const metrics = z.object({
  value: displayValue,
  label: z.string().min(1),
  /**
   * How much weight this number can carry, and the reason the field exists.
   *   artifact   a committed file in the project contains this number
   *   measured   produced by running the project; reproducible but not committed
   *   record     an administrative or academic record: a grade, a certificate, a
   *              competitive selection. Checkable, but not by running anything
   *   target     a goal, a gate, or a contractual threshold — NOT a result
   *   unverified stated in the project's own notes, not independently checkable
   * The layout renders `target` and `unverified` differently on purpose. A target
   * presented as a result is the fastest way to lose an interview.
   */
  basis: z.enum(['artifact', 'measured', 'record', 'target', 'unverified']).default('measured'),
  /** Where the number came from, so a reader can go and check it. */
  source: z.string().optional(),
});

const projects = defineCollection({
  loader: bilingualLoader('./src/content/projects'),
  schema: z
    .object({
      locale,
      slug,
      title: z.string().min(2),
      /** One line for the card. Anything longer will be cut by the layout. */
      summary: z.string().min(10).max(220),
      role: z.string().min(2),
      period: z.string().min(4),
      year: z.number().int().min(2019).max(2100),
      /** Lower sorts first. Unique ordering is asserted by the page, not here. */
      order: z.number().int(),
      status: z.enum(['shipped', 'in-progress', 'research']),
      /**
       * Drives whether a repository link may exist at all. See the refine below.
       */
      visibility: z.enum(['public', 'case-study', 'demo-only']),
      featured: z.boolean().default(false),
      /** Which token tints the plate. Themes stay in control of the value. */
      accent: z.enum(['accent', 'accent-2', 'accent-3']).default('accent'),
      /**
       * Present when the work was not solo. Contributions are stated explicitly so
       * a team project is never presented as individual work.
       */
      team: z
        .object({
          name: z.string().min(1),
          size: z.number().int().min(2).optional(),
          /** Exactly what he owned, in his own terms. */
          contribution: z.string().min(10),
        })
        .optional(),
      /** Subject areas: credit-risk, telemetry, llm-ops, computer-vision, ... */
      domains: z.array(z.string().min(2)).min(1),
      stack: z.array(z.string().min(1)).min(1),
      metrics: z.array(metrics).default([]),
      /** What is actually interesting. Not a feature list. */
      highlights: z.array(z.string().min(10)).min(1),
      /** What the author would not claim. Renders as an honest-limits block. */
      limits: z.array(z.string().min(10)).default([]),
      links: z
        .object({
          repo: z.url().optional(),
          demo: z.url().optional(),
          writeup: z.url().optional(),
        })
        .default({}),
      /**
       * Screenshots, by key rather than by path. `file` is resolved against
       * `src/assets/projects/` by `src/lib/projectImages.ts`, which throws at build time
       * when a key resolves to nothing; a path in frontmatter would render a broken image
       * instead. Alt text is required: an unexplained screenshot is decoration.
       */
      images: z
        .array(
          z.object({
            file: z.string().min(1),
            alt: z.string().min(10),
            caption: z.string().optional(),
          }),
        )
        .default([]),
      /** Explains a case study with no link, in one line, on the card. */
      confidentiality: z.string().optional(),
    })
    .refine(
      (entry) => entry.visibility !== 'public' || Boolean(entry.links.repo),
      {
        message: 'a project marked `public` must include links.repo',
        path: ['links', 'repo'],
      },
    )
    .refine(
      (entry) => entry.visibility !== 'case-study' || !entry.links.repo,
      {
        message:
          'a project marked `case-study` must not link a repository: it is private, and the link would 404',
        path: ['links', 'repo'],
      },
    )
    .refine((entry) => entry.visibility !== 'demo-only' || Boolean(entry.links.demo), {
      message: 'a project marked `demo-only` must include links.demo',
      path: ['links', 'demo'],
    }),
});

/* -------------------------------------------------------------- experience */

const experience = defineCollection({
  loader: bilingualLoader('./src/content/experience'),
  schema: z
    .object({
      locale,
      order: z.number().int(),
      title: z.string().min(2),
      organisation: z.string().min(2),
      location: z.string().optional(),
      /** Contract type, so a recruiter can read the shape of the track record. */
      employment: z.enum(['full-time', 'freelance', 'contract', 'internship']),
      period: z.string().min(4),
      start: isoMonth,
      end: z.union([isoMonth, z.literal('present')]),
      summary: z.string().min(20),
      responsibilities: z.array(z.string().min(10)).min(1),
      stack: z.array(z.string().min(1)).default([]),
      /** Which token tints the timeline entry. Keeps themes in control. */
      accent: z.enum(['accent', 'accent-2', 'accent-3']).default('accent'),
      /** Rendered as a small "under audit" style note when true. */
      regulated: z.boolean().default(false),
    }),
  /*
   * The first version of this schema asserted that exactly one entry could be
   * current, which is wrong about the domain: a salaried role and a freelance
   * practice run at the same time, and so does a role held while studying. A schema
   * that cannot describe the truth is a schema that gets worked around.
   *
   * "At least one entry is current" is a cross-entry invariant that a per-entry
   * schema cannot express, so the section asserts it instead.
   */
});

/* --------------------------------------------------------------- education */

const education = defineCollection({
  loader: bilingualLoader('./src/content/education'),
  schema: z.object({
    locale,
    order: z.number().int(),
    title: z.string().min(2),
    institution: z.string().min(2),
    kind: z.enum(['degree', 'master', 'certification', 'language']),
    period: z.string().min(4),
    start: isoMonth,
    end: z.union([isoMonth, z.literal('present')]),
    /** "9.9 / 10", "8.59 / 10", "C2". Free text because scales differ. */
    grade: z.string().optional(),
    summary: z.string().min(20),
    highlights: z.array(z.string().min(4)).default([]),
    credential: z.url().optional(),
  }),
});

/* ------------------------------------------------------------- skill graph */

const AREAS = ['math', 'cs', 'ds', 'tools', 'lang'] as const;

const skillsGraph = defineCollection({
  // The `file` loader turns each element of a JSON array into one entry, so the
  // graph is wrapped as a single `{ id: "graph", ... }` object.
  loader: file('./src/content/skills/graph.json'),
  schema: z
    .object({
      id: z.string(),
      /*
       * Authored and frozen on purpose. Deriving it from `max(content dates)`
       * would make the map incapable of ever reporting staleness: the newest
       * project would always define "now", so nothing could ever drift out of
       * the current band. Staleness only exists if the reference point is a
       * human decision to re-review the map.
       */
      asOf: isoMonth,
      areas: z
        .array(
          z.object({
            id: z.enum(AREAS),
            label: localized,
            blurb: localized,
          }),
        )
        .min(1),
      nodes: z
        .array(
          z.object({
            id: slug,
            label: z.string().min(1),
            area: z.enum(AREAS),
            /** 0-1. Drives node radius and edge weight, not a "rating". */
            weight: z.number().min(0).max(1),
            note: localized,
            /** Slugs of the projects where this was actually used. */
            projects: z.array(slug).default([]),
            /** Public course titles supporting academic knowledge. */
            courses: z.array(z.object({ title: z.string().min(2), program: z.enum(['degree', 'master']) })).default([]),
          }),
        )
        .min(1),
      edges: z
        .array(
          z.object({
            from: slug,
            to: slug,
            kind: z.enum(['applies', 'uses', 'extends', 'pairs']),
          }),
        )
        .default([]),
    })
    .superRefine((graph, ctx) => {
      const nodeIds = new Set<string>();
      graph.nodes.forEach((node, index) => {
        if (nodeIds.has(node.id)) {
          ctx.addIssue({
            code: 'custom',
            message: `duplicate node id "${node.id}"`,
            path: ['nodes', index, 'id'],
          });
        }
        nodeIds.add(node.id);
      });

      const areaIds = new Set<string>();
      graph.areas.forEach((area, index) => {
        if (areaIds.has(area.id)) {
          ctx.addIssue({
            code: 'custom',
            message: `duplicate area id "${area.id}"`,
            path: ['areas', index, 'id'],
          });
        }
        areaIds.add(area.id);
      });

      graph.nodes.forEach((node, index) => {
        if (!areaIds.has(node.area)) {
          ctx.addIssue({
            code: 'custom',
            message: `node "${node.id}" references unknown area "${node.area}"`,
            path: ['nodes', index, 'area'],
          });
        }
      });

      // A dangling edge renders as a silently missing connection, which is the
      // worst kind of bug in a graph: it looks like there is nothing to see.
      graph.edges.forEach((edge, index) => {
        for (const end of ['from', 'to'] as const) {
          if (!nodeIds.has(edge[end])) {
            ctx.addIssue({
              code: 'custom',
              message: `edge ${index} references unknown node "${edge[end]}"`,
              path: ['edges', index, end],
            });
          }
        }
        if (edge.from === edge.to) {
          ctx.addIssue({
            code: 'custom',
            message: `edge ${index} is a self-loop on "${edge.from}"`,
            path: ['edges', index],
          });
        }
      });
    }),
});

/* ------------------------------------------------------ highlights ==== */

/**
 * Recognitions that are neither a job nor a degree: competitive programmes,
 * hackathons, awards, publications. Rendered as a compact high-signal band.
 */
const highlights = defineCollection({
  loader: bilingualLoader('./src/content/highlights'),
  schema: z.object({
    locale,
    order: z.number().int(),
    kind: z.enum(['program', 'competition', 'award', 'publication', 'contribution']),
    title: z.string().min(2),
    issuer: z.string().min(2),
    period: z.string().min(4),
    /** The single number worth remembering, when there is one. */
    headline: z
      .object({
        value: displayValue,
        label: z.string().min(1),
        basis: z.enum(['artifact', 'measured', 'record', 'target', 'unverified']).default('measured'),
        source: z.string().optional(),
      })
      .optional(),
    /** What it was, in one or two sentences, first person. */
    summary: z.string().min(40),
    /** Required given how many highlights are team based. */
    contribution: z.string().min(20).optional(),
    /** What he would not claim. Same contract as projects. */
    limits: z.array(z.string().min(10)).default([]),
    links: z
      .object({ url: z.url().optional(), label: z.string().optional() })
      .default({}),
  }),
});

/* ------------------------------------------------------ interests and now */

const site = defineCollection({
  /*
   * One file, both locales, as an array of entries with ids — the same pattern the
   * skill graph uses. Pairing the locales inside a single file makes it impossible
   * for one language to gain an interest the other is missing.
   */
  loader: file('./src/content/site/site.json'),
  schema: z.object({
    locale,
    /**
     * Stable interests, grouped. No dates, nothing to maintain, nothing to go
     * stale: this is what makes the site belong to a person.
     */
    interests: z
      .array(
        z.object({
          group: z.string().min(2),
          items: z.array(z.string().min(1)).min(1),
        }),
      )
      .min(1),
    /**
     * What is on the desk right now. Explicitly optional: an empty array is a
     * supported state, because a stale "now" block is worse than none.
     */
    now: z
      .array(
        z.object({
          kind: z.enum(['game', 'book', 'series', 'film', 'course']),
          title: z.string().min(1),
          note: z.string().optional(),
          progress: z.string().optional(),
          link: z.url().optional(),
        }),
      )
      .default([]),
    /** Shown next to the block so the reader can judge how current it is. */
    nowUpdated: isoMonth.optional(),
  }),
});

export const collections = { projects, experience, education, skillsGraph, highlights, site };
