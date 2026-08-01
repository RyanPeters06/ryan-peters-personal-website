import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'
import { PALETTE } from '@/lib/constants'
import { MOTION } from '@/lib/designSystem'

/**
 * The title card — a die-cut sticker sitting over the living plaza.
 *
 * A ringed planet with sparkles, the wordmark in heavy white-outlined
 * type, leaf sprigs either side, a divider, the subtitle, and a solid
 * white pill inviting the first click. The world stays visible and
 * animating underneath, calmed by a veil (Peter's call — the reference
 * mockup shows an opaque gradient, but the plaza being alive behind the
 * title is the better first impression).
 *
 * ---- WHY THIS IS BUILT THE WAY IT IS ---------------------------------
 * The previous version flickered — it would appear, blank out, and come
 * back once the loading screen handed over. Two earlier attempts treated
 * that as a SCHEDULING problem (pad the loader's timer; re-time the
 * reveal to cross-fade). Both were wrong: the reveal timing was fine.
 * It was COMPOSITING.
 *
 *   1. The CTA pill carried `backdrop-blur` AND a perpetual `scale`
 *      animation on the same node. `backdrop-filter` forces the browser
 *      to snapshot everything behind the element — and behind it is a
 *      WebGL canvas repainting every frame under a 7-pass post chain.
 *      That promotes and demotes the layer over and over, which looks
 *      exactly like "paints, blanks, returns". There is now NO
 *      backdrop-filter anywhere in this component, and there must not
 *      be. (This is also what ART_BIBLE §13 asks for: near-solid chrome,
 *      "translucency and backdrop-blur are a light seasoning at most".)
 *   2. Five full-viewport layers used to animate at once on the handoff
 *      frame — the loader fading out, the veil fading in, and a
 *      150vw × 90vh radial gradient fading AND scaling. The gradient is
 *      gone (the planet replaces it) and the veil no longer animates
 *      itself. Exactly ONE full-screen element animates opacity now:
 *      the root.
 *   3. Everything below the root animates in CSS, not JS — see
 *      index.css. The compositor keeps those running even when the main
 *      thread is stalled on the scene's first frames.
 *
 * ---- IT STAYS PUT ----------------------------------------------------
 * Nothing times out. The only exit is the visitor starting: a click
 * anywhere, or any key.
 */
const INK = '#3a5570'

/** One gesture, not five reveals: a short lead-in, then a tight stagger.
 *  These are CSS `animation-delay` values, in seconds. */
const STAGGER = {
  planet: 0.04,
  wordmark: 0.11,
  divider: 0.2,
  subtitle: 0.26,
  pill: 0.34,
} as const

/** A four-point twinkle with concave sides. Drawn around the origin so
 *  it can be dropped anywhere and scaled by one number. */
const SPARKLE = 'M0-10Q1.7-1.7 10 0Q1.7 1.7 0 10Q-1.7 1.7-10 0Q-1.7-1.7 0-10Z'

function Sparkle({
  x,
  y,
  size,
  fill,
  delay,
}: {
  x: number
  y: number
  size: number
  fill: string
  delay: number
}) {
  // TWO nested groups, and they cannot be collapsed into one. A CSS
  // `transform` on an SVG element REPLACES the `transform` presentation
  // attribute rather than composing with it — so putting the twinkle
  // animation on the same node as the placement would wipe out the
  // translate and fling every sparkle to the origin at the wrong size.
  // (That is exactly what the first version did.) Outer node places,
  // inner node animates.
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <g className="t-twinkle" style={{ animationDelay: `${delay}s` }}>
        {/* Its own white cut, divided by the scale so every sparkle gets
            the same visual thickness whatever size it is drawn at. */}
        <path
          d={SPARKLE}
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth={7 / size}
          strokeLinejoin="round"
        />
        <path d={SPARKLE} fill={fill} />
      </g>
    </g>
  )
}

