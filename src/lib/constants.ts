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

/** Where the avatar lives (and spawns), in degrees. Low-center of the
 *  tableau frame: a few steps south of the fountain, facing into the
 *  plaza with his back to the visitor — just like the reference. */
export const AVATAR_LAT = 79
export const AVATAR_LON = 0

/** ---- The tableau: one fixed, art-directed frame --------------------
 * The camera is locked high and pulled back with a long lens so the
 * plaza reads as a compressed diorama. The character walks freely
 * WITHIN the frame (leashed to the staged area); the camera never
 * follows. Mouse adds only a gentle eased look-around. */
export const TABLEAU_CAMERA_POS: readonly [number, number, number] = [0, 38, 26]
export const TABLEAU_CAMERA_TARGET: readonly [number, number, number] = [0, 23.2, -2]
export const TABLEAU_FOV = 28
/** Static fog band: plaza crisp, the planet's limb melts into sky. */
export const TABLEAU_FOG: readonly [number, number] = [40, 100]
/** How far (degrees of arc from the pole) the character may wander —
 *  the stage ends where the frame does. */
export const TABLEAU_WALK_LIMIT_DEG = 30

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
export const CLOUD_SCALE = 2.5

/**
 * The world palette — soft, unsaturated, optimistic.
 * White sky, gentle greens, pastel accents. No neon, ever.
 */
export const PALETTE = {
  /** Sunny spring-morning sky: a genuine blue easing to white at the
   *  horizon — bright and warm, never overcast (see DESIGN_SYSTEM §8). */
  skyTop: '#a5d3f0',
  skyMid: '#d6ecfa',
  skyHorizon: '#ffffff',
  /** Fog: almost white with a hint of sky blue. */
  fog: '#eef8fe',
  /** The plaza floor: cool near-white tiles reflecting the sky. */
  ground: '#f8fafc',
  groundLine: '#e5eaee',
  grass: '#8fce7f',
  grassLight: '#a5dc94',
  grassDark: '#7cbe6e',
  cloud: '#ffffff',
  cloudShade: '#eef4f6',
  /** Shadows lean blue-gray, never neutral gray. */
  shadow: '#c5cfd9',
  ambient: '#eef6ff',
  keyLight: '#fff6e8',
  fillLight: '#e8f2ff',
  /** The avatar: soft skin, warm hair, one pastel accent — a friendly
   *  little person in a blue hoodie, soft navy pants, white sneakers. */
  skin: '#f6cfae',
  hair: '#584639',
  shirt: '#a9c9e8',
  pants: '#707c8d',
  shoe: '#f2f5f7',
  face: '#2e2c2a',
} as const

/** Edge length of one floor tile, in world units. Small — the floor
 *  reads as a quiet UI surface supporting the world, not pavement. */
export const TILE_SIZE = 0.42

/** Multiplier applied to ambient world motion when the visitor prefers
 *  reduced motion. The world calms down but never freezes — a frozen
 *  world would feel broken, not respectful. */
export const REDUCED_MOTION_SCALE = 0.25
