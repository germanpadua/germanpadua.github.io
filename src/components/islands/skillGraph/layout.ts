/**
 * Layout for the skill graph.
 *
 * A pure module with no DOM and no canvas: the radial geometry lives here so it
 * can be verified without a browser (`scripts/verify-skill-layout.mjs`), and so
 * the renderer cannot quietly grow placement rules of its own.
 *
 * Determinism matters here. A layout that reshuffles between builds makes
 * screenshot review useless, and it makes "the graph looks wrong" impossible to
 * reproduce: the same data must always draw the same picture.
 *
 * The island runs `radialLayout` exactly once per (data, canvas size, area-id
 * set) — never on hover, selection or filtering. That rule predates this
 * geometry: an earlier force simulation was being recomputed sixty times a
 * second because the draw function leaked into the layout effect's dependency
 * list. The simulation is gone, but the rule stays, because the reason behind
 * it did not change with the maths: positions belong to the layout, and a
 * filter narrows what is drawn, never where a node sits. A static disc also
 * needs no animation loop — a repaint on state change is enough.
 */

export interface GraphNode {
  id: string;
  label: string;
  area: string;
  /** 0-1. Drives disc radius and, through the level rules, the node's ring. */
  weight: number;
  note: string;
  projects: string[];
  courses?: { title: string; program: "degree" | "master" }[];
}

export interface GraphEdge {
  from: string;
  to: string;
  kind: 'applies' | 'uses' | 'extends' | 'pairs';
}

export interface SimNode extends GraphNode {
  x: number;
  y: number;
  /** Area hub: the anchor the sector geometry places this node around. */
  cx: number;
  cy: number;
}

/*
 * Radial layout.
 *
 * The geometry, in one place: the canvas is treated as a disc of radius R
 * centred on the canvas centre (a circle, not an ellipse — an ellipse breaks
 * the uniform-spacing guarantee below). The areas split the disc into angular
 * sectors proportional to their node counts, each preceded by a fixed gap; the
 * hub of an area sits at its sector's mid-angle, at a fixed fraction of R.
 * Inside a sector, the nodes fill concentric rings outward from the hub, the
 * heaviest skills on the innermost ring.
 *
 * The placement is collision-free by construction, not by simulation:
 *
 * - Within a ring, capacity is `floor(span * r / SPACING)`, so the arc between
 *   neighbouring nodes is at least SPACING = 2 * MAX_RADIUS + MIN_GAP, which
 *   covers the worst possible pair of disc radii with room to spare.
 * - Between consecutive rings the radial distance is RING_STEP = SPACING, so
 *   even two nodes at the same angle cannot touch.
 * - At each sector edge a node keeps at least half of its ring's angular step,
 *   and the sector gap covers the rest, so neighbouring sectors stay apart.
 *
 * When a small canvas cannot fit an area at that spacing, capacity is grown
 * rather than the nodes pushed outside the disc: first the safety cushion is
 * dropped (spacing = 2 * MAX_RADIUS, still covering the worst pair), and only
 * then are extra slots added to whichever ring keeps the largest resulting
 * arc gap. A node never lands outside the disc.
 *
 * Two refinements keep the disc honest and the labels legible:
 *
 * - Sector spans are proportional to node counts, but no area with nodes is
 *   allowed below MIN_SECTOR_SPAN: a three-node area under a purely
 *   proportional split would cram its nodes (and their labels) onto nearly
 *   the same angle. The extra space is taken proportionally from the areas
 *   above the minimum, which have it to spare.
 * - Ring placement fills only the radii that fit the ring step, so on a wide
 *   canvas the map would otherwise huddle in the middle and leave the stage
 *   empty. After placement, every node and hub is scaled about the canvas
 *   centre by `max(1, R / maxR)` so the outermost node lands on the disc rim:
 *   a uniform scale only grows every distance, so the no-overlap guarantee
 *   above is preserved, and the result is clamped back inside the bounds.
 *
 * Everything is pure arithmetic on the input: no Math.random, no clock, no
 * module state, and every sort breaks ties on id. Screenshot review of this
 * map is only worth anything if the same data always draws the same picture.
 */

