# REFERENCE ANALYSIS — Reverse-Engineering the Concept Art

A senior-art-director teardown of the Ryan's Planet concept art
(the plaza tableau with six landmark islands), and a ranked gap list
against the current implementation. **No implementation here — this is
the map that tells us what to change and in what order.**

---

## Part A — What the reference is actually doing

### Shape language
Everything is a **squircle** — the same rounded-square DNA repeated at
every scale: the six landmark bodies, the icons molded into them, the
UI pills and cards, the fountain basin, even the cobble tiles are
rounded-square pebbles. Radii are **large** (~25–30%). Organic elements
(trees, characters, clouds) are the round counterpoint: swollen
spheres and blobs, bottom-weighted, never pointy. The repetition of one
shape at many scales is the single biggest source of "cohesion."

### Industrial design
Each landmark reads as **one molded object**, not an assembly: body,
icon, and label feel injection-molded together in a single pour, with
the icon sitting *in* the surface. The islands are designed as
**products** — a monolith + a grassy base + soft steps + a couple of
trees, composed like a boxed collectible. Nothing looks downloaded;
everything looks tooled by one team. The steps, the platform lip, the
fountain ring all share the same edge-bevel vocabulary.

### Materials
**Premium soft-touch plastic** throughout: glossy-but-soft white bodies
with gentle broad speculars (studio-lit vinyl toy), matte-soft foliage,
a faint sheen on the colored icons. No texture, no grain, no metal or
glass. Surfaces are clean and slightly waxy. Grass is a flat soft
material, not bladed.

### Lighting
High-key, soft, and **almost shadowless** — a big soft top-key plus
heavy sky fill. Shadows are pale, short, and blue-gray, hugging each
object. The brightest whites **bloom very slightly**, giving the "gently
emits light" glow. There is no hard sun, no long shadow, no drama. It
is perpetual mid-morning.

### Composition
A **symmetrical hero shot.** The six landmarks sweep in a shallow
**arc** across the upper-middle band; the **player stands dead center,
back to camera**; the **fountain anchors the exact middle** between
player and landmarks. It's a classic theatrical "stage" — proscenium
arc of set pieces, protagonist center-stage, focal prop mid-stage. The
eye enters on the player, rises to the fountain, fans out along the arc.

### Color
Warm-white bodies carry **one pastel accent each** (lavender, blue,
green, gold, pink, teal), evenly spaced around the color wheel so the
arc reads like a soft rainbow — pastel, never saturated. The sky is a
**clear, genuine blue** (not white) fading to soft white at the horizon.
Greens for foliage, with **lavender and pink seasonal trees** injecting
variety. Every accent is desaturated and light.

### Camera
A **fixed, elevated 3/4 view**, ~35–40° downtilt, wide enough to hold
the entire plaza in one frame. Slightly telephoto (low distortion, forms
stay chunky and toy-like). The viewer is a **spectator of a diorama**,
not a pilot behind a character. This is the defining choice: the world
is *presented*, not *traversed*.

### Atmosphere
Sunny, warm, breezy spring morning. Fluffy discrete clouds in a blue
sky. Clean air (light haze only at the far edge where the disc drops
off). Optimistic and calm.

### Visual rhythm
Strong, even **A-B-A-B cadence**: monolith, tree, monolith, tree along
the arc; islands evenly spaced; steps repeat; lamps and benches punctuate
the gaps. The regular beat is what makes it feel *designed* rather than
scattered.

### Negative space
Deliberate and generous. The **top third is open sky.** Gaps between
islands are real breathing room. The player has an empty foreground apron
of plaza around them. Nothing is crowded; emptiness frames the subjects.

### Landmark placement
On a gentle **arc/ring** on a **flat floating disc** whose front edge
curves away and drops off (grass and trees spilling over the rim). Each
landmark is a **destination island** — platform + steps + planting —
spaced for a short stroll between. The fountain sits at the ring's
center as the hub.

### Hierarchy
Unmistakable: **player (center, sharp, foreground) > fountain (central
anchor) > landmark arc (evenly weighted set) > crowd (small, scattered
life) > dressing (trees/benches/lamps) > sky.** Accent color and slight
bloom pull the eye to the landmarks; scale and centering hold it on the
player.

