# CODING STANDARDS

The goal: someone (human or Claude) opening this repo months from now
writes code indistinguishable from what's already here.

## File Organization

- One component per file, named the same (`Avatar.tsx` exports `Avatar`).
- Place by role: nouns in `scene/`/`world/`, behaviors in `systems/`,
  overlay in `ui/`, data in `content/`, math in `lib/`. See
  ARCHITECTURE.md.
- Barrel files: no. Import concretely via the `@/` alias.

## Component Size & Shape

- Target < ~250 lines. The Avatar is the sanctioned exception (model +
  controller + animation belong together).
- Order inside a component: constants → refs → memoized materials →
  anim-state ref → `useFrame` → JSX.
- Extract a hook when logic is reused twice, not before.

## Naming

- Components/files: `PascalCase`. Hooks: `useCamelCase`.
- Constants: `SCREAMING_SNAKE` in `lib/constants.ts`.
- Scratch objects: `_underscorePrefix` (`_camFlat`, `_axis`).
- Booleans read as predicates (`chasing`, `near`, `inputActive`).

## Hooks & State Rules

- Zustand for shared low-frequency state; frame loops use
  `useWorldStore.getState()` — **never** the reactive hook form inside
  `useFrame`.
- Per-frame cross-component data goes through imperative channel modules
  (like `avatarPose`), never through React state.
- Private animation state lives in a single `useRef<AnimState>` object,
  typed with an interface.

## Comments

- Comment the **why**, and especially **sign/axis conventions** — every
  cross product gets a note (see ARCHITECTURE.md for the three
  convention bugs that shipped).
- Every component gets a short doc block saying what it is *in the
  world*, not what React does.
- No commented-out code in commits. `TEMP-DEBUG:` markers must be
  removed before committing.

## TypeScript

- Strict mode; no `any`, no non-null `!` except `getElementById('root')`.
- Interfaces for data shapes (`WorldLocation`, `AvatarAnim`);
  `as const` for palette/config literals.
- Content files export typed data only — no logic in `content/`.

## Performance Rules (non-negotiable)

- **Zero allocations inside `useFrame`.** Module-level scratch vectors,
  reused. If you `new` anything per frame, refactor.
- Clamp `dt` (`Math.min(rawDt, 0.1)`) in every frame callback.
- All easing frame-rate independent: `expDamp`/`1 - Math.exp(-λ·dt)` —
  never `value += x * 0.1` per frame.
- Share materials/geometries via `useMemo`; instance repeated meshes.
- Deterministic seeded randomness for world layout (`makeRng`), so the
  world is identical every visit; `Math.random()` only for live timers.

## Animation Conventions

- λ cheat sheet: ~1 dreamy · ~2.5 cinematic camera · 4–6 gentle body ·
  8–12 responsive control.
- Ambient motion reads `getAmbientTime()` (respects reduced-motion);
  gameplay timers accumulate real clamped `dt`.
- Overlay springs: framer `type:'spring'` for playful cards, or the
  Wii U curve `cubic-bezier(0.22,1,0.36,1)` at 320ms (see
  ART_DIRECTION UI spec).

## Color & Constants

- Every color comes from `PALETTE` in `lib/constants.ts`. Overlay UI may
  restate hexes in Tailwind classes only when Tailwind needs a literal;
  when you change one, grep for it.
- Any number you tuned by eye is a named constant with a comment saying
  what it looks like when wrong.

## Git

- Logical commits per feature/fix with the established message style
  (imperative subject, body explaining why, `Co-Authored-By: Claude`).
- Push to `main` on github.com/RyanPeters06/ryan-peters-personal-website
  after each approved milestone chunk.

## Definition of Done

`npx tsc -b` clean · `npm run build` clean · verified in a real browser
(remember: background tabs run the sim in slow motion — judge timing only
on a visible window) · docs updated (ROADMAP status, PROGRESS entry) ·
committed and pushed.
