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
  // Rounded SQUARE (2026-07-21, per the reference): near-square with a
  // big squircle radius, not a portrait rectangle. Height 3.6 -> 3.15
  // (aspect ~0.93 at width 2.96), radius 0.47 -> 0.82 (~28% of width).
  body: {
    width: 2.96,
    height: 3.15,
    depth: 1.13,
    radius: 0.82, // squircle — big soft corners
    /** How deep the base sinks into the grass top. */
    sink: 0.3,
    /** The flush colored inset panel on the front. */
    faceWidth: 2.34,
    faceHeight: 2.5,
    faceRadius: 0.6,
  },
  /** Symbol zone: center height (above the grass top) and glyph stroke. */
  symbol: { width: 1.3, centerY: 2.02, barRadius: 0.078 },
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
// Rebuilt 2026-07-21 as an OVAL, LOW island (was a rounded-rectangle box
// sitting too high). Elliptical white rim + grass top (scaled cylinders,
// wider than deep), a low profile, two steps, and grass tufts + flowers
// scattered on top. base/grass are (rx, rz, height): a unit cylinder
// scaled to [rx, height, rz].
export const POD = {
  /** White rim island — the low oval base disc under the grass. Sized
   *  ~3.4 wide (a touch wider than the 2.96 panel) so the six islands
   *  have small visible gaps along the arc instead of merging. */
  base: { rx: 1.7, rz: 1.4, height: 0.16 },
  /** Green grass top, inset so a white rim shows around it. */
  grass: { rx: 1.44, rz: 1.14, height: 0.12 },
  /** Monument offset toward the back of the grass (local -Z; +Z faces
   *  the plaza after the pod's yaw). */
  monumentZ: -0.35,
  /** Two low white steps descending toward the plaza (+Z front). */
  steps: [
    { y: 0.16, z: 1.2, width: 1.5, depth: 0.3, height: 0.1 },
    { y: 0.06, z: 1.48, width: 1.8, depth: 0.3, height: 0.1 },
  ],
  /** Two flanking trees on the grass, behind the monument. */
  trees: [
    { x: -1.02, z: -0.55 },
    { x: 1.02, z: -0.55 },
  ],
  /** Flower tufts scattered on the grass. */
  flowers: [
    { x: -0.85, z: 0.5 },
    { x: 0.8, z: 0.55 },
    { x: 0.05, z: 0.72 },
  ],
  /** Grass-blade tufts scattered on the grass top for detail. */
  grassTufts: [
    { x: -0.55, z: 0.35 },
    { x: 0.5, z: 0.3 },
    { x: -1.0, z: 0.1 },
    { x: 1.02, z: 0.05 },
    { x: -0.2, z: 0.62 },
    { x: 0.3, z: 0.68 },
    { x: -0.7, z: -0.15 },
    { x: 0.72, z: -0.2 },
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
