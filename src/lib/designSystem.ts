/**
 * THE DESIGN SYSTEM — code mirror of docs/DESIGN_SYSTEM.md.
 *
 * Every future object inherits its numbers from here; nothing is
 * designed independently. If a value you need is missing, add it to
 * the doc first, then here, then use it. Colors stay single-sourced
 * in `PALETTE` (constants.ts); this module holds form, motion, and
 * material tokens plus the landmark accent map.
 */

/** ---- World scale (the player is the yardstick) ---------------------- */
export const SCALE = {
  /** The player's height — everything reads relative to this. */
  unit: 1.0,
  villagerMin: 0.96,
  villagerMax: 1.04,
  treeMin: 1.5,
  treeMax: 2.0,
} as const

/** ---- The monument family: one mold for every landmark ---------------
 * The Projects monument (Phase 6) established this language; every
 * future landmark inherits it and changes ONLY accent + symbol + name.
 * Construction mirrors the UI pillow shell: body → inset face →
 * symbol + label. */
export const LANDMARK = {
  body: {
    width: 2.1,
    height: 2.55,
    depth: 0.8,
    radius: 0.33, // extremely soft bevels — the pillow ratio
    /** How deep the base sinks into the floor swell. */
    sink: 0.24,
    /** The flush accent-washed inset panel on the front. */
    faceWidth: 1.62,
    faceHeight: 2.05,
    faceRadius: 0.26,
  },
  swell: { width: 3.1, height: 0.16, depth: 3.1, radius: 0.08, sink: 0.1 },
  /** Symbol zone: center height and stroke radius of glyph bars. */
  symbol: { width: 0.9, centerY: 1.56, barRadius: 0.055 },
  /** Proximity: enter/exit hysteresis for the overlay card. */
  enterDistance: 3.0,
  exitDistance: 3.6,
} as const

/** ---- Landmark pods: each monument stands on its own small grassy
 * mound — a truncated cone (flat top, sloped sides) so trees, the
 * lamppost, and the monument itself all place at one known height
 * (POD.mound.height). Three steps embed into the front (+Z, toward
 * the plaza center) slope; the rest of the mound's base meets the
 * plaza tile flush, no seam. */
export const POD = {
  mound: { topRadius: 1.85, baseRadius: 2.35, height: 0.46 },
  steps: [
    { y: 0.36, z: 1.55, width: 1.5, depth: 0.55 },
    { y: 0.2, z: 1.95, width: 1.65, depth: 0.55 },
    { y: 0.04, z: 2.35, width: 1.8, depth: 0.6 },
  ],
  /** Trees flank the monument at the back corners of the mound. */
  trees: { x: 1.35, z: -0.55 },
  /** The lamppost stands beside the steps. */
  lamp: { x: 1.55, z: 1.1 },
  /** Little flower tuft at the base of the steps. */
  flowers: { x: -1.5, z: 1.9 },
} as const

/** ---- Corner radii: fraction of the shorter side (squircle law) ----- */
export const RADIUS_RATIO = {
  pillow: 0.28, // hero: landmark faces, cards, pills (24–33%)
  standard: 0.22, // tiles, pedestals, keycaps (18–24%)
  soft: 0.16, // platforms, steps, swells (15–18%)
} as const

/** ---- Material roughness bands (metalness is ALWAYS 0) --------------- */
export const ROUGHNESS = {
  gloss: 0.16, // landmark bodies, sign faces
  sheen: 0.3, // molded symbols, accent parts
  ground: 0.5, // floor, swells, steps
  skin: 0.6,
  shirt: 0.55,
  hair: 0.7,
  foliage: 0.75,
} as const

/** ---- Glow: light is life (eased at GLOW.lambda) --------------------- */
export const GLOW = {
  bodyIdle: 0.04,
  bodyNear: 0.1,
  symbolIdle: 0.22,
  symbolBreath: 0.04,
  symbolNear: 0.55,
  lambda: 4,
  /** Bloom pass: a whisper, never a haze. Threshold sits close to 1.0
   *  on purpose — under NoToneMapping, the plaza's near-white sky/fog/
   *  tile surfaces genuinely hit ~0.9+ luminance under the scene's
   *  lighting, so a 0.9 threshold bloomed the ENTIRE horizon band into
   *  a soft white haze that washed out the panels near it. Only true
   *  highlights (accent glow, lantern) should catch bloom now. */
  bloom: { threshold: 0.97, smoothing: 0.15, intensity: 0.18 },
} as const

/** ---- Landmark accents: one pastel per location ---------------------- */
export const ACCENTS = {
  about: '#cdb9ea', // lavender — person mark
  projects: '#a9c9e8', // blue — </> mark
  experience: '#b8e6c9', // green — briefcase mark
  skills: '#f2d38f', // gold — spark mark
  contact: '#f2b8c6', // pink — chat-bubble mark
  resume: '#a8dde0', // teal — document mark
} as const

/** ---- Motion ---------------------------------------------------------- */
export const MOTION = {
  /** UI enter/exit — an app icon coming to life. */
  uiEnterMs: 320,
  /** The house curve (also exported from PlazaCard as PLAZA_EASE). */
  ease: [0.22, 1, 0.36, 1] as const,
  /** expDamp λ cheat sheet. */
  lambda: { dreamy: 1, camera: 2.4, body: 5, controls: 10 },
  breathCycleS: 2,
  strollSpeed: 0.5, // villagers (player walks 1.6)
} as const

/** ---- Typography (one face: bundled Quicksand 700) ------------------- */
export const TYPE = {
  ink: '#54636e',
  soft: '#8a97a0',
  faint: '#a3aeb5',
  titleSize3D: 6,
} as const
