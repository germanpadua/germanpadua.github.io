/**
 * Interactive skill map.
 *
 * An enhancement, not the content: the grouped list rendered below it is the real
 * page, so a reader without JavaScript, a crawler, or someone using a screen reader
 * loses the interaction and not the information.
 *
 * The graph data is fetched from an endpoint rather than passed as props, because
 * Astro serialises island props into the HTML: the node and edge data alone added
 * 28 KB of attributes to the page, paid by every reader including the ones who
 * never scroll this far.
 *
 * Three things this component is deliberate about:
 *
 *   1. The radial layout runs only when the data, the canvas size or the area-id
 *      set changes — never on hover, selection or filtering. The layout module's
 *      header explains why that rule survives the switch from the force
 *      simulation: positions belong to the geometry, and a filter narrows what
 *      is drawn, never where a node sits.
 *   2. There is no animation loop. The disc is static, so a repaint on state
 *      change is enough; nothing here animates, so there is nothing for
 *      `prefers-reduced-motion` to opt out of.
 *   3. Colours are read from the theme tokens and re-read when `data-theme`
 *      changes, so the map is themed like everything else instead of keeping
 *      its own palette.
 *
 * The encodings the canvas draws are the ones `src/lib/skillGraph/meta.ts`
 * derives, and the legend panel states them in words so a reader can audit what
 * the picture claims:
 *
 *   - Level: a ring outside each disc — solid for `strong`, dashed for
 *     `working`, none for `basic`.
 *   - Freshness: opacity on the disc plus one small mark above-right of it —
 *     a filled dot for `current`, a hollow ring for `warming`, a hollow square
 *     for `stale`, and deliberately no mark at all for `unknown`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  nodeAt,
  placeLabels,
  radialLayout,
  radiusFor,
  type GraphEdge,
  type GraphNode,
  type SimNode,
} from './skillGraph/layout';
import type { Freshness, Level } from '../../lib/skillGraph/meta';

interface Area {
  id: string;
  label: string;
  blurb: string;
}

interface PayloadNode extends GraphNode {
  level: Level;
  freshness: Freshness;
  lastActivityYear: number | null;
}

interface GraphData {
  areas: Area[];
  nodes: PayloadNode[];
  edges: GraphEdge[];
  projectIndex: Record<string, { title: string; path: string }>;
  meta: {
    asOf: string;
    counts: { level: Record<Level, number>; freshness: Record<Freshness, number> };
  };
}

interface Props {
  dataUrl: string;
  labels: {
    areas: string;
    reset: string;
    showAll: string;
    hint: string;
    usedIn: string;
    empty: string;
    noMatches: string;
    loading: string;
    failed: string;
    canvasLabel: string;
    selected: string;
    search: string;
    searchPlaceholder: string;
    jumpTo: string;
    clear: string;
    layers: string;
    legend: string;
    hud: string;
    core: string;
    close: string;
    zoom: string;
    levelLabel: string;
    levelLabels: Record<Level, string>;
    freshnessLabel: string;
    freshnessLabels: Record<Freshness, string>;
    lastActivity: string;
    lastReviewed: string;
    levelRule: string;
    freshnessRule: string;
    layerNames: {
      lines: string;
      areaLabels: string;
      skillLabels: string;
      levels: string;
      grid: string;
    };
  };
}

type LayerKey = keyof Props['labels']['layerNames'];
const LAYER_KEYS: LayerKey[] = ['lines', 'areaLabels', 'skillLabels', 'levels', 'grid'];
type PanelKey = 'search' | 'layers' | 'legend';
const ZOOM_STEPS = [1, 1.5, 2] as const;

const EDGE_ALPHA: Record<GraphEdge['kind'], number> = {
  extends: 0.55,
  applies: 0.42,
  uses: 0.3,
  pairs: 0.22,
};

/** Only the heaviest nodes are labelled by default; the rest appear on focus. */
const LABEL_THRESHOLD = 0.82;

/** Level ring: solid for strong, dashed for working, none for basic. */
const LEVEL_RING: Record<Level, { offset: number; width: number; dash: number[] } | null> = {
  strong: { offset: 3.5, width: 2, dash: [] },
  working: { offset: 3.5, width: 1.4, dash: [3, 3] },
  basic: null,
};

