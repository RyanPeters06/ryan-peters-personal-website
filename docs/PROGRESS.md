# PROGRESS — Development Journal

Newest entries first. Update after every milestone or significant
session. This file always reflects the current state of the project.

---

## 2026-07-18 — THE FLAT ISLAND (world model pivot, off the sphere)

**Current milestone:** M5 (Locations) — world-model rewrite, content
placement unaffected
**Next milestone:** Peter to spot-check the title-card reveal live (see
Known issues below), then continue M4/M5 remaining work

### Pivot: sphere → flat floating-island disc
- **Peter's call:** stop simulating a flattened sphere and instead
  rebuild the ground as a genuine flat disc (`scene/Ground.tsx`,
  radius `ISLAND_RADIUS`), plain XZ world coordinates, no curvature,
  no lat/lon, no great-circle math anywhere. This supersedes the
  2026-07-17 "TABLEAU ON THE SPHERE" decision in `ART_BIBLE.md` (now
  updated) — the tableau camera/composition stays, the sphere under it
  does not.
- **Full math rewrite, not a patch:** `lib/math/spherical.ts` and
  `hooks/useSphericalPosition.ts` are deleted outright, replaced by
  `lib/math/damp.ts` (just `expDamp`) and `hooks/useFlatPosition.ts`.
  Every consumer — `avatarPose`, `Avatar`, `Villager`, `Crowd`,
  `Clouds`, `LocationPod`, `Locations` — now does plain Vector3/XZ
  arithmetic. Walking is `position += forward * speed * dt`, clamped
  by distance from center (`TABLEAU_WALK_RADIUS`) instead of an
  angular leash. Verified via `grep` after the fact: zero lat/lon/
  spherical/greatCircle/PLANET_RADIUS references remain in `src/`.
- **Ground.tsx**: a flat tiled disc (the old quad-sphere tile shader
  rewritten for flat XZ cells — much simpler, no cube-face projection)
  plus a short cliff wall dropping from the rim, so the island reads
  as floating with a real edge, not a table that fades to nothing.
  `IslandShadow.tsx` (renamed from `PlanetShadow.tsx`) grounds it from
  below.
- **Planet ornament removed entirely.** `Fountain.tsx` no longer has
  the floating ringed mini-planet or its orbit ring — just the basin,
  grass ring, and a low pillowy dome plinth with a softly breathing
  glow (light is the life here, not motion, per DESIGN_SYSTEM).
- **Landmark positions re-derived**, not hand-waved: each location's
  old (lat, lon) was converted to flat (x, z) preserving the same
  horseshoe angular arrangement and relative spread, then the six
  radii were tuned against the fixed tableau camera's actual frustum.
  Crowd chat-circles and wanderer spots got fresh hand-placed XZ
  coordinates within the walk radius (the old sphere version let
  wanderers roam to off-stage equatorial points well outside the
  camera frame — not reproduced here).

### Rename: Ryan's Planet → Ryan Land
- `index.html` title/meta, the 3D title text (`TitleWorld.tsx`), and
  the header badge (`HeaderBadge.tsx`, new component) all say "Ryan
  Land" now. Swapped the header's 🪐 planet emoji for 🏝️. `ART_BIBLE.md`
  and `DESIGN_SYSTEM.md` headings updated to match; `DESIGN.md`'s
  vision paragraph re-worded from "planet" to "island".

### Header fixed
- The header was rendering oversized and running off both edges
  before this session (a half-finished change from a parallel
  session). `HeaderBadge.tsx` is now a small pill, top-left, 24px
  inset — measured live at **7.6% of viewport width** (130px of
  1707px), far under the "never >1/3 screen width" rule now written
  into `ART_BIBLE.md` §13 (UI Language) so it doesn't regress again.

### Verified live (Claude in Chrome — the in-app preview pane can't run
R3F; see prior session notes)
- Full plaza composition: flat disc floor, six monuments in a
  horseshoe, crowd, fountain plinth, cloud ring, header badge — all
  confirmed via screenshot.
- Header badge size/position confirmed via direct DOM measurement
  (`getBoundingClientRect`), not just eyeballing.
- `npx tsc -b` and `npm run build` both clean.

### Known issues / open items
- **Title-card reveal (3D "Ryan Land" text) could not be visually
  confirmed in this session.** The click-to-enter flow works (the
  invisible full-screen click-catcher always advances the phase
  regardless), but the automated browser tab appears to throttle/pause
  `requestAnimationFrame` heavily in the background, so the ~2.6s
  reveal animation was never caught in a screenshot despite one clean
  console-log capture proving the opacity animation itself runs
  correctly. Repositioned `TitleWorld`'s anchor (`ANCHOR_Y`/`ANCHOR_Z`
  in `TitleWorld.tsx`) using trigonometry calibrated against the
  confirmed-visible monument position, since the fixed tableau camera
  turned out to have very little vertical headroom (a narrow 28° FOV
  pointed steeply down — see the new note in `ARCHITECTURE.md`).
  **Peter should give this one live look in a normal foreground
  browser tab** before considering the title sequence done. Follow-up
  (below) confirms via real screenshot that the title text currently
  overlaps the monuments rather than sitting clear in the sky band —
  still open, not addressed this pass.
