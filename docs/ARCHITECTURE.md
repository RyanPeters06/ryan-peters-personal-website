# ARCHITECTURE — How and Why It Is Built

## Tech Stack

- **React 19 + TypeScript (strict) + Vite** — app shell and tooling.
- **React Three Fiber + Drei** (three.js) — the 3D world.
- **Zustand** — shared state. Chosen because the frame loop can read and
  write imperatively (`useWorldStore.getState()`) with zero re-renders,
  while overlay UI subscribes reactively.
- **Framer Motion + Tailwind CSS** — overlay UI ONLY. Never in-canvas.
- No backend. No external assets (fonts/models/textures) — everything is
  primitives + shaders, so the site works offline and loads instantly.

## Folder Structure (src/)

```
scene/        what exists (Experience composition, Ground, IslandShadow,
              Sky, Clouds, lighting/)
camera/       CinematicCamera — all camera behavior lives here
avatar/       the character: model + all procedural animation
world/        placed structures (LocationPod, Locations, Fountain,
              Crowd, Villager)
systems/      behavior (movement/: input hook + avatarPose channel)
hooks/        reusable logic (ambient clock, smoothing, flat-ground
              placement, reduced-motion)
store/        useWorldStore (Zustand)
ui/           overlay components (cards, hints, mute, header badge)
content/      typed portfolio DATA (locations.ts) — copy lives here,
              never in scene code
lib/          math/damp.ts (pure math), constants.ts (ALL tuning
              knobs + PALETTE)
styles/       Tailwind entry
```

**Why:** scene = nouns, systems = verbs, content = words, lib = truths.
Anyone can find anything by asking "is it a thing, a behavior, copy, or
math?"

## Scene Hierarchy

```
<Canvas shadows dpr=[1,2] NoToneMapping far=CAMERA_FAR>
  <Suspense>
    AmbientLoopDriver   (advances the shared heartbeat)
    Sky                 (gradient dome + fog + background)
    Lighting            (ambient + personal-sun key + fill + hemisphere)
    Ground              (flat tiled disc + cliff edge — the island floor)
    IslandShadow        (soft contact disc below the floating island)
    Clouds              (instanced puff clusters, ring around the island)
    Locations           (LocationPod per content entry)
    Fountain            (center plinth)
    Crowd               (background villagers)
    Avatar              (character + controller + animation)
    TitleWorld          (3D title text)
    CinematicCamera     (drives the fixed tableau camera every frame)
```

## Coordinate & Math Conventions (IMPORTANT — bugs lived here)

- **The world is flat.** The plaza floor is a disc of radius
  `ISLAND_RADIUS`, centered at the origin, lying in the XZ plane at
  y = 0. It has NO curvature — it simply ends at a rounded edge and
  drops into the sky (`Ground.tsx`'s cliff wall), floating-island
  style. There is no sphere, no lat/lon, no great-circle math anywhere
  in the codebase (this was a full rewrite away from the original
  true-sphere world model — see `docs/ART_BIBLE.md`'s WORLD MODEL
  section for the decision history).
- `lib/math/damp.ts` holds the only shared math primitive: `expDamp`
  (frame-rate-independent exponential smoothing). Positioning is plain
  Vector3/XZ arithmetic wherever it's needed — no spherical helpers.
- `hooks/useFlatPosition.ts` places things at `(x, altitude, z)` with
  an identity quaternion (the ground has no curvature, so nothing
  needs a per-position "standing up" rotation). Callers that need a
  facing direction (e.g. `LocationPod` turning to face the fountain)
  add their own yaw via `Math.atan2`.
- **Up is always world +Y**, everywhere — the avatar, villagers, and
  camera never recompute it per-position the way the old sphere model
  did.
- **Walking is a plain XZ vector add**: `position += forward * speed *
  dt`, then clamped to `TABLEAU_WALK_RADIUS` from the island's center
  (a simple `Math.hypot` distance check, not an angular leash).
- **Screen-right = `viewDir × up`.** (`up × viewDir` is screen-LEFT —
  this bug shipped once, back in the sphere-era code.)
- **Arm z-rotation: positive = outward for the RIGHT arm (+x), negative
  for the left.** Getting it backwards folds arms invisibly into the
  body (the wave was inert for a whole session because of this).
- **The fixed tableau camera has very little vertical headroom.**
  `TABLEAU_CAMERA_POS`/`TABLEAU_CAMERA_TARGET` give a steep, narrow
  (`fov 28`) downward-looking frustum — there is no "high sky" in the
  visible frame the way a wider or less-tilted camera would have.
  Anything meant to read as "above the plaza" (e.g. `TitleWorld`'s
  anchor) has to be tuned empirically against this frustum, not placed
  by intuition about world-space height.

## State Management

Three tiers, chosen by change frequency:

1. **Zustand (`useWorldStore`)** — low-frequency shared state: `phase`
   ('arriving' → 'greeting' → 'idle' → 'exploring'), `muted`,
   `cameraFocus`, `activeLocation`. UI subscribes; frame loops call
   `getState()`.
2. **Imperative channels** — per-frame data that must never re-render
   React: `avatarPose` (position/forward/up/moving) written by the
   avatar, read by camera & pods; the ambient clock in `useAmbientLoop`.
3. **Local `useRef` anim state** — timers/phases private to a component
   (blink timers, wave progress, stride).

## Interaction System

Pods self-report proximity: each `LocationPod` measures distance to
`avatarPose.position` each frame with **hysteresis** (enter 2.6 / exit
3.1) and sets `store.activeLocation`. The overlay `LocationCard` renders
whatever is active. Non-modal by design: the world never pauses.

## Camera System (CinematicCamera)

One fixed, art-directed frame — the tableau (see `docs/ART_BIBLE.md`
WORLD MODEL section). The camera never follows the character; it holds
at `TABLEAU_CAMERA_POS` looking at `TABLEAU_CAMERA_TARGET` with
`TABLEAU_FOV`, always `up = world Y`. The only motion is a gentle eased
mouse look-around (pan + a whisper of positional parallax) so the
diorama feels held, not bolted down. Fog eases once to the static
`TABLEAU_FOG` band on mount. The older Orbit/Focus/Chase multi-mode
camera (whole-globe exploration era) is retired; its history lives in
git up to the `snapshot/pre-art-bible-2026-07-17` tag.

## Character Controller

Camera-relative input (`getMoveInput`) → flat XZ move direction →
`forward` eases toward it → position advances by `forward * WALK_SPEED
* dt`, clamped to a radius around the island's center. Facing, walking,
idle life, waving, and foot shifts are all procedural transforms in one
`useFrame` — no rig, no animation clips.

## Performance Strategy

- Instancing for repeated geometry (all cloud puffs = 1 draw call).
- Shared materials per component (useMemo), shared geometries.
- **Zero allocations in frame loops** — module-level scratch Vector3s.
- dpr capped at 2; shadow map 1024 tight around the avatar; far plane
  scaled to the orbit radius.
- Deterministic seeded randomness (the sky is identical every visit).

## Asset Organization

There are no assets. Geometry = three.js primitives; patterns = shaders
(`onBeforeCompile` for the tiles, ShaderMaterial for the sky); copy =
`src/content/*.ts`; every tunable = `src/lib/constants.ts`.

## Coding Principles

See `CODING_STANDARDS.md`. Headline: componentize, centralize constants,
comment the *why* (especially sign conventions), never allocate per
frame, and keep scene code content-free.
