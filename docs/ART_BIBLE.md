# THE ART BIBLE — Ryan Land

> **This is the single source of truth for how Ryan Land looks,
> feels, and moves.** When any decision is uncertain, this document
> wins — over convention, over "modern," over technical convenience.
> It supersedes and consolidates the older `ART_DIRECTION.md`.
>
> The test applied to every pixel, every object, every motion:
> **"Does this belong in Ryan Land — a warm, handcrafted little
> world someone clearly loved making?"** If not, it is wrong, however
> well-built.

---

## ✅ THE WORLD MODEL — DECIDED (2026-07-18): TABLEAU ON A FLAT FLOATING ISLAND

Peter chose the **staged plaza tableau**, superseding the 2026-07-17
sphere-geometry version: the sphere is gone. The plaza is now a **flat
disc floating in the sky**, floating-island style — no curvature
anywhere, plain XZ world coordinates, no lat/lon or great-circle math.

- **One fixed, art-directed camera** — high on the plaza's south side,
  tilted down (a diorama on a table), long lens (`fov 28`) so
  perspective compresses. The plaza and all six monuments fill the
  frame. It never follows. Mouse adds only a gentle eased look-around
  (see `TABLEAU_*` constants + `CinematicCamera.tsx`).
- **The stage is a flat disc (`Ground.tsx`), radius `ISLAND_RADIUS`.**
  It ends at a defined rounded edge and drops off into open sky. The
  fountain centerpiece (`world/Fountain.tsx`) sits at the exact
  center: a white basin and grass ring holding a **small ringed blue
  globe** — reinstated 2026-07-18 per Peter's reference mockup, sized
  and staged as a modest mascot (basin-height, gentle bob/spin), not
  the earlier large freestanding planet-plus-orbit-ring ornament that
  was retired the same day. The six landmarks fan in a horseshoe
  opening toward the camera (screen left→right: About, Projects,
  Experience, Skills, Contact, Resume), each a **saturated pastel
  card** on a **low, barely-raised platform** (two shallow steps, the
  shared white tile material — see `POD` in `designSystem.ts`),
  rotated to face the center. Dressing (trees, lampposts, the bench,
  flowers) is mostly **scattered across the open plaza**
  (`world/PlazaDressing.tsx`), not clustered one-per-landmark — see
  §11 and §15 for the full 2026-07-19 revision of both.
- **The character still walks (WASD)** — freely *within* the frame,
  softly leashed to a walk radius around the island's center
  (`TABLEAU_WALK_RADIUS`; the stage ends where the frame does). Spawns
  low-center, back to the visitor.
- Up is always world +Y. Walking is a plain XZ vector add, clamped by
  distance from center — no rotation-around-axis, no tangent-plane
  projection.

Where older sections say **[TABLEAU]** they are now the live spec;
**[SPHERE]**-flagged rules (chase camera, whole-globe exploration, the
planet ornament) are retired but preserved in git history
(`snapshot/pre-art-bible-2026-07-17`, plus history up to the
2026-07-18 flat-island rewrite).

---

## 1. Project Philosophy

We are not building a website. We are building a **tiny interactive
world that happens to contain a portfolio.** The portfolio is the
souvenir; the world is the point. A visitor should forget they came to
evaluate a candidate and simply enjoy being somewhere.

- **Experience over information.** Delight, charm, and exploration
  outrank density, speed, and convention every time.
- **Handcrafted, not generated.** Everything is built and tuned by
  hand from simple forms. Nothing should feel templated or stock.
- **One cohesive product.** The world reads as if a single small
  industrial-design team manufactured every object together — same
  plastic, same radii, same light. Never a pile of imported assets.
- **Alive, always.** Nothing is ever perfectly still.

## 2. Emotional Goals

The visitor should feel, in order of priority:

1. **Warm** — like morning sun and a friendly face.
2. **Delighted** — the small surprise of a place that plays back.
3. **Calm** — unhurried, safe, soft; nothing demands anything.
4. **Curious** — invited to wander and peek.
5. **Impressed** — "this is *absurdly* polished," arriving quietly.

Never: impressed-first (cold), overwhelmed, hurried, or "sold to."

## 3. Visual Identity

