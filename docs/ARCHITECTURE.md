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
scene/        what exists (Experience composition, Planet, Sky, Clouds,
              PlanetShadow, lighting/)
camera/       CinematicCamera — all camera behavior lives here
avatar/       the character: model + all procedural animation
world/        placed structures (LocationPod, Locations)
systems/      behavior (movement/: input hook + avatarPose channel)
hooks/        reusable logic (ambient clock, smoothing, spherical
              placement, reduced-motion)
store/        useWorldStore (Zustand)
ui/           overlay components (cards, hints, mute)
content/      typed portfolio DATA (locations.ts) — copy lives here,
              never in scene code
lib/          math/spherical.ts (pure math), constants.ts (ALL tuning
              knobs + PALETTE)
styles/       Tailwind entry
```

**Why:** scene = nouns, systems = verbs, content = words, lib = truths.
Anyone can find anything by asking "is it a thing, a behavior, copy, or
math?"

## Scene Hierarchy

```
<Canvas shadows dpr=[1,2] NoToneMapping far=2.5*orbit>
  <Suspense>
    AmbientLoopDriver   (advances the shared heartbeat)
    Sky                 (gradient dome + fog + background)
    Lighting            (ambient + personal-sun key + fill + hemisphere)
    Planet              (quad-sphere tile shader)
    PlanetShadow        (soft contact disc below the floating planet)
    Clouds              (instanced puff clusters)
    Locations           (LocationPod per content entry)
    Avatar              (character + controller + animation)
    CinematicCamera     (drives the default camera every frame)
```

## Coordinate & Math Conventions (IMPORTANT — bugs lived here)

- The planet is a sphere at the origin, `PLANET_RADIUS = 24`.
- `lib/math/spherical.ts` is the single source of truth: lat/lon ↔
  Vector3, surface orientation, great circles, `expDamp`.
- Avatar tangent frame: `up = normalize(position)`, `forward` tangent,
  `right = up × forward`; root quaternion from `makeBasis(right, up,
  forward)` (character faces local +Z).
- **Walking axis: `up × forward`** rotates the position vector *along*
  facing. (`forward × up` walks backward — this bug shipped once.)
- **Screen-right = `viewDir × up`.** (`up × viewDir` is screen-LEFT —
  this bug also shipped once.)
- **Arm z-rotation: positive = outward for the RIGHT arm (+x), negative
  for the left.** Getting it backwards folds arms invisibly into the
  body (the wave was inert for a whole session because of this).

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

One component owns the camera; three eased modes selected by
phase/focus:

- **Orbit** (far): slow drift around the planet; up = world Y.
- **Focus** (portrait): head-height at `CAMERA_FOCUS_RADIUS = R+1.25`,
  standing `FOCUS_LAT_OFFSET = 9°` on the **equator side** of the
  subject; up = local surface normal.
- **Chase** (third person): offset decomposed into azimuth-around-up /
  height / horizontal-distance, each eased separately — transitions
  sweep around the character's side, never over their head.

Every scalar is damped (`useSmoothValue` / `expDamp`); the look target
lerps; fog near/far retune per mode. The camera is never set, always
steered.

## Character Controller

Camera-relative input (`getMoveInput`) → tangent move direction →
`forward` eases toward it → position rotates around `up × forward` by
`WALK_SPEED·dt/R` (great circles). Facing, walking, idle life, waving,
and foot shifts are all procedural transforms in one `useFrame` — no rig,
no animation clips.

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
