# THE ART BIBLE — Ryan's Planet

> **This is the single source of truth for how Ryan's Planet looks,
> feels, and moves.** When any decision is uncertain, this document
> wins — over convention, over "modern," over technical convenience.
> It supersedes and consolidates the older `ART_DIRECTION.md`.
>
> The test applied to every pixel, every object, every motion:
> **"Does this belong in Ryan's Planet — a warm, handcrafted little
> world someone clearly loved making?"** If not, it is wrong, however
> well-built.

---

## ⚠️ ONE OPEN STRATEGIC DECISION (read first)

The concept art and the current build disagree on the **fundamental
world model**, and it changes everything downstream:

- **Concept art = a staged plaza tableau.** A flat, gently-curved
  floating plaza disc. Landmarks arranged in a shallow arc facing the
  viewer, each on its own grassy island with steps and trees. A central
  fountain. A single, mostly-fixed elevated 3/4 camera that shows the
  whole plaza at once. You read the whole world in one glance.
- **Current build = a walkable sphere.** A true tiny planet you orbit
  and walk around via great-circle movement, with a close third-person
  chase camera. You discover the world by exploring it.

Both are legitimate and beautiful. They are **not compatible** — one
is a diorama you survey, the other is a globe you traverse. This Bible
describes the **shared visual language** (which is identical for both),
and flags where a rule depends on the choice with **[TABLEAU]** or
**[SPHERE]**. **Peter must pick the world model before major world
work continues.** See `CODEBASE_AUDIT.md` for the cost of each path.

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

Ryan's Planet looks like a **premium soft-toy operating system that
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
- **A hint of bloom / glow** on the brightest whites and accents — the
  world should feel like it gently emits light. (Currently faked with
  emissive + outline glow; a true subtle bloom pass is the intended
  finish — see audit.)
- `NoToneMapping`: pastels render exactly as authored; whites stay
  bright and airy without filmic compression.
- The sky reads clearly **blue** at the top of every frame, easing to a
  glowing white band behind the world — sunny, never washed out. The
  dome gradient is keyed to the **camera's frame** with steep stops
  (blue arrives within ~20° above view center), so intro and chase
  shots alike compose like the concept art. A subtle real **bloom pass**
  (threshold 0.9, intensity ~0.22) supplies the glow.

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
- **[TABLEAU]** One elevated 3/4 hero angle (~35–40° down) that frames
  the whole plaza with the player centered and the landmark arc behind.
  Gentle mouse-look parallax; the composition stays legible always.
- **[SPHERE]** Three eased moods — far orbit (whole planet) → head-height
  focus portrait (never top-down) → third-person chase (horizon ~40% up
  frame). `camera.up` levels to the local surface normal near ground.
- Framing rule: the player rides **low-center**; generous sky above.

## 9. Composition Rules

- **Symmetry and calm.** The hero shot is balanced, with a clear
  central anchor (the fountain / the player) and landmarks framing it.
- **Generous negative space** — sky is at least the top third; the world
  never fills the frame edge to edge. Emptiness is a designed feature.
- **Clear hierarchy:** player > active landmark > other landmarks >
  crowd > dressing > sky. Bloom, scale, and the single accent enforce it.
- Landmarks sit on a gentle **arc / ring**, evenly rhythmic, each with
  breathing room — a plaza, never a shelf of icons.

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
that became a building** — one continuous molded rounded-square monolith
in glossy white, with its identity **symbol molded flush into the front
face** (two-shot-injection feel; never attached, floating, or
assembled). The accent **breathes as an inner glow** and brightens on
approach — architecture's life is light, not hopping.

- **One family.** All landmarks share proportions, radius, material,
  and construction; they differ only in **accent + molded symbol +
  label.** A visitor recognizes them instantly as one system.
- **Grown from the world**, never set on top: the base sinks into a
  swell of the ground (**[TABLEAU]:** a grassy island with soft steps,
  trees, and flowers, per concept art).
- A **label** in the accent color reads beneath the symbol.
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
  most. (Current build over-uses glass; see audit.)
- **Icon (or emoji) centered above a short label**, rounded sans-serif,
  comfortable padding, friendly proportions.
- Entrance: **scale 0.92→1, fade, ~320ms, `cubic-bezier(0.22,1,0.36,1)`**
  — an app icon coming to life.
- Chrome layout (per concept art): a **title pill top-left**, **round
  tool buttons top-right**, a **welcome/context card bottom-left**, a
  **controls hint pill bottom-center**. All same family.
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
  the plaza's heart and a self-referential wink.
- **Generous emptiness** between landmarks — room to breathe and wander.

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
