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
 *   - a job marked current must have `end: present`, and vice versa
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

/* ---------------------------------------------------------------- projects */

const metrics = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  /** Where the number came from, so a reader can judge it. */
  source: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
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
      cover: z
        .object({
          src: z.string().min(1),
          alt: z.string().min(4),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
        })
        .optional(),
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
  loader: glob({ base: './src/content/experience', pattern: '**/*.{md,mdx}' }),
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
    })
    .refine((entry) => (entry.end === 'present') === (entry.order === 0), {
      message:
        'only the entry with order 0 is the current role, so `end: present` must appear exactly there',
      path: ['end'],
    }),
});

/* --------------------------------------------------------------- education */

const education = defineCollection({
  loader: glob({ base: './src/content/education', pattern: '**/*.{md,mdx}' }),
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

/* ------------------------------------------------------ interests and "now" */

const site = defineCollection({
  loader: glob({ base: './src/content/site', pattern: '**/*.json' }),
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

export const collections = { projects, experience, education, skillsGraph, site };