export const PAD = 18;
export const SECTOR_GAP = 0.16;
export const HUB_FRACTION = 0.3;
export const MIN_GAP = 4;
/** Largest disc the renderer can draw (weight 1). */
export const MAX_RADIUS = radiusFor(1);
/** Worst-case centre distance any pair of discs needs, cushion included. */
export const SPACING = 2 * MAX_RADIUS + MIN_GAP;
/** Node label box height: 13px text plus padding, drawn with a `top` baseline. */
export const LABEL_HEIGHT = 19;
/**
 * Radial distance between consecutive rings. A node label hangs a few pixels
 * below its disc and is LABEL_HEIGHT tall, so the step has to cover two discs
 * plus a label plus the minimum gap — otherwise a perfectly well-spaced pair
 * of labels still collides with the disc on the next ring.
 */
export const RING_STEP = 2 * MAX_RADIUS + LABEL_HEIGHT + MIN_GAP;
/** No area that has nodes may get a narrower sector than this (radians). */
export const MIN_SECTOR_SPAN = 0.42;
/** Spacing with the cushion dropped: still covers two max-radius discs. */
const SPACING_TIGHT = 2 * MAX_RADIUS;

export interface RadialLayoutOptions {
  width: number;
  height: number;
  /** Area ids in fixed order (the order they appear in graph.json). */
  areas: readonly string[];
}

/**
 * Sector spans in radians, one per area, in the given order: proportional to
 * node counts, then with MIN_SECTOR_SPAN enforced for every area that has
 * nodes. The extra space is taken proportionally from the areas above the
 * floor; an area at or below the floor never gives space back. Deterministic
 * and independent of iteration order, like the rest of the module.
 */
export function sectorSpans(counts: readonly number[], usable: number, total: number): number[] {
  const spans = counts.map((count) => (total > 0 ? (usable * count) / total : 0));
  const floorFor = (i: number) => (counts[i]! > 0 ? MIN_SECTOR_SPAN : 0);
  for (let pass = 0; pass < counts.length; pass += 1) {
    let deficit = 0;
    let surplus = 0;
    for (let i = 0; i < spans.length; i += 1) {
      const floor = floorFor(i);
      if (spans[i]! < floor - 1e-12) deficit += floor - spans[i]!;
      else surplus += spans[i]! - floor;
    }
    if (deficit <= 1e-12 || surplus <= 1e-12) break;
    const take = deficit / surplus;
    for (let i = 0; i < spans.length; i += 1) {
      const floor = floorFor(i);
      spans[i] = spans[i]! < floor - 1e-12 ? floor : floor + (spans[i]! - floor) * (1 - take);
    }
  }
  return spans;
}

/**
 * Place every node on its area's rings. Same length and same order as the
 * input; `cx`/`cy` carry the area hub (the island already treats them as the
 * area anchor).
 */
