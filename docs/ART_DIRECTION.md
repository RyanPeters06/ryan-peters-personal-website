# ART DIRECTION — The Visual Identity

**This is the most important document.** When any choice is uncertain,
this file wins — including over making something look "modern."

The feeling: a peaceful Nintendo plaza from the Wii U era. Warm, polished,
playful, minimal. Original in every asset; inspired in every instinct.

## Overall Aesthetic

- **Rounded-square geometry** everywhere: tiles, pedestals, signs, cards,
  keycaps. If it has a corner, the corner is generously rounded.
- **Translucent white surfaces** (subtle — see UI spec below).
- **Soft shadows**, blue-gray, never harsh or black.
- **Glossy highlights** on "plastic toy" surfaces (pedestals, signs).
- **Clean white space.** Emptiness is a feature; the world breathes.
- Low-poly primitives only. No textures, no imported models.

## Color Palette

| Role | Hex |
|---|---|
| Sky zenith | `#DFF4FF` |
| Sky mid | `#EEF9FF` |
| Sky horizon | `#FFFFFF` |
| Fog | `#F2FBFF` (white with a hint of cyan) |
| Ground tiles | `#F8FAFC` |
| Tile seams | `#DCE3E8` |
| Shadows | `#C5CFD9` (blue-gray, never neutral gray) |
| Ambient light | `#EDF5FF` (very faint blue) |
| Key light | `#FFF8EE` (warm) |
| Avatar skin | `#F6CFAE` |
| Avatar hair | `#584639` |
| Avatar shirt (signature accent) | `#A9C9E8` pastel blue |
| Avatar pants / shoes | `#8D99A6` / `#8A939B` |

Accents are always pastel. Saturated colors, neon, and dark tones are
forbidden. All colors live in `src/lib/constants.ts` (`PALETTE`).

## Lighting — "Bright Spring Morning"

- Almost overexposed without losing detail; fresh, airy, optimistic.
- **High ambient** (1.35, faint blue) + **soft warm key** (1.05) +
  pale-blue hemisphere bounce + cool fill. Low contrast everywhere.
- The key light is a **personal sun**: it follows the avatar around the
  planet (fixed world tilt, so shadows drift with travel but never swing
  when turning). Shadow frustum stays tight around the avatar for crisp
  small shadows.
- `NoToneMapping` — pastels render exactly as authored; whites glow.
- The sky is a **gradient dome** (horizon→zenith) whose "up" follows the
  avatar, so blue is always overhead wherever you walk.
- Fog is near-white cyan and **retunes per shot** (far intro vs near
  chase) so both the planet's rim and the walking horizon melt into sky.

## Materials

Everything is **premium molded plastic**: smooth, soft, clean, slightly
glossy, rounded. Never rough, metallic, concrete, textured, or noisy.

- Ground: roughness 0.5, shader-drawn tiles (see Environment).
- Toy/plaza surfaces (pedestals, sign faces): roughness 0.12–0.3, white.
  Translucent shells: opacity ~0.55 + accent emissive (see UI spec).
- Characters: roughness 0.55–0.7 — soft plastic with gentle speculars.
  Soft gradients from lighting only — no painted detail.

## Character Design

Speaks the visual language of a Mii **without being one**:

- Head ≈ **58% of total height**; total ≈ 1.0 world units (~1.2 tiles).
- Short tapered cylindrical body; thin capsule arms; stubby legs with
  **oversized rounded shoes**.
- Face sits **low on the head**. Eyes = simple black ovals; mouth = small
  torus-arc curve; nose = tiniest bump.
- Hair = smooth "hood" cap (opening frames the face) + two **soft
  ellipsoid fringe swooshes** sloping from an open center part + sideburn
  drops. Nothing pointy, nothing that reads as a separate piece.
- One pastel accent (the blue shirt) against soft neutrals.

## Camera Feel

- Always cinematic, always eased. **Nothing ever snaps or teleports.**
- Three moods: far idle orbit (whole planet) → focus portrait (head
  height, equator-side of subject, never top-down) → third-person chase
  (4.5 behind, 1.6 above, looking at the ground ~2.5 ahead → horizon sits
  ~40% up the frame, gently curved).
- `camera.up` always levels against the *local* surface normal when near
  the ground (world Y only for the far orbit). Mode transitions ease
  azimuth/height/distance separately — front→back is a level sweep around
  the character's side, never a vault over the head.

## Animation Philosophy

- Anticipation, follow-through, overshoot, weight. Eased everything
  (`expDamp` / springs) — frame-rate independent.
- **One shared heartbeat** (`useAmbientLoop`) drives all ambient motion,
  so the world breathes together and `prefers-reduced-motion` calms
  everything through one scale factor (calms, never freezes).
