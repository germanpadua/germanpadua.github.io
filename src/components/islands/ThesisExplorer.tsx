import { useEffect, useRef, useState } from 'preact/hooks';
type Experiment = { id: string; name: string; dataset: string; role: string; labels: number[]; baseline: number[][]; comparison: number[][]; scores: number[]; source: string[] };
const COLORS = ['#3981b9','#cb725a','#8981c6','#4e9f86','#c59740','#ca719d','#677c92','#87a456'];
function Projection({ points, labels, title }: { points: number[][]; labels: number[]; title: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const render = () => {
      const width = canvas.clientWidth, height = 280;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.scale(dpr, dpr);
      const xs = points.map(p => p[0]!), ys = points.map(p => p[1]!);
      const minX = Math.min(...xs), minY = Math.min(...ys);
      const scale = Math.min((width - 40) / (Math.max(...xs) - minX || 1), (height - 40) / (Math.max(...ys) - minY || 1));
      const offsetX = (width - (Math.max(...xs) - minX) * scale) / 2;
      const offsetY = (height - (Math.max(...ys) - minY) * scale) / 2;
      ctx.globalAlpha = .75;
      points.forEach((p, i) => { ctx.fillStyle = COLORS[(labels[i] ?? 0) % COLORS.length]!; ctx.beginPath(); ctx.arc(offsetX + (p[0]! - minX) * scale, height - offsetY - (p[1]! - minY) * scale, 2.3, 0, Math.PI * 2); ctx.fill(); });
    };
    const observer = new ResizeObserver(render); observer.observe(canvas); render();
    return () => observer.disconnect();
  }, [points, labels]);
  return <canvas ref={ref} role="img" aria-label={title} style={{ width: '100%', height: '280px' }} />;
}
export default function ThesisExplorer({ locale }: { locale: 'es' | 'en' }) {
  const es = locale === 'es';
  const [data, setData] = useState<Experiment[]>([]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/data/research/gnn.json', { signal: controller.signal }).then(r => { if (!r.ok) throw Error(); return r.json(); }).then(setData).catch(e => { if (e.name !== 'AbortError') setFailed(true); });
    return () => controller.abort();
  }, []);
  if (!data.length) return <p role="status">{failed ? (es ? 'No se han podido cargar los experimentos. Consulta el repositorio enlazado arriba.' : 'Experiments could not load. See the repository linked above.') : (es ? 'Cargando experimentos…' : 'Loading experiments…')}</p>;
  const current = data[index]!;
  const names = es ? ['GCN euclídea', 'QGCN pseudo-riemanniana'] : ['Euclidean GCN', 'Pseudo-Riemannian QGCN'];
  const views = [current.baseline, current.comparison];
  return <section class="thesis-explorer" aria-label={es ? 'Comparador de experimentos del TFG' : 'Thesis experiment comparison'}>
    <div class="thesis-explorer__toolbar"><label for="thesis-dataset">Dataset</label><select id="thesis-dataset" value={index} onChange={e => setIndex(Number(e.currentTarget.value))}>{data.map((d, i) => <option value={i}>{d.name}{d.role === 'counterexample' ? (es ? ' · contraejemplo' : ' · counterexample') : ''}</option>)}</select></div>
    <div class="thesis-explorer__views">{views.map((points, i) => <figure><figcaption>{names[i]}</figcaption><Projection points={points} labels={current.labels} title={`${names[i]} · ${current.name}`} /><p>{es ? 'Accuracy de test' : 'Test accuracy'} <strong>{((current.scores[i] ?? 0) * 100).toFixed(2)}%</strong></p></figure>)}</div>
    <p class="thesis-explorer__note" aria-live="polite">{es ? 'Cada punto representa un nodo; el color corresponde a su clase. Proyecciones 2D y métricas de ejecuciones guardadas, con una muestra de nodos para la visualización. Los ejes se ajustan por separado: la forma y la separación no son una medida de rendimiento.' : 'Each point represents a node; colour indicates its class. 2D projections and metrics from saved runs, with a node sample for display. Axes are scaled independently: shape and separation are not a performance measure.'}</p>
    <details><summary>{es ? 'Procedencia de las ejecuciones' : 'Run provenance'}</summary><ul>{current.source.map((source, i) => <li><a href={`https://github.com/germanpadua/GCN-Pseudo-Riemannian-Manifold/tree/main/${source}`} target="_blank" rel="noopener noreferrer">{names[i]}: {source}</a></li>)}</ul></details>
  </section>;
}
