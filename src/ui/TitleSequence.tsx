import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'
import { PLAZA_EASE } from '@/ui/PlazaCard'

/**
 * The opening: the camera drifts high above the already-living planet
 * — villagers wander, clouds breathe — and after it settles, the name
 * of the place reveals itself out of the bright atmosphere. No card,
 * no box: just soft rounded type belonging to the sky, with a gentle
 * white radiance instead of a shadow.
 *
 * On click the title doesn't vanish — it dissolves upward into the
 * light (blur + fade + rise) while the camera is already beginning
 * its descent toward the character. It should be remembered as part
 * of the place, not as interface.
 */
export function TitleSequence() {
  const phase = useWorldStore((s) => s.phase)
  const setPhase = useWorldStore((s) => s.setPhase)

  return (
    <AnimatePresence>
      {phase === 'title' && (
        <motion.div
          className="pointer-events-auto absolute inset-0 z-20 cursor-pointer select-none"
          onClick={() => setPhase('arriving')}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [...PLAZA_EASE] }}
        >
          <div className="absolute inset-x-0 top-[9vh] flex flex-col items-center gap-3 px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 0.96, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -34, scale: 1.04, filter: 'blur(16px)' }}
              transition={{ duration: 1.6, ease: [...PLAZA_EASE], delay: 0.9 }}
              className="text-[clamp(3rem,7vw,5.5rem)] font-extrabold tracking-tight text-[#6d8494]"
              style={{
                textShadow: [
                  '0 0 22px rgba(255,255,255,0.95)', // delicate bloom
                  '0 0 60px rgba(223,244,255,0.8)', // atmospheric radiance
                  '0 3px 14px rgba(150,170,195,0.28)', // very soft depth
                ].join(', '),
              }}
            >
              Ryan&rsquo;s Planet
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(10px)' }}
              transition={{ duration: 1.3, ease: [...PLAZA_EASE], delay: 1.8 }}
              className="text-sm font-semibold tracking-[0.18em] text-[#93a5b1] md:text-base"
              style={{ textShadow: '0 0 16px rgba(255,255,255,0.9)' }}
            >
              An Interactive Software Engineering Portfolio
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: 2.8 }}
              className="mt-6 text-xs font-semibold tracking-[0.22em] text-[#a8b6c0]"
            >
              {/* a calm, patient invitation */}
              <motion.span
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ textShadow: '0 0 14px rgba(255,255,255,0.9)' }}
              >
                Click Anywhere to Explore
              </motion.span>
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
