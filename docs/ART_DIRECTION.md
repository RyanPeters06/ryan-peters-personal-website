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

- Ground: roughness 0.5, shader-drawn tiles (see Environment).
- Toy/plaza surfaces (pedestals, signs): roughness 0.15–0.35, white,
  optionally `opacity 0.92` for subtle translucency. Never strong glass.
- Character: matte-soft (roughness 0.75–0.9). Soft gradients from
  lighting only — no painted detail.

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

Floating cards only; the world is never blocked. **The Wii U overlay
spec** (applies to location cards and hints):

- Shape: rounded square, border radius **24–32px**.
- Background: `rgba(255,255,255,0.72)` with **backdrop blur 18–24px**.
- Border: `1.5px solid rgba(255,255,255,0.9)`.
- Very subtle white outer glow + soft diffuse shadow.
- Icon centered at top; text below in a rounded sans-serif.
- Entrance: scale **0.92 → 1.0**, fade **0 → 1**, **320ms**,
  easing `cubic-bezier(0.22, 1, 0.36, 1)` — like a Wii U app icon
  coming to life.

No nav bar, no scrolling page, no hero section, no dashboard layouts.

## Environmental Details

- Floor: **quad-sphere tile grid** drawn in-shader. Rounded-square tiles
  (corner radius ~22% of width), blurred low-contrast seams, faint inner
  shadow + subtle top-edge highlight so tiles read slightly raised —
  a giant friendly menu screen, not a 3D-modeling grid.
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
