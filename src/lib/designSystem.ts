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
  // Enlarged ~1.41x (2026-07-20) so the panels read LARGE and close in
  // frame at a natural (non-wide-angle) lens — the reference's panels
  // fill ~32% of frame height, which a moderate camera can only deliver
  // if the panels themselves are big. Was 2.1x2.55x0.8.
  body: {
    width: 2.96,
    height: 3.6,
    depth: 1.13,
    radius: 0.47, // extremely soft bevels — the pillow ratio
    /** How deep the base sinks into the grass top. */
    sink: 0.34,
    /** The flush accent-washed inset panel on the front. */
    faceWidth: 2.28,
    faceHeight: 2.89,
    faceRadius: 0.37,
  },
  /** Symbol zone: center height (above the grass top) and glyph stroke. */
  symbol: { width: 1.27, centerY: 2.2, barRadius: 0.078 },
  /** Proximity: enter/exit hysteresis for the overlay card. */
  enterDistance: 3.4,
  exitDistance: 4.0,
} as const

/** ---- Landmark pods: each monument stands on a LOW, subtle platform
 * — not a hill. (Revised 2026-07-19: the grass-mound "floating pod"
 * treatment read as separated islands with sky gaps between them,
 * against the reference's one continuous plaza floor. Platforms are
 * barely raised — two shallow steps down to the shared tile floor —
 * and share the floor's own white tile material, not grass, so the
 * ground reads unbroken between landmarks.) A thin grass trim strip
 * behind the platform and a single flanking tree are the only planting
 * tied to the pod itself; lampposts, the bench, and extra flowers are
 * scattered across the open plaza instead (see world/PlazaDressing.tsx). */
// Rebuilt 2026-07-20 as the reference's raised GRASS ISLAND (was a flat
// white platform + trim). Each landmark stands on a rounded grass-topped
// disc inside a white rim, with a real staircase down to the plaza and
// trees/flowers planted on the grass. Sized (tangential width ~4.3) so
// the islands nearly touch along the tightened arc, forming one big
// crescent like the reference. The monument sits toward the BACK of the
// grass so the visitor reads its face across the greenery.
export const POD = {
  /** White rim island — the base disc under the grass. */
  base: { width: 4.3, depth: 3.6, height: 0.34, radius: 0.34 },
  /** Green grass top, inset so a white rim shows around it. */
  grass: { width: 3.78, depth: 3.08, height: 0.18, radius: 0.3 },
  /** Monument offset toward the back of the grass (local -Z; +Z faces
   *  the plaza after the pod's yaw). */
  monumentZ: -0.55,
  /** Three white steps descending toward the plaza (+Z front), widening
   *  as they drop. topY of the island is base.height + grass.height. */
  steps: [
    { y: 0.44, z: 1.72, width: 1.7, depth: 0.34, height: 0.14 },
    { y: 0.29, z: 2.02, width: 2.0, depth: 0.34, height: 0.14 },
    { y: 0.14, z: 2.32, width: 2.3, depth: 0.34, height: 0.14 },
  ],
  /** Two flanking trees on the grass, behind the monument. */
  trees: [
    { x: -1.55, z: -1.0 },
    { x: 1.55, z: -1.0 },
  ],
  /** Flower tufts scattered on the grass in front of the monument. */
  flowers: [
    { x: -1.35, z: 0.85 },
    { x: 1.25, z: 0.95 },
    { x: 0.15, z: 1.15 },
  ],
} as const

/** Height of an island's grass top above the plaza floor. */
export const POD_TOP_Y = POD.base.height + POD.grass.height

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
