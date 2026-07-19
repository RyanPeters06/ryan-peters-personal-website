# DESIGN — What We Are Building

## Vision

A personal portfolio for **Ryan Peters** (CS student, aspiring software
engineer) that is not a portfolio website. It is a **tiny interactive
world**: a small island floating in a bright spring-morning sky, inhabited
by one friendly character the visitor controls. The portfolio content —
projects, experience, education, skills, contact — exists as **places on
the island** that the visitor walks to.

> This should feel like a tiny game that happens to contain a portfolio.
> Visitors should remember the experience more than the information.

## Core Philosophy

- **Experience first, portfolio second.** Every decision favors delight,
  charm, polish, and exploration over information density.
- **Peaceful, optimistic, playful, charming, relaxing, nostalgic.**
  The website should make visitors smile.
- **Handcrafted.** Everything is built from primitive shapes, tuned by
  hand. Nothing feels generated or templated.
- **Alive.** Nothing is ever perfectly still. The character breathes and
  blinks; signs bob; clouds drift; the camera sways.
- The north-star question for every decision:
  **"Would this look natural in a peaceful Nintendo plaza from the
  Wii U era?"** If no → choose the softer, rounder, more playful option.

## Inspiration

The warmth, polish, playfulness, and minimalism of Nintendo's Wii U-era
interfaces — particularly the **Warawara Plaza** (white tiled plaza,
translucent rounded UI, tiny cheerful characters) and the simplicity and
friendliness of **Miis**. Everything is **completely original**: we
capture the *feeling*, never copy assets, models, or trademarks.

## The Visitor's Journey

1. **The title:** the camera holds high above the already-living
   island (villagers wander, clouds drift) while "Ryan Land"
   reveals itself out of the bright sky. One click, and the title
   dissolves into the light as the camera begins its descent.
2. **Arrival:** the camera glides down to the character, who turns
   and waves hello.
3. **The handoff:** the camera swings around behind him (classic third
   person); a springy keycap card teaches WASD/arrows.
4. **Exploration:** the visitor strolls the plaza. Destinations are
   sculptural landmarks (see ART_BIBLE.md §11 Landmark Design);
   approaching one springs up a translucent card with its contents —
   no clicks required, like greeting someone in a plaza.
5. Nothing is modal. The world never stops being playable.

## Areas of the World (portfolio sections as architecture)

Every area is a landmark from ONE monument family (see ART_BIBLE.md
§11 Landmark Design): a molded monolith grown from its own grass pod,
identical construction, distinguished only by its pastel accent and
the original symbol molded into its face — giant app icons become
buildings. All six exist in content and stand on staged pods; only
Projects has its molded symbol built so far (see `content/locations.ts`,
`world/Locations.tsx`).

| Area | Molded symbol | Accent | Status |
|---|---|---|---|
| About | Rounded person mark | Lavender `#CDB9EA` | Pod built; symbol + real content pending |
| Projects | Rounded `</>` mark | Blue `#A9C9E8` | Built (placeholder content) |
| Experience | Rounded briefcase mark | Green `#B8E6C9` | Pod built; symbol + real content pending |
| Skills | Rounded spark mark | Gold `#F2D38F` | Pod built; symbol + real content pending |
| Contact | Rounded chat-bubble mark | Pink `#F2B8C6` | Pod built; symbol + real content pending |
| Resume | Rounded document mark | Teal `#A8DDE0` | Pod built; symbol + real content pending |

## How Visitors Should Feel

Calm. Curious. Gently amused. Like they found a small toy world someone
clearly loved making — and left knowing the person who made it is someone
they'd like to work with.

## Long-Term Goals

- All seven areas built and filled with real content.
- Ambient audio (birds, wind, footsteps, soft UI sounds) behind a mute
  button that has existed since day one.
- The "everything is alive" pass: grass, birds, flowers, lit windows.
- Runs smoothly on a normal laptop and acceptably on mobile.
- The kind of site that gets shared for how it feels, not just read.
