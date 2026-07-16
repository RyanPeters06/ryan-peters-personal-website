# Ryan Peters — A Tiny World 🌍

A portfolio that isn't a portfolio: a tiny interactive planet floating in a
white sky. Visitors explore a small handcrafted world — walking a friendly
avatar between little buildings that hold projects, experience, education,
skills, and more — instead of scrolling a webpage.

Inspired by the warmth and playfulness of Nintendo-era interfaces (think
plaza floors and friendly characters), built entirely from original assets
and primitive geometry.

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

- `src/lib/math/spherical.ts` — the single source of truth for living on a
  sphere: lat/lon placement, surface orientation, great-circle travel.
- `src/hooks/useAmbientLoop.ts` — one shared "heartbeat" clock drives every
  ambient motion, so the whole world breathes together and
  `prefers-reduced-motion` calms everything through one scale factor.
- `src/scene/Planet.tsx` — the white plaza floor is a quad-sphere grid drawn
  in the fragment shader (equal-angle cube projection): evenly sized
  rounded-square tiles, no texture seams, no pole pinching.
- Milestone-driven: world → avatar → movement → locations → delight → audio.
