import type { TrajectoryPoint, ShotType } from '../types';

// Physics constants
const GRAVITY = 9.8; // m/s^2
const SCALE = 50; // pixels per meter (for visualization)

// Court dimensions (in meters, converted to pixels)
export const COURT = {
  WIDTH: 800,
  HEIGHT: 600,
  FLOOR_Y: 550,
};

// Hoop configuration
export const HOOP = {
  X: 650, // pixels from left
  Y: 250, // pixels from top
  RADIUS: 20, // hoop radius in pixels
  RIM_THICKNESS: 3,
  BACKBOARD_X: 700,
  BACKBOARD_Y: 200,
  BACKBOARD_HEIGHT: 150,
};

// Ball configuration
export const BALL = {
  RADIUS: 12,
  START_X: 100,
  START_Y: 500,
};

export interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  time: number;
}

/**
 * Calculate ball trajectory using projectile motion physics
 * @param angle Launch angle in degrees
 * @param power Power (0-1) determines initial velocity
 * @returns Array of trajectory points
 */
export function calculateTrajectory(angle: number, power: number): TrajectoryPoint[] {
  const trajectory: TrajectoryPoint[] = [];

  // Initial velocity based on power (5-25 m/s range)
  const initialVelocity = 5 + power * 20;

  // Convert angle to radians
  const angleRad = (angle * Math.PI) / 180;

  // Initial velocity components
  const vx = initialVelocity * Math.cos(angleRad);
  const vy = -initialVelocity * Math.sin(angleRad); // Negative because y increases downward

  // Starting position
  const x0 = BALL.START_X;
  const y0 = BALL.START_Y;

  // Simulate trajectory for 3 seconds max, dt = 0.016s (~60fps)
  const dt = 0.016;
  const maxTime = 3;

  for (let t = 0; t <= maxTime; t += dt) {
    // Projectile motion equations
    const x = x0 + vx * SCALE * t;
    const y = y0 + vy * SCALE * t + 0.5 * GRAVITY * SCALE * t * t;

    trajectory.push({ x, y, t });

    // Stop if ball goes off screen or hits ground
    if (y > COURT.FLOOR_Y || x > COURT.WIDTH || x < 0) {
      break;
    }
  }

  return trajectory;
}

/**
 * Check if ball goes through the hoop
 */
export function checkHoopCollision(trajectory: TrajectoryPoint[]): {
  made: boolean;
  shotType: ShotType;
  distance: number;
} {
  let closestDistance = Infinity;
  let hitRim = false;
  let hitBackboard = false;

  for (let i = 1; i < trajectory.length; i++) {
    const prev = trajectory[i - 1];
    const curr = trajectory[i];

    // Check if ball is near hoop height
    const hoopTop = HOOP.Y - HOOP.RIM_THICKNESS;
    const hoopBottom = HOOP.Y + HOOP.RIM_THICKNESS;

    if (prev.y <= hoopTop && curr.y >= hoopTop) {
      // Ball is passing through hoop plane
      const dx = curr.x - HOOP.X;
      const distance = Math.abs(dx);

      closestDistance = Math.min(closestDistance, distance);

      // Check if ball goes through hoop cleanly
      if (distance < HOOP.RADIUS - BALL.RADIUS) {
        // Perfect swish
        return { made: true, shotType: 'swish', distance };
      } else if (distance < HOOP.RADIUS + BALL.RADIUS) {
        // Hit the rim
        hitRim = true;
        // 50% chance of going in if it hits rim (simplified)
        const goesIn = Math.random() > 0.5;
        if (goesIn) {
          return { made: true, shotType: 'rim_in', distance };
        }
      }
    }

    // Check backboard collision
    if (
      curr.x >= HOOP.BACKBOARD_X - BALL.RADIUS &&
      curr.y >= HOOP.BACKBOARD_Y &&
      curr.y <= HOOP.BACKBOARD_Y + HOOP.BACKBOARD_HEIGHT
    ) {
      hitBackboard = true;
      // Simplified: 30% chance of going in off backboard
      if (Math.abs(curr.y - HOOP.Y) < HOOP.RADIUS * 2) {
        const goesIn = Math.random() > 0.7;
        if (goesIn) {
          return { made: true, shotType: 'backboard', distance: Math.abs(curr.x - HOOP.X) };
        }
      }
    }
  }

  return { made: false, shotType: 'miss', distance: closestDistance };
}

/**
 * Calculate optimal angle for a given power to make the shot
 */
export function getOptimalAngle(power: number): number {
  // Optimal angle is typically around 45-50 degrees for free throws
  // Adjusts slightly based on power
  return 45 + (0.5 - power) * 10;
}

/**
 * Get shot difficulty multiplier based on angle and power
 */
export function getShotDifficulty(angle: number, power: number): number {
  const optimalAngle = getOptimalAngle(power);
  const angleDiff = Math.abs(angle - optimalAngle);

  // Optimal power is around 0.6-0.7
  const optimalPower = 0.65;
  const powerDiff = Math.abs(power - optimalPower);

  // Difficulty increases with deviation from optimal
  return 1 + angleDiff / 20 + powerDiff * 2;
}
