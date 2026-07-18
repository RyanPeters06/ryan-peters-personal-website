# CODEBASE AUDIT — Alignment with the Art Bible

Ruthless evaluation of the current implementation **purely on aesthetic
alignment** with `ART_BIBLE.md` and `REFERENCE_ANALYSIS.md`. Function is
ignored; the code mostly *works*. The only question here is: **does it
look and feel like Ryan's Planet?**

Verdict up top: **the engineering foundation is genuinely strong and
worth keeping; the aesthetic is ~60% of the way to the reference, held
back by one strategic fork and a handful of tuning debts.** Nothing here
is embarrassing. But to hit the concept art, we redesign the camera/world
staging and finish the world — and we should be willing to.

---

## ✅ What's worth keeping (the strong core)

- **`lib/math/spherical.ts` + `useSphericalPosition` + `useSmoothValue`
  + `expDamp`.** Clean, pure, reusable. The math spine is excellent and
  survives either world model. **Keep as-is.**
- **`useAmbientLoop` shared heartbeat + reduced-motion scaling.** Exactly
  the Bible's "one heartbeat" rule, implemented well. **Keep.**
- **Allocation-free frame loops** (module scratch vectors everywhere).
  Disciplined and correct. **Keep the pattern; enforce it in review.**
- **`content/locations.ts` typed data layer.** Content-as-data is right;
  scene code stays copy-free. **Keep.**
- **`Avatar.tsx` proportions & procedural idle life.** The character is
  on-Bible (head ~58%, low face, hood hair, one accent) and genuinely
  alive. **Keep the model; keep the animation approach.**
- **`Villager.tsx` + `Crowd.tsx`.** Shared geometry/material pools,
  deterministic seeding, per-agent state machines, peaceful strolling —
  this is real "living world" and it's efficient. **Keep.**
- **`Planet.tsx` quad-sphere tile shader.** Technically lovely; seams
  align, per-tile variation is a nice touch. **Keep the shader**
  (its *use* depends on the world-model decision).
- **Zustand store + `phase` machine.** Right tool, clean. **Keep.**
- **The "molded monolith + flush symbol + breathing glow" landmark
  concept** in `LocationPod`/`Locations`. The *idea* is dead-on Bible.
  **Keep the concept; it needs staging around it (below).**

## 🔧 What should be redesigned

- **The camera (`CinematicCamera.tsx`) — biggest aesthetic redesign.**
  The chase cam is well-built but delivers the *wrong experience* vs. the
  reference's fixed elevated hero shot. **[TABLEAU]:** add a presentation
  camera mode. **[SPHERE]:** at minimum pull back and raise the chase so
  more world reads at once. Either way the current close-hug framing
  under-sells the plaza.
- **Sky (`Sky.tsx`) + palette (`constants.ts`).** Too near-white; reads
  clinical, not sunny. Push `skyTop`/`skyMid` bluer and add a touch of
  saturation so it's a *bright blue morning*, not an overcast one.
- **UI shells (`PlazaCard.tsx`, and the header comment still points at
  the retired `ART_DIRECTION.md`).** Over-glassed: `rgba(255,255,255,
  0.55)` + `backdrop-blur-24px` fights the "avoid strong glassmorphism"
  rule and the reference's clean solid-white chrome. Redesign toward
  **near-solid white + soft shadow**, translucency as seasoning only.
- **Landmark staging (`LocationPod.tsx`).** The monolith is right but
  **naked** — no grassy island, no steps, no trees, no label. Redesign
  the pod into a **composed destination island** per the Bible.
- **Lighting polish (`Lighting.tsx`).** Solid, but the reference's "gently
  glowing" look needs a **subtle bloom pass** the current rig can't
  produce. Add postprocessing (small dependency; Peter's call) — highest
  polish-per-hour upgrade available.

## 🗑️ What should be deleted / retired

- **`ART_DIRECTION.md` as an authority.** Now superseded by
  `ART_BIBLE.md`. Reduce it to a one-line pointer (done) so there is
  exactly one source of truth. Stray references to it in code comments
  (`PlazaCard.tsx`) should be repointed.
- **Nothing else should be *deleted* outright** — the code debt is
  redesign, not removal. Do **not** delete the sphere/planet/chase
  systems until the world-model decision is made; if [TABLEAU] wins,
  `PlanetShadow`, the sphere `Planet` mesh, great-circle movement, and
  the orbit/chase halves of the camera would then be retired together.
  (Flag, don't delete, today.)

## ⚠️ Technical debt (aesthetic-relevant only)

- **Two art docs** existed (`ART_BIBLE` vs `ART_DIRECTION`) — resolved by
  making the Bible master. Keep it that way.
- **Docstring drift:** `PlazaCard` cites `ART_DIRECTION.md`; several
  comments describe the old "bobbing sign" pod. Low-risk but erodes the
  brain's trust. Sweep when touched.
- **No bloom/postprocessing pipeline** — a real gap between "faked glow"
  and the reference. Not debt from doing it wrong; debt from not doing it
  yet.
- **Sky color constants** duplicated in intent between `PALETTE` and the
  Sky shader stops — keep them single-sourced through `PALETTE`.
- **Bundle:** three.js ~1.2MB, no code-split (deferred to M9). Not
  aesthetic; noted for completeness.
- **Desktop-keyboard only**; no touch. Not aesthetic; affects reach.

## 🥊 Which systems are fighting the desired aesthetic

1. **The chase camera vs. the reference's hero framing.** The single
   biggest "feels different from the concept art" force. It's not broken
   — it's the *wrong lens* for a diorama.
2. **The near-white sky vs. sunny-blue warmth.** Quietly drains the
   emotional target (#1 Warm). Cheap to fix, high impact.
3. **Glassy UI vs. clean solid chrome.** Actively against a hard-NO;
   muddies the crisp toy-UI read.
4. **Bare landmark vs. staged island.** The monolith reads as "a shape on
   the floor," not "a destination," until it gets its planting + steps +
   label.
5. **Absence, not opposition:** no fountain, no dressing, no top-right HUD
   — the world simply isn't finished, so it can't yet feel like the
   populated reference.

Note: almost nothing *actively* betrays the aesthetic (the code is
tasteful). The gap is **one strategic fork + unfinished world + a few
tuning debts** — not a rotten foundation.

---

## The strategic fork, costed

**If [TABLEAU] (match the concept art literally):**
- Retire: sphere `Planet` mesh usage, great-circle movement, orbit +
  chase camera, `PlanetShadow`.
- Build: flat curved plaza disc, arc landmark layout, fixed hero camera
  with mouse-look parallax, movement re-expressed on a plane, central
  fountain.
- Keep: all math, ambient loop, avatar, crowd, tile shader (reprojected
  to the disc), store, content layer, UI (re-styled).
- **Largest change; highest fidelity to the reference.**

**If [SPHERE] (keep the globe, borrow the reference's polish):**
- Keep everything; **redesign camera framing** to present more world,
  cluster landmarks into a visible "plaza" arc near spawn, and apply all
  the tuning wins (sky, bloom, UI, staged islands).
- **Much smaller change; ~85% of the reference's *feeling* at a fraction
  of the cost; diverges from the literal diorama composition.**

**Creative Director's recommendation:** decide this **before** any more
world-building, because landmark layout, camera, and movement all hang
off it. If the concept art *is* the non-negotiable vision, choose
[TABLEAU]. If the walkable-globe delight is the beloved core and the
concept art is mood reference, choose [SPHERE] and spend the saved effort
on finishing and polishing the world. Either way, **do the cheap tuning
wins (sky, bloom, UI solidity, staged first island) next** — they pay off
under both models.
