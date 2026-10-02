/**
 * Force-directed layout for the skill graph.
 *
 * A pure module with no DOM and no canvas: it takes nodes and edges, and mutates
 * positions. That keeps the simulation testable and the rendering honest.
 *
 * Determinism matters here. The initial positions come from a seeded generator and
 * the step count is fixed, so the same graph always settles into the same picture.
 * A layout that reshuffles between builds makes screenshot review useless, and it
 * makes "the graph looks wrong" impossible to reproduce.
 */

export interface GraphNode {
  id: string;
  label: string;
  area: string;
  /** 0-1. Drives radius and, weakly, how strongly the node holds its place. */
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
  vx: number;
  vy: number;
  /** Area centroid, recomputed each step. */
  cx: number;
  cy: number;
}

export interface LayoutOptions {
  width: number;
  height: number;
  /** Distance the layout tries to give positive space. */
  radius?: number;
}

/** Mulberry32: small, fast, and seedable, which is all the determinism needs. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function initialNodes(
  nodes: readonly GraphNode[],
  { width, height }: LayoutOptions,
  seed = 0x5eed,
): SimNode[] {
  const random = seededRandom(seed);
  const cx = width / 2;
  const cy = height / 2;
  const spread = Math.min(width, height) * 0.34;

  return nodes.map((node) => {
    // Deterministic ring plus jitter: better starting conditions than pure noise,
    // so the layout settles in fewer steps and more predictably.
    const angle = random() * Math.PI * 2;
    const distance = spread * (0.35 + random() * 0.65);
    return {
      ...node,
      cx,
      cy,
      x: cx + Math.cos(angle) * distance,
      y: cy + Math.sin(angle) * distance,
      vx: 0,
      vy: 0,
    };
  });
}

/**
 * One simulation step. Forces are applied and then positions are clamped inside
 * the canvas, because a node that escapes the viewport is a node the reader
 * cannot click.
 */
export function step(
  nodes: SimNode[],
  edges: readonly GraphEdge[],
  options: LayoutOptions & { areaAttraction?: number; repulsion?: number; damping?: number },
): void {
  const { width, height, radius = 34, areaAttraction = 0.022, repulsion = 1600, damping = 0.82 } = options;
  const margin = 26;

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const anchors: Record<string, [number, number]> = { math: [.22, .25], cs: [.22, .75], ds: [.51, .46], tools: [.8, .4], lang: [.83, .85] };
  for (const node of nodes) {
    const [x, y] = anchors[node.area] ?? [.5, .5];
    node.cx = x * width;
    node.cy = y * height;
  }

  // Repulsion. O(n^2) is fine at this size and avoids a spatial index nobody needs.
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    /* c8 ignore next */
    if (!a) continue;
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      /* c8 ignore next */
      if (!b) continue;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let distSq = dx * dx + dy * dy;
      if (distSq < 0.01) {
        // Perfectly coincident nodes would divide by zero; nudge them apart.
        dx = (i % 2 === 0 ? 1 : -1) * 0.5;
        dy = (j % 2 === 0 ? 1 : -1) * 0.5;
        distSq = dx * dx + dy * dy;
      }
      const dist = Math.sqrt(distSq);
      const force = repulsion / distSq;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx -= fx;
      a.vy -= fy;
      b.vx += fx;
      b.vy += fy;
    }
  }

  // Springs. Edge length is a function of the two endpoints' weight, so a strong
  // pairing of strong skills sits closer together than a marginal one.
  for (const edge of edges) {
    const a = byId.get(edge.from);
    const b = byId.get(edge.to);
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.max(0.01, Math.sqrt(dx * dx + dy * dy));
    const rest = radius * (1.5 - 0.5 * Math.min(a.weight, b.weight));
    const force = (dist - rest) * 0.006;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
  }

  for (const node of nodes) {
    // Pull toward the area centroid: this is what produces readable clusters
    // instead of one uniform cloud, which is the whole point of a graph.
    node.vx += (node.cx - node.x) * areaAttraction;
    node.vy += (node.cy - node.y) * areaAttraction;
    // A weak pull to the middle keeps the clusters from drifting apart.
    node.vx += (width / 2 - node.x) * 0.0016;
    node.vy += (height / 2 - node.y) * 0.0016;

    node.vx *= damping;
    node.vy *= damping;
    node.x += node.vx;
    node.y += node.vy;

    node.x = Math.max(margin, Math.min(width - margin, node.x));
    node.y = Math.max(margin, Math.min(height - margin, node.y));
  }

  /*
   * Hard separation, as a final pass.
   *
   * The forces above are soft: nothing guarantees that two nodes end up apart, and in
   * practice two pairs were landing on top of each other, which made them look like one
   * node and made one of the pair impossible to click. This costs another O(n^2) sweep
   * and removes the possibility entirely; the clamp afterwards means the very edge of
   * the canvas may still be slightly tight, and the next step resolves it.
   */
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    /* c8 ignore next */
    if (!a) continue;
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      /* c8 ignore next */
      if (!b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 0.01;
      const minimum = radiusFor(a.weight) + radiusFor(b.weight) + 3;
      if (distance >= minimum) continue;
      const push = (minimum - distance) / 2;
      const ux = dx / distance;
      const uy = dy / distance;
      a.x -= ux * push;
      a.y -= uy * push;
      b.x += ux * push;
      b.y += uy * push;
    }
  }

  for (const node of nodes) {
    node.x = Math.max(margin, Math.min(width - margin, node.x));
    node.y = Math.max(margin, Math.min(height - margin, node.y));
  }
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
