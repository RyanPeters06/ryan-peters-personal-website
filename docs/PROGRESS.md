# PROGRESS — Development Journal

Newest entries first. Update after every milestone or significant
session. This file always reflects the current state of the project.

---

## 2026-07-19 — Header false alarm + sun angle correction

Peter reported two regressions: the header back to full-size overlap,
and "still no real directional lighting" — despite the lighting pass
earlier the same day. Investigated both from source before touching
anything, per the ask.

**Header: not a regression.** Read `HeaderBadge.tsx` and `Overlay.tsx`
fresh — both identical to the small-pill implementation, mounted once,
no duplicate. Live-checked in the browser: the large full-width "Ryan
Land" text is `TitleWorld.tsx`'s **intentional 3D intro title**, which
is *supposed* to fill the frame before the visitor's first click (it's
real scene geometry, not the overlay). After clicking through, the
actual `HeaderBadge` renders correctly — small pill, top-left, as
designed. No code changed here; flagged to Peter that the screenshot/
observation was almost certainly the title screen, not the persistent
header.

**Lighting: real angle bug, not "still absent."** The shadow-coverage
fix from earlier today was confirmed still present and working (git
log clean, `Lighting.tsx`/`Experience.tsx` unchanged from that commit).
What was actually wrong: the sun's `SUN_DIR` had `x = +0.8`, which
— given screen-right for this camera rig is world `+X`
(`viewDir x up`, documented in ARCHITECTURE.md) — put the sun upper-
**right**, shadows falling lower-left. The reference wants upper-left/
lower-right, the mirror image. Flipped to `x = -0.85`, bumped the z
lean slightly (`0.4 -> 0.55`) for a clearer front-key read. Confirmed
live: panel side faces now show a visible lit-left/shadowed-right
split, and NPC/tree shadows fall toward the lower-right of their feet.

**Files:** `scene/lighting/Lighting.tsx` only (one constant). No header
code touched (nothing was wrong). `tsc -b` and `npm run build` clean.

---

## 2026-07-19 — Lighting pass: shadows, AO, DOF, color grade

Peter asked for a diagnosis-first pass on lighting/shading — the
scene's layout, color, and framing were considered settled; this was
purely render-pipeline work. Findings, checked before touching
anything:

1. **Shadows were enabled but silently useless for 90% of the scene.**
   `<Canvas shadows>` and `castShadow`/`receiveShadow` were all
   correctly set — but the key light's shadow camera was a tight +/-8
   orthographic frustum that **tracked the avatar's live position**
   every frame (`Lighting.tsx`'s old `useFrame`, copying
   `avatarPose.position`). That was correct for the old chase-camera
   model, where only the avatar's immediate surroundings were ever in
   frame. It was never revisited after the fixed-tableau pivot
   (2026-07-18) — under a camera that always shows the *whole* plaza,
   a small avatar-centered frustum left every landmark, tree, lamppost,
   and bench outside the shadow camera, so they cast/received nothing
   despite having the right mesh flags. Fixed: the key light is now a
   **fixed** world-space sun (no more per-frame tracking, no more
   `avatarPose` import in `Lighting.tsx`), shadow camera widened to
   `ISLAND_RADIUS + 2`, shadow map bumped 1024->2048 to hold resolution
   over the larger area.
2. **Materials were already correctly lit** — every object uses
   `MeshStandardMaterial`; the only `MeshBasicMaterial` in the codebase
   is `IslandShadow`'s baked contact-shadow blob, which is *supposed*
   to be unlit. The "flat card" look was a **light-balance** problem,
   not a material problem: ambient (1.3) was nearly as strong as the
   key light (1.15), which flattens directional falloff across a
   surface. Ambient 1.3->1.05, key 1.15->1.35, hemisphere 0.55->0.42 —
   more directional without darkening the scene's overall mood.
