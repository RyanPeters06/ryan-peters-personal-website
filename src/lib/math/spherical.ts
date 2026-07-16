import { Quaternion, Vector3 } from 'three'

/**
 * Spherical math — the single source of truth for living on the planet.
 *
 * Every object, the avatar, and the camera all agree on one convention:
 *   - latitude  (degrees):  -90 (south pole) .. +90 (north pole)
 *   - longitude (degrees): -180 .. +180, wrapping freely
 *   - +Y is "up" at (lat 90), and (lat 0, lon 0) faces +Z.
 *
 * Functions that return vectors accept an optional `out` parameter so
 * frame-loop code can avoid allocating per frame.
 */

const WORLD_UP = new Vector3(0, 1, 0)

// Scratch objects for allocation-free frame-loop math.
const _a = new Vector3()
const _b = new Vector3()

export interface LatLon {
  /** degrees, -90..90 */
  lat: number
  /** degrees, -180..180 */
  lon: number
}

const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

/** Convert (lat°, lon°) on a sphere of `radius` to a world position. */
export function latLonToVec3(
  lat: number,
  lon: number,
  radius: number,
  out: Vector3 = new Vector3(),
): Vector3 {
  const latR = lat * DEG2RAD
  const lonR = lon * DEG2RAD
  const cosLat = Math.cos(latR)
  return out.set(
    radius * cosLat * Math.sin(lonR),
    radius * Math.sin(latR),
    radius * cosLat * Math.cos(lonR),
  )
}

/** Convert a world position back to (lat°, lon°). Radius is discarded. */
export function vec3ToLatLon(v: Vector3): LatLon {
  const r = v.length()
  if (r === 0) return { lat: 0, lon: 0 }
  return {
    lat: Math.asin(v.y / r) * RAD2DEG,
    lon: Math.atan2(v.x, v.z) * RAD2DEG,
  }
}

/** The outward surface normal (unit vector) at a world position. */
export function surfaceNormal(position: Vector3, out: Vector3 = new Vector3()): Vector3 {
  return out.copy(position).normalize()
}

/**
 * Orientation for standing on the sphere: a quaternion whose local +Y
 * points along the outward surface normal at `position`.
 *
 * Anything placed with this quaternion "stands upright" on the ground.
 */
export function surfaceQuaternion(
  position: Vector3,
  out: Quaternion = new Quaternion(),
): Quaternion {
  surfaceNormal(position, _a)
  return out.setFromUnitVectors(WORLD_UP, _a)
}

/**
 * Great-circle interpolation between two points on the sphere.
 * `t` in [0, 1]. Both inputs are treated as directions; the result is
 * placed at `radius`. This is how everything travels on the planet —
 * walking, camera focus shifts, the lot.
 */
export function slerpOnSphere(
  from: Vector3,
  to: Vector3,
  t: number,
  radius: number,
  out: Vector3 = new Vector3(),
): Vector3 {
  _a.copy(from).normalize()
  _b.copy(to).normalize()

  let cos = _a.dot(_b)
  cos = Math.min(1, Math.max(-1, cos))
  const angle = Math.acos(cos)

  // Nearly identical directions — lerp is safe and stable.
  if (angle < 1e-6) {
    return out.copy(_a).multiplyScalar(radius)
  }

  const sin = Math.sin(angle)
  const wFrom = Math.sin((1 - t) * angle) / sin
  const wTo = Math.sin(t * angle) / sin
  return out
    .set(
      _a.x * wFrom + _b.x * wTo,
      _a.y * wFrom + _b.y * wTo,
      _a.z * wFrom + _b.z * wTo,
    )
    .normalize()
    .multiplyScalar(radius)
}

/** Arc length (world units) between two surface points along the sphere. */
export function greatCircleDistance(from: Vector3, to: Vector3, radius: number): number {
  _a.copy(from).normalize()
  _b.copy(to).normalize()
  const cos = Math.min(1, Math.max(-1, _a.dot(_b)))
  return Math.acos(cos) * radius
}

/** Shortest signed distance (degrees) from one angle to another,
 *  in [-180, 180] — so easing a longitude never takes the long way. */
export function shortestAngleDeltaDeg(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180
}

/**
 * Exponential smoothing toward a target — frame-rate independent.
 * `lambda` is the responsiveness (higher = snappier). The workhorse
 * behind every "nothing should snap" rule in the project.
 */
export function expDamp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt)
}
