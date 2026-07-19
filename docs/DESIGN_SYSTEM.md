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
| Tile | 0.42 | Many per stride; floor reads fine-grained |
| Planet radius | 24 | Horizon ~40% up frame in chase view |

## 2. Landmark Proportions (the monument family)

One mold for every location. Differ ONLY in accent + symbol + label.

| Part | Dimensions (w × h × d) | Notes |
|---|---|---|
| Body | 2.1 × 2.55 × 0.8, r 0.33 | One continuous RoundedBox, base sunk 0.24 |
| Inset face | 1.62 × 2.05, r 0.26 | Flush accent-washed panel |
| Ground swell | 3.1 × 0.16 × 3.1, r 0.08 | Floor material |
| Symbol zone | 0.9 wide, centered at y ≈ 1.56 | Upper-middle of face |
| Symbol stroke | capsule r 0.055, flush molded | ~0.02 proud |
| Mound | truncated cone, top r 1.85, base r 2.35, h 0.46 | Grass; monument stands on top |
| Steps | 3, embedded in mound's front (+Z) slope | White; see `POD.steps` |
| Trees | 2 per pod, flanking at mound corners | Green or blossom-pink canopy |
| Lamppost / flowers | 1 each per pod | See `world/Lamppost.tsx`, `FlowerTuft.tsx` |

Pod dressing tokens live in `POD` (designSystem.ts), shipped 2026-07-18.

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
- Shader floor: bevel band 0.10–0.12 of cell, brightness ±1.4–1.8%.

## 5. Materials (the plastic bands)

| Band | Roughness | Used for |
|---|---|---|
| Gloss | 0.12–0.20 | Landmark bodies, sign faces, fountain |
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
| Bloom pass | threshold 0.9, smoothing 0.25, intensity ≈ 0.22 — a whisper |

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
