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
    /** The colored inset panel on the front. (Kept full-width: narrowing
     *  it exposed foliage/bevel slivers at the panel's angled right edge;
     *  the reference's "inset" look is carried by the accent tint below,
     *  not a physical recess, which shadowed the face and threw an
     *  artifact.) */
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
// Enlarged 2026-07-23 (Peter): the grass ovals were barely wider than
// the 2.96 panel (grass rx 1.5 vs panel half-width 1.48 — no side
// margin), so the panel read as filling the island edge-to-edge. The
// reference has a generous grass apron on ALL sides, with trees/bushes
// out in the margins. Grown to ~0.4u of clear grass past each panel
// edge; the tangential (rx) growth is capped so neighbours only kiss
// into a crescent along the tightest arc join rather than fully merging.
export const POD = {
  /** White rim island — the low oval base disc under the grass. A thin
   *  (~0.17u) rim around the grass dome. */
  /** Deepened 2026-07-29 to give the trees ground BEHIND the panel to
   *  stand on. rx is capped by the neighbours: pods sit 4.75 apart, so
   *  base.rx must stay under ~2.37 or adjacent islands touch. */
  base: { rx: 2.22, rz: 2.02, height: 0.16 },
  /** Green grass mound — a low convex DOME (not a flat coin), inset so a
   *  white rim shows around it. `cap` is the dome's peak height above the
   *  base; dressing sits on the dome surface (see LocationPod's domeY). */
  grass: { rx: 2.05, rz: 1.85, cap: 0.32 },
  /** Monument offset toward the back of the grass (local -Z; +Z faces
   *  the plaza after the pod's yaw). Held fixed so the panel — and thus
   *  the solved camera framing — doesn't move as the island grows. */
  monumentZ: -0.35,
  /** Two low white steps descending toward the plaza (+Z front). */
  steps: [
    { y: 0.16, z: 1.75, width: 1.7, depth: 0.32, height: 0.1 },
    { y: 0.06, z: 2.06, width: 2.05, depth: 0.32, height: 0.1 },
  ],
  /** Two trees in the FRONT apron, flanking the panel's lower third
   *  (revised 2026-07-29 — they used to intersect it at scale 2.0).
   *  The front is the only workable region: the ellipse is widest at its
   *  middle, which is exactly where the panel sits, and there is no
   *  grass left behind the panel at these x offsets. Behind-the-panel
   *  also hid them completely, and deepening the island backwards pushed
   *  its rim further past the plaza's own edge.
   *
   *  CLEARANCE, re-measured 2026-08-05 across all twelve seeded trees.
   *  The figure here used to read "±0.53 in x" and had gone stale — the
   *  trees of 2026-08-04 actually reached ±0.565, because that canopy's
   *  extent was an emergent `d + r` rather than a controlled input. The
   *  current Tree.tsx places lobes tangent to an enclosing sphere, so
   *  its reach is bounded by construction.
   *
   *  The panel occupies x ∈ [−1.48, 1.48], z ∈ [−0.915, 0.215].
   *  - HARD constraint is z: the deepest tree's back edge sits at 0.450
   *    — clear IN FRONT of the panel's face by 0.235. Breaking this is
   *    the bug this comment exists to prevent.
   *  - SOFT constraint is x: the grass ellipse is 1.759 half-wide at
   *    z 0.95, so a tree at x 1.24 begins overhanging past ±0.519. The
   *    widest measures ±0.536, i.e. a canopy overhanging grass by <2cm.
   *    That is natural and fine — don't "fix" it by shrinking the trees.
   *  Re-run the offline extent check if the canopy layout changes. */
  trees: [
    { x: -1.24, z: 0.95 },
    { x: 1.24, z: 0.95 },
  ],
  /** Rounded bushes for foliage volume, in the side/back margins. */
  bushes: [
    { x: -0.62, z: 1.62 },
    { x: 0.62, z: 1.62 },
  ],
  /** A couple of little grey pebbles nestled in the grass, like the
   *  reference's rocks. (x, z, r) */
  rocks: [
    { x: 0.95, z: 1.45, r: 0.14 },
    { x: -0.85, z: 1.38, r: 0.11 },
  ],
  /** Proper blooms (daisies/forget-me-nots/pink) scattered on the grass,
   *  spread into the fuller lawn — see world/Flower.tsx. */
  flowers: [
    { x: -0.72, z: 1.28, kind: 'daisy' },
    { x: 0.68, z: 1.32, kind: 'daisy' },
    { x: 0.05, z: 1.02, kind: 'forgetMeNot' },
    { x: -0.45, z: 0.42, kind: 'pink' },
    { x: 0.55, z: 0.38, kind: 'forgetMeNot' },
  ],
  /** Green leaf sprigs for low foliage detail on the dome. */
  leaves: [
    { x: -0.75, z: 0.85 },
    { x: 0.8, z: 0.5 },
  ],
  /** Grass-blade tufts scattered densely across the grass mound. */
  grassTufts: [
    { x: -0.62, z: 0.55 },
    { x: 0.58, z: 0.52 },
    { x: -1.68, z: 0.4 },
    { x: 1.68, z: 0.4 },
    { x: -0.28, z: 0.95 },
    { x: 0.32, z: 0.98 },
    { x: -1.02, z: 0.42 },
    { x: 1.0, z: 0.4 },
    { x: 0.0, z: 0.62 },
    { x: -1.55, z: 0.75 },
    { x: 1.55, z: 0.72 },
    { x: -0.35, z: 1.42 },
    { x: 0.38, z: 1.38 },
    { x: 0.0, z: 1.3 },
  ],
} as const

/** The grass mound's peak height above the plaza floor. */
export const POD_TOP_Y = POD.base.height + POD.grass.cap

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
  /** Foliage carries a soft sheen, not a matte finish (2026-08-05). It
   *  sat at 0.75 and was the outlier in a world whose panels are 0.16
   *  and accents 0.3 — everything here is meant to be the same moulded
   *  plastic. The highlights are what make a canopy read as a volume
   *  rather than a flat green shape. If they ever start blooming, ease
   *  back toward 0.58 rather than touching the Bloom threshold. */
  foliage: 0.5,
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
