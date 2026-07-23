# DESIGN SYSTEM — The Factory Specs

Every object in Ryan Land is manufactured from **these tokens**.
Nothing is designed independently: a new landmark, prop, card, or
character picks its numbers from this sheet (mirrored in code at
`src/lib/designSystem.ts`). If a value isn't here, add it here first —
then use it. `ART_BIBLE.md` says *why*; this file says *exactly what*.

## 1. World Scale

| Token | Value | Meaning |
|---|---|---|
| `UNIT` | 1.0 | The player's height — the yardstick for everything |
| Villager | 0.96–1.04 | Same as player, whisper of variation |
| Landmark body | 2.2 tall | Monumental-but-friendly ≈ 2.2× player |
| Tree | 1.5–2.0 | Between person and building |
| Cobble | ~0.46 avg (TILE_SIZE × 1.1 Voronoi scale) | Irregular stones; floor reads fine-grained |
| Planet radius | 24 | Horizon ~40% up frame in chase view |

## 2. Landmark Proportions (the monument family)

One mold for every location. Differ ONLY in accent + symbol + label.

| Part | Dimensions (w × h × d) | Notes |
|---|---|---|
| Body | 2.96 × 3.15 × 1.13, top r 0.62 / bottom r 0.16 | Arched-top / squarer-bottom profile (2026-07-23), extruded — see below |
| Inset face | 2.34 × 2.5, top r 0.5 / bottom r 0.14 | White + RADIAL accent glow; same arched profile as the body |
| Grass island | OVAL: base rx2.07×rz1.82×h0.16 + grass rx1.9×rz1.65×cap0.32 | Low elliptical grass dome + thin white rim + 2 steps + tufts/rocks (POD) |
| Symbol zone | 1.3 wide, centered at y ≈ 2.02 above grass | Upper-middle of face |
| Symbol relief | 2D Shape -> ExtrudeGeometry, depth 0.08 | Flat consistent emboss, NOT capsules |
| Steps | 2 low white steps down the front (+Z) | See `POD.steps` |
| Trees | 2 per pod, on the grass behind the monument | Green or blossom-pink canopy |
| Flowers | daisy / forget-me-not / pink + leaf sprigs, on the grass | Real procedural blooms — `world/Flower.tsx` (replaced the old 3-ball `FlowerTuft`) |

**Panel body shape** (revised 2026-07-23, per the reference close-ups):
the body is **no longer a uniform squircle** (`RoundedBox`) — it is an
`ExtrudeGeometry` of a 2D profile with a **big top radius and a small
bottom radius** (`panelProfile()` in `LocationPod.tsx`), so the panel is
pillowy at the crown and nearly square where it meets the grass — it
reads as *sitting on the ground*, not floating. A soft bevel rounds the
front/back edges. The inset face uses the same profile. The body clay is
**opaque matte** (`clay({ env: 0.08, sheen: 0.14 })`) — a higher env
reflection made the body mirror the sky HDRI and ghost a glassy "second
shell" around the inset face; low env kills it.

