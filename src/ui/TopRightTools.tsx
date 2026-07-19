import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'
import { PLAZA_EASE } from '@/ui/PlazaCard'

const TOOLS = [
  { icon: '🗺️', label: 'Map' },
  { icon: '👥', label: 'People' },
  { icon: '⚙️', label: 'Settings' },
]

/**
 * The round tool-button cluster from the reference, top-right. These
 * mirror the chrome but have no panels behind them yet (no map,
 * friends list, or settings screen exist) — presentational only, a
 * known gap until those features are built.
 */
export function TopRightTools() {
  const phase = useWorldStore((s) => s.phase)

  return (
    <div className="pointer-events-none absolute right-6 top-6 flex gap-2.5">
      <AnimatePresence>
        {phase !== 'title' &&
          TOOLS.map((tool, i) => (
            <motion.button
              key={tool.label}
              type="button"
              aria-label={tool.label}
              title={`${tool.label} (coming soon)`}
              initial={{ scale: 0.92, opacity: 0, y: -8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [...PLAZA_EASE], delay: 0.85 + i * 0.05 }}
              whileTap={{ scale: 0.94 }}
              className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(255,255,255,0.72)] text-base backdrop-blur-[20px]"
              style={{
                boxShadow: [
                  '0 0 16px rgba(255,255,255,0.6)',
                  '0 6px 16px rgba(150,170,195,0.22)',
                  'inset 0 1.5px 3px rgba(255,255,255,0.95)',
                  'inset 0 -1px 2px rgba(160,180,200,0.25)',
                ].join(', '),
              }}
            >
              {tool.icon}
            </motion.button>
          ))}
      </AnimatePresence>
    </div>
  )
}
