/**
 * F1 qualifying lap.
 *
 * A top-down time trial: three sectors, lap and best-lap timing, records in
 * localStorage, keyboard and touch controls. The physics and the track geometry live
 * in pure modules next to this file; this component owns the loop, the drawing and the
 * HUD.
 *
 * Two behaviours worth calling out because they are easy to get wrong:
 *   - the loop pauses on blur and on a hidden tab. A race that keeps timing while the
 *     reader is in another tab is a race you cannot win.
 *   - with `prefers-reduced-motion` the skid marks and the camera shake are dropped.
 *     The lap is still a lap; it is the decoration that goes.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { buildTrack, constrainToTrack, curvatureAhead, locate, sectorOf, type Track } from './game/track';
import { createCar, stepCar, type CarState, type Controls } from './game/physics';

interface Props {
  labels: {
    title: string;
    start: string;
    restart: string;
    pause: string;
    resume: string;
    paused: string;
    lap: string;
    best: string;
    last: string;
    sector: string;
    speed: string;
    offTrack: string;
    sliding: string;
    record: string;
    noRecord: string;
    summary: string;
    sectors: string;
    delta: string;
    controls: string;
    throttle: string;
    brake: string;
    keyboard: string;
    touch: string;
    countingdown: string;
    finished: string;
    clearance: string;
  };
}

type Phase = 'idle' | 'countdown' | 'running' | 'finished';

interface Records {
  bestLap: number | null;
  bestSectors: [number | null, number | null, number | null];
}

const STORAGE_KEY = 'gp.f1.records.v2';

/** Class list join. `class:list` is an Astro-only directive, so Preact needs this. */
const cx = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter((part): part is string => typeof part === 'string' && part.length > 0).join(' ');

const COUNTDOWN_MS = 2200;

function readRecords(): Records {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { bestLap: null, bestSectors: [null, null, null] };
    const parsed = JSON.parse(raw) as Records;
    return {
      bestLap: typeof parsed.bestLap === 'number' ? parsed.bestLap : null,
      bestSectors: [
        typeof parsed.bestSectors?.[0] === 'number' ? parsed.bestSectors[0] : null,
        typeof parsed.bestSectors?.[1] === 'number' ? parsed.bestSectors[1] : null,
        typeof parsed.bestSectors?.[2] === 'number' ? parsed.bestSectors[2] : null,
      ],
    };
  } catch {
    return { bestLap: null, bestSectors: [null, null, null] };
  }
}

