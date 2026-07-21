/**
 * Global tuning knobs for Ryan Land.
 * Everything size- or feel-related should live here so the whole
 * world can be re-tuned from one place.
 */

/** Radius of the floating plaza island — a flat disc in the sky.
 *  The ground has NO curvature; the island simply ends at a soft
 *  rounded edge and drops off into the atmosphere. Sized just past
 *  the landmark arc's low platforms (monuments sit ~9.2 from center;
 *  platforms + steps add ~1.6 more) so the cliff edge clears them
 *  without leaving a wide empty apron of bare tile beyond the arc. */
export const ISLAND_RADIUS = 9.5

/** Height of the island's cliff edge, where the floor drops into the
 *  sky below the rim. */
export const ISLAND_EDGE_HEIGHT = 1.6

/** Radius of the gradient sky dome surrounding the world. */
export const SKY_DOME_RADIUS = 200

/** Camera far-clip plane. MUST stay beyond SKY_DOME_RADIUS (plus the
 *  camera's own offset from center) or the dome clips out entirely and
 *  the sky renders as the flat white canvas background. Deriving this
 *  from ISLAND_RADIUS caused exactly that bug when the island shrank. */
export const CAMERA_FAR = SKY_DOME_RADIUS * 1.3

/** Where the avatar spawns: low-center of the tableau frame, a few
 *  steps south of the fountain, back to the visitor. Must stay inside
 *  the frame's bottom edge (~43° below the camera's horizontal at the
 *  current TABLEAU rig) or the character spawns head-clipped. */
export const AVATAR_SPAWN_Z = 2.6

/** ---- The tableau: one fixed, art-directed frame --------------------
 * The camera is locked high and pulled back with a long lens so the
 * plaza reads as a compressed diorama on a table. The character walks
 * freely WITHIN the frame (leashed to the island); the camera never
 * follows. Mouse adds only a gentle eased look. */
/** Framed to the reference concept image (revised 2026-07-20, THIRD
 * pass). Solved numerically (/tmp/cam5.py) TOGETHER with the scene
 * geometry — the earlier passes failed because they treated the camera
 * as independent of the islands. Reference targets, all measured off
 * the image:
 *   avatar 66% down frame   fountain ~50%   panels ~32% of frame height
 *   side rims OFF both edges (you cannot see the island's sides)
 *   near rim OFF the bottom  generous sky above the arc
 * These are only jointly achievable at a NATURAL lens (fov 42, pitch
 * 22deg — a genuinely lower, undistorted view) because the landmark arc
 * was tightened ~22% and the panels enlarged ~40% this same pass. With
 * the old small islands the only solution was fov 54 / pitch 20, a wide
 * lens that keystoned the outer panels. (The solve accounts for the
 * panels sitting RAISED on grass islands ~0.5u up, height 3.6 -> tops
 * at ~4.1u — a first solve that assumed panels on the bare floor put
 * their tops through the top edge.)
 *
 * If these move, re-check FOUR coupled things or the frame breaks in
 * ways that look like unrelated bugs:
 *   1. the near-rim ray (rim at z=+ISLAND_RADIUS must stay below the
 *      bottom edge, or the disc's front lip appears)
 *   2. Sky.tsx's gradient stops (calibrated to the visible elevation
 *      band, which this pitch/fov defines)
 *   3. TABLEAU_FOG (panels must sit in front of fog-near)
 *   4. the DOF focus distance in Experience.tsx (avatar distance) */
export const TABLEAU_CAMERA_POS: readonly [number, number, number] = [0, 6.62, 13.91]
export const TABLEAU_CAMERA_TARGET: readonly [number, number, number] = [0, 1.0, 0]
export const TABLEAU_FOV = 42
/** Static fog band. At the 2026-07-20 third-pass rig the far panels sit
 *  ~22u from the camera and the far rim ~24u — fog must start beyond the
 *  panels (or the arc washes out) but close enough that the rim still
 *  melts into sky. */
export const TABLEAU_FOG: readonly [number, number] = [24, 62]
/** How far from the island's center the character may wander — the
 *  stage ends before the edge does. */
export const TABLEAU_WALK_RADIUS = 8.4

/** Walking speed along the surface, world units per second. */
export const WALK_SPEED = 1.6

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
  /** The plaza floor: cool light grey reflecting the sky. NOT
   *  near-white — it was #f8fafc (97% white), which under a real tone
   *  curve left no headroom at all: the floor clipped flat, taking the
   *  cobble pattern and every shadow on it with it. The reference's
   *  plaza is a light grey, not paper. */
  ground: '#e9eef3',
  groundLine: '#c3ccd6',
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
  /** Landmark-pod dressing: tree trunks and two canopy palettes. */
  trunk: '#b08968',
  blossomDark: '#e8a8c2',
  blossom: '#f3c6d9',
  blossomLight: '#fadeea',
} as const

/** Edge length of one floor tile, in world units. Small — the floor
 *  reads as a quiet UI surface supporting the world, not pavement. */
export const TILE_SIZE = 0.42

/** Multiplier applied to ambient world motion when the visitor prefers
 *  reduced motion. The world calms down but never freezes — a frozen
 *  world would feel broken, not respectful. */
export const REDUCED_MOTION_SCALE = 0.25