- Idle life is mandatory: breathing, blinking, glances, foot shifts,
  bobbing signs, drifting clouds. Nothing is ever perfectly still.

## UI Philosophy

Floating cards only; the world is never blocked. **The pillow-shell
spec** — every interactive object, 2D or 3D (cards, signs, buttons,
future buildings), is built as a multi-layer molded-plastic icon:

1. **Thick translucent outer rim** (~10% of width): frosted
   `rgba(255,255,255,0.55)`, backdrop blur ~24px, edges described by
   *highlights* (inset top light, inset bottom shade) — never outlines.
   The object's accent color **glows through the rim** as a soft halo.
2. **Inner white face** inset within the rim, gentle top-to-bottom
   light gradient, radius ~24px (outer ~32px).
3. Content floats on the face with generous padding.
- Tiny, close, diffuse float shadow — objects hover 2mm, not 20.
- One accent per object; identical white shells create cohesion.
- Icon centered at top; text below in a rounded sans-serif.
- Entrance: scale **0.92 → 1.0**, fade **0 → 1**, **320ms**,
  easing `cubic-bezier(0.22, 1, 0.36, 1)` — an app icon coming to life.
- In 3D: same construction (translucent RoundedBox shell, faintly
  accent-tinted + accent emissive ~0.14, around an inset white face).

No nav bar, no scrolling page, no hero section, no dashboard layouts.

## World Architecture — landmarks are architecture, not props

The environment must feel manufactured as ONE cohesive product by one
industrial design team — a living interface where architecture and UI
are the same thing. Never a collection of imported 3D assets.

- Every landmark is **one continuous molded form** (a giant app icon
  become architecture): a soft rounded monolith whose base sinks into a
  gentle swell of the floor itself — it grows *from* the world.
- Its identity symbol is **molded flush into the front face** (rounded
  accent forms half-sunk into the body, like two-shot injection
  molding) — never attached, never floating, never assembled.
- No pedestals, no furniture, no miniature real-world objects (the
  Projects landmark is a monolith bearing a rounded `</>` mark — NOT a
  computer model).
- The accent breathes as a soft emissive glow inside the body and
  brightens on approach. Architecture doesn't hop or spin; its life is
  light.
- All landmarks share proportions (~1.7×2.2×0.66, radius 0.26),
  materials, corner language, and construction — one family,
  instantly recognizable, differing only in accent + symbol.
- **The final test for every object:** "Does this look placed into the
  scene?" → redesign. "Does this look born as part of this world?" →
  ship.

## The Title — part of the place, not the interface

The opening shot holds high above the already-living planet; after the
camera settles, **"Ryan's Planet"** reveals itself out of the bright
atmosphere: soft rounded heavy type in blue-gray (#6d8494), lit by
white radiance (layered text-glow, no hard shadow), blur-in + slow
upward easing. Subtitle: "An Interactive Software Engineering
Portfolio" / "Click Anywhere to Explore" — understated, the title is
always focal. On click it dissolves upward into the light (blur + fade
+ rise) while the camera is already descending. Calm and confident:
no particles, no spin, no oversized glow, never a hard cut.

## Environmental Details

- Floor: **quad-sphere tile grid** drawn in-shader — a giant quiet UI
  surface, not pavement. **Very small** rounded-square tiles
  (`TILE_SIZE 0.42`, corner radius ~22%), whisper-soft blurred seams,
  minimal contrast, a very gentle raised bevel, and ±1.2% per-tile
  brightness variation so it feels handcrafted. The pattern quietly
  supports the world; it never demands attention.
- Clouds: plump bottom-aligned puff clusters, instanced, drifting slowly.
- Future dressing (trees, benches, lamps) must pass the plaza test:
  rounded, toy-like, pastel, gently animated.

## Atmosphere

Bright spring morning, forever. White-blue gradient sky, drifting clouds,
soft cyan-white haze at every horizon. The mood targets: fresh,
optimistic, clean, airy, peaceful.

## Audio Direction (future)

Soft ambient only: birds, light wind, padded footsteps, marshmallow-soft
UI pops. Everything behind the mute button (which shipped before audio
did, on purpose). Music, if ever, is gentle and loopable.

## Things to Avoid — hard NOs

Tech-startup aesthetics · flat material design · sharp corners · dark
themes · high-contrast grids · cyberpunk/neon · glassmorphism with strong
transparency · dashboard layouts · parallax scroll · hero sections ·
typing animations · skill bars · timelines · realistic textures ·
harsh shadows · anything that would look wrong in a peaceful plaza.
