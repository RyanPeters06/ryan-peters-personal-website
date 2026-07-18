import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'
import { PLAZA_EASE } from '@/ui/PlazaCard'

/**
 * The compact header from the reference: a small pillow pill, top-left,
 * naming the place while you play. Appears once the title sequence has
 * given way; never competes with the world.
 */
export function HeaderBadge() {
  const phase = useWorldStore((s) => s.phase)

  return (
    <div className="pointer-events-none absolute left-6 top-6">
      <AnimatePresence>
        {phase !== 'title' && (
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [...PLAZA_EASE], delay: 0.8 }}
            className="flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.72)] py-2 pl-3 pr-4 backdrop-blur-[20px]"
            style={{
              boxShadow: [
                '0 0 18px rgba(255,255,255,0.6)',
                '0 6px 18px rgba(150,170,195,0.22)',
                'inset 0 1.5px 3px rgba(255,255,255,0.95)',
                'inset 0 -1px 2px rgba(160,180,200,0.25)',
              ].join(', '),
            }}
          >
            <span className="text-base leading-none">🏝️</span>
            <span className="text-sm font-bold text-[#54636e]">
              Ryan Land
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