export function radialLayout(
  nodes: readonly GraphNode[],
  options: RadialLayoutOptions,
): SimNode[] {
  const centerX = options.width / 2;
  const centerY = options.height / 2;
  const discRadius = Math.min(options.width, options.height) / 2 - PAD;
  const hubRadius = HUB_FRACTION * discRadius;
  const total = nodes.length;

  // Sectors follow the given area order; an unknown area (data drift) gets a
  // trailing sector instead of a node silently dropped from the map.
  const areaNodes = new Map<string, GraphNode[]>();
  const sectorIds: string[] = [];
  for (const area of options.areas) {
    if (!areaNodes.has(area)) {
      areaNodes.set(area, []);
      sectorIds.push(area);
    }
  }
  for (const node of nodes) {
    const list = areaNodes.get(node.area);
    if (list) list.push(node);
    else {
      areaNodes.set(node.area, [node]);
      sectorIds.push(node.area);
    }
  }

  const usable = 2 * Math.PI - sectorIds.length * SECTOR_GAP;
  const spans = sectorSpans(
    sectorIds.map((id) => areaNodes.get(id)?.length ?? 0),
    usable,
    total,
  );
  let cursor = -Math.PI / 2; // sectors start at the top and run clockwise
  const positions = new Map<GraphNode, { x: number; y: number; cx: number; cy: number }>();

  for (let s = 0; s < sectorIds.length; s += 1) {
    const area = sectorIds[s]!;
    const members = areaNodes.get(area);
    /* c8 ignore next */
    if (!members) continue;
    const span = spans[s] ?? 0;
    const start = cursor + SECTOR_GAP;
    cursor = start + span;

    const midAngle = start + span / 2;
    const hubX = centerX + hubRadius * Math.cos(midAngle);
    const hubY = centerY + hubRadius * Math.sin(midAngle);
    if (members.length === 0) continue;

    // Ring radii, innermost first, clamped inside the disc. On a canvas too
    // small for even one full step there is still exactly one ring, at the rim.
    const ringRadiiFor = (step: number) => {
      const ringCount = Math.max(1, Math.floor((discRadius - hubRadius) / step));
      const radii: number[] = [];
      for (let k = 1; k <= ringCount; k += 1) {
        radii.push(Math.min(hubRadius + k * step, discRadius));
      }
      return radii;
    };
    const capacityFor = (radii: number[], spacing: number) =>
      radii.map((r) => Math.max(1, Math.floor((span * r) / spacing)));
    const sum = (capacities: number[]) => capacities.reduce((a, b) => a + b, 0);

    // The full ring step leaves room for a label between two rings, but disc
    // non-overlap is the hard rule and a small canvas may not offer both. When
    // the sector does not fit at the labelled step, fall back to the dense
    // step; placeLabels then drops any label that would not fit between rings
    // instead of drawing it over a disc.
    let radii = ringRadiiFor(RING_STEP);
    let capacities = capacityFor(radii, SPACING);
    if (sum(capacities) < members.length) {
      capacities = capacityFor(radii, SPACING_TIGHT);
    }
    if (sum(capacities) < members.length) {
      radii = ringRadiiFor(SPACING);
      capacities = capacityFor(radii, SPACING);
      if (sum(capacities) < members.length) {
        capacities = capacityFor(radii, SPACING_TIGHT);
      }
    }
    // Last resort: one extra slot at a time, always on the ring whose next
    // slot keeps the largest arc gap. Deterministic, and never reached by the
    // real data — the verifier would report the overlap if it were.
    while (capacities.reduce((a, b) => a + b, 0) < members.length) {
      let best = 0;
      let bestGap = -1;
      for (let k = 0; k < radii.length; k += 1) {
        const radius = radii[k];
        const capacity = capacities[k];
        /* c8 ignore next */
        if (radius === undefined || capacity === undefined) continue;
        const gap = (span * radius) / (capacity + 1);
        const bestRadius = radii[best] ?? 0;
        const better =
          gap > bestGap + 1e-9 ||
          (gap > bestGap - 1e-9 && (radius > bestRadius || (radius === bestRadius && k < best)));
        if (better) {
          best = k;
          bestGap = gap;
        }
      }
      capacities[best] = (capacities[best] ?? 0) + 1;
    }

    // Heaviest first, ties by id: the innermost ring holds the strongest
    // skills, which is also what the weight-ordering check asserts.
    const sorted = [...members].sort(
      (a, b) => b.weight - a.weight || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );
    let placed = 0;
    for (let k = 0; k < radii.length && placed < sorted.length; k += 1) {
      const count = Math.min(capacities[k] ?? 0, sorted.length - placed);
      if (count <= 0) continue;
      const radius = radii[k];
      /* c8 ignore next */
      if (radius === undefined) continue;
      for (let j = 0; j < count; j += 1) {
        const node = sorted[placed];
        /* c8 ignore next */
        if (!node) continue;
        const angle = start + (span * (j + 0.5)) / count;
        positions.set(node, {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          cx: hubX,
          cy: hubY,
        });
        placed += 1;
      }
    }
  }

  /*
   * Fill the stage. Ring placement stops at the largest radius that fits the
   * ring step, so on a big canvas the map would otherwise sit in the middle
   * with the rim empty. Scale every placed point (nodes and hubs alike) about
   * the canvas centre so the outermost node lands on the disc rim. A uniform
   * scale only grows distances, so nothing that did not overlap before can
   * overlap now; the clamp afterwards restores the bounds invariant.
   */
  let maxR = 0;
  for (const position of positions.values()) {
    maxR = Math.max(maxR, Math.hypot(position.x - centerX, position.y - centerY));
  }
  if (maxR > 0) {
    const k = Math.max(1, discRadius / maxR);
    for (const position of positions.values()) {
      position.x = centerX + (position.x - centerX) * k;
      position.y = centerY + (position.y - centerY) * k;
      position.cx = centerX + (position.cx - centerX) * k;
      position.cy = centerY + (position.cy - centerY) * k;
    }
    for (const node of nodes) {
      const position = positions.get(node);
      /* c8 ignore next */
      if (!position) continue;
      const r = radiusFor(node.weight);
      position.x = Math.min(Math.max(position.x, r), options.width - r);
      position.y = Math.min(Math.max(position.y, r), options.height - r);
    }
  }

  return nodes.map((node) => {
    const position = positions.get(node);
    /* c8 ignore next */
    const fallback = { x: centerX, y: centerY, cx: centerX, cy: centerY };
    const { x, y, cx, cy } = position ?? fallback;
    return { ...node, x, y, cx, cy };
  });
}

