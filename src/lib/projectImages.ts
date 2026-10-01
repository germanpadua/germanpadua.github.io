/**
 * Project images.
 *
 * Content frontmatter stores a short `file` key, not a path, and this module resolves it
 * against `src/assets/projects/`. Two reasons:
 *
 *   1. `src/assets` is the only place Astro will optimise from. An image in `public/` is
 *      copied as-is, so a 1.8 MB PNG stays 1.8 MB and the reader pays for it.
 *   2. A key that resolves to nothing throws at build time. A path in frontmatter would
 *      happily point at a missing file and render a broken image, which is precisely the
 *      failure that only shows up in a browser nobody runs the tests in.
 */
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/projects/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },
);

const byFile = new Map<string, ImageMetadata>();
for (const [path, module] of Object.entries(modules)) {
  const base = (path.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
  if (base) byFile.set(base, module.default);
}

export const projectImageKeys = (): string[] => [...byFile.keys()].sort();

export function projectImage(file: string): ImageMetadata {
  const image = byFile.get(file);
  if (!image) {
    throw new Error(
      `no image "${file}" in src/assets/projects/. Available keys: ${projectImageKeys().join(', ')}`,
    );
  }
  return image;
}