Ryan Land looks like a **premium soft-toy operating system that
became a place** — the friendliness of a Wii U-era plaza and the tactile
charm of high-end vinyl designer toys, rendered original in every
asset. Bright, rounded, pastel, glossy, and airy. A world you want to
squeeze.

Signature motifs: the rounded-square "pillow," the little planet mark,
the single pastel accent per object against soft warm white.

## 4. Shape Language

- **The rounded square (squircle) is the DNA of the world.** Tiles,
  landmarks, cards, buttons, keycaps, platforms — all descend from it.
  Corner radius is **generous: 20–33% of the shorter side.**
- **No hard corners. No sharp edges. Ever.** Every edge carries a soft
  bevel; every silhouette is a swollen, pillowy form.
- Organic forms (trees, clouds, characters) are built from **spheres,
  capsules, and swollen blobs** — round, plump, bottom-weighted.
- Forms feel **inflated / over-rounded**, like they hold a little air.

## 5. Materials

Everything is **premium soft-touch molded plastic.** Smooth, clean,
slightly glossy, with gentle speculars.

| Surface | Roughness | Notes |
|---|---|---|
| Landmark bodies, UI faces | 0.12–0.20 | Glossy toy white |
| Accents / molded symbols | 0.25–0.35 | Slight sheen, emissive-tinted |
| Characters | 0.55–0.70 | Soft matte-plastic, gentle spec |
| Ground | ~0.5 | Quiet, near-matte |
| Foliage | 0.6–0.75 | Soft, unshiny |

**Never:** metal, glass, concrete, fabric weave, roughness > 0.8,
normal-mapped detail, high-frequency texture, or visible seams between
parts of one object. Color and light do all the work; there are no
painted textures anywhere.

## 6. Lighting — "Bright Spring Morning, Forever"

- Bright, high-key, low-contrast, almost — but never quite —
  overexposed. Fresh and optimistic.
- **Generous ambient** (faint blue) + **one soft warm key sun** +
  **pale-blue sky bounce** + cool fill. Shadows are **soft and
  blue-gray**, close to their object, never black or hard.
- **The key light is a fixed world-space sun** (revised 2026-07-19),
  not a light that tracks the avatar. It used to ride above wherever
  the avatar stood with a tight shadow frustum — correct for the old
  chase camera, where only the avatar's immediate surroundings were
  ever in frame. Under the fixed tableau camera the whole plaza is
  always in frame, so that tight avatar-centered frustum silently
  dropped shadows from every landmark, tree, and bench. The shadow
  camera now covers the whole island (`ISLAND_RADIUS + 2`) from a
  fixed direction — see `scene/lighting/Lighting.tsx`.
- **Sun angle: upper-left of the camera's view, shadows falling lower-
  right** (tuned 2026-07-19 to match the reference exactly). Screen-
  right for the tableau camera is world `+X`; the sun's `SUN_DIR` needs
  a **negative x** to read as upper-left — a same-magnitude positive x
  was tried first and put the sun upper-*right* instead, the mirror
  image of the reference. If the camera rig ever changes, re-derive
  screen-left/right before retuning this.
- **Shadows are genuinely soft** via `VSMShadowMap`
  (`shadows="variance"` on the Canvas), not the deprecated
  `PCFSoftShadowMap` — R3F's `shadows` boolean/`"soft"` string both
  silently fall back to hard-edged PCF in current three.js. Blur comes
  from `shadow-radius`/`shadow-blurSamples` on the key light.
- **Contact AO** (`N8AO`, tinted the same blue-gray as the palette's
  `shadow` color, never black) darkens contact creases — tree-to-
  platform, panel-to-swell, steps-to-floor — so objects read as
  resting on the ground, not floating above it.
- **Subtle depth of field** (`DepthOfField`, world-space focus distance
  tuned to the avatar): sharp on the avatar and near crowd, gently
  softening toward the landmark arc and sky. Kept light — this is a
  toy diorama, not a cinematic rack-focus.
- **A hint of bloom / glow** on the brightest whites and accents — the
  world should feel like it gently emits light. A real bloom pass is
  live (`@react-three/postprocessing`, tuned high-threshold so it
  catches highlights only, not general geometry — see below).