/** Which node is under a point, or null. Used for hover and drag. */
export function nodeAt(nodes: readonly SimNode[], x: number, y: number, pad = 6): SimNode | null {
  let best: SimNode | null = null;
  let bestDistance = Infinity;
  for (const node of nodes) {
    const radius = radiusFor(node.weight) + pad;
    const distance = Math.hypot(node.x - x, node.y - y);
    if (distance <= radius && distance < bestDistance) {
      best = node;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * Smallest gap between any two node edges. Used by the verification to assert that no
 * pair overlaps, which is not something a force layout guarantees on its own.
 */
export function minimumGap(nodes: readonly SimNode[]): number {
  let smallest = Infinity;
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    if (!a) continue;
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      if (!b) continue;
      const gap = Math.hypot(b.x - a.x, b.y - a.y) - radiusFor(a.weight) - radiusFor(b.weight);
      smallest = Math.min(smallest, gap);
    }
  }
  return smallest;
}

export function radiusFor(weight: number): number {
  return 4 + weight * 9;
}

/*
 * Label placement.
 *
 * A pure function, like the rest of the module: the island draws exactly what
 * `placeLabels` returns, so the picture on screen and the picture under test
 * are the same picture by construction, not by discipline.
 *
 * The rules, in the order they are applied:
 *
 * - Hub (and core) labels claim their space first: they name the structure,
 *   and every node label must respect their boxes. Their default position is
 *   above the hub; if two hub boxes would collide, the second tries below the
 *   hub instead. A hub label is never dropped — it is drawn last, over its
 *   own opaque background box, so nothing shows through it.
 * - Node labels are placed heaviest first, below their disc, horizontally
 *   clamped inside the canvas so text is never cut by an edge. A label is
 *   kept only if its box fits inside the canvas and does not overlap any
 *   drawn disc, any already-placed label, or any hub label box; otherwise it
 *   is dropped. Occupancy therefore treats every drawn disc as an obstacle,
 *   which is what makes "no label ever sits on a node" true by construction.
 *
 * Text width is estimated, not measured: the module has no DOM, and a canvas
 * measurement here would make the verifier dependent on a browser. The
 * estimate is deliberately generous for the system UI sans stack, so a drawn
 * label always fits inside the box the function returns.
 */

export interface LabelBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface PlacedLabel {
  /** The node id, or the id the caller gave a hub label. */
  id: string;
  text: string;
  /**
   * Text anchor. Node labels draw with a `top` baseline; hub labels draw
   * vertically centred on `y` (the island uses the two styles it already had).
   */
  x: number;
  y: number;
  box: LabelBox;
  /** True for hub/core labels: drawn last, with the hub styling. */
  hub: boolean;
}

export interface HubLabelInput {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface PlaceLabelsOptions {
  width: number;
  height: number;
  /** Core and area labels. Placed first; node labels may not overlap them. */
  hubs?: readonly HubLabelInput[];
  /** Which nodes should get a label. Defaults to every node in `nodes`. */
  labelIds?: readonly string[];
  /** Hard cap on node labels (hub labels do not count). */
  maxLabels?: number;
}

const LABEL_FONT_SIZE = 13;
/** Generous per-character width for 13px ui-sans-serif. */
const LABEL_CHAR = 0.62 * LABEL_FONT_SIZE;
const LABEL_BOX_PAD_X = 4;
/** Gap between a disc's edge and the top of its label box. */
const LABEL_BELOW_GAP = 6;
/** Hub labels: 11px, weight 600, drawn vertically centred. */
const HUB_LABEL_CHAR = 0.68 * 11;
const HUB_LABEL_BOX_PAD_X = 5;
const HUB_LABEL_HEIGHT = 18;
/** Hub label position: above the hub, falling back to below it. */
const HUB_LABEL_OFFSETS = [-14, 18] as const;
/** Every label box keeps at least this much canvas around it. */
const LABEL_EDGE_PAD = 4;

const boxesOverlap = (a: LabelBox, b: LabelBox): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const circleHitsBox = (cx: number, cy: number, r: number, box: LabelBox): boolean => {
  const nearestX = Math.min(Math.max(cx, box.left), box.right);
  const nearestY = Math.min(Math.max(cy, box.top), box.bottom);
  return (cx - nearestX) ** 2 + (cy - nearestY) ** 2 < r * r;
};

/** Clamp a horizontally-centred label so its box stays inside the canvas. */
const clampCentre = (x: number, half: number, width: number): number =>
  Math.max(LABEL_EDGE_PAD + half, Math.min(width - LABEL_EDGE_PAD - half, x));

export function placeLabels(
  nodes: readonly SimNode[],
  options: PlaceLabelsOptions,
): PlacedLabel[] {
  const { width, height } = options;
  const placed: PlacedLabel[] = [];
  const boxes: LabelBox[] = [];
  // Every drawn disc is an obstacle, including the labelled node's own disc:
  // the box hangs below it with a fixed gap, and the strict inequality here
  // keeps "touching" legal while any real penetration is a collision.
  const discs = nodes.map((node) => ({ x: node.x, y: node.y, r: radiusFor(node.weight) }));

  const fits = (box: LabelBox): boolean =>
    box.left >= 0 &&
    box.right <= width &&
    box.top >= 0 &&
    box.bottom <= height &&
    !boxes.some((other) => boxesOverlap(box, other)) &&
    !discs.some((disc) => circleHitsBox(disc.x, disc.y, disc.r, box));

  const keep = (label: PlacedLabel) => {
    placed.push(label);
    boxes.push(label.box);
  };

  for (const hub of options.hubs ?? []) {
    const half = (hub.text.length * HUB_LABEL_CHAR) / 2 + HUB_LABEL_BOX_PAD_X;
    const tx = clampCentre(hub.x, half, width);
    let kept = false;
    for (const offset of HUB_LABEL_OFFSETS) {
      const y = hub.y + offset;
      const box: LabelBox = {
        left: tx - half,
        right: tx + half,
        top: y - HUB_LABEL_HEIGHT / 2,
        bottom: y + HUB_LABEL_HEIGHT / 2,
      };
      if (!fits(box)) continue;
      keep({ id: hub.id, text: hub.text, x: tx, y, box, hub: true });
      kept = true;
      break;
    }
    if (kept) continue;
    // Nowhere clean: place it above the hub anyway. Hub labels are drawn last
    // over their own opaque box, so the label stays legible either way.
    const y = hub.y + HUB_LABEL_OFFSETS[0]!;
    keep({
      id: hub.id,
      text: hub.text,
      x: tx,
      y,
      box: {
        left: tx - half,
        right: tx + half,
        top: y - HUB_LABEL_HEIGHT / 2,
        bottom: y + HUB_LABEL_HEIGHT / 2,
      },
      hub: true,
    });
  }

  const wanted = options.labelIds ? new Set(options.labelIds) : null;
  const candidates = nodes
    .filter((node) => !wanted || wanted.has(node.id))
    .sort((a, b) => b.weight - a.weight || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  let count = 0;
  for (const node of candidates) {
    if (options.maxLabels !== undefined && count >= options.maxLabels) break;
    const half = (node.label.length * LABEL_CHAR) / 2 + LABEL_BOX_PAD_X;
    const tx = clampCentre(node.x, half, width);
    const ty = Math.min(height - LABEL_HEIGHT - 3, node.y + radiusFor(node.weight) + LABEL_BELOW_GAP);
    const box: LabelBox = {
      left: tx - half,
      right: tx + half,
      top: ty - 2,
      bottom: ty + LABEL_HEIGHT - 2,
    };
    if (!fits(box)) continue;
    keep({ id: node.id, text: node.label, x: tx, y: ty, box, hub: false });
    count += 1;
  }
  return placed;
}
