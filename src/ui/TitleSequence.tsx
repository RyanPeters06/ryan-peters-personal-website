import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'

/**
 * The title — now a SCREEN-SPACE overlay (it used to be 3D text inside the
 * scene, which the fixed low-headroom camera kept clipping/occluding).
 * It keeps the world's choreography: the name condenses in, the subtitle
 * and prompt follow in sequence, the prompt gently breathes, and on a
 * click it releases upward (blur + drift) as the world takes over.
 * A click anywhere enters (phase -> arriving).
 */
const EASE = [0.22, 1, 0.36, 1] as const
const GLOW = '0 3px 40px rgba(255, 255, 255, 0.8)'

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
          className="pointer-events-auto absolute inset-0 z-20 flex cursor-pointer select-none flex-col items-center justify-center gap-5 px-6 text-center"
          exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeIn' } }}
          onClick={() => setPhase('arriving')}
        >
          {/* The name — condenses out of the light, releases upward on exit */}
          <motion.h1
            className="font-bold leading-none text-[#5b7286]"
            style={{ fontSize: 'clamp(2.75rem, 9vw, 8rem)', textShadow: GLOW }}
            initial={{ opacity: 0, y: 26, scale: 0.965 }}
            animate={booted ? { opacity: 0.97, y: 0, scale: 1 } : {}}
            exit={{ opacity: 0, y: -36, filter: 'blur(10px)' }}
            transition={{ delay: 0.4, duration: 1.4, ease: EASE }}
          >
            Ryan Land
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="font-medium text-[#8fa1ad]"
            style={{
              fontSize: 'clamp(0.72rem, 1.75vw, 1.25rem)',
              letterSpacing: '0.32em',
              textShadow: '0 2px 24px rgba(255,255,255,0.7)',
            }}
            initial={{ opacity: 0, y: 18 }}
            animate={booted ? { opacity: 0.9, y: 0 } : {}}
            exit={{ opacity: 0, y: -22 }}
            transition={{ delay: 1.0, duration: 1.2, ease: EASE }}
          >
            An Interactive Software Engineering Portfolio
          </motion.p>

          {/* Call to action — reveals, then breathes */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            exit={{ opacity: 0, y: -14 }}
            transition={{ delay: 1.6, duration: 1.0, ease: EASE }}
          >
            <motion.p
              className="font-semibold text-[#a7b4be]"
              style={{ fontSize: 'clamp(0.66rem, 1.35vw, 1rem)', letterSpacing: '0.28em' }}
              animate={{ opacity: [0.55, 0.95, 0.55] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              Click Anywhere to Explore
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