- ROADMAP.md's M1/M3 prose still describes the old sphere/great-circle/
  chase-camera model — flagged as a follow-up, not fixed this session.
  **Resolved same day, see ROADMAP.md.**

### Follow-up: camera framing pass (sky ratio + tightened composition)
- **Peter's feedback:** pitch was too steep (only a sliver of sky at
  the top of frame) and the disc left a lot of dead, empty floor
  around the panel arc.
- **Verification method correction:** the in-app Browser preview pane
  and Claude-in-Chrome were both unavailable/non-rendering for R3F this
  session; the Playwright MCP tools (real Chromium, not the preview
  pane) rendered the canvas correctly and gave reliable screenshots —
  worth reaching for first next time R3F needs visual verification.
- **Fix, iterated visually against real screenshots (not just math):**
  raised the camera and flattened its pitch — `TABLEAU_CAMERA_POS`
  `[0,15,19]` → `[0,14,19]`, `TABLEAU_CAMERA_TARGET` `[0,-0.5,-3]` →
  `[0,2.9,-2]`, `TABLEAU_FOV` `28` → `38` — landing sky at ~40% of
  frame (target was 35-45%). `ISLAND_RADIUS` `16` → `11` and
  `TABLEAU_WALK_RADIUS` `12.5` → `9.6` close the cliff edge in behind
  the landmark arc (max landmark radius is ~9.2) instead of leaving a
  wide empty ring. Landmark/crowd/avatar positions untouched.
- **Regression caught and fixed in the same pass:** shrinking
  `TABLEAU_WALK_RADIUS` also shrinks the cloud ring (`Clouds.tsx`
  derives its orbit radius from it), which let a cloud drift within a
  few units of the camera — filling half the frame with a gray blob.
  Bumped the ring's minimum clearance so it always clears the camera's
  own distance from center with margin.
- **No reddish/pink vignette found.** Checked the title screen, the
  idle plaza, and the arrival frame directly — sky gradient, fog, and
  bloom are all blue/white per `PALETTE`; the only warm/pink tones are
  the "Contact" and "About" monuments' own pastel accents, not a
  screen-edge effect. If Peter still sees one, it's worth a screenshot
  from his machine — could be a monitor/OS color effect rather than
  something the app is drawing.
- Verified: `npx tsc -b` and `npm run build` both clean; screenshots
  confirm sky ratio, panel/avatar/NPC framing, and no cloud-in-face
  regression.

### Follow-up 2: real blue sky + tighter dolly (Peter round 2)
- **Peter's feedback:** still too much sky, and the sky rendered as
  flat blank white — no gradient, no clouds in it; plus dead ground
  between the camera and the panel arc and beyond the outer panels.
- **Root cause of the white sky — two stacked bugs:**
  1. `CAMERA_FAR` was derived as `ISLAND_RADIUS * 15`; shrinking the
     island to 11 dropped the far plane to 165, **closer than the
     200u sky dome**, clipping the dome out entirely — the "sky" was
     the flat white canvas background. Now `SKY_DOME_RADIUS = 200`
     is its own constant and `CAMERA_FAR` derives from *it* (×1.3),
     with a comment explaining the trap.
  2. Even unclipped, the gradient could never show: the tableau
     camera points ~26° down, so every ray in frame aims BELOW
     world-horizontal, and both the old camera-up keying and naive
     world-up stops put all the blue above the frame. The dome
     shader (`Sky.tsx`) now keys world elevation with stops
     calibrated to the visible band (h ≈ −0.29..−0.05): white at the
     island rim, light blue within degrees, full blue by frame top.
     Stops are camera-geometry-coupled — retune if the rig moves.
- **Clouds live at rim height now:** same reasoning — the visible sky
  band sits at/below the island rim, so `CLOUD_ALTITUDE` is now
  −4..+6 (beside/below the edge, selling the floating island) over a
  deep 25..45u radius band, instead of 2..12 up where the frame never
  looks.
- **Framing:** dolly in `[0,14,19]→[0,10.5,14.5]`, target
  `[0,2.9,-2]→[0,2.6,-1.8]`, fov 38 — rim now ~40% down frame,
  panels near the side edges, minimal dead ground. `AVATAR_SPAWN_Z`
  4.7→3.4 (the closer camera clipped his head at the old spawn; note
  added in constants.ts).
- Verified via Playwright screenshots; tsc + build clean.

