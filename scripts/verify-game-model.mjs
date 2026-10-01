#!/usr/bin/env node
/**
 * Model tests for the racing game: track geometry and car physics.
 *
 * These are the parts most likely to be wrong and least likely to be caught by looking
 * at the canvas. The last test is the important one: an autopilot drives a full lap, so
 * "the circuit is drivable and the physics allow a lap" is asserted rather than
 * assumed. A track that cannot be completed, or a grip limit that makes every corner
 * impossible, fails here instead of being discovered by a visitor.
 *
 * Run with type stripping so the TypeScript modules load directly:
 *   pnpm test:model
 */
import { buildTrack, curvatureAhead, locate, sectorOf } from '../src/components/islands/game/track.ts';
import { brakingDistance, createCar, DEFAULT_PHYSICS, stepCar } from '../src/components/islands/game/physics.ts';

const failures = [];
const check = (ok, label, detail = '') => {
  if (ok) console.log(`ok   ${label}`);
  else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

const track = buildTrack(900, 520);
const dt = 1 / 60;

/* ------------------------------------------------------------------ geometry */

check(track.centreline.length > 500, 'track: densely sampled', `${track.centreline.length} samples`);
check(track.totalLength > 1200, 'track: a real lap length', `${Math.round(track.totalLength)} px`);
check(track.halfWidth > 12 && track.halfWidth < 60, 'track: plausible width', `${track.halfWidth.toFixed(1)} px`);
check(track.sectorStarts.length === 3, 'track: three sectors declared');

const atStart = locate(track, track.start);
check(atStart.onTrack && atStart.distance < 1, 'track: the start point is on the track', `d=${atStart.distance.toFixed(2)}`);
check(atStart.progress < 0.01, 'track: the start point is at progress zero', atStart.progress.toFixed(3));

const farAway = locate(track, { x: -500, y: -500 });
check(!farAway.onTrack, 'track: a distant point is off the track', `d=${farAway.distance.toFixed(1)}`);

let monotonic = true;
let previous = 0;
for (let index = 0; index < track.centreline.length; index += 7) {
  const sample = track.centreline[index];
  const found = locate(track, sample, index);
  if (found.progress + 1e-9 < previous) monotonic = false;
  previous = found.progress;
}
check(monotonic, 'track: progress advances monotonically along the centreline');

check(sectorOf(track, 0.05) === 1, 'track: sector 1 before the first boundary');
check(sectorOf(track, 0.5) === 2, 'track: sector 2 in the middle');
check(sectorOf(track, 0.9) === 3, 'track: sector 3 in the final third');

check(curvatureAhead(track, 0, 40) >= 0, 'track: curvature ahead is non-negative');

/* ------------------------------------------------------------------- physics */

const straight = createCar(0, 0, 0);
for (let i = 0; i < 120; i += 1) stepCar(straight, { throttle: 1, brake: 0, steer: 0 }, dt, true);
check(straight.speed > 100, 'physics: throttle builds speed', straight.speed.toFixed(1));
check(straight.speed <= DEFAULT_PHYSICS.maxSpeed, 'physics: speed respects the maximum');

const braking = createCar(0, 0, 0);
braking.speed = DEFAULT_PHYSICS.maxSpeed;
for (let i = 0; i < 30; i += 1) stepCar(braking, { throttle: 0, brake: 1, steer: 0 }, dt, true);
check(braking.speed < DEFAULT_PHYSICS.maxSpeed - 50, 'physics: braking sheds speed', braking.speed.toFixed(1));

// The grip limit is the whole point of the model: full lock at speed must slide, and
// the same lock when slow must not.
const fast = createCar(0, 0, 0);
fast.speed = DEFAULT_PHYSICS.maxSpeed;
const fastStep = stepCar(fast, { throttle: 0, brake: 0, steer: 1 }, dt, true);
check(fastStep.slid && fast.sliding, 'physics: full lock at top speed breaks grip');
check(fast.speed < DEFAULT_PHYSICS.maxSpeed, 'physics: sliding scrubs speed', fast.speed.toFixed(1));

const slow = createCar(0, 0, 0);
slow.speed = 90;
stepCar(slow, { throttle: 0, brake: 0, steer: 1 }, dt, true);
check(!slow.sliding, 'physics: the same lock at low speed holds grip');

// Off the track must never be faster than on it, or cutting corners would be optimal.
const onTrack = createCar(0, 0, 0);
const offTrack = createCar(0, 0, 0);
for (let i = 0; i < 120; i += 1) {
  stepCar(onTrack, { throttle: 1, brake: 0, steer: 0 }, dt, true);
  stepCar(offTrack, { throttle: 1, brake: 0, steer: 0 }, dt, false);
}
check(
  offTrack.speed < onTrack.speed,
  'physics: the grass is slower than the track',
  `${offTrack.speed.toFixed(1)} vs ${onTrack.speed.toFixed(1)}`,
);

check(
  brakingDistance(200) > brakingDistance(100) && brakingDistance(100) > brakingDistance(0),
  'physics: braking distance grows with speed',
);

/* --------------------------------------------------------- a full driven lap */

/**
 * An autopilot: aim at a point a fixed distance ahead on the centreline, brake when the
 * corner ahead is tight, throttle otherwise. It is not a racing line, it is a sanity
 * check that the circuit can be completed at all.
 */
function driveLap() {
  const car = createCar(track.start.x, track.start.y, track.startHeading);
  let hint;
  let lapsCompleted = 0;
  let previousProgress = 0;
  const splits = [null, null, null];
  let sectorStart = 0;
  let lapStart = 0;
  let sector = 1;
  let time = 0;
  let lapTime = null;

  for (let frame = 0; frame < 60 * 60; frame += 1) {
    const position = locate(track, { x: car.x, y: car.y }, hint);
    hint = position.index;
    time += dt;

    const progress = position.progress;
    if (previousProgress > 0.75 && progress < 0.25) {
      /*
       * Sector three does not end on a sector change, it ends here: the finish line is
       * the boundary. Recording it only in the sector-change branch leaves the third
       * split permanently null, which is exactly the bug this test had.
       */
      splits[2] = time - sectorStart;
      lapTime = time - lapStart;
      lapsCompleted += 1;
      if (lapsCompleted >= 1) break;
      lapStart = time;
      sectorStart = time;
      sector = 1;
    }
    const nextSector = sectorOf(track, progress);
    if (nextSector !== sector && nextSector > sector) {
      splits[sector - 1] = time - sectorStart;
      sectorStart = time;
      sector = nextSector;
    }
    previousProgress = progress;

    // Aim a little further ahead when fast, so the car does not saw at the wheel.
    const lookahead = Math.round(18 + car.speed * 0.22);
    const target = track.centreline[(position.index + lookahead) % track.centreline.length];
    let desired = Math.atan2(target.y - car.y, target.x - car.x);
    let error = desired - car.heading;
    while (error > Math.PI) error -= 2 * Math.PI;
    while (error < -Math.PI) error += 2 * Math.PI;
    const steer = Math.max(-1, Math.min(1, error * 2.2));

    const corner = curvatureAhead(track, position.index, Math.round(30 + car.speed * 0.2));
    // 1/curvature is the radius; the safe speed is where lateral acceleration sits
    // inside the grip limit.
    const safeSpeed = corner > 1e-4 ? Math.sqrt(DEFAULT_PHYSICS.gripLimit / corner) * 0.92 : DEFAULT_PHYSICS.maxSpeed;
    const brake = car.speed > safeSpeed + 12 ? 1 : 0;
    const throttle = brake === 1 ? 0 : car.speed < safeSpeed ? 1 : 0;

    stepCar(car, { throttle, brake, steer }, dt, position.onTrack);
  }
  return { laps: lapsCompleted, splits, lapTime, time };
}

const driven = driveLap();
check(driven.laps >= 1, 'autopilot: completes a full lap', `laps=${driven.laps}`);
check(
  driven.lapTime !== null && driven.lapTime > 4 && driven.lapTime < 45,
  'autopilot: the lap time is in a playable range',
  driven.lapTime === null ? 'no lap' : `${driven.lapTime.toFixed(2)} s`,
);
check(
  driven.splits.every((split) => typeof split === 'number' && split > 0),
  'autopilot: all three sector splits register',
  JSON.stringify(driven.splits.map((s) => (s === null ? null : Number(s.toFixed(2))))),
);
console.log(`\ndriven lap: ${driven.lapTime?.toFixed(3)} s, sectors ${driven.splits.map((s) => s?.toFixed(3)).join(' / ')}`);
console.log(`physics: max ${DEFAULT_PHYSICS.maxSpeed} px/s, grip limit ${DEFAULT_PHYSICS.gripLimit} px/s^2`);

if (failures.length > 0) {
  console.error(`\nGame model failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('\nGame model passed.');