/** Freshness: opacity on the disc; the mark shape sits above-right of it. */
const FRESHNESS_ALPHA: Record<Freshness, number> = {
  current: 1,
  warming: 0.7,
  stale: 0.45,
  // Deliberately unmarked, not failed: nearly full presence, no state mark.
  unknown: 0.85,
};

const tokenName = (area: string) => `--node-${area}`;

export default function SkillGraph({ dataUrl, labels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const layoutRef = useRef<SimNode[]>([]);
  const sizeRef = useRef({ width: 900, height: 640 });

  const [data, setData] = useState<GraphData | null>(null);
  const [failed, setFailed] = useState(false);
  const [size, setSize] = useState({ width: 900, height: 640 });
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    lines: true,
    areaLabels: true,
    skillLabels: true,
    levels: true,
    grid: true,
  });
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    let active = true;
    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((payload: GraphData) => {
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [dataUrl]);

  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];
  const areas = data?.areas ?? [];

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const selected = selectedId ? nodeById.get(selectedId) ?? null : null;
  const areaIds = useMemo(() => areas.map((area) => area.id).join(','), [areas]);

  const normalizedQuery = query.trim().toLowerCase();

  /**
   * What the canvas shows right now: the area filter and the search narrow the
   * picture, they never move it.
   */
  const visibleNodes = useMemo(
    () =>
      nodes.filter(
        (node) =>
          !hidden.has(node.area) &&
          (normalizedQuery === '' || node.label.toLowerCase().includes(normalizedQuery)),
      ),
    [nodes, hidden, normalizedQuery],
  );

  /** One selection code path for the picker, the search and the canvas. */
  const selectNode = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (!id) return;
      const area = nodeById.get(id)?.area;
      if (area) {
        setHidden((current) => {
          if (!current.has(area)) return current;
          const next = new Set(current);
          next.delete(area);
          return next;
        });
      }
    },
    [nodeById],
  );

  const searchMatches = useMemo(() => {
    if (normalizedQuery === '') return [];
    return visibleNodes.filter((node) => node.label.toLowerCase().includes(normalizedQuery));
  }, [visibleNodes, normalizedQuery]);

  /** Enter (or a single live match) selects through the same path as the picker.
   *  The query clears afterwards: the point of searching is to see the map, not
   *  to keep it filtered down to nothing. */
  const commitSearch = useCallback(() => {
    const first = searchMatches[0];
    if (first) {
      selectNode(first.id);
      setQuery('');
    }
  }, [searchMatches, selectNode]);

  /** Read the theme's palette so the map is themed, not hard-coded. */
  const palette = useCallback(() => {
    const styles = getComputedStyle(document.documentElement);
    const rootSize = parseFloat(styles.fontSize) || 16;
    const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
    const gridSize = parseFloat(read('--grid-size', '3.5rem')) * rootSize;
    return {
      fg: read('--fg-strong', '#111111'),
      fgSoft: read('--fg', '#333333'),
      muted: read('--fg-muted', '#777777'),
      border: read('--border', '#dddddd'),
      accent: read('--accent', '#0b6e8c'),
      background: read('--bg-inset', '#f4f6fa'),
      // A theme may set `--grid-line: transparent` (atlas): that means no grid,
      // not a fallback colour.
      gridLine: read('--grid-line', 'transparent'),
      gridSize: Number.isFinite(gridSize) && gridSize > 8 ? gridSize : 56,
      ornamentOpacity: parseFloat(read('--ornament-opacity', '1')) || 1,
      areas: Object.fromEntries(areas.map((area) => [area.id, read(tokenName(area.id), '#888888')])),
    };
  }, [areas]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || layoutRef.current.length === 0) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const { width, height } = sizeRef.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const colors = palette();
    const centerX = width / 2;
    const centerY = height / 2;
    const active = hoveredId ?? selectedId;
    const activeNode = active ? layoutRef.current.find((node) => node.id === active) : undefined;
    const shown = new Set(visibleNodes.map((node) => node.id));
    const positions = new Map(layoutRef.current.map((node) => [node.id, node]));
    /* --- background dot grid ------------------------------------------------ */
    if (layers.grid && colors.gridLine !== '' && colors.gridLine !== 'transparent') {
      context.save();
      context.globalAlpha = colors.ornamentOpacity;
      context.fillStyle = colors.gridLine;
      const step = colors.gridSize;
      for (let x = step / 2; x < width; x += step) {
        for (let y = step / 2; y < height; y += step) {
          context.beginPath();
          context.arc(x, y, 1.1, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.restore();
    }

    /* --- spokes: core to each area hub ------------------------------------- */
    if (layers.lines) {
      context.strokeStyle = colors.border;
      context.globalAlpha = 1;
      context.lineWidth = 1;
      for (const hubId of areaIds.split(',')) {
        // `cx`/`cy` of any node in the area carry its hub.
        const hub = layoutRef.current.find((node) => node.area === hubId);
        if (!hub) continue;
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(hub.cx, hub.cy);
        context.stroke();
      }
    }

    /* --- edges -------------------------------------------------------------- */
    if (layers.lines) {
      for (const edge of edges) {
        if (!shown.has(edge.from) || !shown.has(edge.to)) continue;
        const a = positions.get(edge.from);
        const b = positions.get(edge.to);
        if (!a || !b) continue;

        const touchesActive = activeNode && (edge.from === activeNode.id || edge.to === activeNode.id);
        const dim = activeNode && !touchesActive;
        context.strokeStyle = touchesActive ? colors.areas[a.area] ?? colors.fg : colors.border;
        context.globalAlpha = dim ? 0.16 : touchesActive ? 0.85 : EDGE_ALPHA[edge.kind] * 1.5;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }

    /* --- core and area hubs ------------------------------------------------- */
    context.globalAlpha = 1;
    context.beginPath();
    context.arc(centerX, centerY, 6, 0, Math.PI * 2);
    context.fillStyle = colors.accent;
    context.fill();
    context.beginPath();
    context.arc(centerX, centerY, 9, 0, Math.PI * 2);
    context.strokeStyle = colors.accent;
    context.lineWidth = 1;
    context.stroke();

    /* --- nodes -------------------------------------------------------------- */
    const orderedNodes = [...layoutRef.current].sort(
      (a, b) =>
        (b.id === active ? 1 : 0) - (a.id === active ? 1 : 0) || b.weight - a.weight,
    );
    for (const node of orderedNodes) {
      if (!shown.has(node.id)) continue;
      const payload = nodeById.get(node.id);
      const isActive = activeNode?.id === node.id;
      const connected =
        activeNode &&
        edges.some(
          (edge) =>
            (edge.from === activeNode.id && edge.to === node.id) ||
            (edge.to === activeNode.id && edge.from === node.id),
        );
      const dim = activeNode && !isActive && !connected;
      const radius = radiusFor(node.weight);
      const freshnessAlpha = FRESHNESS_ALPHA[payload?.freshness ?? 'unknown'];

      // Disc, dimmed by freshness and by focus.
      context.globalAlpha = (dim ? 0.3 : 1) * freshnessAlpha;
      context.beginPath();
      context.arc(node.x, node.y, radius, 0, Math.PI * 2);
      context.fillStyle = colors.areas[node.area] ?? colors.muted;
      context.fill();

      // Level ring: the area colour, style carries the level.
      const ring = layers.levels ? LEVEL_RING[payload?.level ?? 'basic'] : null;
      if (ring) {
        context.globalAlpha = dim ? 0.3 : 1;
        context.lineWidth = ring.width;
        context.setLineDash(ring.dash);
        context.strokeStyle = colors.areas[node.area] ?? colors.fg;
        context.beginPath();
        context.arc(node.x, node.y, radius + ring.offset, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
      }

      // Freshness mark, above-right of the disc. `unknown` gets none on purpose.
      if (!dim) {
        const markAngle = -Math.PI / 4;
        const markDistance = radius + 5;
        const mx = node.x + Math.cos(markAngle) * markDistance;
        const my = node.y + Math.sin(markAngle) * markDistance;
        context.globalAlpha = 1;
        context.strokeStyle = colors.fgSoft;
        context.fillStyle = colors.fgSoft;
        context.lineWidth = 1.2;
        if (payload?.freshness === 'current') {
          context.beginPath();
          context.arc(mx, my, 2.4, 0, Math.PI * 2);
          context.fill();
        } else if (payload?.freshness === 'warming') {
          context.beginPath();
          context.arc(mx, my, 2.6, 0, Math.PI * 2);
          context.stroke();
        } else if (payload?.freshness === 'stale') {
          context.strokeRect(mx - 2.4, my - 2.4, 4.8, 4.8);
        }
      }

      if (isActive) {
        context.globalAlpha = 1;
        context.lineWidth = 2;
        context.strokeStyle = colors.fg;
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, Math.PI * 2);
        context.stroke();
      }
    }

    /*
     * Labels. Placement is the pure `placeLabels`, not ad-hoc canvas maths: it
     * owns the collision rules (no two boxes overlap, no box over a disc, no
     * box outside the canvas, every box clamped off the edges), and the canvas
     * draws exactly what it returns — so the picture on screen and the picture
     * under test cannot diverge. Hub labels are in the same pass and drawn
     * last, over their own background box, so an area name is never covered.
     */
    const drawnNodes = layoutRef.current.filter((node) => shown.has(node.id));
    const hubLabels = layers.areaLabels
      ? [
          { id: 'core', text: labels.core, x: centerX, y: centerY - 18 },
          ...areas.map((area) => {
            const hub = layoutRef.current.find((node) => node.area === area.id);
            return {
              id: `area:${area.id}`,
              text: area.label,
              x: hub?.cx ?? centerX,
              y: (hub?.cy ?? centerY) - 14,
            };
          }),
        ]
      : [];
    const labelIds = activeNode
      ? [activeNode.id]
      : layers.skillLabels && !normalizedQuery
        ? drawnNodes.filter((node) => node.weight >= LABEL_THRESHOLD).map((node) => node.id)
        : [];
    const placedLabels = placeLabels(drawnNodes, { width, height, labelIds, hubs: hubLabels });

    for (const label of placedLabels) {
      if (label.hub) continue;
      const isActiveLabel = label.id === active;
      context.font = `${isActiveLabel ? '600 ' : ''}13px ui-sans-serif, system-ui, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'top';
      context.globalAlpha = 0.94;
      context.fillStyle = colors.background;
      context.fillRect(
        label.box.left,
        label.box.top,
        label.box.right - label.box.left,
        label.box.bottom - label.box.top,
      );
      context.globalAlpha = 1;
      context.fillStyle = colors.fg;
      context.fillText(label.text, label.x, label.y);
    }
    for (const label of placedLabels) {
      if (!label.hub) continue;
      context.font = '600 11px ui-sans-serif, system-ui, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.globalAlpha = 0.92;
      context.fillStyle = colors.background;
      context.fillRect(
        label.box.left,
        label.box.top,
        label.box.right - label.box.left,
        label.box.bottom - label.box.top,
      );
      context.globalAlpha = 1;
      context.fillStyle = colors.fgSoft;
      context.fillText(label.text, label.x, label.y);
    }
    context.globalAlpha = 1;
  }, [
    edges,
    hoveredId,
    selectedId,
    hidden,
    normalizedQuery,
    layers,
    palette,
    visibleNodes,
    nodeById,
    areaIds,
    areas,
    labels.core,
  ]);

  /*
   * The draw function changes whenever hover, selection, filtering or a layer
   * toggle changes, so it must not appear in the layout effect's dependencies.
   * This indirection keeps "repaint" and "relayout" apart.
   */
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
    draw();
  }, [draw]);

  /* ---------------------------------------------------------- sizing and layout */

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const next = {
        width: rect.width > 40 ? Math.round(rect.width) : 900,
        height: rect.height > 40 ? Math.round(rect.height) : 640,
      };
      sizeRef.current = next;
      setSize((current) =>
        Math.abs(current.width - next.width) < 1 && Math.abs(current.height - next.height) < 1
          ? current
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  /*
   * The only things that re-run the layout: new data, a canvas resize (the zoom
   * control included — it resizes the canvas), or a change in the area-id set.
   * Selection and filtering do not change node positions.
   */
  useEffect(() => {
    if (nodes.length === 0 || areaIds === '') return;
    const { width, height } = sizeRef.current;
    layoutRef.current = radialLayout(nodes, { width, height, areas: areaIds.split(',') });
    drawRef.current();
  }, [nodes, areaIds, size.width, size.height]);

  // The theme can change under us; the palette is read from the document.
  useEffect(() => {
    const observer = new MutationObserver(() => drawRef.current());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  /* --------------------------------------------------------------- interaction */

  const pointer = (event: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const shownIds = () => new Set(visibleNodes.map((node) => node.id));
  /** Only nodes that are currently visible can be hit, which matches what is drawn. */
  const interactable = () => layoutRef.current.filter((node) => shownIds().has(node.id));

  const onPointerMove = (event: PointerEvent) => {
    const { x, y } = pointer(event);
    const hit = nodeAt(interactable(), x, y);
    const next = hit ? hit.id : null;
    if (next !== hoveredId) setHoveredId(next);
  };

  const onPointerDown = (event: PointerEvent) => {
    const { x, y } = pointer(event);
    const hit = nodeAt(interactable(), x, y);
    selectNode(hit ? hit.id : null);
  };

  // Escape closes whichever HUD panel is open.
  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanel(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [panel]);

  const filtersActive = hidden.size > 0 || normalizedQuery !== '';
  const reset = () => {
    setHidden(new Set());
    setQuery('');
    setSelectedId(null);
  };

  const toggleArea = (id: string) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (selected && selected.area === id) setSelectedId(null);
  };

  const toggleLayer = (key: LayerKey) => {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  };

  const enabledLayers = LAYER_KEYS.filter((key) => layers[key]);
  const panelLabel: Record<PanelKey, string> = {
    search: labels.search,
    layers: labels.layers,
    legend: labels.legend,
  };
  const freshnessOrder: Freshness[] = ['current', 'warming', 'stale', 'unknown'];
  const levelOrder: Level[] = ['strong', 'working', 'basic'];
  const meta = data?.meta;
  const announce = selected
    ? `${labels.selected}: ${selected.label}, ${selected.note}`
    : labels.hint;

  if (failed) return <p class="graph__failed">{labels.failed}</p>;

  const legendSwatch = {
    // The level legend swatches mirror the canvas encoding: solid / dashed / plain.
    level: (level: Level) =>
      level === 'strong' ? (
        <svg class="graph__legend-mark" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="4.5" fill="currentColor" />
          <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      ) : level === 'working' ? (
        <svg class="graph__legend-mark" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="4.5" fill="currentColor" />
          <circle
            cx="10"
            cy="10"
            r="7.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-dasharray="3 3"
          />
        </svg>
      ) : (
        <svg class="graph__legend-mark" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="4.5" fill="currentColor" />
        </svg>
      ),
    // Freshness: filled dot, hollow ring, hollow square, and nothing at all.
    freshness: (freshness: Freshness) =>
      freshness === 'current' ? (
        <svg class="graph__legend-mark" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="4" fill="currentColor" />
        </svg>
      ) : freshness === 'warming' ? (
        <svg class="graph__legend-mark" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="1.6" />
        </svg>
      ) : freshness === 'stale' ? (
        <svg class="graph__legend-mark" viewBox="0 0 20 20" aria-hidden="true">
          <rect
            x="5.8"
            y="5.8"
            width="8.4"
            height="8.4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          />
        </svg>
      ) : (
        <svg class="graph__legend-mark graph__legend-mark--none" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1 3" />
        </svg>
      ),
  };

  return (
    <div class="graph" data-layers={enabledLayers.join(' ')}>
      {/*
        The accessible path to the canvas: an area filter and a skill picker that
        both work from the keyboard, no floating dock needed to reach them.
      */}
      <div class="graph__filters">
        <fieldset class="graph__areas" disabled={!data}>
          <legend class="sr-only">{labels.areas}</legend>
          {areas.map((area) => (
            <label
              key={area.id}
              class="graph__area"
              style={{ '--area-color': `var(${tokenName(area.id)})` }}
              data-off={hidden.has(area.id) ? 'true' : 'false'}
            >
              <input type="checkbox" checked={!hidden.has(area.id)} onChange={() => toggleArea(area.id)} />
              <span class="graph__swatch" aria-hidden="true"></span>
              {area.label}
            </label>
          ))}
        </fieldset>

        <label class="graph__picker">
          <span>{labels.jumpTo}</span>
          <select
            value={selectedId ?? ''}
            disabled={!data}
            onChange={(event) => selectNode(event.currentTarget.value || null)}
          >
            <option value="">{labels.searchPlaceholder}</option>
            {areas.map((area) => (
              <optgroup label={area.label}>
                {nodes
                  .filter((node) => node.area === area.id)
                  .map((node) => (
                    <option value={node.id}>{node.label}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      {/*
        Zoom and pan live here: the scroll container owns the panning (and leaves
        pinch-zoom and vertical page scroll to the browser), the zoom wrapper
        scales the canvas' size in steps, and the stage keeps the geometry
        comfortable — never squeezed down to overlap.
      */}
      <div class="graph__scroll">
        <div class="graph__zoom" style={{ '--graph-zoom': String(zoom) }}>
          <div class="graph__stage" ref={stageRef}>
            <canvas
              data-selected={selectedId ?? ''}
              ref={canvasRef}
              class="graph__canvas"
              role="img"
              aria-label={labels.canvasLabel}
              onPointerMove={onPointerMove}
              onPointerDown={onPointerDown}
              onPointerLeave={() => setHoveredId(null)}
            />
            {!data && !failed && <p class="graph__empty">{labels.loading}</p>}
            {/*
              Reactive, not computed from the layout ref: the layout lands in an
              effect after the first paint, and an imperative check here would
              print "no area selected" over a fully drawn map.
            */}
            {data && nodes.length > 0 && visibleNodes.length === 0 && (
              <p class="graph__empty">{normalizedQuery !== '' ? labels.noMatches : labels.empty}</p>
            )}
            <p class="sr-only" role="status" aria-live="polite">
              {announce}
            </p>

            <div class="graph__hud">
              {panel === 'search' && (
                <div class="graph__panel" role="group" aria-label={panelLabel.search}>
                  <form
                    class="graph__search"
                    onSubmit={(event) => {
                      event.preventDefault();
                      commitSearch();
                    }}
                  >
                    <input
                      class="graph__searchInput"
                      type="search"
                      placeholder={labels.searchPlaceholder}
                      aria-label={labels.search}
                      value={query}
                      onInput={(event) => {
                        const value = event.currentTarget.value;
                        setQuery(value);
                        const trimmed = value.trim().toLowerCase();
                        if (trimmed === '') return;
                        const matches = nodes.filter(
                          (node) =>
                            !hidden.has(node.area) && node.label.toLowerCase().includes(trimmed),
                        );
                        const match = matches[0];
                        if (matches.length === 1 && match) selectNode(match.id);
                      }}
                    />
                    <button class="graph__searchSubmit" type="submit" disabled={!data}>
                      {labels.search}
                    </button>
                    <button class="graph__searchClear" type="button" onClick={() => setQuery('')}>
                      {labels.clear}
                    </button>
                  </form>
                  {normalizedQuery !== '' && (
                    <p class="graph__searchCount">
                      {searchMatches.length} / {nodes.length}
                    </p>
                  )}
                </div>
              )}

              {panel === 'layers' && (
                <div class="graph__panel" role="group" aria-label={panelLabel.layers}>
                  <fieldset class="graph__layers">
                    <legend class="graph__panelTitle">{labels.layers}</legend>
                    {LAYER_KEYS.map((key) => (
                      <label class="graph__layer" key={key}>
                        <input
                          type="checkbox"
                          checked={layers[key]}
                          onChange={() => toggleLayer(key)}
                        />
                        <span>{labels.layerNames[key]}</span>
                      </label>
                    ))}
                  </fieldset>
                </div>
              )}

              {panel === 'legend' && (
                <div class="graph__panel graph__panel--legend" role="group" aria-label={panelLabel.legend}>
                  <p class="graph__panelTitle">{labels.legend}</p>

                  <ul class="graph__legendList" data-legend-group="area">
                    {areas.map((area) => (
                      <li class="graph__legendRow" data-legend="area" key={area.id}>
                        <span class="graph__swatch" style={{ background: `var(${tokenName(area.id)})` }} aria-hidden="true"></span>
                        <span class="graph__legendLabel">{area.label}</span>
                        <span class="graph__legendCount">{nodes.filter((node) => node.area === area.id).length}</span>
                      </li>
                    ))}
                  </ul>

                  <ul class="graph__legendList" data-legend-group="level">
                    {levelOrder.map((level) => (
                      <li class="graph__legendRow" data-legend="level" key={level}>
                        {legendSwatch.level(level)}
                        <span class="graph__legendLabel">{labels.levelLabels[level]}</span>
                        <span class="graph__legendCount">{meta?.counts.level[level] ?? 0}</span>
                      </li>
                    ))}
                  </ul>

                  {/*
                    Only the states the data actually has: a state with zero nodes
                    would make the legend lie about the map.
                  */}
                  <ul class="graph__legendList" data-legend-group="freshness">
                    {freshnessOrder.filter((state) => (meta?.counts.freshness[state] ?? 0) > 0).map((state) => (
                      <li class="graph__legendRow" data-legend="freshness" key={state}>
                        {legendSwatch.freshness(state)}
                        <span class="graph__legendLabel">{labels.freshnessLabels[state]}</span>
                        <span class="graph__legendCount">{meta?.counts.freshness[state]}</span>
                      </li>
                    ))}
                  </ul>

                  <p class="graph__legendRule">{labels.levelRule}</p>
                  <p class="graph__legendRule">{labels.freshnessRule}</p>
                  <p class="graph__legendRule">
                    {labels.lastReviewed}: <time dateTime={meta?.asOf}>{meta?.asOf}</time>
                  </p>
                </div>
              )}

              <div class="graph__dock" role="toolbar" aria-label={labels.hud}>
                {panel && (
                  <button
                    type="button"
                    class="graph__dockBtn graph__dockClose"
                    aria-label={labels.close}
                    onClick={() => setPanel(null)}
                  >
                    ×
                  </button>
                )}
                <button
                  type="button"
                  class="graph__dockBtn graph__dockSearch"
                  aria-pressed={panel === 'search'}
                  onClick={() => setPanel((current) => (current === 'search' ? null : 'search'))}
                >
                  {labels.search}
                </button>
                <button
                  type="button"
                  class="graph__dockBtn graph__dockLayers"
                  aria-pressed={panel === 'layers'}
                  onClick={() => setPanel((current) => (current === 'layers' ? null : 'layers'))}
                >
                  {labels.layers}
                </button>
                <button
                  type="button"
                  class="graph__dockBtn graph__dockLegend"
                  aria-pressed={panel === 'legend'}
                  onClick={() => setPanel((current) => (current === 'legend' ? null : 'legend'))}
                >
                  {labels.legend}
                </button>
                <button type="button" class="graph__dockBtn graph__reset" onClick={reset} disabled={!data}>
                  {filtersActive ? labels.showAll : labels.reset}
                </button>
                <span class="graph__dockSep" aria-hidden="true"></span>
                <div class="graph__zoomGroup" role="group" aria-label={labels.zoom}>
                  {ZOOM_STEPS.map((step) => (
                    <button
                      type="button"
                      class="graph__dockBtn graph__zoomBtn"
                      aria-pressed={zoom === step}
                      aria-label={`${labels.zoom} ${step}×`}
                      onClick={() => setZoom(step)}
                    >
                      {step}×
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="graph__detail" data-empty={selected ? 'false' : 'true'}>
        {selected ? (
          <>
            <p class="graph__detail-area" style={{ color: `var(${tokenName(selected.area)})` }}>
              {areas.find((area) => area.id === selected.area)?.label}
            </p>
            <h3 class="graph__detail-title">{selected.label}</h3>
            <dl class="graph__detail-meta">
              <div class="graph__detail-fact">
                <dt>{labels.levelLabel}</dt>
                <dd data-detail="level">{labels.levelLabels[selected.level]}</dd>
              </div>
              <div class="graph__detail-fact">
                <dt>{labels.freshnessLabel}</dt>
                <dd data-detail="freshness">{labels.freshnessLabels[selected.freshness]}</dd>
              </div>
              {selected.lastActivityYear !== null && (
                <div class="graph__detail-fact">
                  <dt>{labels.lastActivity}</dt>
                  <dd data-detail="year">{selected.lastActivityYear}</dd>
                </div>
              )}
            </dl>
            <p class="graph__detail-note">{selected.note}</p>
            {selected.courses?.length ? (
              <details class="graph__coursework" open>
                <summary>{dataUrl.includes('/es/') ? 'Formación relacionada' : 'Related coursework'}</summary>
                <ul role="list">
                  {selected.courses.map((course) => (
                    <li>
                      <span>
                        {course.program === 'master'
                          ? dataUrl.includes('/es/')
                            ? 'Máster'
                            : 'Master’s'
                          : dataUrl.includes('/es/')
                            ? 'Doble grado'
                            : 'Double degree'}
                      </span>
                      {course.title}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            {selected.projects.length > 0 && (
              <p class="graph__detail-projects">
                <span>{labels.usedIn}:</span>{' '}
                {selected.projects.map((slug) => {
                  const project = data?.projectIndex[slug];
                  return project && <a href={project.path}>{project.title}</a>;
                })}
              </p>
            )}
          </>
        ) : (
          <p class="graph__detail-hint">{labels.hint}</p>
        )}
      </div>
    </div>
  );
}
