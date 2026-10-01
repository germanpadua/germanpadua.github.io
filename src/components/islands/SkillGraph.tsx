/**
 * Interactive skill graph.
 *
 * An enhancement, not the content: the grouped list rendered below it is the real
 * page, so a reader without JavaScript, a crawler, or someone using a screen reader
 * loses the interaction and not the information. The canvas is `aria-hidden` and a
 * live region announces every selection instead.
 *
 * Colours come from the theme tokens rather than from literals, and the component
 * re-reads them when `data-theme` changes, so the graph is themed like everything
 * else instead of keeping its own palette.
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

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  areas: Area[];
  labels: {
    title: string;
    areas: string;
    reset: string;
    hint: string;
    usedIn: string;
    empty: string;
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

const tokenName = (area: string) => `--node-${area}`;

export default function SkillGraph({ nodes, edges, areas, labels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<SimNode[]>([]);
  const sizeRef = useRef({ width: 900, height: 520 });
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const visible = useMemo(() => nodes.filter((node) => !hidden.has(node.area)), [nodes, hidden]);
  const selected = selectedId ? nodeById.get(selectedId) ?? null : null;

  /** Read the theme's palette so the graph is themed, not hard-coded. */
  const palette = useCallback(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) => {
      const value = styles.getPropertyValue(name).trim();
      return value.length > 0 ? value : fallback;
    };
    return {
      bg: read('--bg', '#ffffff'),
      fg: read('--fg-strong', '#111111'),
      muted: read('--fg-faint', '#888888'),
      border: read('--border', '#dddddd'),
      areas: Object.fromEntries(areas.map((area) => [area.id, read(tokenName(area.id), '#888888')])),
    };
  }, [areas]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const { width, height } = sizeRef.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const colors = palette();
    const active = hoveredId ?? selectedId;
    const activeNode = active ? simRef.current.find((node) => node.id === active) : undefined;
    const shown = new Set(visible.map((node) => node.id));

    // Edges first, so nodes sit on top of them.
    context.lineWidth = 1;
    for (const edge of edges) {
      if (!shown.has(edge.from) || !shown.has(edge.to)) continue;
      const a = simRef.current.find((node) => node.id === edge.from);
      const b = simRef.current.find((node) => node.id === edge.to);
      if (!a || !b) continue;

      const touchesActive = activeNode && (edge.from === activeNode.id || edge.to === activeNode.id);
      const dim = activeNode && !touchesActive;
      context.strokeStyle = touchesActive ? colors.areas[a.area] ?? colors.fg : colors.border;
      context.globalAlpha = dim ? 0.08 : touchesActive ? 0.85 : EDGE_ALPHA[edge.kind] * 0.6;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }

    // Nodes.
    for (const node of simRef.current) {
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

      // Only label the nodes that carry weight, or the ones in focus: labelling
      // everything turns the graph into unreadable noise at this density.
      const label = isActive || connected || (!activeNode && node.weight >= 0.85);
      if (label) {
        context.globalAlpha = dim ? 0.3 : 1;
        context.fillStyle = colors.fg;
        context.font = `${isActive ? '600 ' : ''}13px ui-sans-serif, system-ui, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(node.label, node.x, node.y + radiusFor(node.weight) + 4);
      }
    }
    context.globalAlpha = 1;
  }, [edges, hoveredId, palette, selectedId, visible]);

  /** Rebuild the simulation whenever the visible set changes. */
  const reset = useCallback(
    (animate: boolean) => {
      const { width, height } = sizeRef.current;
      simRef.current = initialNodes(visible, { width, height });
      setSettled(!animate);
      if (!animate) {
        for (let i = 0; i < 420; i += 1) {
          step(simRef.current, edges, { width, height });
        }
        draw();
      }
    },
    [draw, edges, visible],
  );

  // Size tracking. The canvas is sized by CSS and the backing store by DPR.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      sizeRef.current = { width: Math.max(320, rect.width), height: Math.max(320, rect.height) };
      draw();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [draw]);

  // Settle on mount and whenever the visible set changes, then stop. A graph that
  // keeps moving is a graph you cannot click.
  useEffect(() => {
    const { width, height } = sizeRef.current;
    simRef.current = initialNodes(visible, { width, height });
    setSettled(false);
    let frame = 0;
    let handle = 0;
    const total = 320;
    const tick = () => {
      for (let i = 0; i < 4 && frame < total; i += 1) {
        step(simRef.current, edges, { width, height });
        frame += 1;
      }
      draw();
      if (frame < total) {
        handle = requestAnimationFrame(tick);
      } else {
        setSettled(true);
      }
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [draw, edges, visible]);

  // The theme can change under us; the palette is read from the document.
  useEffect(() => {
    const observer = new MutationObserver(() => draw());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw, settled]);

  const pointer = (event: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onPointerMove = (event: PointerEvent) => {
    const { x, y } = pointer(event);
    if (dragRef.current) {
      const node = simRef.current.find((entry) => entry.id === dragRef.current?.id);
      if (node) {
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
        draw();
      }
      return;
    }
    const hit = nodeAt(simRef.current.filter((node) => !hidden.has(node.area)), x, y);
    const next = hit ? hit.id : null;
    if (next !== hoveredId) setHoveredId(next);
  };

  const onPointerDown = (event: PointerEvent) => {
    const { x, y } = pointer(event);
    const hit = nodeAt(simRef.current.filter((node) => !hidden.has(node.area)), x, y);
    if (hit) {
      dragRef.current = { id: hit.id, offsetX: hit.x - x, offsetY: hit.y - y };
      setSelectedId(hit.id);
    } else {
      setSelectedId(null);
    }
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const toggleArea = (id: string) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedId(null);
  };

  const announce = selected
    ? `${labels.selected}: ${selected.label}, ${selected.note}`
    : `${labels.title}. ${labels.hint}`;

  return (
    <div class="graph">
      <div class="graph__controls">
        <fieldset class="graph__areas">
          <legend class="sr-only">{labels.areas}</legend>
          {areas.map((area) => (
            <label
              key={area.id}
              class="graph__area"
              style={{ '--area-color': `var(${tokenName(area.id)})` }}
              data-off={hidden.has(area.id) ? 'true' : 'false'}
            >
              <input
                type="checkbox"
                checked={!hidden.has(area.id)}
                onChange={() => toggleArea(area.id)}
              />
              <span class="graph__swatch" aria-hidden="true"></span>
              {area.label}
            </label>
          ))}
        </fieldset>
        <button type="button" class="graph__reset" onClick={() => reset(true)}>
          {labels.reset}
        </button>
      </div>

      <div class="graph__stage" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          class="graph__canvas"
          role="img"
          aria-label={labels.canvasLabel}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={endDrag}
          onPointerLeave={() => {
            endDrag();
            setHoveredId(null);
          }}
        />
        <p class="sr-only" role="status" aria-live="polite">
          {announce}
        </p>
        {visible.length === 0 && <p class="graph__empty">{labels.empty}</p>}
      </div>

      <div class="graph__detail" data-empty={selected ? 'false' : 'true'}>
        {selected ? (
          <>
            <p class="graph__detail-area" style={{ color: `var(${tokenName(selected.area)})` }}>
              {areas.find((area) => area.id === selected.area)?.label}
            </p>
            <h3 class="graph__detail-title">{selected.label}</h3>
            <p class="graph__detail-note">{selected.note}</p>
            {selected.projects.length > 0 && (
              <p class="graph__detail-projects">
                <span>{labels.usedIn}:</span> {selected.projects.join(' · ')}
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