/** The planet: a glossy sphere inside a ring that passes behind it on
 *  one side and in front on the other, the whole silhouette wrapped in a
 *  thick white sticker outline.
 *
 *  The outline is an SVG filter (dilate the alpha, flood it white,
 *  composite the original back on top) rather than strokes on each
 *  shape — strokes would show through where the ring crosses the sphere
 *  and read as seams instead of one cut-out. It rasterises once and is
 *  never animated; the bob lives on a wrapper element.
 */
function Planet() {
  return (
    <svg
      viewBox="0 0 200 176"
      className="h-auto w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="tp-sphere" cx="34%" cy="27%" r="82%">
          <stop offset="0%" stopColor="#b3bdf3" />
          <stop offset="48%" stopColor="#8290e2" />
          <stop offset="100%" stopColor="#5563c2" />
        </radialGradient>
        <radialGradient id="tp-gloss" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="tp-sticker" x="-25%" y="-25%" width="150%" height="150%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d" />
          <feFlood floodColor="#ffffff" result="w" />
          <feComposite in="w" in2="d" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#tp-sticker)">
        {/* Ring, back half — drawn first so the sphere covers it. */}
        <path
          d="M23.7 104.2A78 26 -12 0 1 176.3 71.8"
          fill="none"
          stroke="#bcd6f4"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <circle cx="100" cy="88" r="46" fill="url(#tp-sphere)" />
        {/* Specular highlight, upper-left. */}
        <ellipse cx="82" cy="68" rx="19" ry="14" fill="url(#tp-gloss)" />
        {/* Ring, front half — its own white edge separates it from the
            sphere, the way the reference shows. */}
        <path
          d="M23.7 104.2A78 26 -12 0 0 176.3 71.8"
          fill="none"
          stroke="#ffffff"
          strokeWidth="19"
          strokeLinecap="round"
        />
        <path
          d="M23.7 104.2A78 26 -12 0 0 176.3 71.8"
          fill="none"
          stroke="#cfe2f8"
          strokeWidth="11"
          strokeLinecap="round"
        />
      </g>

      <Sparkle x={170} y={28} size={1.5} fill="#ffd45c" delay={0} />
      <Sparkle x={196} y={68} size={0.85} fill="#ffd45c" delay={0.9} />
      <Sparkle x={24} y={40} size={1.0} fill="#ffffff" delay={1.6} />
    </svg>
  )
}

