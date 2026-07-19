# Ryan Land 🏝️

A portfolio that isn't a portfolio: a tiny interactive plaza floating on an
island in a bright blue sky. Visitors watch a staged diorama — a friendly
avatar walking between six small grass-mound landmarks that hold about,
projects, experience, skills, contact, and resume — instead of scrolling
a webpage.

Inspired by the warmth and playfulness of Nintendo-era interfaces (think
Wii U plaza floors and friendly characters), built entirely from original
assets and primitive geometry.

## Tech

- **React + TypeScript + Vite**
- **React Three Fiber + Drei** — the 3D world
- **Zustand** — world state (read imperatively by the frame loop)
- **Framer Motion + Tailwind CSS** — overlay UI only
- No backend

## Run it

```bash
npm install
npm run dev
```

## Architecture notes

- **Flat world, no curvature.** The plaza is a disc floating in the sky
  (`src/scene/Ground.tsx`), plain XZ world coordinates throughout — no
  sphere, lat/lon, or great-circle math anywhere in the codebase.
- `src/hooks/useAmbientLoop.ts` — one shared "heartbeat" clock drives every
  ambient motion, so the whole world breathes together and
  `prefers-reduced-motion` calms everything through one scale factor.
- `src/scene/Ground.tsx` — the white plaza floor is rounded-square tiles
  drawn in the fragment shader directly from world XZ position, ending in
  a cliff edge that drops into open sky, floating-island style.
- Milestone-driven: world → avatar → movement → locations → delight → audio.
  Full details in `docs/` (start with `docs/ART_BIBLE.md`).