---

## Part B — Ranked gap list (current build vs. reference)

Largest / most identity-defining first.

### 1. World model: walkable sphere vs. staged plaza tableau — **THE big one**
The reference is a **flat floating plaza disc surveyed from a fixed
elevated camera.** The build is a **full sphere you orbit and walk
around** with a close chase cam. This one choice cascades into camera,
composition, layout, and "feel." Everything below is smaller than this.
**Strategic decision for Peter** (see `CODEBASE_AUDIT.md` for cost).

### 2. Camera: fixed elevated hero shot vs. close third-person chase
Reference presents the whole plaza in one legible, symmetrical frame.
The build hugs the player at ~4.5u behind / 1.6u up, showing a small
patch of ground. The reference's "read the world at a glance" is absent.

### 3. World population: a built plaza vs. one landmark + empty space
Reference has **six finished landmark islands, a fountain, trees,
benches, lamps, flowers, steps.** The build has **one** landmark
(Projects) and **zero** dressing. The world is ~90% unbuilt against the
target. This is the biggest pure *volume* of work.

### 4. Landmark presentation: bare monolith vs. designed island
Reference landmarks sit on **grassy platforms with steps, trees, and a
label** — composed destinations. The build's monolith rises from a bare
tile swell with no planting, steps, or label. The "boxed collectible"
staging is missing.

### 5. Sky & lighting brightness: near-white vs. genuine sunny blue
Reference sky is clearly **blue**; the build's is nearly **white**
(`skyHorizon #FFF`, `skyTop #DFF4FF`), which drains the warmth and reads
overcast/clinical rather than sunny. Needs a bluer zenith and a touch
more saturation.

### 6. Bloom / glow: present vs. faked
The reference's signature "gently glowing" whites come from a **real
soft bloom pass**. The build fakes it with emissive + text-outline and
otherwise has none. Adding a subtle bloom is the single highest-leverage
"polish" upgrade. (Needs `@react-three/postprocessing` — Peter's call.)

### 7. UI materiality: near-solid clean white vs. heavy glass
Reference chrome is **solid warm-white, soft-shadowed, crisp.** The build
leans on `rgba(0.55)` frost + 24px backdrop-blur — muddier, and against
the "avoid strong glassmorphism" rule. Dial translucency down toward
solid.

### 8. UI chrome completeness: full HUD vs. partial
Reference has a **title pill (TL)**, **round tool buttons (TR: map,
people, settings)**, a **welcome card (BL)**, and a **controls pill
(BC)** — a complete, balanced HUD. The build has the title, mute, a
location card, and a controls hint, but no top-right tools and a less
resolved layout.

### 9. Ground tiles: organic rounded cobbles vs. regular quad-grid
Reference tiles are **irregular rounded pebbles** (hand-laid feel). The
build's are a **mathematically regular quad-sphere grid**. The build's
is actually *cleaner*; the reference is *cozier*. Minor, and partly a
[SPHERE]-vs-[TABLEAU] artifact — low priority.

### 10. Foliage variety: seasonal color vs. none
Reference scatters **green + lavender + pink** trees for warmth and
rhythm. The build has no trees at all yet. (Rolls into #3.)

### 11. Fountain / central anchor: present vs. absent
Reference's spinning-planet fountain is the plaza's heart and a lovely
self-reference. The build has no central anchor. (Meaningful for
[TABLEAU]; optional for [SPHERE].)

### 12. Accent saturation on symbols: crisp vs. slightly washed
Reference icons are pastel but **confidently readable at a distance.**
The build's molded `</>` is faint. Minor tuning once bloom lands.

---

### The through-line
Gaps **1–2** are one strategic decision. Gaps **3–4, 10–11** are one big
build-out of the world (mostly additive, and cheap once the landmark +
dressing kit exists). Gaps **5–8, 12** are **tuning passes** — hours, not
weeks, and they'd lift perceived polish the most for the least effort.
Recommended sequence: **decide the world model → do the cheap tuning
wins (sky, bloom, UI solidity) → build out the plaza kit.**
