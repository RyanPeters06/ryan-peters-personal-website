/**
 * Exponential smoothing toward a target — frame-rate independent.
 * `lambda` is the responsiveness (higher = snappier). The workhorse
 * behind every "nothing should snap" rule in the project.
 */
export function expDamp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt)
}