- `NoToneMapping` **on the renderer**: pastels render exactly as
  authored; whites stay bright and airy without filmic compression.
  A light **post color grade** (`BrightnessContrast` + `HueSaturation`,
  applied *after* Bloom in the composer) adds warmth and shadow depth
  without touching what counts as a bloom highlight — ordering matters
  here, a grade applied *before* Bloom would re-trigger the horizon-haze
  bug from 2026-07-18.
- The sky reads clearly **blue** at the top of every frame, easing to a
  glowing white band right at the island's rim — sunny, never washed
  out. The dome gradient is keyed to **world up** with stops calibrated
  to the tableau camera's actual downward-pitched view band (it never
  looks above world-horizontal, so the blue has to live *below* zero
  elevation or the whole frame reads as flat white — see
  `scene/Sky.tsx`). A subtle real **bloom pass** (threshold 0.97,
  intensity ~0.18) supplies the glow — tuned high on purpose: at 0.9 the
  plaza's own near-white surfaces bloomed into a horizon-wide haze.

## 7. Color Palette

Soft, warm, optimistic. Pastel accents against warm-white and gentle
sky-blue. **All values live in `src/lib/constants.ts` (`PALETTE`).**

**Environment**
| Role | Hex |
|---|---|
| Sky zenith | `#A5D3F0` (genuine sunny blue) |
| Sky horizon | `#FFFFFF` |
| Fog | `#F2FBFF` |
| Ground | `#F8FAFC` |
| Tile seam | `#E3E9ED` |
| Shadow | `#C5CFD9` (blue-gray) |
| Ambient | `#EDF5FF` · Key `#FFF8EE` |

**Landmark accents — one per location, always pastel**
| Location | Accent (target) | Symbol |
|---|---|---|
| About | Soft lavender | Rounded person |
| Projects | Pastel blue `#A9C9E8` | Rounded `</>` |
| Experience | Soft green | Rounded briefcase |
| Skills | Warm gold | Rounded spark / cog-flower |
| Contact | Soft pink | Rounded chat bubble |
| Resume | Sky teal | Rounded document |

**Foliage:** greens `#8FCE7F`/`#A5DC94`, plus seasonal **lavender and
blossom-pink** trees for variety (per concept art).

**Forbidden:** neon, saturated primaries, dark themes, cool grays,
black. If a color feels "corporate" or "techy," it is wrong.

## 8. Camera Philosophy

- **Cinematic and eased, always. Nothing snaps or teleports.** Every
  move accelerates and settles.
- The camera **breathes** — always a whisper of drift, never locked
  fully static.
- **One fixed elevated 3/4 hero angle** (~35–40° down) that frames the
  whole plaza with the player low-center and the landmark arc behind —
  never a chase or orbit; the camera never follows. Gentle mouse-look
  parallax only; the composition stays legible always. `camera.up` is
  always world +Y (the ground has no curvature to level against).
- Framing rule: the player rides **low-center**; the horizon sits
  roughly 40–50% down the frame — enough sky to read as a place with
  air above it, not so much the plaza reads distant or small.

## 9. Composition Rules

- **Symmetry and calm.** The hero shot is balanced, with a clear
  central anchor (the fountain / the player) and landmarks framing it.
- **Tight and filled, not distant** (revised 2026-07-18 — see §15):
  the camera dollies in close enough that the pod arc, avatar, and
  crowd occupy most of the frame. Breathing room lives *within* the
  composition — inside a pod, between neighboring pods, in the sky
  band above the rim — never as a wide empty apron of bare ground
  around the whole scene.
- **Clear hierarchy:** player > active landmark > other landmarks >
  crowd > dressing > sky. Bloom, scale, and the single accent enforce it.
- Landmarks sit on a gentle **arc / horseshoe**, in a steady **A-B-A-B
  rhythm** (monolith, tree, monolith, tree) that reads as *designed*
  rather than scattered — evenly spaced, each pod with its own
  breathing room, never a shelf of icons.

## 10. Character Design

Original, Mii-adjacent, never a copy.

- **Head ≈ 58% of total height**; total ≈ 0.96 world units. Big head,
  chunky little body, oversized rounded shoes.
