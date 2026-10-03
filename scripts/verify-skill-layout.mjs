#!/usr/bin/env node
/**
 * Geometry tests for the radial skill layout. The layout is pure arithmetic, so
 * these checks are about the picture it draws: same input, same picture; every
 * disc inside the canvas; and no two discs touching — at desktop and phone
 * sizes alike, because a layout that only works at one width is not a layout.
 *
 * The constants and the sector formula are imported from the module itself, so
 * the verifier can never drift from the geometry it is checking.
 *
 * Run with type stripping so the TypeScript module loads directly:
 *   pnpm test:skill-layout
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MIN_SECTOR_SPAN,
  minimumGap,
  placeLabels,
  radialLayout,
  radiusFor,
  SECTOR_GAP,
} from '../src/components/islands/skillGraph/layout.ts';

const here = dirname(fileURLToPath(import.meta.url));
const graph = JSON.parse(
  readFileSync(join(here, '..', 'src', 'content', 'skills', 'graph.json'), 'utf8'),
)[0];

const failures = [];
const check = (ok, label, detail = '') => {
  if (ok) console.log(`ok   ${label}`);
  else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};
const info = (label, detail) => console.log(`     ${label}: ${detail}`);

const SIZES = [
  { name: '900x520', width: 900, height: 520 },
  { name: '390x600', width: 390, height: 600 },
];
/* The stage shapes the map actually renders at: full desktop and the 900x520
 * reference. The fill assertion below exists because ring placement used to
 * stop at the last radius that fit the ring step, leaving a big canvas with a
 * small map in the middle and an empty rim. */
const FILL_SIZES = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '900x520', width: 900, height: 520 },
];
const areas = graph.areas.map((area) => area.id);
const areaLabels = new Map(graph.areas.map((area) => [area.id, area.label.es]));

/* ------------------------------------------------------------- the dataset */

check(graph.nodes.length === 93, 'graph: 93 nodes', `found ${graph.nodes.length}`);
check(graph.areas.length === 5, 'graph: 5 areas', `found ${graph.areas.length}`);