/** A small two-blade sprig. `flip` mirrors it for the other side. */
function Leaf({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 34 26"
      className="h-[0.42em] w-[0.55em] shrink-0"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <path
        d="M2 22C10 22 20 18 24 8C14 6 4 12 2 22Z"
        fill={PALETTE.grass}
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 24C18 20 26 18 32 20C28 26 18 27 12 24Z"
        fill={PALETTE.grassDark}
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TitleSequence() {
  const phase = useWorldStore((s) => s.phase)
  const setPhase = useWorldStore((s) => s.setPhase)
  // Flips the instant the loader begins its own fade, so this reveal
  // overlaps that fade rather than queueing behind it.
  const booted = useWorldStore((s) => s.booted)

  const showing = phase === 'title'
  const start = () => setPhase('arriving')

  // "…or press a button." Any key starts, so the experience is reachable
  // without a pointer. Tab is left alone (it's how you'd navigate here in
  // the first place) and bare modifiers aren't intent.
  useEffect(() => {
    if (!showing || !booted) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.metaKey || e.ctrlKey || e.altKey) return
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return
      setPhase('arriving')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showing, booted, setPhase])

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          key="title"
          // `fixed`, not `absolute`: the overlay above is inset by the
          // phone's safe areas, and "click anywhere" has to mean the
          // whole screen — notch strip and home-indicator band included.
          className={`pointer-events-auto fixed inset-0 z-20 cursor-pointer select-none ${
            booted ? 'is-shown' : ''
          }`}
          style={{ willChange: 'opacity' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: booted ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: MOTION.ease }}
          onClick={start}
        >
          {/* The veil — calms the plaza so the type reads, without
              hiding it. Static: the root's own fade carries it, so this
              is one less full-screen layer animating on the handoff. */}
          <div className="absolute inset-0 bg-white/30" />

          <div className="absolute inset-0 flex flex-col items-center px-6 pt-[8vh] text-center">
            {/* Planet. Entrance on the outer element, perpetual bob on
                the inner one, so the two transforms never fight. It gets
                the `pop` (which includes scale) because it is small —
                see the wordmark below for why that matters. */}
            <div
              className="t-item t-item--pop"
              style={{ animationDelay: `${STAGGER.planet}s` }}
            >
              <div className="t-bob w-[clamp(118px,16vw,198px)]">
                <Planet />
              </div>
            </div>

            {/* Wordmark, with leaves flanking at its mid-height.
                Deliberately `t-item` (translate + opacity) and NOT the
                scaling `pop`: the compositor reuses one texture for a
                scale animation, so scaling this large, drop-shadowed
                text would resample it and go soft mid-entrance. The
                planet's pop carries that beat instead. */}
            <div
              className="t-item mt-[0.22em] flex items-center gap-[0.26em]"
              style={{
                animationDelay: `${STAGGER.wordmark}s`,
                fontSize: 'clamp(2.5rem, 8.6vw, 7rem)',
              }}
            >
              <Leaf />
              <h1
                className="t-sticker font-bold leading-none"
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontSize: '1em',
                  letterSpacing: '-0.015em',
                  color: INK,
                  filter: 'drop-shadow(0 5px 10px rgba(110,140,170,0.28))',
                }}
              >
                <span className="t-sticker__stroke" aria-hidden="true">
                  Ryan Land
                </span>
                <span className="t-sticker__fill">Ryan Land</span>
              </h1>
              <Leaf flip />
            </div>

            {/* Divider. Carries its own white ring so it survives the
                busy cobbles, same die-cut logic as everything else. */}
            <div
              className="t-item mt-6 h-[7px] w-[104px] rounded-full bg-[#7f9db8] shadow-[0_0_0_3.5px_rgba(255,255,255,0.92)]"
              style={{ animationDelay: `${STAGGER.divider}s` }}
            />

            {/* Subtitle. Gets a thin version of the sticker cut — a plain
                white text-shadow could NOT hold it against the pale
                cobbles; it washed out almost completely. The copy is far
                longer than the reference's short line, so the flanking
                dots sit on a row that wraps rather than crowding it. */}
            <div
              className="t-item mt-6 flex max-w-[min(92vw,46rem)] items-center justify-center gap-3.5"
              style={{ animationDelay: `${STAGGER.subtitle}s` }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#8fb0cb] shadow-[0_0_0_2.5px_rgba(255,255,255,0.92)]" />
              <p
                className="t-sticker t-sticker--thin font-bold"
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontSize: 'clamp(0.78rem, 1.75vw, 1.18rem)',
                  letterSpacing: '0.11em',
                  color: '#546e86',
                }}
              >
                <span className="t-sticker__stroke" aria-hidden="true">
                  An Interactive Software Engineering Portfolio
                </span>
                <span className="t-sticker__fill">
                  An Interactive Software Engineering Portfolio
                </span>
              </p>
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#8fb0cb] shadow-[0_0_0_2.5px_rgba(255,255,255,0.92)]" />
            </div>

            {/* The invitation. SOLID white — no backdrop blur, ever. */}
            <div
              className="t-item t-item--pop mt-9"
              style={{ animationDelay: `${STAGGER.pill}s` }}
            >
              <div className="t-pulse">
                <span
                  className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-3.5 font-bold"
                  style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: 'clamp(0.74rem, 1.5vw, 1.05rem)',
                    letterSpacing: '0.14em',
                    color: INK,
                    boxShadow:
                      '0 10px 26px rgba(120,150,180,0.28), inset 0 -2px 0 rgba(160,185,210,0.28)',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#bcd6ee]" />
                  Click Anywhere to Explore
                  <span className="h-1.5 w-1.5 rounded-full bg-[#bcd6ee]" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
