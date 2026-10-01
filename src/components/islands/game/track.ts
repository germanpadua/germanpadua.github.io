/**
 * Track geometry.
 *
 * Pure: a closed Catmull-Rom loop through a handful of control points, densely
 * resampled so that "nearest point on the track" is a cheap linear scan. No assets,
 * no network, and deterministic, so the lap is the same for everyone and a screenshot
 * of a corner is reproducible.
 *
 * The circuit is a fictional layout, not a real one. It has a long straight, a
 * hairpin, a set of esses and a fast final corner, because those are the four things
 * that make the grip limit legible to a player: you have to brake for three of them
 * and you must not for the fourth.
 */

export interface Vec {
  x: number;
  y: number;
}

export interface Track {
  /** Closed loop, evenly spaced samples. */
  centreline: Vec[];
  /** Tangent direction (radians) at each sample. */
  headings: number[];
  halfWidth: number;
  /** Cumulative distance at each sample, and the total. */
  cumulative: number[];
  totalLength: number;
  /** Progress values where each sector starts: 0, 1/3, 2/3. */
  sectorStarts: number[];
  start: Vec;
  startHeading: number;
}

/** Normalised control points. Closed loop, so the last connects back to the first. */
const CONTROL_POINTS: readonly Vec[] = [
  { x: 0.09, y: 0.78 },
  { x: 0.24, y: 0.87 },
  { x: 0.44, y: 0.9 },
  { x: 0.64, y: 0.87 },
  { x: 0.8, y: 0.79 },
  { x: 0.89, y: 0.64 },
  { x: 0.87, y: 0.47 },
  { x: 0.74, y: 0.37 },
  { x: 0.6, y: 0.41 },
  { x: 0.52, y: 0.3 },
  { x: 0.46, y: 0.17 },
  { x: 0.32, y: 0.11 },
  { x: 0.18, y: 0.19 },
  { x: 0.14, y: 0.35 },
  { x: 0.21, y: 0.5 },
  { x: 0.14, y: 0.62 },
  { x: 0.07, y: 0.7 },
];

const SAMPLES_PER_SEGMENT = 42;

/** Catmull-Rom, which interpolates its control points instead of approximating them. */
function catmullRom(p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

export function buildTrack(width: number, height: number): Track {
  const scale = { x: width, y: height };
  const points = CONTROL_POINTS.map((point) => ({ x: point.x * scale.x, y: point.y * scale.y }));
  const count = points.length;

  const centreline: Vec[] = [];
  for (let i = 0; i < count; i += 1) {
    const p0 = points[(i - 1 + count) % count] as Vec;
    const p1 = points[i] as Vec;
    const p2 = points[(i + 1) % count] as Vec;
    const p3 = points[(i + 2) % count] as Vec;
    for (let s = 0; s < SAMPLES_PER_SEGMENT; s += 1) {
      centreline.push(catmullRom(p0, p1, p2, p3, s / SAMPLES_PER_SEGMENT));
    }
  }

  const headings: number[] = [];
  const cumulative: number[] = [0];
  for (let i = 0; i < centreline.length; i += 1) {
    const current = centreline[i] as Vec;
    const next = centreline[(i + 1) % centreline.length] as Vec;
    headings.push(Math.atan2(next.y - current.y, next.x - current.x));
    if (i > 0) {
      const previous = centreline[i - 1] as Vec;
      cumulative.push((cumulative[i - 1] ?? 0) + Math.hypot(current.x - previous.x, current.y - previous.y));
    }
  }
  const totalLength = cumulative[cumulative.length - 1] ?? 0;

  return {
    centreline,
    headings,
    // Roughly four car widths: wide enough to be forgiving, narrow enough that
    // cutting a corner costs you time.
    halfWidth: Math.max(16, Math.min(width, height) * 0.045),
    cumulative,
    totalLength,
    sectorStarts: [0, 1 / 3, 2 / 3],
    start: centreline[0] as Vec,
    startHeading: headings[0] ?? 0,
  };
}

export interface TrackPosition {
  /** Index of the nearest sample. */
  index: number;
  /** Distance from the centreline, in pixels. */
  distance: number;
  /** 0-1 around the lap. */
  progress: number;
  /** Mutable hint so the next lookup can search locally instead of globally. */
  onTrack: boolean;
}

/**
 * Nearest point on the centreline.
 *
 * `hint` narrows the search to a window around the previous index, which is both
 * faster and more robust: a global scan can snap to the far side of a hairpin, where
 * two parts of the track are genuinely close together.
 */
export function locate(track: Track, point: Vec, hint?: number): TrackPosition {
  const count = track.centreline.length;
  let bestIndex = 0;
  let bestDistanceSq = Infinity;

  if (hint !== undefined) {
    const window = 40;
    for (let offset = -window; offset <= window; offset += 1) {
      const index = (hint + offset + count) % count;
      const sample = track.centreline[index] as Vec;
      const distanceSq = (sample.x - point.x) ** 2 + (sample.y - point.y) ** 2;
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        bestIndex = index;
      }
    }
  } else {
    for (let index = 0; index < count; index += 1) {
      const sample = track.centreline[index] as Vec;
      const distanceSq = (sample.x - point.x) ** 2 + (sample.y - point.y) ** 2;
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        bestIndex = index;
      }
    }
  }

  const distance = Math.sqrt(bestDistanceSq);
  const travelled = track.cumulative[bestIndex] ?? 0;
  return {
    index: bestIndex,
    distance,
    progress: track.totalLength > 0 ? travelled / track.totalLength : 0,
    onTrack: distance <= track.halfWidth,
  };
}

/**
 * Which sector a progress value falls in: 1, 2 or 3.
 *
 * The boundaries come from the track rather than being repeated here, so the split
 * the timing uses and the split the renderer draws can never disagree.
 */
export function sectorOf(track: Track, progress: number): number {
  const [, second, third] = track.sectorStarts;
  if (progress >= (third ?? 2 / 3)) return 3;
  if (progress >= (second ?? 1 / 3)) return 2;
  return 1;
}

/** Curve radius at a sample, from the turn between its neighbours. */
export function curvatureAt(track: Track, index: number): number {
  const count = track.centreline.length;
  const before = track.headings[(index - 1 + count) % count] ?? 0;
  const after = track.headings[(index + 1) % count] ?? 0;
  let delta = after - before;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  const spacing = track.totalLength / count;
  return Math.abs(delta) / Math.max(1, spacing);
}

/** Look ahead along the track, for the racing line hint and the corner readout. */
export function curvatureAhead(track: Track, index: number, ahead: number): number {
  let worst = 0;
  for (let step = 0; step <= ahead; step += 4) {
    const sample = (index + step) % track.centreline.length;
    worst = Math.max(worst, curvatureAt(track, sample));
  }
  return worst;
}
