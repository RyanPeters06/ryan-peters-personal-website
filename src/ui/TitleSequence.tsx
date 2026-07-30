import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'

/**
 * The title card — a screen-space overlay (it used to be 3D text inside
 * the scene, which the fixed low-headroom camera kept clipping).
 *
 * It should feel like a console channel opening: the world is already
 * there, alive and visible, held for a moment while the name settles
 * onto it. Two things carry that:
 *
 *   1. A soft radial sun-glow behind the wordmark, feathered to nothing
 *      so it reads as morning light through the frame, never as a card.
 *   2. A gentle white veil over the whole world, lifted on start. The
 *      plaza stays visible and animating underneath — villagers still
 *      wander — it is simply calmed so the type can sit on top of it.
 *
 * ---- TIMING (this is the part that was broken) ----------------------
 * It now CROSS-FADES with the loading screen instead of queueing behind
 * it. The old version started every element only after `booted` flipped
 * and then staggered them 0.4s / 1.0s / 1.6s apart on 1.0–1.4s
 * durations, so although the loader was gone by ~3.1s the prompt wasn't
 * readable until ~5.1s — about two seconds of bare world with a
 * barely-there title, which is exactly the "flickers when opening so you
 * can't see it for a few seconds" Peter reported.
 *
 * `booted` is set at the same instant the loader BEGINS its 0.6s fade,
 * so everything here starts at delay ~0 and completes inside ~0.75s:
 * the type is fully readable as the loader finishes clearing, with no
 * gap in between. Tight stagger (0.07s) keeps it one gesture rather than
 * three separate reveals.
 *
 * ---- IT STAYS PUT ---------------------------------------------------
 * Once in, nothing moves and nothing times out. The only exit is the
 * visitor starting the experience — a click anywhere, or any key. There
 * is deliberately no auto-advance.
 */
const EASE = [0.22, 1, 0.36, 1] as const

/** Layered halo: a tight rim for separation against any pixel, then two
 *  wide glows for warmth. Without the tight rim the letters smear into
 *  the bright plaza; without the wide ones it reads as a hard sticker. */
const TITLE_HALO = [
  '0 1px 0 rgba(255,255,255,0.95)',
  '0 0 16px rgba(255,255,255,0.95)',
  '0 0 54px rgba(255,255,255,0.85)',
  '0 6px 26px rgba(122,150,175,0.28)',
].join(', ')

const SUB_HALO = '0 1px 0 rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.9)'

const PILL_SHADOW = [
  '0 0 22px rgba(255,255,255,0.7)',
  '0 8px 22px rgba(150,170,195,0.24)',
  'inset 0 1.5px 3px rgba(255,255,255,0.95)',
  'inset 0 -1.5px 3px rgba(160,180,200,0.28)',
].join(', ')

/** One gesture, not three reveals: a short lead-in then a tight stagger. */
const GROUP: Variants = {
  hidden: {},
  shown: { transition: { delayChildren: 0.06, staggerChildren: 0.07 } },
}

const ITEM: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

/** The wordmark gets a whisper of overshoot — the "channel opening" beat. */
const WORDMARK: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  shown: {
    opacity: 1,
    y: 0,
    scale: [0.96, 1.022, 1],
    transition: { duration: 0.62, ease: EASE, times: [0, 0.6, 1] },
  },
}

export function TitleSequence() {
  const phase = useWorldStore((s) => s.phase)
  const setPhase = useWorldStore((s) => s.setPhase)
  // Set the instant the loading screen begins its fade, so the reveal
  // below overlaps that fade rather than waiting for it to finish.
  const booted = useWorldStore((s) => s.booted)

  const showing = phase === 'title'
  const start = () => setPhase('arriving')

  // "…or press a button." Any key starts, so the experience is reachable
  // without a pointer at all. Tab is left alone (it's how you'd navigate
  // in the first place) and bare modifier presses don't count as intent.
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
          // phone's safe areas, and "click anywhere to explore" has to
          // mean the whole screen — including the notch strip and the
          // band by the home indicator.
          className="pointer-events-auto fixed inset-0 z-20 cursor-pointer select-none"
          // Quick. The world starts moving the instant this is dismissed,
          // so a long dissolve here just sits on top of the arrival.
          exit={{ opacity: 0, y: -12, transition: { duration: 0.4, ease: 'easeIn' } }}
          onClick={start}
        >
          {/* The veil — calms the world without hiding it. Matches the
              loader's own 0.6s fade so the handoff is one wash. */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: booted ? 0.2 : 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          />

          {/* The sun behind the name. Sized in vw so it stays a wide,
              soft wash rather than a visible disc on any screen. */}
          <motion.div
            className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 'min(150vw, 1500px)',
              height: 'min(90vh, 780px)',
              background:
                'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.72) 32%, rgba(255,255,255,0.28) 55%, rgba(255,255,255,0) 74%)',
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: booted ? 1 : 0, scale: booted ? 1 : 0.94 }}
            transition={{ duration: 0.7, ease: EASE }}
          />

          <motion.div
            className="absolute inset-0 flex flex-col items-center gap-5 px-6 pt-[17vh] text-center"
            variants={GROUP}
            initial="hidden"
            animate={booted ? 'shown' : 'hidden'}
          >
            <motion.h1
              className="font-bold leading-none text-[#3f5a70]"
              style={{
                fontSize: 'clamp(3rem, 10vw, 8.5rem)',
                letterSpacing: '-0.015em',
                textShadow: TITLE_HALO,
              }}
              variants={WORDMARK}
            >
              Ryan Land
            </motion.h1>

            {/* Subtitle. Wide tracking at low contrast was most of why
                this used to be unreadable — tightened and darkened. */}
            <motion.p
              className="font-semibold text-[#54636e]"
              style={{
                fontSize: 'clamp(0.8rem, 1.9vw, 1.3rem)',
                letterSpacing: '0.14em',
                textShadow: SUB_HALO,
              }}
              variants={ITEM}
            >
              An Interactive Software Engineering Portfolio
            </motion.p>

            {/* The invitation — a real plaza pill, so it reads as an
                affordance rather than faint grey text over the crowd. */}
            <motion.div className="mt-2" variants={ITEM}>
              <motion.span
                className="inline-block rounded-full bg-[rgba(255,255,255,0.86)] px-6 py-2.5 font-bold text-[#54636e] backdrop-blur-sm"
                style={{
                  fontSize: 'clamp(0.72rem, 1.45vw, 1rem)',
                  letterSpacing: '0.18em',
                  boxShadow: PILL_SHADOW,
                }}
                // Breathing only — the card itself never drifts.
                animate={{ scale: [1, 1.045, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                Click Anywhere to Explore
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
