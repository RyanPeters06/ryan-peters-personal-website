# Ryan Peters — A Tiny World

A Nintendo-plaza-style interactive world that happens to contain a
portfolio. **Not** a modern portfolio website.

## MANDATORY WORKFLOW — read this first

1. **Before making any decision, read every document in `/docs`:**
   - `docs/ART_BIBLE.md` — **THE source of truth for look/feel/motion.
     When any choice is uncertain, this file wins.** (Supersedes the old
     `ART_DIRECTION.md`.) The world model is **decided (2026-07-17):
     staged TABLEAU on the sphere — fixed art-directed camera, WASD
     walking leashed within the frame.** See the Bible's top section.
   - `docs/DESIGN.md` — what we're building and why
   - `docs/REFERENCE_ANALYSIS.md` — reverse-engineered concept art +
     ranked gap list vs. the current build
   - `docs/CODEBASE_AUDIT.md` — how well the code matches the Bible
     (keep / redesign / delete / debt)
   - `docs/ARCHITECTURE.md` — structure, systems, and the sign/axis
     conventions that have caused real shipped bugs
   - `docs/ROADMAP.md` — all milestones and their status
   - `docs/CODING_STANDARDS.md` — how code is written here
   - `docs/PROGRESS.md` — the development journal / current state
   - `docs/REFERENCES.md` — inspiration library
2. These documents are the project's memory. **Do not rely on chat
   history when they exist.**
3. When a milestone completes: update `ROADMAP.md` (status),
   `PROGRESS.md` (journal entry), and any doc affected by new decisions.
4. If a requested change conflicts with the docs, **ask before changing
   direction. Never silently change the project's direction.**
5. The design north star for every choice: *"Would this look natural in
   a peaceful Nintendo plaza from the Wii U era?"* If no, choose the
   softer, rounder, more playful alternative.

## Working agreement

- Peter is the creative director; act as lead engineer. For real design
  forks, present 2–3 options with tradeoffs and a recommendation.
- Milestone-driven: build → explain what/why → suggest improvements →
  wait for approval.
- Definition of done: `npx tsc -b` clean, `npm run build` clean,
  verified in a visible browser window (background tabs run the sim in
  slow motion — never judge timing there), docs updated, committed and
  pushed (logical commits, imperative subjects).

## Quick facts

- Dev: `npm run dev` (port is dynamic — read it from the output).
- Repo: https://github.com/RyanPeters06/ryan-peters-personal-website
- Content/copy lives ONLY in `src/content/`; every color and tunable
  lives in `src/lib/constants.ts`.