function formatTime(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return '--:--.---';
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = Math.floor(total % 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

function formatDelta(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return '—';
  const sign = ms >= 0 ? '+' : '−';
  return `${sign}${(Math.abs(ms) / 1000).toFixed(3)}`;
}

export default function F1Game({ labels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<Track | null>(null);
  const carRef = useRef<CarState | null>(null);
  const sizeRef = useRef({ width: 900, height: 520 });
  const phaseRef = useRef<Phase>('idle');
  const controlsRef = useRef<Controls>({ throttle: 0, brake: 0, steer: 0 });
  const touchRef = useRef<Controls>({ throttle: 0, brake: 0, steer: 0 });
  const timingRef = useRef({
    lapStart: 0,
    sectorStart: 0,
    sectorTimes: [null, null, null] as [number | null, number | null, number | null],
    lastLap: null as number | null,
    bestLap: null as number | null,
    bestSectorSplit: [null, null, null] as [number | null, number | null, number | null],
  });
  const lastProgressRef = useRef(0);
  const skidRef = useRef<{ x: number; y: number }[]>([]);
  const initialisedRef = useRef(false);
  const frameRef = useRef(0);
  /* Local-search hint for the nearest-point lookup, so a hairpin cannot snap. */
  const positionIndexRef = useRef<number | undefined>(undefined);

  const [phase, setPhase] = useState<Phase>('idle');
  const [paused, setPaused] = useState(false);
  const [records, setRecords] = useState<Records>({ bestLap: null, bestSectors: [null, null, null] });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hud, setHud] = useState({
    speed: 0,
    lapMs: 0,
    sector: 1,
    sectorSplits: [null, null, null] as [number | null, number | null, number | null],
    delta: null as number | null,
    offTrack: false,
    sliding: false,
    corner: 0,
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [result, setResult] = useState<{
    lapMs: number;
    sectors: [number, number, number];
    isRecord: boolean;
    bestLap: number | null;
  } | null>(null);

  const setPhaseBoth = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  useEffect(() => {
    const stored = readRecords();
    setRecords(stored);
    // The delta needs a baseline from the first frame, and a record restored from
    // storage is that baseline. Without this the delta reads null until the first lap
    // of the session completes.
    timingRef.current.bestLap = stored.bestLap;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const listener = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  /* ------------------------------------------------------------ track and reset */

  const resetCar = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    carRef.current = createCar(track.start.x, track.start.y, track.startHeading);
    controlsRef.current = { throttle: 0, brake: 0, steer: 0 };
    touchRef.current = { throttle: 0, brake: 0, steer: 0 };
    skidRef.current = [];
    lastProgressRef.current = 0;
    positionIndexRef.current = 0;
    timingRef.current = {
      ...timingRef.current,
      lapStart: 0,
      sectorStart: 0,
      sectorTimes: [null, null, null],
    };
  }, []);

  const startRun = useCallback(() => {
    resetCar();
    setResult(null);
    setPaused(false);
    setCountdown(3);
    timingRef.current.lapStart = performance.now() + COUNTDOWN_MS;
    timingRef.current.sectorStart = timingRef.current.lapStart;
    setPhaseBoth('countdown');
    setHud(current => ({ ...current, speed: 0, lapMs: 0, sector: 1, sectorSplits: [null, null, null], delta: null, offTrack: false, sliding: false }));
    canvasRef.current?.focus({ preventScroll: true });
  }, [resetCar, setPhaseBoth]);

  /* ------------------------------------------------------------------- drawing */

  const palette = useCallback(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
    return {
      track: '#37434b',
      edge: read('--border-strong', '#cccccc'),
      kerb: read('--accent-2', '#cc8800'),
      line: read('--fg-muted', '#888888'),
      car: read('--accent', '#0088cc'),
      carAlt: read('--fg-strong', '#111111'),
      skid: read('--fg-faint', '#999999'),
      warn: read('--warn', '#ccaa00'),
    };
  }, []);

  const draw = useCallback(
    () => {
      const canvas = canvasRef.current;
      const track = trackRef.current;
      const car = carRef.current;
      if (!canvas || !track || !car) return;
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
      context.fillStyle = '#dde6dd';
      context.fillRect(0, 0, width, height);

      // The track surface: a thick stroke along the centreline, then a lighter inner
      // stroke so the edge reads as an edge.
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#aab4ad';
      context.lineWidth = track.halfWidth * 2 + 30;
      context.beginPath();
      track.centreline.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.closePath();
      context.stroke();

      context.strokeStyle = '#d6dbd7';
      context.lineWidth = track.halfWidth * 2 + 26;
      context.stroke();
      context.strokeStyle = '#f6f5f0';
      context.lineWidth = track.halfWidth * 2 + 8;
      context.stroke();
      context.strokeStyle = '#ba514c';
      context.lineCap = 'butt';
      context.setLineDash([10, 10]);
      context.stroke();
      context.setLineDash([]);
      context.lineCap = 'round';
      context.strokeStyle = colors.track;
      context.lineWidth = track.halfWidth * 2;
      context.stroke();

      context.strokeStyle = '#f2f4f2';
      context.lineWidth = 1;
      for (const side of [-1, 1]) {
        context.beginPath();
        track.centreline.forEach((point, index) => {
          const heading = track.headings[index] ?? 0;
          const normal = heading + Math.PI / 2;
          const x = point.x + Math.cos(normal) * track.halfWidth * side;
          const y = point.y + Math.sin(normal) * track.halfWidth * side;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.closePath();
        context.stroke();
      }

      // Sector boundaries, so the split makes sense visually.
      const count = track.centreline.length;
      // Boundaries come from the track, the same values the timing uses.
      for (const boundary of track.sectorStarts.slice(1)) {
        const index = Math.floor(boundary * count);
        const point = track.centreline[index];
        if (!point) continue;
        const heading = track.headings[index] ?? 0;
        const normal = heading + Math.PI / 2;
        context.strokeStyle = colors.line;
        context.setLineDash([6, 6]);
        context.beginPath();
        context.moveTo(
          point.x - Math.cos(normal) * track.halfWidth,
          point.y - Math.sin(normal) * track.halfWidth,
        );
        context.lineTo(
          point.x + Math.cos(normal) * track.halfWidth,
          point.y + Math.sin(normal) * track.halfWidth,
        );
        context.stroke();
        context.setLineDash([]);
      }

      // Start and finish line, chequered.
      const start = track.centreline[0];
      if (start) {
        const heading = track.startHeading;
        const normal = heading + Math.PI / 2;
        const squares = 10;
        for (let i = 0; i < squares; i += 1) {
          const t = (i / squares - 0.5) * 2 * track.halfWidth;
          const size = (2 * track.halfWidth) / squares;
          context.fillStyle = i % 2 === 0 ? colors.carAlt : colors.track;
          context.save();
          context.translate(start.x + Math.cos(normal) * t, start.y + Math.sin(normal) * t);
          context.rotate(heading);
          context.fillRect(-3, 0, 6, size);
          context.restore();
        }
      }

      // Skid marks, dropped entirely when the reader asked for less motion.
      if (!reducedMotion && skidRef.current.length > 1) {
        context.strokeStyle = colors.skid;
        context.globalAlpha = 0.25;
        context.lineWidth = 2;
        context.beginPath();
        skidRef.current.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.stroke();
        context.globalAlpha = 1;
      }

      // A top-down single-seater, with exposed wheels and a visible front wing.
      context.save();
      context.translate(car.x, car.y);
      context.rotate(car.heading);
      context.fillStyle = '#171d22';
      for (const x of [-7, 7]) for (const y of [-7, 4]) context.fillRect(x - 3, y, 6, 4);
      context.fillStyle = '#d45248';
      context.fillRect(-11, -7, 4, 14);
      context.fillRect(9, -8, 3, 16);
      context.beginPath();
      context.moveTo(12, -2);
      context.lineTo(2, -3);
      context.lineTo(-2, -5);
      context.lineTo(-9, -4);
      context.lineTo(-9, 4);
      context.lineTo(-2, 5);
      context.lineTo(2, 3);
      context.lineTo(12, 2);
      context.closePath();
      context.fill();
      context.fillStyle = '#17252c';
      context.fillRect(-3, -2.5, 5, 5);
      context.fillStyle = '#f1e8d5';
      context.beginPath(); context.arc(-1, 0, 1.7, 0, Math.PI * 2); context.fill();
      context.restore();

      // A short trail behind the car, which reads as speed without a speedometer.
      context.globalAlpha = 0.18;
      context.fillStyle = colors.car;
      for (let i = 1; i <= 3; i += 1) {
        context.beginPath();
        context.arc(
          car.x - Math.cos(car.heading) * i * 7,
          car.y - Math.sin(car.heading) * i * 7,
          4 - i * 0.8,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      context.globalAlpha = 1;

    },
    [palette, reducedMotion],
  );

  /* --------------------------------------------------------------------- loop */

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      const width = rect.width > 60 ? rect.width : 900;
      const height = rect.height > 60 ? rect.height : 520;
      const previous = sizeRef.current;
      sizeRef.current = { width, height };
      const rebuilt = buildTrack(width, height);
      trackRef.current = rebuilt;
      if (!initialisedRef.current) {
        initialisedRef.current = true;
        carRef.current = createCar(rebuilt.start.x, rebuilt.start.y, rebuilt.startHeading);
      } else if (carRef.current) {
        carRef.current.x *= width / previous.width;
        carRef.current.y *= height / previous.height;
        const position = locate(rebuilt, carRef.current);
        positionIndexRef.current = position.index;
        constrainToTrack(rebuilt, carRef.current, position.index);
      }
      draw();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    let handle = 0;
    let previous = performance.now();

    const frame = (now: number) => {
      handle = requestAnimationFrame(frame);
      const elapsed = now - previous;
      const dt = Math.min(0.05, elapsed / 1000);
      previous = now;

      const track = trackRef.current;
      const car = carRef.current;
      if (!track || !car) return;

      if (phaseRef.current === 'countdown') {
        if (now >= timingRef.current.lapStart) {
          setPhaseBoth('running');
          timingRef.current.lapStart = now;
          timingRef.current.sectorStart = now;
          setCountdown(null);
        } else {
          const step = Math.max(1, Math.min(3, Math.ceil((timingRef.current.lapStart - now) / (COUNTDOWN_MS / 3))));
          setCountdown((current) => (current === step ? current : step));
        }
        draw();
        return;
      }

      if (phaseRef.current !== 'running' || paused) {
        if (paused) {
          timingRef.current.lapStart += elapsed;
          timingRef.current.sectorStart += elapsed;
        }
        draw();
        return;
      }

      // Merge keyboard and touch: a player can hold a key and a button at once.
      const controls: Controls = {
        throttle: Math.max(controlsRef.current.throttle, touchRef.current.throttle),
        brake: Math.max(controlsRef.current.brake, touchRef.current.brake),
        steer: Math.abs(touchRef.current.steer) > 0 || touchRef.current.steer !== 0
          ? touchRef.current.steer
          : controlsRef.current.steer,
      };

      let position = locate(track, { x: car.x, y: car.y }, positionIndexRef.current);
      positionIndexRef.current = position.index;

      stepCar(car, controls, dt, position.onTrack);
      constrainToTrack(track, car, position.index);
      position = locate(track, car, position.index);
      positionIndexRef.current = position.index;
      if (car.sliding && !reducedMotion) {
        skidRef.current.push({ x: car.x, y: car.y });
        if (skidRef.current.length > 240) skidRef.current.shift();
      }

      // Lap progress, and the start/finish crossing. A crossing is a wrap from near
      // the end of the lap back to the beginning, not any small backwards step.
      const progress = position.progress;
      const previousProgress = lastProgressRef.current;
      if (previousProgress > 0.75 && progress < 0.25) {
        const lapMs = now - timingRef.current.lapStart;
        const sectors: [number | null, number | null, number | null] = [...timingRef.current.sectorTimes];
        sectors[2] = now - timingRef.current.sectorStart;
        if (sectors[0] !== null && sectors[1] !== null && sectors[2] !== null) {
          const lapSectors: [number, number, number] = [sectors[0], sectors[1], sectors[2]];
          const current = readRecords();
          const isRecord = current.bestLap === null || lapMs < current.bestLap;
          const nextRecords: Records = {
            bestLap: isRecord ? lapMs : current.bestLap,
            bestSectors: [
              current.bestSectors[0] === null || lapSectors[0] < current.bestSectors[0] ? lapSectors[0] : current.bestSectors[0],
              current.bestSectors[1] === null || lapSectors[1] < current.bestSectors[1] ? lapSectors[1] : current.bestSectors[1],
              current.bestSectors[2] === null || lapSectors[2] < current.bestSectors[2] ? lapSectors[2] : current.bestSectors[2],
            ],
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
          } catch {
            /* storage may be blocked; the lap still counts for this session */
          }
          setRecords(nextRecords);
          setResult({ lapMs, sectors: lapSectors, isRecord, bestLap: nextRecords.bestLap });
          timingRef.current.lastLap = lapMs;
          timingRef.current.bestLap = nextRecords.bestLap;
          setPhaseBoth('finished');
          draw();
          return;
        }
        // A lap that never registered its splits does not count: better to drop it
        // than to publish a time that skipped a sector.
        timingRef.current.lapStart = now;
        timingRef.current.sectorStart = now;
        timingRef.current.sectorTimes = [null, null, null];
      }

      // Sector splits.
      const sector = sectorOf(track, progress);
      const previousSector = sectorOf(track, previousProgress);
      if (sector !== previousSector && sector > previousSector) {
        const split = now - timingRef.current.sectorStart;
        timingRef.current.sectorTimes[previousSector - 1] = split;
        timingRef.current.sectorStart = now;
      }
      lastProgressRef.current = progress;

      // HUD at about 15 Hz: the canvas is redrawn every frame, the text does not need
      // to be, and re-rendering sixty times a second for a number is waste.
      frameRef.current += 1;
      if (frameRef.current % 4 === 0) {
        const best = timingRef.current.bestLap;
        setHud({
          speed: car.speed,
          lapMs: now - timingRef.current.lapStart,
          sector: sectorOf(track, progress),
          sectorSplits: [...timingRef.current.sectorTimes] as [number | null, number | null, number | null],
          delta: best === null ? null : now - timingRef.current.lapStart - best,
          offTrack: car.offTrack,
          sliding: car.sliding,
          corner: curvatureAhead(track, position.index, 30),
        });
      }

      draw();
    };

    handle = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(handle);
  }, [draw, paused, reducedMotion, setPhaseBoth]);

  /* ------------------------------------------------------- pause on blur / hidden */

  useEffect(() => {
    const pause = () => {
      controlsRef.current = { throttle: 0, brake: 0, steer: 0 };
      touchRef.current = { throttle: 0, brake: 0, steer: 0 };
      if (phaseRef.current === 'running') setPaused(true);
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  /* ------------------------------------------------------------------- controls */

  useEffect(() => {
    const keyMap: Record<string, keyof Controls> = {
      ArrowUp: 'throttle',
      KeyW: 'throttle',
      ArrowDown: 'brake',
      KeyS: 'brake',
    };
    const steerMap: Record<string, number> = { ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1 };
    const held = new Set<string>();

    const apply = () => {
      controlsRef.current = {
        throttle: held.has('ArrowUp') || held.has('KeyW') ? 1 : 0,
        brake: held.has('ArrowDown') || held.has('KeyS') ? 1 : 0,
        steer:
          (held.has('ArrowLeft') || held.has('KeyA') ? -1 : 0) +
          (held.has('ArrowRight') || held.has('KeyD') ? 1 : 0),
      };
    };

    const onDown = (event: KeyboardEvent) => {
      if (!wrapRef.current?.closest('.game')?.contains(document.activeElement)) return;
      if (document.activeElement?.matches('input, textarea, select')) return;
      if (keyMap[event.code] || steerMap[event.code]) {
        // Only swallow the keys the game actually uses, so the page still scrolls.
        event.preventDefault();
        held.add(event.code);
        apply();
      }
      if (event.code === 'KeyR') startRun();
      if (event.code === 'Space' && phaseRef.current === 'running') {
        event.preventDefault();
        setPaused((current) => !current);
      }
    };
    const onUp = (event: KeyboardEvent) => {
      held.delete(event.code);
      apply();
    };
    const clearHeld = () => { held.clear(); apply(); };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', clearHeld);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', clearHeld);
    };
  }, [startRun]);

  const holdTouch = (key: 'throttle' | 'brake' | 'steer', value: number) => ({
    onPointerDown: (event: PointerEvent) => {
      event.preventDefault();
      (event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
      touchRef.current = { ...touchRef.current, [key]: value };
    },
    onPointerUp: () => {
      touchRef.current = { ...touchRef.current, [key]: 0 };
    },
    onPointerCancel: () => {
      touchRef.current = { ...touchRef.current, [key]: 0 };
    },
  });

  const bestSectors = useMemo(() => records.bestSectors, [records]);

  return (
    <div class="game">
      <div class="game__hud">
        <div class="game__stat">
          <span class="game__stat-label">{labels.lap}</span>
          <span class="game__stat-value tabular">{formatTime(phase === 'idle' ? null : hud.lapMs)}</span>
        </div>
        <div class="game__stat">
          <span class="game__stat-label">{labels.best}</span>
          <span class="game__stat-value tabular">{formatTime(records.bestLap)}</span>
        </div>
        <div class="game__stat">
          <span class="game__stat-label">{labels.delta}</span>
          <span
            class={cx(
              'game__stat-value',
              'tabular',
              hud.delta !== null && hud.delta < 0 && 'game__delta--ahead',
              hud.delta !== null && hud.delta >= 0 && 'game__delta--behind',
            )}
          >
            {formatDelta(hud.delta)}
          </span>
        </div>
        <div class="game__stat">
          <span class="game__stat-label">{labels.sector}</span>
          <span class="game__stat-value tabular">{hud.sector}/3</span>
        </div>
        <div class="game__stat">
          <span class="game__stat-label">{labels.speed}</span>
          <span class="game__stat-value tabular">{Math.round(hud.speed)}</span>
        </div>
      </div>

      <div class="game__stage" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          class="game__canvas"
          tabindex={0}
          role="img"
          aria-label={labels.title}
        />

        <div class="game__splits">
          {hud.sectorSplits.map((split, index) => (
            <span class="game__split" data-active={hud.sector === index + 1 ? 'true' : 'false'}>
              <span class="game__split-label">{labels.sector} {index + 1}</span>
              <span class="tabular">
                {split === null ? '--.---' : (split / 1000).toFixed(3)}
                {bestSectors[index] !== null && split !== null && (
                  <span
                    class={cx(
                      'game__split-best',
                      split <= (bestSectors[index] ?? Infinity) && 'game__split-best--faster',
                    )}
                  >
                    {split <= (bestSectors[index] ?? Infinity) ? ' ▼' : ' ▲'}
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>

        {(phase === 'idle' || phase === 'finished') && (
          <div class="game__overlay">
            {phase === 'finished' && result ? (
              <>
                <p class="game__overlay-title">{labels.finished}</p>
                <p class="game__overlay-value tabular">{formatTime(result.lapMs)}</p>
                {result.isRecord && <p class="game__record">{labels.record}</p>}
                <div class="game__summary">
                  <p class="game__summary-title">{labels.sectors}</p>
                  {result.sectors.map((split, index) => (
                    <p class="game__summary-row tabular">
                      <span>{labels.sector} {index + 1}</span>
                      <span>{(split / 1000).toFixed(3)}</span>
                    </p>
                  ))}
                </div>
                <button type="button" class="btn btn--primary" onClick={startRun}>
                  {labels.restart}
                </button>
              </>
            ) : (
              <>
                <p class="game__overlay-title">{labels.title}</p>
                <p class="game__overlay-hint">{labels.controls}</p>
                {records.bestLap === null && <p class="game__overlay-hint game__overlay-hint--dim">{labels.noRecord}</p>}
                <button type="button" class="btn btn--primary" onClick={startRun}>
                  {labels.start}
                </button>
              </>
            )}
          </div>
        )}

        {paused && phase === 'running' && (
          <div class="game__overlay">
            <p class="game__overlay-title">{labels.paused}</p>
            <button type="button" class="btn btn--primary" onClick={() => setPaused(false)}>
              {labels.resume}
            </button>
          </div>
        )}

        {countdown !== null && (
          <p class="game__countdown tabular" role="status" aria-live="polite">
            {countdown}
          </p>
        )}

        {phase === 'running' && hud.offTrack && <p class="game__flag">{labels.offTrack}</p>}
        {phase === 'running' && !hud.offTrack && hud.sliding && <p class="game__flag">{labels.sliding}</p>}
      </div>

      <div class="game__actions">
        <button type="button" class="btn" onClick={startRun}>{labels.restart}</button>
        {phase === 'running' && <button type="button" class="btn" onClick={() => setPaused(current => !current)}>{paused ? labels.resume : labels.pause}</button>}
      </div>
      <div class="game__touch">
        <button type="button" class="game__pad" aria-label={labels.brake === 'Frenar' ? 'Girar a la izquierda' : 'Steer left'} {...holdTouch('steer', -1)}>
          ◀
        </button>
        <button type="button" class="game__pad" aria-label={labels.brake === 'Frenar' ? 'Girar a la derecha' : 'Steer right'} {...holdTouch('steer', 1)}>
          ▶
        </button>
        <button type="button" class="game__pad game__pad--wide" {...holdTouch('brake', 1)}>
          {labels.brake}
        </button>
        <button type="button" class="game__pad game__pad--wide" {...holdTouch('throttle', 1)}>
          {labels.throttle}
        </button>
      </div>

      <p class="game__help">
        {labels.keyboard}
        <span class="game__help-sep"> · </span>
        {labels.touch}
      </p>
    </div>
  );
}
