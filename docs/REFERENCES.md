# REFERENCES — Inspiration Library

Add to this file whenever something improves the project. Reference
images shared in chat are described here (we don't commit copyrighted
images to the repo).

## Design Inspirations
- **Wii U Warawara Plaza** — the master reference: bright white tiled
  plaza, tiny cheerful characters gathering around rounded-square app
  icons, translucent UI, soft glow everywhere. We capture the *feeling*;
  we never copy the assets.
- Mii Maker / Tomodachi Life — character simplicity, personality from
  almost nothing.
- Animal Crossing — walk-to-things pacing; the world keeps living
  around you.
- Super Mario Galaxy — tiny spherical planets, walking all the way
  around, camera up-vector following the surface.

## Character References
- Peter's reference (2026-07-16): a Mii face with **angular center-part
  black hair** — chunky side-swept masses, open forehead V between them,
  hair over sides/ears. Our build: hood cap + two soft ellipsoid fringe
  swooshes + sideburn drops (`avatar/Avatar.tsx`). Iterations rejected:
  bowl-cut cap ("don't like it"), pointy cone bangs ("two triangles").
  Lesson: **rounded masses, never discrete pointy pieces.**
- Proportions reference: plaza Miis read at distance because the head is
  more than half the character. Ours: head ≈58% of ~1.0 units.

## UI Inspirations
- **Wii channel icons** (Peter's reference, 2026-07-16): the definitive
  statement of the pillow-shell principle — each icon is a thick
  translucent molded-plastic rim around an inset white face, with the
  glyph's single accent color *glowing through* the rim as a halo;
  squircle radii ~30% of width; edges described entirely by highlights
  (no outlines); tiny close diffuse shadows; generous spacing. Analysis
  distilled into ART_BIBLE.md §13 (pillow-shell spec). Bloom pass has
  since shipped (`@react-three/postprocessing`); the UI chrome itself
  still runs heavier glass than the spec calls for — open item.
- Wii U app tiles: rounded squares, `rgba(255,255,255,0.72)` frost,
  1.5px white border, icon-over-label, springy scale-in. Exact spec in
  ART_BIBLE.md §13 (Peter, 2026-07-16).
- Console keycap hints (rounded keys with a heavy bottom border) — our
  ControlsHint.

## Lighting References
- "Bright spring morning" spec (Peter, 2026-07-16): sky #DFF4FF /
  #EEF9FF / #FFFFFF, ground #F8FAFC, seams #DCE3E8, near-white cyan fog,
  faint-blue ambient, blue-gray shadows, almost-overexposed white.
- Nintendo menu light: bright without realism — no god rays, no bloom,
  no HDR drama.

## Camera References
- Warawara Plaza's own hero shot: a fixed elevated 3/4 diorama view,
  never a pilot's-eye chase — the direct model for the tableau camera
  (`CinematicCamera.tsx`). The whole-globe chase/orbit era (M1–M3,
  retired 2026-07-17/18) took its cues from Mario Odyssey-style
  third-person framing instead; kept here as history since a future
  world-model pivot could reach for it again.

## Animation References
- Nintendo UI physics: overshoot springs, nothing linear, nothing
  instant. Framer springs (stiffness ~300, damping ~20) or the Wii U
  curve `cubic-bezier(0.22,1,0.36,1)`.
- Mii idle language: blinks, tiny glances, weight shifts — small,
  frequent, silent.

## Material References
- Toy plastic: white, gloss roughness 0.15–0.35, soft speculars.
- Warawara floor: slightly raised rounded tiles with soft seams — our
  in-shader bevel (inner shadow + top highlight).

## Color References
- Full palette table lives in ART_BIBLE.md §7 (single source of truth
  is `src/lib/constants.ts` PALETTE).

## Environmental References
- Cartoon clouds: bottom-aligned overlapping puffs, plump center —
  never a chain of spheres (the "caterpillar" failure of M1).
