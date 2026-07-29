import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'

/**
 * The title — a screen-space overlay (it used to be 3D text inside the
 * scene, which the fixed low-headroom camera kept clipping).
 *
 * It should feel like a console channel opening: the world is already
 * there, alive and visible, but held for a moment while the name
 * condenses out of the light. Two things make that work, and both were
 * missing — the type had NOTHING behind it and simply dissolved into a
 * bright, busy plaza (Peter: "hard to see... i cannot read the words
 * below"):
 *
 *   1. A soft radial sun-glow behind the wordmark, feathered to nothing
 *      so it reads as morning light through the frame, never as a card.
 *   2. A gentle white veil over the whole world, lifted on click. The
 *      plaza stays visible and animating underneath — villagers still
 *      wander — it is simply calmed so the type can sit on top of it.
 *
 * The block also sits HIGH, in the sky band, rather than dead centre
 * across the panel arc and the crowd.
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

export function TitleSequence() {
  const phase = useWorldStore((s) => s.phase)
  const setPhase = useWorldStore((s) => s.setPhase)
  // Hold the reveal until the loading screen has washed away, so the name
  // condenses onto a finished world rather than animating behind the loader.
  const booted = useWorldStore((s) => s.booted)

  return (
    <AnimatePresence>
      {phase === 'title' && (
        <motion.div
          key="title"
          // `fixed`, not `absolute`: the overlay above is inset by the
          // phone's safe areas, and "click anywhere to explore" has to
          // mean the whole screen — including the notch strip and the
          // band by the home indicator.
          className="pointer-events-auto fixed inset-0 z-20 cursor-pointer select-none"
          exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeIn' } }}
          onClick={() => setPhase('arriving')}
        >
          {/* The veil — calms the world without hiding it. */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={booted ? { opacity: 0.2 } : { opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
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
            initial={{ opacity: 0, scale: 0.88 }}
            animate={booted ? { opacity: 1, scale: 1 } : { opacity: 0 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 1.6, ease: EASE }}
          />

          <div className="absolute inset-0 flex flex-col items-center gap-5 px-6 pt-[17vh] text-center">
            {/* The name — condenses out of the light with a small
                overshoot, the beat that reads as a channel opening. */}
            <motion.h1
              className="font-bold leading-none text-[#3f5a70]"
              style={{
                fontSize: 'clamp(3rem, 10vw, 8.5rem)',
                letterSpacing: '-0.015em',
                textShadow: TITLE_HALO,
              }}
              initial={{ opacity: 0, y: 26, scale: 0.94 }}
              animate={booted ? { opacity: 1, y: 0, scale: [0.94, 1.035, 1] } : {}}
              exit={{ opacity: 0, y: -36, filter: 'blur(10px)' }}
              transition={{ delay: 0.4, duration: 1.4, ease: EASE, times: [0, 0.62, 1] }}
            >
              Ryan Land
            </motion.h1>

            {/* Subtitle. The old 0.32em tracking at 55% contrast was most
                of why this was unreadable — tightened and darkened. */}
            <motion.p
              className="font-semibold text-[#54636e]"
              style={{
                fontSize: 'clamp(0.8rem, 1.9vw, 1.3rem)',
                letterSpacing: '0.14em',
                textShadow: SUB_HALO,
              }}
              initial={{ opacity: 0, y: 18 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0, y: -22 }}
              transition={{ delay: 1.0, duration: 1.2, ease: EASE }}
            >
              An Interactive Software Engineering Portfolio
            </motion.p>

            {/* Call to action — a real plaza pill, so it reads as an
                affordance instead of faint grey text over the crowd. */}
            <motion.div
              className="mt-2"
              initial={{ opacity: 0, y: 14 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0, y: -14 }}
              transition={{ delay: 1.6, duration: 1.0, ease: EASE }}
            >
              <motion.span
                className="inline-block rounded-full bg-[rgba(255,255,255,0.86)] px-6 py-2.5 font-bold text-[#54636e] backdrop-blur-sm"
                style={{
                  fontSize: 'clamp(0.72rem, 1.45vw, 1rem)',
                  letterSpacing: '0.18em',
                  boxShadow: PILL_SHADOW,
                }}
                animate={{ scale: [1, 1.045, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                Click Anywhere to Explore
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