Pod dressing tokens live in `POD` / `POD_TOP_Y` (designSystem.ts).
Revised 2026-07-23: the island is a LOW OVAL grass DOME (elliptical
scaled cylinders + a hemisphere cap) inside a thin white rim, enlarged
so ~0.42u of clear grass shows past each side of the panel (the ovals
were previously barely wider than the panel — no side margin). Two steps
down to the plaza; trees/bushes pushed OUT into the widened margins;
flower/grass tufts + a couple of grey rocks planted on top. Lampposts/
bench live in `world/PlazaDressing.tsx`, scattered across the open plaza
(hand-placed, same pattern as `Crowd.tsx`'s `GROUPS`).

**Landmark body color** (revised 2026-07-22): body is **soft-clay
white** (`clay()`, faint accent emissive breathing); the inset face is
white carrying a **RADIAL accent glow** (onBeforeCompile: brightest
behind the icon, fading to white at the rim) + accent emissive, so each
face reads as softly lit in its icon's colour — the reference's look.
(This reverses the 2026-07-19 pure-white-face call: a flat accent tint
read "greenish", but a radial glow reads as lighting.) Symbols + labels
carry the accent **as ink, deepened** via `offsetHSL(0, +0.32, −0.2)`
(deepened 2026-07-23 so the green/teal labels stay legible on white).
Icons ≈35–40% of panel width (`SYMBOL_SCALE`); label fontSize 0.34,
width-capped, beneath the icon.

## 3. Corner Radii (the squircle law)

Radius as a fraction of the shorter side. **Never below 15%.**

| Class | Ratio | Examples |
|---|---|---|
| Pillow (hero) | 24–33% | Landmark faces, UI cards, title pill |
| Standard | 18–24% | Tiles (22%), pedestals, keycaps |
| Soft edge | 15–18% | Platforms, steps, swells |
| Organic | n/a | Spheres/capsules only (characters, trees, clouds) |

## 4. Bevels & Edge Light

- 3D: bevel = the RoundedBox radius itself; `smoothness ≥ 4` (6 for
  hero objects). No chamfers, no hard insets.
- 2D: edges are **light, not lines** — inset top highlight
  `rgba(255,255,255,.95) 0 1.5px 3px`, inset bottom shade
  `rgba(160,180,200,.28) 0 -1.5px 3px`. **Borders: never.**
- Shader floor (cobbles, 2026-07-19): seam = wide F2−F1 falloff
  (0..0.14) mixed only 28% toward `groundLine`; per-stone dome +1.4%;
  per-stone brightness ±2%. No drawn lines, no bevel band.

## 5. Materials (the plastic bands)

| Band | Roughness | Used for |
|---|---|---|
| Clay | 0.5 rough + sheen 0.4 + clearcoat 0.06 | Panel bodies, island rims, steps (`clay()`) |
| Gloss | 0.12–0.20 | Fountain, small props |
| Sheen | 0.25–0.35 | Molded symbols, accent parts |
| Ground | 0.45–0.55 | Floor, swells, steps |
| Soft | 0.55–0.70 | Characters (skin 0.60, shirts 0.55, hair 0.70) |
| Matte | 0.70–0.80 | Foliage, cloud tops (clouds: 1.0, lit by sky) |

Metalness **always 0**. No maps of any kind. One material per part,
shared via pools.

## 6. Shadows

- Type: soft blue-gray `#C5CFD9`, close and small. Never black/hard.
- Key-light shadow map: 1024², frustum ±8 around the player, bias −0.0005.
- Contact grounding for floating objects: baked soft disc, opacity ≤ 0.35.
- UI float shadow: `0 14px 36px rgba(150,170,195,.24)` + white radiance
  `0 0 30px rgba(255,255,255,.65)`. Objects hover 2mm, not 20.

## 7. Glow (light is life)

| State | Emissive intensity |
|---|---|
| Landmark body idle | 0.04 (accent) |
| Landmark body near | 0.10 |
| Symbol idle | 0.22 ± 0.04 breathing |
| Symbol near | 0.55 |
| Lamp bulbs (future) | 0.6 warm |
| Bloom pass | threshold 0.97, smoothing 0.15, intensity ≈ 0.18 — a whisper |

Glow eases at λ ≈ 4. Nothing flashes; light *breathes*.

## 8. Color Palette (single source: `PALETTE` in constants.ts)

**Environment (sunny spring morning — post-Phase-5 values)**
| Role | Hex |
|---|---|
| Sky zenith | `#A5D3F0` (genuine blue) |
| Sky mid | `#D6ECFA` |
| Sky horizon | `#FFFFFF` |
| Fog | `#EEF8FE` |
| Ground | `#F8FAFC` · Seam `#E5EAEE` |
| Shadow | `#C5CFD9` |
| Ambient `#EEF6FF` · Key `#FFF6E8` · Fill `#E8F2FF` |

**Landmark accents (one per location, all pastel)**
| Location | Accent | Symbol |
|---|---|---|
| About | `#CDB9EA` lavender | person |
| Projects | `#A9C9E8` blue | `</>` |
| Experience | `#B8E6C9` green | briefcase |
| Skills | `#F2D38F` gold | spark |
| Contact | `#F2B8C6` pink | chat bubble |
| Resume | `#A8DDE0` teal | document |

**Characters:** skin `#F6CFAE`, hair pool ×5, shirt pool ×8 pastels.
**Foliage:** `#8FCE7F`/`#A5DC94`/`#7CBE6E` + lavender `#CDB9EA` + pink
`#F2B8C6` seasonal trees. **Forbidden:** neon, saturated primaries,
dark tones, cool corporate grays.

## 9. Icon / Symbol Sizing

- 3D molded symbols: total width ≈ 1.0 on a 1.7-wide face (59%);
  stroke = capsule radius 0.05; sheen band material; accent color.
- UI icon chip: 56×56px, radius 16px, white, accent halo
  `0 0 14px {accent}88`; glyph 20–24px.
- Recognizability test: symbol must read at 12 units / thumbnail size.

## 10. Typography

- **One typeface: Quicksand** (bundled woff, weight 700). Rounded,
  warm, timeless. No second face, ever.
- 3D title: size 6 (≈ planet-scale hero), letterSpacing −0.015.
- UI: title 18px/bold, body 14px, caption 12px; labels may track wide
  (+0.18–0.28em) for pill text. Colors: ink `#54636E`, soft `#8A97A0`,
  faint `#A3AEB5` — never black.

## 11. Animation Timing

| Motion | Duration / rate |
|---|---|
| UI enter/exit | 320ms |
| Title reveal | 1.6–1.7s, staggers +0.9/+1.9/+2.9s |
| Breathing (chest, glow) | ~2s cycle |
| Blink | 130ms, every 2–5.5s |
| Foot shift / hop | 450–550ms, every 3–8s |
| Walk cycle | stride ≈ 9–11 rad/s at full speed |
| Villager stroll | 0.5 u/s (player 1.6) |
| Cloud drift | 1.1–2.5 °lon/s |

## 12. Transition Curves

| Use | Curve |
|---|---|
| UI springs | `cubic-bezier(0.22, 1, 0.36, 1)` (PLAZA_EASE) |
| Playful pop-ins | spring stiffness ~320, damping ~22 |
| Frame-loop eases | `expDamp` λ: 1 dreamy · 2.2–2.6 camera · 4–6 body · 8–12 controls |
| Envelopes | smoothstep in/out; never linear |

**Nothing snaps. Nothing moves linearly. Everything settles.**
