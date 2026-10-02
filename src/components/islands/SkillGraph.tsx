/**
 * Interactive skill graph.
 *
 * An enhancement, not the content: the grouped list rendered below it is the real
 * page, so a reader without JavaScript, a crawler, or someone using a screen reader
 * loses the interaction and not the information.
 *
 * The graph data is fetched from an endpoint rather than passed as props, because
 * Astro serialises island props into the HTML: the node and edge data alone added
 * 28 KB of attributes to the home page, paid by every reader including the ones who
 * never scroll this far.
 *
 * Three things this component is deliberate about:
 *
 *   1. The simulation runs when the data arrives, when the canvas is resized, or when
 *      the reader asks for it — and at no other time. An earlier version had the draw
 *      function in the effect's dependencies, and since drawing depends on the hovered
 *      node, every pointer move restarted a 320-step layout. The positions were stable
 *      because the layout is deterministic, so nothing looked wrong; it was simply the
 *      whole graph being recomputed sixty times a second for a highlight.
 *   2. Filtering hides nodes, it does not rearrange them. Hiding an area used to change
 *      the node set, which changed the layout, which moved every remaining node. A
 *      filter should narrow what you see, not shuffle it.
 *   3. Colours are read from the theme tokens and re-read when `data-theme` changes, so
 *      the graph is themed like everything else instead of keeping its own palette.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  initialNodes,
  nodeAt,
  radiusFor,
  step,
  type GraphEdge,
  type GraphNode,
  type SimNode,
} from './skillGraph/layout';

interface Area {
  id: string;
  label: string;
  blurb: string;
}

interface GraphData {
  areas: Area[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  projectIndex: Record<string, { title: string; path: string }>;
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
    loading: string;
    failed: string;
    canvasLabel: string;
    selected: string;
  };
}

const EDGE_ALPHA: Record<GraphEdge['kind'], number> = {
  extends: 0.55,
  applies: 0.42,
  uses: 0.3,
  pairs: 0.22,
};

/** Only the heaviest nodes are labelled by default; the rest appear on focus. */
const LABEL_THRESHOLD = 0.82;

const tokenName = (area: string) => `--node-${area}`;

