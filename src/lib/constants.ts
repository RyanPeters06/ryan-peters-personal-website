/**
 * Global tuning knobs for the tiny planet world.
 * Everything size- or feel-related should live here so the whole
 * world can be re-tuned from one place.
 */

/** Radius of the planet sphere, in world units. Large enough that the
 *  walking horizon sits high and curves gently, while the intro shot
 *  (which frames proportionally) still reads as a tiny toy globe. */
export const PLANET_RADIUS = 24

/** How far the idle cinematic camera orbits from the planet center. */
export const CAMERA_ORBIT_RADIUS = PLANET_RADIUS * 4.3

/** Camera distance when focused on the avatar or a location — an
 *  absolute offset above the surface (the subject is person-sized,
 *  so this must not scale with the planet). */
export const CAMERA_FOCUS_RADIUS = PLANET_RADIUS + 4.2

/** Degrees of latitude the focus camera sits above its subject —
 *  small, so the front shot is eye-level-ish rather than top-down. */
export const FOCUS_LAT_OFFSET = 3

/** Where the avatar lives (and spawns), in degrees. */
export const AVATAR_LAT = 16
export const AVATAR_LON = -20

/** Walking speed along the surface, world units per second. */
export const WALK_SPEED = 1.6

/** Third-person chase camera: behind and above the avatar. Tuned so
 *  the horizon sits ~40% up the frame with a gentle curve. */
export const CHASE_DISTANCE = 4.5
export const CHASE_HEIGHT = 1.6
/** How far ahead of the avatar (along the ground) the camera looks. */
export const CHASE_LOOK_AHEAD = 2.5

/** Radians/second the idle camera drifts around the planet. */
export const CAMERA_ORBIT_SPEED = 0.04

/** Altitude band (above the surface) where clouds live. */
export const CLOUD_ALTITUDE_MIN = 2.2
export const CLOUD_ALTITUDE_MAX = 4.5

/**
 * The world palette — soft, unsaturated, optimistic.
 * White sky, gentle greens, pastel accents. No neon, ever.
 */
export const PALETTE = {
  sky: '#eef2f4',
  /** The plaza floor: bright white tiles with soft gray seams. */
  ground: '#ffffff',
  groundLine: '#ccd4d9',
  grass: '#8fce7f',
  grassLight: '#a5dc94',
  grassDark: '#7cbe6e',
  cloud: '#ffffff',
  cloudShade: '#eef4f6',
  shadow: '#c9d4d2',
  keyLight: '#fff7ec',
  fillLight: '#eaf4ff',
  /** The avatar: soft skin, warm hair, one pastel accent. */
  skin: '#f6cfae',
  hair: '#584639',
  shirt: '#a9c9e8',
  pants: '#8d99a6',
  face: '#3d3833',
} as const

/** Edge length of one floor tile, in world units. */
export const TILE_SIZE = 0.85

/** Multiplier applied to ambient world motion when the visitor prefers
 *  reduced motion. The world calms down but never freezes — a frozen
 *  world would feel broken, not respectful. */
export const REDUCED_MOTION_SCALE = 0.25
