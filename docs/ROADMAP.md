# ROADMAP — Every Milestone

Statuses: ✅ done · 🔨 in progress · ⬜ not started
(Keep this file updated whenever a milestone changes state.)

---

## M0 — Scaffold ✅
- **Objective:** clean foundation.
- **Features:** Vite + React + strict TS; R3F/Drei/Zustand/Framer/Tailwind;
  `@/` alias; dynamic dev port.
- **Files:** package.json, vite.config.ts, tsconfig*, src/main.tsx.
- **Success:** `npm run dev` + clean build. **Deps:** none.

## M1 — The Living World ✅
- **Objective:** a beautiful, breathing planet worth staring at.
- **Features:** quad-sphere tile floor (shader); gradient-sky + fog;
  soft lighting; instanced drifting clouds; slow cinematic orbit camera;
  mute button + overlay layer; shared ambient heartbeat;
  reduced-motion support.
- **Files:** scene/*, camera/CinematicCamera, hooks/*, lib/*, ui/MuteButton.
- **Success:** 60fps; horizon curves; nothing static. **Deps:** M0.

## M2 — The Avatar ✅
- **Objective:** an original Mii-language resident.
- **Features:** head ≈58% proportions, oversized shoes, low face, hood +
  swoosh-fringe hair; breathing/blinking/glances/foot-shifts; one-arm
  wave greeting; arrival sequence (planet → portrait → wave).
- **Files:** avatar/Avatar.tsx, store phase state, camera focus mode.
- **Success:** feels alive within 5 seconds. **Deps:** M1.

## M3 — Movement ✅
- **Objective:** the world becomes a game.
- **Features:** WASD/arrows camera-relative walking on great circles;
  procedural walk cycle; third-person chase camera (level side-sweep
  transition, surface-normal up, ~40% horizon); controls hint card.
- **Files:** systems/movement/*, camera, ui/ControlsHint.
- **Success:** full lap of the planet feels natural; controls not
  inverted (see ARCHITECTURE sign conventions). **Deps:** M2.

## M4 — World Dressing 🔨 (partially — atmosphere done)
- **Objective:** the walks between destinations feel rewarding.
- **Done:** spring-morning atmosphere (gradient dome, blue ambient,
  personal sun, per-shot fog).
- **Remaining:** benches, lamps, little trees/planters, path hints —
  all rounded/toy-like, instanced, gently animated.
- **Files:** world/* (new props), scene/lighting.
- **Success:** every camera angle has something charming in it.
  **Deps:** M1 (visual), M5 (placement makes sense around pods).

## M5 — Locations & Interaction System 🔨
- **Objective:** portfolio sections exist as places.
- **Done:** typed content layer (content/locations.ts); LocationPod
  (plaza kiosk: pedestal + accent + bobbing translucent sign + glyph);
  proximity hysteresis → activeLocation; Wii U-style overlay card.
  First pod: **Projects**.
- **Remaining:** real project content (placeholders now); remaining pods —
  Experience, Education, Skills, Contact, Resume, Achievements — each
  with a distinct primitive glyph/structure; spread placement + possibly
  a subtle direction hint toward the nearest pod.
- **Files:** content/locations.ts, world/*, ui/LocationCard.
- **Success:** a stranger finds and reads real content unprompted.
  **Deps:** M3.

## M6 — Content Fill ⬜
- **Objective:** every section carries Ryan's real information.
- **Features:** real projects (repos/links), experience entries,
  education, skills, contact links, downloadable resume.
- **Files:** content/* only (that's the point).
- **Success:** the site could be sent to a recruiter. **Deps:** M5.

## M7 — Ambient Delight ⬜
- **Objective:** "everything is alive."
- **Features:** footstep dust, birds flying by, swaying planters,
  glowing lamp bulbs at pod arrival, sign sparkles, tiny surprises.
- **Success:** visitors linger after reading. **Deps:** M4, M5.

## M8 — Audio ⬜
- **Objective:** the world gets a voice, respectfully.
- **Features:** ambient birds/wind, footsteps, soft UI pops; all behind
  the existing mute contract; no autoplaying music.
- **Files:** new systems/audio, ui wiring. **Deps:** M7.

## M9 — Polish & Ship ⬜
- **Objective:** production quality.
- **Features:** performance audit (code-split three bundle), mobile/touch
  controls (virtual stick), keyboard accessibility, loading experience,
  SEO/meta/OG image, deploy (GitHub Pages/Vercel).
- **Success:** Lighthouse respectable; works on a phone; shareable URL.
  **Deps:** everything.
