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

/** Camera altitude when focused on the avatar: just above head
 *  height, so the shot is a portrait — never a top-down view. */
export const CAMERA_FOCUS_RADIUS = PLANET_RADIUS + 1.25

/** Degrees of latitude the focus camera stands away from its subject
 *  along the ground (≈4 world units) — the portrait's distance. The
 *  camera stands on the equator side, the same side the far intro
 *  view arrives from, so the push-in never flies past the subject. */
export const FOCUS_LAT_OFFSET = 9

/** Where the avatar lives (and spawns), in degrees. Near the top of
 *  the planet: there the surface "up" almost matches world up, so the
 *  intro zoom needs no disorienting camera roll, and the far planet
 *  view naturally frames him in front. */
export const AVATAR_LAT = 75
export const AVATAR_LON = 0

/** Walking speed along the surface, world units per second. */
export const WALK_SPEED = 1.6

/** Third-person chase camera: behind and above the avatar. Tuned so
 *  the horizon sits ~40% up the frame with a gentle curve. */
export const CHASE_DISTANCE = 4.5
export const CHASE_HEIGHT = 1.6
/** How far ahead of the avatar (along the ground) the camera looks —
 *  closer means more down-pitch, which lifts the horizon in frame. */
export const CHASE_LOOK_AHEAD = 1.4

/** Radians/second the idle camera drifts around the planet. */
export const CAMERA_ORBIT_SPEED = 0.04

/** Altitude band (above the surface) where clouds live. */
export const CLOUD_ALTITUDE_MIN = 3.0
export const CLOUD_ALTITUDE_MAX = 6.0

/** Uniform scale applied to each cloud, so they read from orbit and
 *  still feel like plump companions at walking level. */
export const CLOUD_SCALE = 2.2

/**
 * The world palette — soft, unsaturated, optimistic.
 * White sky, gentle greens, pastel accents. No neon, ever.
 */
export const PALETTE = {
  /** Spring-morning sky: a soft white-to-blue gradient. */
  skyTop: '#dff4ff',
  skyMid: '#eef9ff',
  skyHorizon: '#ffffff',
  /** Fog: almost white with a hint of cyan. */
  fog: '#f2fbff',
  /** The plaza floor: cool near-white tiles reflecting the sky. */
  ground: '#f8fafc',
  groundLine: '#dce3e8',
  grass: '#8fce7f',
  grassLight: '#a5dc94',
  grassDark: '#7cbe6e',
  cloud: '#ffffff',
  cloudShade: '#eef4f6',
  /** Shadows lean blue-gray, never neutral gray. */
  shadow: '#c5cfd9',
  ambient: '#edf5ff',
  keyLight: '#fff8ee',
  fillLight: '#e8f2ff',
  /** The avatar: soft skin, warm hair, one pastel accent. */
  skin: '#f6cfae',
  hair: '#584639',
  shirt: '#a9c9e8',
  pants: '#8d99a6',
  shoe: '#8a939b',
  face: '#2e2c2a',
} as const

/** Edge length of one floor tile, in world units. */
export const TILE_SIZE = 0.85

/** Multiplier applied to ambient world motion when the visitor prefers
 *  reduced motion. The world calms down but never freezes — a frozen
 *  world would feel broken, not respectful. */
export const REDUCED_MOTION_SCALE = 0.25