- Body: one **plump squashed capsule — the hoodie** — with a soft hood
  bump molded on the upper back; stable, huggable, toddler-plush.
  Arms: rounded capsules. **White sneakers**, soft-navy pants. Face
  sits **low** on the head. Eyes: simple black ovals. Mouth: tiny
  torus-arc. Nose: the faintest bump.
- Walk carries a gentle side-to-side **waddle roll** + chunky step
  bounce — the plump silhouette must read alive from behind.
- Hair: smooth "hood" cap + soft ellipsoid fringe swooshes. **Nothing
  pointy, nothing that reads as an attached piece.**
- **One pastel accent** (the player's blue hoodie) over soft neutrals.
- Crowd = the same recipe, varied pastel hair/shirt pools, player-height.

## 11. Landmark Design

**Landmarks are architecture, not props.** Each is a **giant app icon
that became a building** — one continuous molded rounded-square
monolith, with its identity **symbol molded flush into the front face**
(two-shot-injection feel; never attached, floating, or assembled). The
accent **breathes as an inner glow** and brightens on approach —
architecture's life is light, not hopping.

- **One family.** All landmarks share proportions, radius, material,
  and construction; they differ only in **accent + molded symbol +
  label.** A visitor recognizes them instantly as one system.
- **The body is white/frosted soft plastic; the accent lives ONLY in
  the icon glyph and label** (Peter's final call, later on 2026-07-19,
  matching the reference's white cards with colored icons — this
  reverted a same-day fully-saturated-body experiment). The inset face
  carries only a faint accent wash (~14% lerp, the two-shot molding
  cue), and the accent still breathes as faint emissive from within
  the white body.
- **Symbols and labels are accent-colored** against the white card.
  All six locations have a molded symbol: person (About), `</>`
  (Projects), briefcase (Experience), gear (Skills), chat bubble
  (Contact), document (Resume) — see `world/Locations.tsx`.
- **Grown from the world**, never set on top: the base sinks into a
  swell atop a **low, barely-raised platform** — two shallow steps,
  the shared plaza tile material, one flanking tree, a flower tuft
  (`POD` in `designSystem.ts`). Revised 2026-07-19 from an earlier
  grass-mound "hill" treatment that read as separated floating islands
  with sky gaps between them, against the reference's one continuous
  floor. Lampposts, the bench, and most flowers now live in
  `world/PlazaDressing.tsx`, scattered across the open plaza instead
  of clustered onto each pod.
- A **label** reads beneath the symbol.
- **Final test, every landmark:** "placed into the scene?" → redesign.
  "born as part of this world?" → ship.

## 12. Animation Philosophy

- **Everything eased** (`expDamp` / springs), frame-rate independent.
  Anticipation, follow-through, gentle overshoot, weight.
- **One shared heartbeat** (`useAmbientLoop`) drives all ambient motion,
  so the world breathes *together*.
- **Idle life is mandatory:** breathing, blinking, glances, foot-shifts,
  drifting clouds, breathing landmark glow, swaying foliage.
- Motion is **slow and peaceful.** Villagers stroll; nothing darts.
- `prefers-reduced-motion` **calms** the world via one scale factor —
  never freezes it (a frozen world reads as broken).

## 13. UI Language

Floating, rounded, soft — the world is never blocked by a wall of UI.

- **Rounded-square cards** (radius 24–32px), **solid warm-white** with a
  **soft diffuse shadow** and a whisper of white edge-light. Per the
  concept art the chrome reads **near-solid and clean, NOT heavy
  glass** — translucency and backdrop-blur are a light seasoning at
  most. **Open gap:** `PlazaCard.tsx` still uses heavy glass
  (`rgba(255,255,255,0.55)` + 24px backdrop-blur) — dial toward
  near-solid next time UI is touched.
- **Icon (or emoji) centered above a short label**, rounded sans-serif,
  comfortable padding, friendly proportions.
- Entrance: **scale 0.92→1, fade, ~320ms, `cubic-bezier(0.22,1,0.36,1)`**
  — an app icon coming to life.
- Chrome layout (per concept art): a **title pill top-left**, **round
  tool buttons top-right**, a **welcome/context card bottom-left**, a
  **controls hint pill bottom-center**. All same family.
- **The title pill (`HeaderBadge`) is a small badge, never a header.**
  Icon + short wordmark at the same scale as the panel labels ("Projects,"
  "Skills," …) or smaller. Hard rule: it must never exceed roughly **1/3
  of the viewport width** and must stay pinned top-left — it never grows
  to span or dominate the 3D canvas. Any subtitle beneath it follows the
  same rule. (Regression history: it once rendered oversized and ran off
  both edges of the screen — don't let that happen again.)
- **Never:** nav bars, scrolling pages, hero sections, dashboards,
  tables, skill bars, timelines, sharp rectangles, hard borders.

## 14. Sound Direction (future)

Soft ambient only, gentle and loopable: **birdsong, light wind, padded
footsteps, water trickle at the fountain, marshmallow-soft UI pops.**
Everything sits behind the **mute button, which shipped before any
audio did** — on purpose. No autoplay music; if music ever comes, it is
quiet and optional.

## 15. Environmental Rules

- **Floor:** a quiet rounded-tile UI surface, not pavement. Small
  squircle tiles, whisper-soft low-contrast seams, faint bevel, tiny
  per-tile brightness variation. It supports the world; it never shouts.
- **Sky:** bright blue easing to white horizon; plump instanced clouds
  drift slowly.
- **Dressing** (trees, benches, lamps, flowers, fountain): every piece
  must pass the plaza test — rounded, toy-like, pastel, gently animated,
  built from the same plastic. Trees are lollipop/cloud blobs (green +
  seasonal lavender/pink). Lamps are white posts with a softly glowing
  bulb. A **central fountain** with a slowly spinning little planet is
  the plaza's heart and a self-referential wink. Distribution (revised
  2026-07-19): one tree + a flower tuft is tied to each pod; lampposts,
  the bench, and extra flowers are hand-placed across the **open**
  plaza (`world/PlazaDressing.tsx`) rather than clustered per-landmark
  — the reference scatters dressing naturally across one continuous
  ground, not into isolated per-panel gardens.
- **Tight, filled composition, with real sky** (revised 2026-07-19):
  the tableau camera holds close enough that the pod arc, avatar, and
  crowd occupy most of the frame width — minimal empty ground at the
  edges or between camera and plaza — while pitching shallow enough
  that the sky still takes up **roughly 40–50% of the frame**, not a
  thin strip. Breathing room lives *within* the composition (inside a
  pod, between neighboring pods, in the open sky above), never as a
  wide empty ring of bare ground.

## 16. Scale Rules

- **Player = 1.0 world unit ≈ the human yardstick.** Everything reads
  relative to the little character.
- Landmarks are **monumental but friendly** — roughly 2–2.5× player
  height: clearly architecture, never intimidating.
- Crowd = player height. Trees ≈ 1.5–2×. Tiles ≈ 0.42u (many per stride).
- Keep the player small in frame with lots of world and sky around —
  the smallness is what makes it a *tiny* world.

## 17. Things We Never Do (hard NOs)

Tech-startup / SaaS aesthetics · flat material design · sharp corners ·
dark themes · high-contrast grids · neon / cyberpunk · saturated
primaries · strong glassmorphism · dashboard or table layouts ·
parallax-scroll pages · hero sections · typing animations · skill bars ·
timelines · realistic textures or normal maps · metal / glass / concrete
· harsh or black shadows · snapping / teleporting camera · stock or
imported 3D models · anything that reads as "a website with 3D on it"
instead of "a place."

## 18. Definition of Visual Consistency

The world is consistent when **any object, dropped anywhere in the
scene, looks like it was manufactured in the same factory as everything
around it.** Concretely, every object must satisfy:

1. **Shape:** descends from the rounded square; generous radii; no hard
   corners.
2. **Material:** the shared soft-touch plastic (correct roughness band);
   no foreign materials or textures.
3. **Color:** from `PALETTE`; at most one pastel accent; soft warm-white
   base.
4. **Light:** lit only by the shared rig; soft blue-gray shadow; a hint
   of glow on brights.
5. **Motion:** eased; carries a little idle life; on the shared
   heartbeat.
6. **Scale:** correct relative to the 1.0-unit player.
7. **Belonging:** passes the final test — *born as part of this world,
   not placed into it.*

If an object fails any one of these, it is inconsistent and must be
fixed or removed — regardless of how well it functions.