export default function SkillGraph({ dataUrl, labels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<SimNode[]>([]);
  const sizeRef = useRef({ width: 900, height: 520 });
  const dragRef = useRef<{ id: string } | null>(null);

  const [data, setData] = useState<GraphData | null>(null);
  const [failed, setFailed] = useState(false);
  const [size, setSize] = useState({ width: 900, height: 520 });
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  /** Read the theme's palette so the graph is themed, not hard-coded. */
  const palette = useCallback(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
    return {
      fg: read('--fg-strong', '#111111'),
      muted: read('--fg-muted', '#777777'),
      border: read('--border', '#dddddd'),
      background: read('--bg-inset', '#f4f6fa'),
      areas: Object.fromEntries(areas.map((area) => [area.id, read(tokenName(area.id), '#888888')])),
    };
  }, [areas]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || simRef.current.length === 0) return;
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
    const active = hoveredId ?? selectedId;
    const activeNode = active ? simRef.current.find((node) => node.id === active) : undefined;
    const shown = new Set(simRef.current.filter((node) => !hidden.has(node.area)).map((node) => node.id));
    const positions = new Map(simRef.current.map((node) => [node.id, node]));

    context.lineWidth = 1;
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

    const labelBoxes: { left: number; top: number; right: number; bottom: number }[] = [];
    const orderedNodes = [...simRef.current].sort((a, b) => (b.id === active ? 1 : 0) - (a.id === active ? 1 : 0) || b.weight - a.weight);
    for (const node of orderedNodes) {
      if (!shown.has(node.id)) continue;
      const isActive = activeNode?.id === node.id;
      const connected =
        activeNode &&
        edges.some(
          (edge) =>
            (edge.from === activeNode.id && edge.to === node.id) ||
            (edge.to === activeNode.id && edge.from === node.id),
        );
      const dim = activeNode && !isActive && !connected;

      context.globalAlpha = dim ? 0.25 : 1;
      context.beginPath();
      context.arc(node.x, node.y, radiusFor(node.weight), 0, Math.PI * 2);
      context.fillStyle = colors.areas[node.area] ?? colors.muted;
      context.fill();

      if (isActive) {
        context.lineWidth = 2;
        context.strokeStyle = colors.fg;
        context.stroke();
      }

      const label = isActive || connected || (!activeNode && node.weight >= LABEL_THRESHOLD);
      if (label) {
        context.globalAlpha = dim ? 0.3 : 1;
        context.fillStyle = colors.fg;
        context.font = `${isActive ? '600 ' : ''}13px ui-sans-serif, system-ui, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        const textWidth = context.measureText(node.label).width;
        const tx = Math.max(textWidth / 2 + 8, Math.min(width - textWidth / 2 - 8, node.x));
        const ty = Math.min(height - 20, node.y + radiusFor(node.weight) + 5);
        const box = { left: tx - textWidth / 2 - 4, right: tx + textWidth / 2 + 4, top: ty - 2, bottom: ty + 17 };
        if (isActive || !labelBoxes.some(b => box.left < b.right && box.right > b.left && box.top < b.bottom && box.bottom > b.top)) {
          labelBoxes.push(box);
          context.globalAlpha = .94;
          context.fillStyle = colors.background;
          context.fillRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
          context.globalAlpha = 1;
          context.fillStyle = colors.fg;
          context.fillText(node.label, tx, ty);
        }
      }
    }
    context.globalAlpha = 1;
  }, [edges, hidden, hoveredId, palette, selectedId]);

  /*
   * The draw function changes whenever the hover or selection changes, so it must not
   * appear in the simulation effect's dependencies. This indirection is the whole
   * difference between one repaint per pointer move and a full layout per pointer move.
   */
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
    draw();
  }, [draw]);

  /* ---------------------------------------------------------- sizing and layout */

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      const next = {
        width: rect.width > 40 ? rect.width : 900,
        height: rect.height > 40 ? rect.height : 520,
      };
      sizeRef.current = next;
      setSize((current) =>
        Math.abs(current.width - next.width) < 1 && Math.abs(current.height - next.height) < 1 ? current : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  /*
   * The only things that re-run the simulation: new data or a resize.
   * Selection and filtering do not change node positions.
   */
  useEffect(() => {
    if (nodes.length === 0) return;
    const { width, height } = sizeRef.current;
    simRef.current = initialNodes(nodes, { width, height });

    let frame = 0;
    let handle = 0;
    const total = 320;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (let i = 0; i < total; i++) step(simRef.current, edges, { width, height });
      drawRef.current();
      return;
    }
    const tick = () => {
      for (let i = 0; i < 4 && frame < total; i += 1) {
        step(simRef.current, edges, { width, height });
        frame += 1;
      }
      drawRef.current();
      if (frame < total) handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [nodes, edges, size.width, size.height]);

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

  /** Only nodes that are currently visible can be hit, which matches what is drawn. */
  const interactable = () => simRef.current.filter((node) => !hidden.has(node.area));

  const onPointerMove = (event: PointerEvent) => {
    const { x, y } = pointer(event);
    if (dragRef.current) {
      const node = simRef.current.find((entry) => entry.id === dragRef.current?.id);
      if (node) {
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
        drawRef.current();
      }
      return;
    }
    const hit = nodeAt(interactable(), x, y);
    const next = hit ? hit.id : null;
    if (next !== hoveredId) setHoveredId(next);
  };

  const onPointerDown = (event: PointerEvent) => {
    const { x, y } = pointer(event);
    const hit = nodeAt(interactable(), x, y);
    if (!hit) {
      setSelectedId(null);
      return;
    }
    setSelectedId(hit.id);
    /*
     * A touch selects, it does not drag. The canvas allows vertical panning so the page
     * can still be scrolled with a finger, and a drag that fights that leaves the reader
     * stuck inside the graph.
     */
    if (event.pointerType !== 'touch') dragRef.current = { id: hit.id };
  };

  const filtersActive = hidden.size > 0;
  const onButton = () => {
    setHidden(new Set());
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

  const announce = selected ? `${labels.selected}: ${selected.label}, ${selected.note}` : labels.hint;

  if (failed) return <p class="graph__failed">{labels.failed}</p>;

  return (
    <div class="graph">
      <div class="graph__controls">
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
        {/*
          One control, and its label always says what pressing it will do. It used to be
          labelled "re-layout" while it actually cleared the filters.
        */}
        <button type="button" class="graph__reset" onClick={onButton} disabled={!data}>
          {filtersActive ? labels.showAll : labels.reset}
        </button>
      </div>

      <label class="graph__picker">
        <span>{dataUrl.includes('/es/') ? 'Explorar un conocimiento' : 'Explore a skill'}</span>
        <select value={selectedId ?? ''} disabled={!data} onChange={(event) => {
          const id = event.currentTarget.value;
          setSelectedId(id || null);
          const area = nodeById.get(id)?.area;
          if (area) setHidden(current => new Set([...current].filter(entry => entry !== area)));
        }}>
          <option value="">{dataUrl.includes('/es/') ? 'Selecciona un nodo del grafo' : 'Select a graph node'}</option>
          {areas.map(area => <optgroup label={area.label}>{nodes.filter(node => node.area === area.id).map(node => <option value={node.id}>{node.label}</option>)}</optgroup>)}
        </select>
      </label>
      <div class="graph__stage" ref={wrapRef}>
        <canvas
          data-selected={selectedId ?? ""}
          ref={canvasRef}
          class="graph__canvas"
          role="img"
          aria-label={labels.canvasLabel}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={() => {
            dragRef.current = null;
          }}
          onPointerLeave={() => {
            dragRef.current = null;
            setHoveredId(null);
          }}
        />
        {!data && !failed && <p class="graph__empty">{labels.loading}</p>}
        {data && interactable().length === 0 && <p class="graph__empty">{labels.empty}</p>}
        <p class="sr-only" role="status" aria-live="polite">
          {announce}
        </p>
      </div>

      <div class="graph__detail" data-empty={selected ? 'false' : 'true'}>
        {selected ? (
          <>
            <p class="graph__detail-area" style={{ color: `var(${tokenName(selected.area)})` }}>
              {areas.find((area) => area.id === selected.area)?.label}
            </p>
            <h3 class="graph__detail-title">{selected.label}</h3>
            <p class="graph__detail-note">{selected.note}</p>
            {selected.courses?.length ? <details class="graph__coursework" open>
              <summary>{dataUrl.includes('/es/') ? 'Formación relacionada' : 'Related coursework'}</summary>
              <ul role="list">{selected.courses.map(course => <li><span>{course.program === 'master' ? (dataUrl.includes('/es/') ? 'Máster' : 'Master’s') : (dataUrl.includes('/es/') ? 'Doble grado' : 'Double degree')}</span>{course.title}</li>)}</ul>
            </details> : null}
            {selected.projects.length > 0 && (
              <p class="graph__detail-projects">
                <span>{labels.usedIn}:</span> {selected.projects.map(slug => { const project = data?.projectIndex[slug]; return project && <a href={project.path}>{project.title}</a>; })}
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
