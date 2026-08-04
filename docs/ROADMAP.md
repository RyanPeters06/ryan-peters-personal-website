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
- **Objective:** a beautiful, breathing world worth staring at.
- **Features:** flat tiled floor with a cliff edge (shader) on a
  floating island; gradient-sky + fog; soft lighting; instanced
  drifting clouds ringing the island; fixed art-directed tableau
  camera with a gentle eased mouse look-around; mute button + overlay
  layer; shared ambient heartbeat; reduced-motion support.
- **Files:** scene/*, camera/CinematicCamera, hooks/*, lib/*, ui/MuteButton.
- **Success:** 60fps; nothing static. **Deps:** M0.

## M2 — The Avatar ✅
- **Objective:** an original Mii-language resident.
- **Features:** head ≈58% proportions, oversized shoes, low face, hood +
  swoosh-fringe hair; breathing/blinking/glances/foot-shifts; one-arm
  wave greeting; arrival sequence (title dissolves → he turns and waves
  → hands off to free walking), timed off the shared phase machine, no
  camera mode changes involved (the tableau camera is always fixed).
- **Files:** avatar/Avatar.tsx, store phase state.
- **Success:** feels alive within 5 seconds. **Deps:** M1.

## M3 — Movement ✅
- **Objective:** the world becomes a game.
- **Features:** WASD/arrows camera-relative walking, plain XZ
  translation on the flat floor, leashed to a walk radius around the
  island's center so the stage ends where the fixed tableau frame
  does; procedural walk cycle; controls hint card.
- **Files:** systems/movement/*, camera, ui/ControlsHint.
- **Success:** walking around the plaza feels natural; controls not
  inverted (see ARCHITECTURE sign conventions). **Deps:** M2.

## M4 — World Dressing 🔨 (atmosphere + crowd + pods + scattered dressing done)
- **Objective:** the walks between destinations feel rewarding.
- **Done:** spring-morning atmosphere (gradient dome, blue ambient,
  personal sun, per-shot fog). **Background crowd** (~24 villagers,
  player-height, **colourful** hair/shirts/pants (recoloured 2026-07-24
  off the grey/pale palette), chat circles facing inward with nods and
  hops; everyone takes slow strolls between destinations — circle
  members walk out and return home. Deterministic seed, shared
  geometry/material pools). **Centerpiece planter** (2026-07-24): white
  clay disc + raised torus curb containing a grass dome + the ringed
  planet + real flowers, built to match the island material exactly.
  **Lampposts** restyled to lavender post + warm glowing globe. **Landmark pods**, revised 2026-07-19: each
  monument stands on a low platform (2 steps, shared floor tile) with
  flanking trees/bushes and real flowers (daisy/forget-me-not/pink +
  leaf sprigs) — world/Tree.tsx, world/Bush.tsx, world/Flower.tsx,
  tokens in designSystem.ts POD. **Scattered plaza dressing**
  (2026-07-19, revised 2026-07-23): lampposts and a bench hand-placed
  across the open floor (loose flower tufts on bare tile removed) —
  world/Bench.tsx, world/PlazaDressing.tsx —
  instead of clustered one-per-pod (that read as isolated islands).
- **Remaining:** path hints — rounded/toy-like, instanced, gently animated.
- **Files:** world/* (new props), scene/lighting.
- **Success:** every camera angle has something charming in it.
  **Deps:** M1 (visual), M5 (placement makes sense around pods).

## M5 — Locations & Interaction System ✅
- **Objective:** portfolio sections exist as places — as architecture.
- **Done:** typed content layer (content/locations.ts) with all **six**
  locations (About, Projects, Experience, Skills, Contact, Resume);
  LocationPod as a **monument** (one molded monolith on its own low
  platform — steps, a tree, flush-molded symbol face, accent
  breathing/brightening on approach — spec in ART_BIBLE.md §11);
  proximity hysteresis → activeLocation; pillow-shell overlay card;
  title sequence. **All six** now have molded symbol glyphs
  (2026-07-19: person, `</>`, briefcase, gear, chat bubble, document —
  `world/Locations.tsx`'s `SYMBOLS` map), white/cream against each
  location's saturated accent card.
- **Real content landed 2026-08-04** — see M6.
- **Files:** content/locations.ts, world/*, ui/LocationCard.
- **Success:** a stranger finds and reads real content unprompted, and
  every landmark is instantly recognizable as one design system.
  **Deps:** M3.

## M6 — Content Fill ✅ (2026-08-04)
- **Objective:** every section carries Ryan's real information.
- **Done:** all six locations filled from the resume, cross-referenced
  against the GitHub API for live repo links. About (bio + Western B.S.
  CS), Projects (BrainReps, Dr. Maple, RAG Model Comparator, Clearwater
  Care, Ryan Land — each linked), Experience (RBC incoming, Royal
  Containers ×2, Citi Early ID), Skills (4 groups), Contact (email,
  LinkedIn, GitHub), Resume (education, coursework, leadership).
- **Files:** content/locations.ts — plus one height cap in
  ui/LocationCard (below), which the content forced.
- **Two decisions worth keeping:**
  - **No phone number.** The resume carries one; a public page indexed
    by search engines is a different exposure than a PDF sent to a
    recruiter. Email and LinkedIn cover the same need.
  - **No resume PDF.** There is no PDF in the repo, so the Resume pod
    links to LinkedIn instead of offering a download. Drop a PDF in
    `public/` and the last item becomes a real download.
- **Card height is content-driven, so the card is now capped.**
  `LocationCard` only capped its height on touch; on desktop it grew
  unbounded and the first draft of Projects hit 837px inside a 900px
  viewport, with nothing to scroll. Both paths now cap
  (`max-h-[calc(100vh-6rem)]` on desktop, `52vh` on touch) and both
  scroll. Descriptions were also tightened to a line or two — a card
  filling 93% of the frame is a page, not the floating card ART_BIBLE
  asks for. **Keep item lists to ~5 and descriptions short**; the header
  comment in `content/locations.ts` says the same thing.
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

## M9 — Polish & Ship 🔨
- **Objective:** production quality.
- **Done:** loading experience (`ui/LoadingScreen.tsx`). **Mobile/touch
  controls** (2026-07-28): an invisible thumb stick that materializes
  under the finger (`ui/TouchJoystick.tsx`) + a centred teaching card
  (`ui/TouchHint.tsx`); analog tilt-sets-speed; safe-area insets and
  `viewport-fit=cover`; touch-only camera look-follow + forward walk cap
  so the avatar cannot leave the frame on a phone.
- **Remaining:** performance audit (code-split the ~1.9MB three bundle —
  still one chunk), keyboard accessibility, SEO/meta/OG image, deploy
  finish (Vercel + Namecheap DNS in progress).
- **Known bug, deliberately unfixed:** the avatar walks out of frame on
  **desktop** too, at any aspect narrower than 1.77 (see PROGRESS
  2026-07-28 for measurements). Peter scoped this pass to mobile only.
- **Success:** Lighthouse respectable; works on a phone; shareable URL.
  **Deps:** everything.
