/**
 * Car physics.
 *
 * A pure step function, no DOM and no canvas. The model is deliberately small, but it
 * has one property that matters: **grip is finite**. Lateral acceleration is
 * `speed * turnRate`, and past the limit the car slides and loses speed. That single
 * constraint is what turns "hold the accelerator" into a lap that requires braking,
 * which is the only reason a driving game is interesting.
 *
 * Everything is in pixels and seconds, so the numbers are readable and the model can be
 * reasoned about rather than tuned blind.
 */

export interface CarState {
  /** Position on the plane. */
  x: number;
  y: number;
  /** Heading in radians. */
  heading: number;
  /** Forward speed, pixels per second. */
  speed: number;
  /** Latched when lateral acceleration exceeds the grip limit. */
  sliding: boolean;
  /** Set while any wheel is off the track. */
  offTrack: boolean;
  /** Distance travelled since the lap started, for the finish check. */
  distance: number;
}

export interface Controls {
  throttle: number;
  brake: number;
  /** -1 left, 1 right. */
  steer: number;
}

export interface PhysicsConfig {
  /** Top speed on a straight, pixels per second. */
  maxSpeed: number;
  /** Acceleration, pixels per second squared. */
  power: number;
  /** Braking deceleration. */
  braking: number;
  /** Coasting and aero drag. */
  drag: number;
  /** Maximum lateral acceleration the tyres will hold. */
  gripLimit: number;
  /** How quickly the wheels turn at low speed, radians per second. */
  maxSteerRate: number;
  /** Speed at which steering authority halves. */
  steerFalloff: number;
}

/*
 * Tuned against a simulated lap rather than by feel, and measured with the autopilot in
 * `scripts/verify-game-model.mjs`. The track is about 1985 px long and a centreline-only
 * autopilot — the worst possible line, braking to 92% of the safe speed — gets round in
 * 17.35 s. A person taking apexes will be quicker. Full lock at top speed exceeds the
 * grip limit and the same lock at 90 px/s does not, which is the property that makes
 * braking necessary rather than optional, and it is asserted rather than assumed.
 *
 * Raising the grip limit quickly runs into diminishing returns: the autopilot is limited
 * by the track's curvature, not by the tyres, so easing the layout is the lever that
 * would shorten the lap, not more grip.
 */
export const DEFAULT_PHYSICS: PhysicsConfig = {
  maxSpeed: 340,
  power: 250,
  braking: 460,
  drag: 18,
  gripLimit: 270,
  maxSteerRate: 2.6,
  steerFalloff: 160,
};

export function createCar(x: number, y: number, heading: number): CarState {
  return { x, y, heading, speed: 0, sliding: false, offTrack: false, distance: 0 };
}

export interface StepResult {
  /** True on the frame where the car crossed the grip limit. */
  slid: boolean;
  /** True on the frame where the car left the track. */
  left: boolean;
}

/**
 * Advance the car by `dt` seconds.
 *
 * `onTrack` comes from the track geometry, not from here: this module knows nothing
 * about circuits, which keeps the physics testable with a bare boolean.
 */
export function stepCar(
  car: CarState,
  controls: Controls,
  dt: number,
  onTrack: boolean,
  config: PhysicsConfig = DEFAULT_PHYSICS,
): StepResult {
  const wasSliding = car.sliding;
  const wasOff = car.offTrack;

  // Longitudinal. Off the track the surface is dirty, so power is wasted and the car
  // scrubs speed: a shortcut is never faster, which is the point.
  const surface = onTrack ? 1 : 0.45;
  const speeding = car.speed / config.maxSpeed;

  // Engine power falls away with speed, so acceleration is not linear.
  const engine = controls.throttle * config.power * surface * (1 - 0.65 * speeding);
  const brake = controls.brake * config.braking * surface;
  const rolling = config.drag * surface;

  car.speed += (engine - brake - rolling) * dt;
  car.speed = Math.max(0, Math.min(config.maxSpeed, car.speed));

  // Steering authority shrinks with speed. Without this the car can pivot on the spot
  // at top speed, and no corner would ever need braking.
  const authority = config.steerFalloff / (config.steerFalloff + car.speed);
  const turnRate = controls.steer * config.maxSteerRate * authority;
  const lateral = Math.abs(car.speed * turnRate);

  // The grip limit. Past it the car understeers: it keeps some of its turn, scrubs
  // speed, and the player sees it happen.
  let effectiveTurn = turnRate;
  car.sliding = lateral > config.gripLimit;
  if (car.sliding) {
    effectiveTurn *= config.gripLimit / lateral;
    const excess = lateral - config.gripLimit;
    car.speed = Math.max(40, car.speed - excess * 0.06 * dt * 60);
  }

  car.heading += effectiveTurn * dt;

  const travel = car.speed * dt;
  car.x += Math.cos(car.heading) * travel;
  car.y += Math.sin(car.heading) * travel;
  car.distance += travel;
  car.offTrack = !onTrack;

  return { slid: car.sliding && !wasSliding, left: car.offTrack && !wasOff };
}

/** Braking distance at the current speed, for the corner readout. */
export function brakingDistance(speed: number, config: PhysicsConfig = DEFAULT_PHYSICS): number {
  if (speed <= 0) return 0;
  return (speed * speed) / (2 * config.braking);
}
