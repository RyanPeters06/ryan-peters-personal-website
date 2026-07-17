# PROGRESS — Development Journal

Newest entries first. Update after every milestone or significant
session. This file always reflects the current state of the project.

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