for (const { name, width, height } of SIZES) {
  const input = graph.nodes.map((node) => ({ ...node }));
  const first = radialLayout(input, { width, height, areas });
  const second = radialLayout(input, { width, height, areas });

  /* ----------------------------------------------------------- determinism */
  const identical = first.every((node, i) => {
    const other = second[i];
    return (
      node.x === other.x && node.y === other.y && node.cx === other.cx && node.cy === other.cy
    );
  });
  check(identical, `${name}: determinism — two runs are identical`);

  /* ----------------------------------------------------------------- order */
  check(
    first.every((node, i) => node.id === input[i].id),
    `${name}: output preserves input order`,
  );

  /* ---------------------------------------------------------------- bounds */
  const outside = first.filter((node) => {
    const r = radiusFor(node.weight);
    return (
      node.x < r ||
      node.x > width - r ||
      node.y < r ||
      node.y > height - r ||
      node.cx < 0 ||
      node.cx > width ||
      node.cy < 0 ||
      node.cy > height
    );
  });
  check(outside.length === 0, `${name}: every node and hub inside canvas bounds`, `${outside.length} outside`);

  /* -------------------------------------------------------------- no overlap */
  const gap = minimumGap(first);
  check(gap > 0, `${name}: no two node discs overlap`, `minimumGap ${gap.toFixed(3)}px`);
  info(`${name} measured minimumGap`, `${gap.toFixed(3)}px`);

  /* ------------------------------------------------------------------ hubs */
  // The hub of area i sits at its sector's mid-angle at HUB_FRACTION * R; the
  // sector spans are recomputed here from the documented formula so the check
  // is against the spec, not against a value the layout happened to emit.
  // The hub of area i sits at its sector's mid-angle at HUB_FRACTION * R; the
  // sector spans are recomputed here from the documented formula — proportional
  // to node counts, with MIN_SECTOR_SPAN enforced for non-empty areas — so the
  // check is against the spec, not against a value the layout happened to emit.
  const R = Math.min(width, height) / 2 - 18;
  const hubRadius = 0.3 * R;
  const counts = new Map(areas.map((id) => [id, 0]));
  for (const node of first) counts.set(node.area, (counts.get(node.area) ?? 0) + 1);
  const usable = 2 * Math.PI - areas.length * SECTOR_GAP;
  const orderedCounts = areas.map((id) => counts.get(id) ?? 0);
  const spans = orderedCounts.map((count) => (first.length > 0 ? (usable * count) / first.length : 0));
  for (let pass = 0; pass < spans.length; pass += 1) {
    let deficit = 0;
    let surplus = 0;
    for (let i = 0; i < spans.length; i += 1) {
      const floor = orderedCounts[i] > 0 ? MIN_SECTOR_SPAN : 0;
      if (spans[i] < floor - 1e-12) deficit += floor - spans[i];
      else surplus += spans[i] - floor;
    }
    if (deficit <= 1e-12 || surplus <= 1e-12) break;
    const take = deficit / surplus;
    for (let i = 0; i < spans.length; i += 1) {
      const floor = orderedCounts[i] > 0 ? MIN_SECTOR_SPAN : 0;
      spans[i] = spans[i] < floor - 1e-12 ? floor : floor + (spans[i] - floor) * (1 - take);
    }
  }
  let cursor = -Math.PI / 2;
  const sectors = areas.map((id, i) => {
    const start = cursor + SECTOR_GAP;
    cursor = start + spans[i];
    return { id, start, end: start + spans[i] };
  });
  const narrow = sectors.filter(
    (sector, i) => orderedCounts[i] > 0 && sector.end - sector.start < MIN_SECTOR_SPAN - 1e-9,
  );
  check(
    narrow.length === 0,
    `${name}: every non-empty area keeps the minimum angular span`,
    narrow.map((s) => s.id).join(', '),
  );
  for (const sector of sectors) {
    info(`${name} area ${sector.id} span`, `${(((sector.end - sector.start) * 180) / Math.PI).toFixed(1)}°`);
  }

  const byArea = new Map();
  for (const node of first) {
    if (!byArea.has(node.area)) byArea.set(node.area, []);
    byArea.get(node.area).push(node);
  }
  const hubs = areas.map((id) => {
    const [hub] = byArea.get(id);
    return { id, x: hub.cx, y: hub.cy };
  });
  const distinct = new Set(hubs.map((hub) => `${hub.x},${hub.y}`)).size === hubs.length;
  check(distinct, `${name}: the five hubs are pairwise distinct`);
  const centreDistance = Math.min(
    ...hubs.map((hub) => Math.hypot(hub.x - width / 2, hub.y - height / 2)),
  );
  check(centreDistance > 0, `${name}: every hub off the centre`, `${centreDistance.toFixed(1)}px`);
  const misfiled = hubs.filter((hub) => {
    const sector = sectors.find((s) => s.id === hub.id);
    let angle = Math.atan2(hub.y - height / 2, hub.x - width / 2);
    while (angle < sector.start) angle += 2 * Math.PI;
    return angle > sector.end + 1e-9;
  });
  check(misfiled.length === 0, `${name}: each hub inside its own sector's angular range`);

  for (const sector of sectors) {
    const nodes = byArea.get(sector.id) ?? [];
    const hub = hubs.find((h) => h.id === sector.id);
    const hubAngleDeg = ((((Math.atan2(hub.y - height / 2, hub.x - width / 2) + 2.5 * Math.PI) % (2 * Math.PI)) - Math.PI / 2) * 180) / Math.PI;
    info(`${name} area ${sector.id}`, `${nodes.length} nodes, hub angle ${hubAngleDeg.toFixed(1)}° from top, clockwise`);
  }

  /* -------------------------------------------------------- weight ordering */
  for (const sector of sectors) {
    const nodes = byArea.get(sector.id) ?? [];
    const hub = hubs.find((h) => h.id === sector.id);
    let nearest = null;
    let farthest = null;
    for (const node of nodes) {
      const d = Math.hypot(node.x - hub.x, node.y - hub.y);
      if (!nearest || d < nearest.d) nearest = { d, weight: node.weight, id: node.id };
      if (!farthest || d > farthest.d) farthest = { d, weight: node.weight, id: node.id };
    }
    check(
      nearest.weight >= farthest.weight,
      `${name}: ${sector.id} — node nearest the hub is at least as heavy as the farthest`,
      `nearest ${nearest.id} (${nearest.weight}) vs farthest ${farthest.id} (${farthest.weight})`,
    );
  }
}

/* --------------------------------------------- the stage is filled (defect 1) */

for (const { name, width, height } of FILL_SIZES) {
  const input = graph.nodes.map((node) => ({ ...node }));
  const placed = radialLayout(input, { width, height, areas });
  const R = Math.min(width, height) / 2 - 18;
  const maxR = Math.max(...placed.map((node) => Math.hypot(node.x - width / 2, node.y - height / 2)));
  check(
    maxR >= 0.9 * R,
    `${name}: the map fills the stage`,
    `maxR ${maxR.toFixed(1)}px of R ${R.toFixed(1)}px`,
  );
  info(`${name} fill ratio (maxR / R)`, (maxR / R).toFixed(3));
}

