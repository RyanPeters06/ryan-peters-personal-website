# CODEBASE AUDIT — Performance & Dead Code

A living audit doc. (The original `CODEBASE_AUDIT.md` was a one-time
aesthetic audit that drove the 2026-07-17 TABLEAU decision; it was
retired once resolved — see git history. This file was recreated
2026-07-19 for the performance/dead-code audit and should be updated
whenever a future audit runs.)

## 2026-07-19 — Performance pass (visual-identical constraint)

### Baseline (dev build, dpr 1.25, embedded browser)

| Metric | Before | After |
|---|---|---|
| Draw calls / frame | ~626 | ~630 (unchanged — nothing removed was rendering) |
| Triangles / frame | ~219k | ~220k (unchanged) |
| Avg frame time | ~28–38ms (env-dependent) | same envelope |
| Worst frame (startup) | 141ms | 85ms (shader precompile) |
| Shader programs | 29–37 | unchanged |
| Shadow map | 2048² (already at target) | unchanged |
| DPR cap | [1, 2] (already capped) | unchanged |

Frame time varies heavily with the measuring browser (embedded pane
vs. Playwright Chromium); treat cross-session numbers as rough.

### White flash — root causes, all fixed
Four stacked layers of white before the first settled frame:
1. `index.css`: `html/body/#root` background `#ffffff`
2. `App.tsx`: canvas wrapper `bg-white`
3. `Sky.tsx`: scene clear color = `skyHorizon` (pure white) — never
   visible in a settled frame (the sky dome encloses the camera) but
   IS what shows for any frame rendered before the dome
4. `Suspense fallback={null}` while the Quicksand woff loads → layers
   1–3 showed through

All three colors now `PALETTE.skyMid` (#d6ecfa), so every pre-scene
moment reads as sky. Plus drei `<Preload all />` compiles every
shader/material up front instead of on the first presented frames
(tone mapping was already set at renderer creation, not a frame late).

### Where the frame time actually goes
- **Villagers: ~576 of the ~630 draw calls.** ~24 villagers × ~12
  meshes each, doubled by the shadow pass. Geometry/materials are
  already pooled but each mesh is its own draw call. **Flagged, not
  fixed**: true instancing of articulated characters (per-limb
  transforms per instance) is a real refactor — the biggest available
  win if frame rate still hurts.
- Post pipeline (N8AO, DOF, Bloom, BrightnessContrast, HueSaturation,
  4× MSAA composer): all five passes visibly contribute (AO contact
  shading, background softness, highlight glow, warm grade) — nothing
  removable without changing the look. N8AO has cheaper modes
  (`halfRes`) that would slightly change AO quality — not applied per
  the visual-identical constraint.
- Shadow map updates every frame **by necessity**: the light is static
  but the avatar and all villagers move; freezing the map would
  visibly freeze their shadows.

### Deleted (confident)
- `src/hooks/useSmoothValue.ts` — zero references (sphere-era).
- `cameraFocus` / `setCameraFocus` (store) + the one write in
  `Avatar.tsx` — write-only state; no reader since the chase rig was
  retired.

### Verified clean (nothing to delete)
- No spherical/lat-lon/great-circle math anywhere.
- `public/` is empty; only bundled asset is the one Quicksand 700 woff
  (imported via `?url`, used by three Text components).
- Every `package.json` dependency is imported and used.
- Drei imports minimal: Instances/Instance, Billboard, Text,
  RoundedBox, Preload.

### Kept deliberately — for review
- **`designSystem.ts` token groups `SCALE`, `RADIUS_RATIO`, `MOTION`,
  `TYPE`** — not referenced by code, but they're the intentional "code
  mirror of DESIGN_SYSTEM.md" (values are read by humans building new
  objects, per the project's design-token workflow). Not dead; not
  deleted.
- **`IslandShadow`** — the soft disc under the island. With the new
  low camera it may be entirely (or almost entirely) out of frame; it
  costs 1 draw call + 1 small texture. Suspected-invisible; left in
  place because removing it could subtly change the drop-off edges at
  far left/right. Peter's call.
- **`Clouds` `castShadow`** — clouds orbit far outside the shadow
  frustum, so the flag is inert (culled from the shadow pass). Zero
  cost; left for correctness if the frustum ever grows.
- **`PerfProbe`** (new, dev-only) — exposes the renderer as
  `window.__rlGL` in dev for profiling; compiled out of production.
