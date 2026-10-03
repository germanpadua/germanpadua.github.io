/**
 * Content accessors.
 *
 * Every section reads through here rather than calling `getCollection` directly,
 * so sorting and locale filtering happen in exactly one place. Astro's collection
 * order is not deterministic across platforms, so anything that renders as a list
 * is sorted explicitly.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/ui';

/** Collections whose entries are ordered by a numeric `order` field. */
type OrderedCollection = 'experience' | 'education' | 'highlights' | 'projects';

/**
 * `K extends OrderedCollection` rather than a union parameter: passing the union
 * directly collapses the return type into a union of every collection's entries,
 * which then fails at the call site with errors about properties that "do not
 * exist" on a type that is actually four types.
 */
async function sorted<K extends OrderedCollection>(
  collection: K,
  locale: Locale,
): Promise<CollectionEntry<K>[]> {
  const entries = await getCollection(collection, ({ data }) => data.locale === locale);
  return [...entries].sort((a, b) => a.data.order - b.data.order);
}

export const getExperience = (locale: Locale) => sorted('experience', locale);
export const getEducation = (locale: Locale) => sorted('education', locale);
export const getHighlights = (locale: Locale) => sorted('highlights', locale);
export const getProjects = (locale: Locale) => sorted('projects', locale);

export async function getFeaturedProjects(locale: Locale) {
  return (await getProjects(locale)).filter((entry) => entry.data.featured);
}

export async function getSupportingProjects(locale: Locale) {
  return (await getProjects(locale)).filter((entry) => !entry.data.featured);
}

export async function getProject(locale: Locale, slug: string) {
  const entries = await getCollection(
    'projects',
    ({ data }) => data.locale === locale && data.slug === slug,
  );
  // Destructure first: `noUncheckedIndexedAccess` means a length check does not
  // narrow `entries[0]`, so the guard has to be on the value itself.
  const [entry] = entries;
  if (!entry || entries.length !== 1) {
    throw new Error(
      `expected exactly one ${locale} project with slug "${slug}", found ${entries.length}`,
    );
  }
  return entry;
}

/**
 * `noUncheckedIndexedAccess` is on, so indexed access yields `T | undefined`.
 * These two collections are singletons by construction; asserting that here keeps
 * the check honest instead of silencing it with a non-null assertion at each site.
 */
export async function getSite(locale: Locale) {
  const entries = await getCollection('site', ({ data }) => data.locale === locale);
  const [entry] = entries;
  if (!entry || entries.length !== 1) {
    throw new Error(`expected exactly one site entry for locale ${locale}, found ${entries.length}`);
  }
  return entry.data;
}

export async function getSkillGraph() {
  const entries = await getCollection('skillsGraph');
  const [entry] = entries;
  if (!entry || entries.length !== 1) {
    throw new Error(`expected exactly one skill graph entry, found ${entries.length}`);
  }
  return entry.data;
}

/* ------------------------------------------------------------------ routes */

export const projectsIndexPath = (locale: Locale): string =>
  locale === 'en' ? '/en/projects/' : '/proyectos/';

export const projectPath = (locale: Locale, slug: string): string =>
  locale === 'en' ? `/en/projects/${slug}/` : `/proyectos/${slug}/`;

export const skillMapPath = (locale: Locale): string => (locale === 'es' ? '/mapa/' : '/en/map/');

/* ------------------------------------------------------------- provenance */

export type MetricBasis = 'artifact' | 'measured' | 'record' | 'target' | 'unverified';

/**
 * A number that cannot be traced is a liability. `target` and `unverified` are
 * rendered differently on purpose: a goal presented as a result is the fastest way
 * to lose an interview, and the point of carrying the field through to the markup
 * is that the reader gets to decide how much weight to give it.
 */
export const basisIsResult = (basis: MetricBasis): boolean =>
  basis === 'artifact' || basis === 'measured' || basis === 'record';