---

## 2026-07-17 — Creative-Director pass: Art Bible, reference teardown, audit

**Current milestone:** M5 (Locations) — paused for a strategic decision
**Next milestone:** Peter to resolve the world-model fork (below)

### 2026-07-18 — THE TABLEAU (world model decided)
- **Peter chose the staged tableau.** Camera locked to one fixed
  art-directed frame (pos [0,38,26] → target [0,23.2,-2], fov 28
  compressed-diorama lens) with gentle eased mouse look-around; the
  chase/orbit/focus rig is retired (history: CinematicCamera pre-pivot).
- **Composition arranged to the reference:** six landmarks in a
  horseshoe at the crown (screen L→R About #cdb9ea, Projects #a9c9e8,
  Experience #b8e6c9, Skills #f2d38f, Contact #f2b8c6, Resume #a8dde0;
  lats ~70-73, lons ±98..±163), each yawed to face the new **fountain
  centerpiece** (world/Fountain.tsx: white basin, grass ring, floating
  ringed mini-planet) at the pole. All six locations now exist in
  content (placeholders; only Projects has a 3D symbol so far).
- **WASD kept, leashed:** walk clamps softly at 30° arc from the pole
  (TABLEAU_WALK_LIMIT_DEG); spawn lat 79, facing the fountain (back to
  camera, like the reference). Greeting no longer distance-gated.
- Fog now static (40/100); title re-anchored into the sky band above
  the plaza's far horizon. Materials/lighting/post untouched this pass
  by explicit instruction.
- Verified live: the frame closely matches the concept-art composition.

### Phase 6+7 (same day)
- **Projects monument redesigned from scratch** — the language every
  landmark inherits (tokens in DESIGN_SYSTEM → LANDMARK): pillowy
  white monolith (1.9×2.3×0.75, r 0.3, extremely soft bevels) sunk
  0.22 into the floor swell + **flush accent-washed inset face panel**
  (the UI pillow-shell construction become architecture) + refined
  molded `</>` glyph + **the location's name in 3D Quicksand** on the
  face. Glow fully token-driven.
- **Character redesigned (Phase 7):** plump squashed-capsule hoodie
  body with molded hood bump on the back, chunkier arms/shoes, **white
  sneakers** (crowd matched), soft-navy pants, waddle roll + bigger
  step bounce in the walk. Verified live mid-wave: reads uncannily
  like the concept-art character.

### Phase 4+5 (same day, after the docs pass)
- **Design system shipped:** docs/DESIGN_SYSTEM.md + src/lib/designSystem.ts
  (world scale, monument mold, radii law, material bands, glow levels,
  all six landmark accents, timing, curves). Nothing designed
  independently from here on.
- **Environment redesigned (Phase 5, env only — UI untouched):** sunny
  genuine-blue sky (`#A5D3F0` zenith) with the dome gradient re-keyed to
  the CAMERA frame with steep stops — the old avatar-up keying left the
  whole intro background below the gradient horizon (that was the real
  "overcast" bug). Warmer/stronger key sun (1.15), blue hemisphere;
  hand-laid floor (per-tile center jitter + per-tile corner radius
  17–27%); plumper clouds (scale 2.5); **real bloom pass** added
  (@react-three/postprocessing; threshold 0.9, intensity 0.22).
  Verified live: intro frame now genuinely resembles the concept art —
  blue corners, radiant white halo behind the planet, title in the glow.

### Completed (documentation only — no code changed)
- **Snapshot tag** `snapshot/pre-art-bible-2026-07-17` created and pushed
  — a durable return point before any redesign.
- **`docs/ART_BIBLE.md`** — new comprehensive source of truth (18
  sections: philosophy → materials → lighting → camera → landmarks → UI
  → sound → scale → hard-NOs → consistency definition). Supersedes
  `ART_DIRECTION.md` (now a one-line pointer). CLAUDE.md reading list
  repointed.
- **`docs/REFERENCE_ANALYSIS.md`** — senior-AD reverse-engineering of the
  concept art + a ranked gap list (largest→smallest) vs. the build.
- **`docs/CODEBASE_AUDIT.md`** — ruthless keep/redesign/delete/debt pass
  on every file, judged only on Art-Bible alignment.

### THE open strategic decision (blocks major world work)
The concept art is a **staged plaza tableau** (flat curved disc, arc of
landmark islands, central fountain, fixed elevated hero camera). The
build is a **walkable sphere** with a close chase camera. They're not
compatible. Peter must choose **[TABLEAU]** (largest change, literal
fidelity) or **[SPHERE]** (keep the globe, borrow the polish — ~85% of
the feeling, far cheaper). Cost of each is in CODEBASE_AUDIT.md.