/* ---------------------------------------------------- labels fit (defects 2 and 3) */

for (const { name, width, height } of FILL_SIZES) {
  const input = graph.nodes.map((node) => ({ ...node }));
  const placed = radialLayout(input, { width, height, areas });
  const hubs = [
    { id: 'core', text: areaLabels.get('core') ?? 'Conocimientos', x: width / 2, y: height / 2 - 18 },
    ...areas.map((id) => {
      const hub = placed.find((node) => node.area === id);
      return { id: `area:${id}`, text: areaLabels.get(id) ?? id, x: hub.cx, y: hub.cy - 14 };
    }),
  ];
  const run = (labelIds) =>
    placeLabels(placed, { width, height, hubs, labelIds });

  // Worst case first: every node wants a label. The invariants must hold no
  // matter how many candidates there are.
  const everyone = run(placed.map((node) => node.id));
  // The island's default policy: only the strong skills are labelled.
  const strong = run(placed.filter((node) => node.weight >= 0.82).map((node) => node.id));

  for (const [policy, labels] of [['every node', everyone], ['strong only (island policy)', strong]]) {
    const nodeLabels = labels.filter((label) => !label.hub);
    const hubLabels = labels.filter((label) => label.hub);

    const overlapping = [];
    for (let i = 0; i < labels.length; i += 1) {
      for (let j = i + 1; j < labels.length; j += 1) {
        const a = labels[i].box;
        const b = labels[j].box;
        if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) {
          overlapping.push(`${labels[i].id} × ${labels[j].id}`);
        }
      }
    }
    check(
      overlapping.length === 0,
      `${name} labels (${policy}): no two label boxes overlap`,
      overlapping.slice(0, 4).join(', '),
    );

    const onDiscs = nodeLabels.filter((label) =>
      placed.some((node) => {
        const r = radiusFor(node.weight);
        const nx = Math.min(Math.max(node.x, label.box.left), label.box.right);
        const ny = Math.min(Math.max(node.y, label.box.top), label.box.bottom);
        return (node.x - nx) ** 2 + (node.y - ny) ** 2 < r * r;
      }),
    );
    check(
      onDiscs.length === 0,
      `${name} labels (${policy}): no label box covers a node disc`,
      onDiscs.map((label) => label.id).join(', '),
    );

    const outside = labels.filter(
      (label) =>
        label.box.left < 0 ||
        label.box.right > width ||
        label.box.top < 0 ||
        label.box.bottom > height,
    );
    check(
      outside.length === 0,
      `${name} labels (${policy}): every label box is inside the canvas`,
      outside.map((label) => label.id).join(', '),
    );

    check(
      hubLabels.length === hubs.length,
      `${name} labels (${policy}): the core and the five area hubs are all labelled`,
      `${hubLabels.length} of ${hubs.length}`,
    );

    info(`${name} labels placed (${policy})`, `${nodeLabels.length} node + ${hubLabels.length} hub`);
  }

  const again = run(placed.map((node) => node.id));
  check(
    JSON.stringify(everyone) === JSON.stringify(again),
    `${name} labels: two runs are identical`,
  );
}

/* ------------------------------------------------- synthetic, not tuned data */

const synthetic = (counts) => {
  let n = 0;
  return counts.flatMap((count, i) =>
    Array.from({ length: count }, () => ({
      id: `s${(n += 1)}`,
      label: `s${n}`,
      area: `a${i}`,
      weight: 1,
      note: '',
      projects: [],
    })),
  );
};

const syntheticCases = [
  { name: '1 area, 3 nodes', counts: [3] },
  { name: '2 areas of 20 and 2', counts: [20, 2] },
];
for (const { name, counts } of syntheticCases) {
  const nodes = synthetic(counts);
  const syntheticAreas = counts.map((_, i) => `a${i}`);
  for (const { name: size, width, height } of SIZES) {
    const out = radialLayout(nodes, { width, height, areas: syntheticAreas });
    const gap = minimumGap(out);
    check(gap > 0, `synthetic ${name} @ ${size}: no overlap`, `minimumGap ${gap.toFixed(3)}px`);
    info(`synthetic ${name} @ ${size} measured minimumGap`, `${gap.toFixed(3)}px`);
  }
}

/* ------------------------------------------------------------------- report */

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('\nAll skill-layout geometry checks passed.');
