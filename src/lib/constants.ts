/**
 * Global tuning knobs for Ryan Land.
 * Everything size- or feel-related should live here so the whole
 * world can be re-tuned from one place.
 */

/** Radius of the floating plaza island — a flat disc in the sky.
 *  The ground has NO curvature; the island simply ends at a soft
 *  rounded edge and drops off into the atmosphere. */
export const ISLAND_RADIUS = 16

/** Height of the island's cliff edge, where the floor drops into the
 *  sky below the rim. */
export const ISLAND_EDGE_HEIGHT = 1.6

/** Camera far-clip plane — generous enough to keep the cloud ring and
 *  sky dome from clipping. */
export const CAMERA_FAR = ISLAND_RADIUS * 15

/** Where the avatar spawns: low-center of the tableau frame, a few
 *  steps south of the fountain, back to the visitor. */
export const AVATAR_SPAWN_Z = 4.7

/** ---- The tableau: one fixed, art-directed frame --------------------
 * The camera is locked high and pulled back with a long lens so the
 * plaza reads as a compressed diorama on a table (~37 degrees down).
 * The character walks freely WITHIN the frame (leashed to the island);
 * the camera never follows. Mouse adds only a gentle eased look. */
export const TABLEAU_CAMERA_POS: readonly [number, number, number] = [0, 15, 19]
export const TABLEAU_CAMERA_TARGET: readonly [number, number, number] = [0, -0.5, -3]
export const TABLEAU_FOV = 28
/** Static fog band: plaza crisp; distance melts into the sky. */
export const TABLEAU_FOG: readonly [number, number] = [32, 75]
/** How far from the island's center the character may wander — the
 *  stage ends before the edge does. */
export const TABLEAU_WALK_RADIUS = 12.5

/** Walking speed along the surface, world units per second. */
export const WALK_SPEED = 1.6

/** Altitude band (above the surface) where clouds live. */
export const CLOUD_ALTITUDE_MIN = 2.0
export const CLOUD_ALTITUDE_MAX = 12.0

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
