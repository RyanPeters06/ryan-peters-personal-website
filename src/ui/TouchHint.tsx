import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'
import { useCoarsePointer } from '@/hooks/useCoarsePointer'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { MOTION } from '@/lib/designSystem'
import { PlazaCard } from '@/ui/PlazaCard'

/**
 * The mobile counterpart to `ControlsHint` — and the reason the touch
 * stick can afford to be invisible.
 *
 * It sits dead centre during the idle beat, shows the gesture rather
 * than describing it (a little knob easing out of a ring and back), and
 * slips away the instant the visitor takes their first step. On a phone
 * this is the only thing telling you the world is walkable, so it is
 * deliberately the one piece of chrome allowed to sit over the plaza.
 */
export function TouchHint() {
  const coarse = useCoarsePointer()
  const phase = useWorldStore((s) => s.phase)
  const reduced = usePrefersReducedMotion()

  const show = coarse && phase === 'idle'

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: MOTION.uiEnterMs / 1000, ease: MOTION.ease }}
          >
            <PlazaCard>
              <div className="flex flex-col items-center gap-3">
                {/* The gesture, demonstrated: a knob easing out and home. */}
                <div
                  className="relative grid h-16 w-16 place-items-center rounded-full"
                  style={{
                    background: 'rgba(233,242,249,0.9)',
                    boxShadow:
                      'inset 0 1.5px 3px rgba(255,255,255,0.95), inset 0 -1.5px 3px rgba(160,180,200,0.28)',
                  }}
                >
                  <motion.span
                    className="h-7 w-7 rounded-full"
                    style={{
                      background:
                        'linear-gradient(to bottom, rgba(255,255,255,1), rgba(243,248,252,0.94))',
                      boxShadow:
                        '0 3px 8px rgba(150,170,195,0.3), inset 0 1px 0 rgba(255,255,255,1)',
                    }}
                    animate={reduced ? { x: 0, y: 0 } : { x: [0, 13, 0, -11, 0], y: [0, -9, 0, 7, 0] }}
                    transition={
                      reduced
                        ? undefined
                        : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                    }
                  />
                </div>
                <p className="text-sm font-bold text-[#54636e]">Drag anywhere to walk</p>
              </div>
            </PlazaCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