3. **A real bug found mid-fix:** `<Canvas shadows>` (and the explicit
   `shadows="soft"` string) both map to three.js's now-**deprecated**
   `PCFSoftShadowMap`, which silently falls back to hard-edged
   `PCFShadowMap` at render time (console: "PCFSoftShadowMap has been
   deprecated. Using PCFShadowMap instead"). Switched to
   `shadows="variance"` (`VSMShadowMap`) with `shadow-radius`/
   `shadow-blurSamples` on the key light for genuinely soft, blurred
   shadow edges. (Caught a red herring here too: the warning kept
   showing after the fix because of stale HMR state from many edits
   this session — a full dev-server restart confirmed the fix actually
   worked. Don't trust console warnings that persist across HMR
   without a hard restart to rule out stale state.)
4. **No AO or DOF pass existed** — `EffectComposer` only had `Bloom`.
   Added `N8AO` (tinted `PALETTE.shadow`, never black, per the "shadows
   are always blue-gray" rule) for contact-point darkening, and
   `DepthOfField` (world-space focus distance tuned to the avatar,
   `worldFocusRange=15` for a wide sharp band, `bokehScale=1.3` —
   first pass at `bokehScale=2.2`/`worldFocusRange=9` blurred the
   landmark arc too aggressively for labels/icons to stay legible at
   rest).
5. **No color grade existed** (`NoToneMapping`, chosen specifically to
   dodge the 2026-07-18 bloom/haze bug). Added `BrightnessContrast` +
   `HueSaturation` for warmth/contrast, but ordered them **after**
   `Bloom` in the composer — applying a grade before Bloom would shift
   what counts as a highlight and could re-trigger the same haze,
   since Bloom's threshold is tuned against the un-graded image.

**Files:** `scene/lighting/Lighting.tsx` (rewritten), `scene/
Experience.tsx` (Canvas `shadows` prop, five new composer effects).
No layout, color, or camera-framing changes, per the ask. Verified live
via the Browser pane; `tsc -b` and `npm run build` both clean.

---

## 2026-07-19 — Plaza realignment: platforms, saturated cards, real sky

Peter shared a new reference image and authorized destructive changes
to bring the plaza in line with it — explicitly superseding the
grass-mound pod direction from the previous session. Rollback point:
tag `snapshot/pre-plaza-realign-2026-07-19` (commit `5656c2c`).

**Ground topology (biggest visual gap):** the grass-mound "hill" per
pod read as separated floating islands with sky visible between them
— against the reference's one continuous plaza floor. Replaced with a
low platform (`POD.platform`, 0.18 tall vs. the mound's 0.46, same
white tile material as the shared floor) + 2 shallow steps + a thin
grass trim strip, instead of a 0.46-tall grass truncated cone. The
ground now reads unbroken between landmarks.

**Panel color (root cause of "washed out," not just bloom):** the
previous fix (raising the bloom threshold) was correct but incomplete
— the real problem was that landmark bodies were **white** with only
a faint accent-tinted inset face. Reference cards are fully saturated
per-location color. Body now lerps `#ffffff` toward the accent ~68%
(inset face ~52%); symbol and label color inverted to white/cream
(`#fdfaf5`/`#fffdf9`) since they now sit on a colored card, not a
white one.

**All six landmarks now have molded symbols** (previously only
Projects did): person (About), briefcase (Experience), gear (Skills),
chat bubble (Contact), document (Resume), built from the same
capsule/box/torus primitive language as the original `</>` mark —
`world/Locations.tsx`.

**Dressing redistributed:** pods keep one flanking tree + a flower
tuft; lampposts, a new `world/Bench.tsx`, and extra flower tufts moved
to `world/PlazaDressing.tsx`, hand-placed across the open plaza
(mirroring `Crowd.tsx`'s hand-placed `GROUPS` pattern) instead of
one-per-pod.

**Camera reopened for more sky:** pitch shallowed from ~26° to ~19°
down (`TABLEAU_CAMERA_POS` `[0,11.5,16.5]`→`[0,9.5,15.5]`, target y
2.6→3.4, fov 44→42) so the sky fills roughly 40–50% of the frame
instead of ~30%; `ISLAND_RADIUS` 12.5→10.5 now that platforms need far
less clearance than the old mounds, tightening dead space past the
outer panels.

**New UI chrome, matching the reference:** `ui/TopRightTools.tsx` (map/
people/settings icon buttons, top-right) and `ui/WelcomeCard.tsx`
(bottom-left greeting) — both presentational, no backing features yet.
Caught and fixed a real bug while adding these: `ControlsHint` was
anchored `bottom-8 left-8`, the same corner the new `WelcomeCard` needs
per the reference (which wants controls bottom-*center*) — moved
`ControlsHint` to `inset-x-0 justify-center`, matching `LocationCard`'s
existing pattern.

**Left as a known gap:** the top-right tools have no map/people/
settings panels behind them (presentational only, per Peter's "add to
match the reference" instruction — building real features wasn't in
scope). Icon shapes (gear, chat bubble, briefcase, document, person)
are simplified original glyphs, not pixel-matched to the reference —
same "reasonable approximation" standard the original `</>` mark was
built to.

Verified live via the Browser pane (worked this session — see
[[browser-pane-no-raf]] for the retry pattern). `tsc -b` and
`npm run build` both clean.

---

## 2026-07-19 — Docs consolidation pass

Peter asked for a full pass over every markdown file: fix what's stale,
cut what's redundant, optimize for what's actually useful as AI
session-start context (rather than treat `/docs` as append-only).

**Deleted three docs, folding anything durable into ART_BIBLE.md first:**
- `ART_DIRECTION.md` — fully superseded by `ART_BIBLE.md` since
  2026-07-17; was supposed to already be "reduced to a one-line
  pointer" per the old audit but never actually was (still 200 lines
  of now-contradicted sphere-era spec sitting in the mandatory reading
  list). Deleted outright.
- `CODEBASE_AUDIT.md` — a one-time keep/redesign/delete verdict pass
  that existed to decide and cost the TABLEAU-vs-SPHERE fork. That
  fork is resolved and shipped; its file-by-file verdicts named files
  that no longer exist (`spherical.ts`, `Planet.tsx`, `PlanetShadow.tsx`).
  Its still-actionable items (bloom, sky-blue, staged islands) have all
  shipped; the one still-open item (PlazaCard's heavy glass) moved into
  ART_BIBLE.md §13 as a plain note instead of a dangling "see audit."
- `REFERENCE_ANALYSIS.md` — the concept-art teardown that produced the
  ranked gap list driving the last week of work. The gap list is now
  ~entirely resolved (world model, camera, sky, bloom, dressing,
  fountain). Its durable analysis (squircle shape language, "one
  molded object" industrial design, A-B-A-B landmark rhythm) was
  already largely captured in ART_BIBLE.md from its original 2026-07-17
  consolidation; the one genuinely new insight (A-B-A-B rhythm) got
  folded into ART_BIBLE.md §9.

**Fixed remaining staleness across the survivors:**
- `CLAUDE.md` — mandatory reading list still said "world model decided:
  TABLEAU on the sphere" (wrong since the 07-18 flat-island rewrite);
  removed the two deleted docs, added `DESIGN_SYSTEM.md` (was never
  listed despite being load-bearing).
- `ART_BIBLE.md` — sky-gradient and bloom-threshold values in §6 were
  the pre-fix numbers; §8 still carried `[TABLEAU]`/`[SPHERE]` fork
  brackets for a decision that's no longer a fork; §9's "generous
  negative space, emptiness is a feature" directly contradicted the
  tight-framing calls from the last two sessions; §11 described pod
  dressing as a future `[TABLEAU]` bracket instead of shipped work.
- `ROADMAP.md` — M2 described a "planet → portrait → wave" arrival and
  a "camera focus mode" that don't exist in the tableau model; M5
  listed Education/Achievements (never built) and omitted About (which
  exists) — corrected against the actual `content/locations.ts`.
- `DESIGN.md` — Areas table had the same wrong location list; fixed to
  match reality and noted only Projects has its molded symbol built.
- `ARCHITECTURE.md`, `CODING_STANDARDS.md`, `REFERENCES.md` — repointed
  every `ART_DIRECTION.md` cross-reference to `ART_BIBLE.md`; fixed a
  stale "far plane scaled to the orbit radius" comment (it's
  `SKY_DOME_RADIUS` now, on purpose — see 07-18's haze-fix entry);
  added `Tree`/`Lamppost`/`FlowerTuft` to the folder-structure listing;
  replaced `REFERENCES.md`'s stale chase/orbit camera section with the
  current fixed-tableau framing.
- `src/ui/PlazaCard.tsx` — one stray code comment pointed at the
  deleted `ART_DIRECTION.md`; repointed.
- `README.md` (repo root, public-facing) — still called the project "A
  Tiny World" / "planet," and its Architecture Notes section described
  `spherical.ts` and `Planet.tsx` as the load-bearing math/floor files;
  both were deleted in the 07-18 rewrite. Rewritten for the current
  flat-island architecture.

**Net result:** 8 docs (was 11) + CLAUDE.md + README.md, all internally
consistent with the shipped flat-island/pod build. Only non-doc touch:
one stray code comment in `PlazaCard.tsx` pointing at a deleted file.

---

## 2026-07-18 — Landmark pods + fountain globe (reference-matched dressing)

**Current milestone:** M4 (World Dressing) — pods shipped; M5 unaffected

Peter shared his original mockup image mid-session and, given a choice
between (a) just finishing the in-flight haze/framing fix, (b) also
reinstating the fountain's ringed globe, or (c) going all the way to
match the reference's per-landmark grass pods, **picked (c), full
scope.** Two things shipped together:

### 1. Bloom haze fixed (root cause, not a guess)
The white glow band washing out the horizon and panels was **not**
fog or the sky shader — it was `GLOW.bloom.threshold: 0.9` under
`NoToneMapping`: the plaza's near-white sky/fog/tile surfaces
genuinely hit ~0.9+ luminance under the scene's flat lighting, so
*ordinary geometry* bloomed, not just highlights. Threshold raised to
0.97, intensity 0.22→0.18, smoothing 0.25→0.15 — bloom now only
catches real highlights (accent glow, lantern), never general white
surfaces. (designSystem.ts GLOW.bloom)

### 2. Landmark pods (new — matches the reference mockup)
Every monument now stands on its own small grass mound instead of
sitting flush on the shared plaza tile:
- **Mound**: a truncated cone (flat top, sloped sides), grass-topped,
  meeting the plaza flush at its base. Three steps embed into the
  front slope, descending toward the plaza center.
- **Dressing**: two flanking trees (`world/Tree.tsx` — cartoon-cloud
  canopy construction, green or blossom-pink per location via new
  `treeVariant` content field), a lamppost (`Lamppost.tsx`, emissive
  lantern, no real light), a small flower tuft (`FlowerTuft.tsx`).
- All tokens in `POD` (designSystem.ts) — mound radii/height, step
  positions, prop offsets. `ISLAND_RADIUS` grown 11→12.5 so the
  island's cliff edge clears the wider mounds instead of clipping
  them.
- **Fountain reinstated a small ringed globe** — reverses the
  "no planet ornament" call from earlier the same day, per the
  reference: basin + grass ring (kept) + a modest bobbing/spinning
  ringed sphere (brought back, ~40% the size of the original retired
  ornament, no separate orbit-ring mesh).
- Camera widened to fit the wider composition:
  `[0,10.5,14.5]/fov 38` → `[0,11.5,16.5]/fov 44`. `TABLEAU_CAMERA_TARGET`
  y unchanged.
- Verified live via the Browser pane (Playwright MCP was disconnected
  mid-session; Claude in Chrome had no browser connected either — the
  in-app pane worked this time, contradicting [[browser-pane-no-raf]]
  intermittently. See that memory for the retry pattern that worked:
  resize to a preset, click/scroll to nudge focus, wait 2-3s.).
  `tsc -b` and `npm run build` both clean.
- **Open follow-up:** the top-right icon buttons (map/people/settings)
  and benches visible in the reference are not yet built — out of
  scope for this pass, flagged for a future M4/M9 UI session.

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
