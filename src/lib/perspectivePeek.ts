/** Limited living-bed perspective peek. Not free orbit. */

export const PEEK_YAW_LIMIT_DEG = 13;
export const PEEK_PITCH_LIMIT_DEG = 7;
export const PEEK_YAW_LIMIT = (PEEK_YAW_LIMIT_DEG * Math.PI) / 180;
export const PEEK_PITCH_LIMIT = (PEEK_PITCH_LIMIT_DEG * Math.PI) / 180;
export const PEEK_DRAG_THRESHOLD_PX = 7;
/** Follow the pointer while held. Higher is snappier. */
export const PEEK_FOLLOW = 16;
/** Critically damped spring back to the authored frame. */
export const PEEK_SPRING_STIFFNESS = 42;
export const PEEK_SPRING_DAMPING = 2 * Math.sqrt(PEEK_SPRING_STIFFNESS);
export const PEEK_SETTLE_ANGLE = 0.0003;
export const PEEK_SETTLE_VELOCITY = 0.0009;

export type PeekAngles = {
  yaw: number;
  pitch: number;
};

export type PeekGesture = {
  pointerId: number | null;
  lastX: number;
  lastY: number;
  moved: number;
  dragged: boolean;
  holding: boolean;
  targetYaw: number;
  targetPitch: number;
  yaw: number;
  pitch: number;
  yawVel: number;
  pitchVel: number;
};

export const createPeekGesture = (): PeekGesture => ({
  pointerId: null,
  lastX: 0,
  lastY: 0,
  moved: 0,
  dragged: false,
  holding: false,
  targetYaw: 0,
  targetPitch: 0,
  yaw: 0,
  pitch: 0,
  yawVel: 0,
  pitchVel: 0,
});

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const clampPeekAngles = (yaw: number, pitch: number): PeekAngles => ({
  yaw: clamp(yaw, -PEEK_YAW_LIMIT, PEEK_YAW_LIMIT),
  pitch: clamp(pitch, -PEEK_PITCH_LIMIT, PEEK_PITCH_LIMIT),
});

/** OrbitControls-style: drag right/up moves the camera around the target. */
export const peekFromPointerDelta = (
  current: PeekAngles,
  dx: number,
  dy: number,
  viewSpan: number,
): PeekAngles => {
  const span = Math.max(viewSpan, 1);
  return clampPeekAngles(
    current.yaw - (dx / span) * (2 * PEEK_YAW_LIMIT),
    current.pitch - (dy / span) * (2 * PEEK_PITCH_LIMIT),
  );
};

export const isPeekDrag = (distancePx: number) =>
  distancePx >= PEEK_DRAG_THRESHOLD_PX;

export const dampAngle = (
  current: number,
  target: number,
  dt: number,
  lambda = PEEK_FOLLOW,
) => current + (target - current) * (1 - Math.exp(-lambda * Math.max(dt, 0)));

export const stepSpringAngle = (
  value: number,
  velocity: number,
  target: number,
  dt: number,
) => {
  const safeDt = Math.min(Math.max(dt, 0), 0.048);
  const acceleration =
    -PEEK_SPRING_STIFFNESS * (value - target) - PEEK_SPRING_DAMPING * velocity;
  const nextVelocity = velocity + acceleration * safeDt;
  return {
    value: value + nextVelocity * safeDt,
    velocity: nextVelocity,
  };
};

export const peekIsSettled = (gesture: Pick<
  PeekGesture,
  "yaw" | "pitch" | "yawVel" | "pitchVel"
>) =>
  Math.abs(gesture.yaw) < PEEK_SETTLE_ANGLE &&
  Math.abs(gesture.pitch) < PEEK_SETTLE_ANGLE &&
  Math.abs(gesture.yawVel) < PEEK_SETTLE_VELOCITY &&
  Math.abs(gesture.pitchVel) < PEEK_SETTLE_VELOCITY;

export const stepPeekGesture = (
  gesture: PeekGesture,
  dt: number,
  options: { reducedMotion?: boolean } = {},
) => {
  if (gesture.holding) {
    gesture.yaw = dampAngle(gesture.yaw, gesture.targetYaw, dt);
    gesture.pitch = dampAngle(gesture.pitch, gesture.targetPitch, dt);
    gesture.yawVel = 0;
    gesture.pitchVel = 0;
    return;
  }

  if (options.reducedMotion) {
    gesture.yaw = 0;
    gesture.pitch = 0;
    gesture.yawVel = 0;
    gesture.pitchVel = 0;
    return;
  }

  if (peekIsSettled(gesture)) {
    gesture.yaw = 0;
    gesture.pitch = 0;
    gesture.yawVel = 0;
    gesture.pitchVel = 0;
    return;
  }

  const nextYaw = stepSpringAngle(gesture.yaw, gesture.yawVel, 0, dt);
  const nextPitch = stepSpringAngle(gesture.pitch, gesture.pitchVel, 0, dt);
  gesture.yaw = nextYaw.value;
  gesture.yawVel = nextYaw.velocity;
  gesture.pitch = nextPitch.value;
  gesture.pitchVel = nextPitch.velocity;
};

/**
 * Orbit the authored camera around its look-at by yaw (around world Y)
 * and pitch (polar). Zero angles return the rest pose.
 */
export const peekedPosition = (
  rest: readonly [number, number, number],
  target: readonly [number, number, number],
  yaw: number,
  pitch: number,
): [number, number, number] => {
  const offsetX = rest[0] - target[0];
  const offsetY = rest[1] - target[1];
  const offsetZ = rest[2] - target[2];
  const radius = Math.hypot(offsetX, offsetY, offsetZ) || 1;
  const theta = Math.atan2(offsetX, offsetZ) + yaw;
  const phi = clamp(
    Math.acos(clamp(offsetY / radius, -1, 1)) + pitch,
    0.04,
    Math.PI - 0.04,
  );
  const sinPhi = Math.sin(phi);
  return [
    target[0] + radius * sinPhi * Math.sin(theta),
    target[1] + radius * Math.cos(phi),
    target[2] + radius * sinPhi * Math.cos(theta),
  ];
};