### Cheap wins that pay off under EITHER model (recommended next)
Sky too near-white → push bluer/sunnier · add a subtle bloom pass
(needs `@react-three/postprocessing`) · dial UI back from heavy glass to
near-solid white · stage the first landmark island (grass + steps +
label + trees).

---

## 2026-07-16 — Docs system established; M5 underway

**Current milestone:** M5 (Locations) + M4 remainder (dressing)
**Next milestone:** remaining pods + real content (M6)

### Completed
- `/docs` project brain created (this system). Root `CLAUDE.md` directs
  every future session to read `/docs` first.
- **World-architecture philosophy** (Peter): landmarks are architecture,
  not props. The Projects kiosk (pedestal + bobbing sign + computer
  glyph) was replaced by a single molded monolith growing from a floor
  swell, with an original rounded `</>` symbol molded flush into its
  face and an accent that breathes/brightens on approach. Spec in
  ART_DIRECTION → World Architecture; all future landmarks follow it.
- **Title sequence**: phase 'title' opens the experience — camera high
  over the living world (drift slowed to a breath), and "Ryan's
  Planet" exists as REAL 3D text in the atmosphere above the crown
  (scene/TitleWorld.tsx, bundled Quicksand Bold woff — the project's
  one typeface asset). True parallax, clouds pass around it, soft
  white outline-glow; staggered condense-in, and on click it releases
  upward into the light while the descent begins. The DOM is only an
  invisible click-catcher. Avatar arrival timers anchored to the
  moment the title gives way. (Peter rejected the first DOM-overlay
  version — titles must be tangible in the world.)
- **The plaza crowd** (world/Crowd.tsx + world/Villager.tsx): ~24
  villagers at player height (Peter revised from the initial 60–70%
  spec) with varied pastel hair/shirt pools; 7 chat circles (members
  ring the center facing inward, nodding, with little Warawara hops) +
  6 free wanderers. Everyone strolls at 0.5 u/s: wanderers roam POI to
  POI; circle members occasionally walk out, pause, and walk home to
  rejoin the chat, so the plaza gently reshuffles. Deterministic seed;
  shared GPU resources; per-villager state machines; reduced-motion
  aware.
- **M2/M3 shipped and iterated with Peter:** avatar redesigned to deep
  Mii language (head ≈58%, oversized shoes, low face, hood + swoosh
  fringe hair after two rejected iterations: bowl cut, pointy cone
  bangs); WASD/arrow movement on great circles; third-person chase
  camera; arrival sequence (planet view → head-height portrait → one-arm
  wave → level side-sweep to chase); controls hint card.
- **Planet grown to R=24** so the walking horizon sits ~40% up the frame,
  gently curved. Fog retunes per shot; key light became a "personal sun"
  following the avatar.
- **Spring-morning atmosphere:** gradient sky dome (Peter's exact hexes)
  whose up follows the avatar; blue-tinted high-ambient lighting;
  blue-gray shadows; cool white floor.
- **M5 start:** typed content layer, plaza-kiosk LocationPod, proximity
  hysteresis → activeLocation, overlay card. Projects pod live with
  placeholder content.
- Overlay cards restyled to the Wii U translucent spec (see
  ART_DIRECTION → UI Philosophy).

### Important decisions
- Navigation pivoted from click-to-move to **keyboard walking + chase
  camera** (Peter, 2026-07-16).
- Design north star adopted: *"Would this look natural in a peaceful
  Wii U-era Nintendo plaza?"*
- Avatar spawns at the planet's crown (lat 75) facing south so the intro
  needs no camera roll; focus camera stands equator-side of subjects.

### Hard-won conventions (do not rediscover these)
- Walking axis `up × forward`; screen-right `viewDir × up`; arm
  z-rotation positive = outward for the right arm. All documented in
  ARCHITECTURE.md.
- Background/hidden tabs throttle rAF → the sim runs in slow motion
  (dt clamp 0.1). Judge timing only on a visible window.

### Known issues / open items
- Projects content is placeholder — Peter must fill
  `src/content/locations.ts`.
- Only 1 of 7 locations exists; world dressing (benches/lamps/trees)
  not started; no audio; desktop-keyboard only (no touch).
- three.js bundle ~1.2MB minified — code-split in M9.
- Wave pacing and chase feel still await Peter's real-time approval.

---

## 2026-07-15 — M0 + M1 complete

- Scaffolded the project; built the living world: quad-sphere shader
  tile floor (evolved from green low-poly grass through triplanar to
  quad-sphere white plaza tiles per Peter's Warawara reference), fog,
  instanced clouds, cinematic orbit camera, mute overlay, shared ambient
  heartbeat, reduced-motion support.
- Locked: true-sphere world model; Zustand; procedural avatar (no rig);
  content-as-data. Milestone workflow: build → report → approval.
- Pushed initial history to
  github.com/RyanPeters06/ryan-peters-personal-website.
