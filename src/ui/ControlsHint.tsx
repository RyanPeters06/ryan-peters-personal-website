import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'
import { MOTION } from '@/lib/designSystem'

/** One small rounded keycap, game-console style. */
function Key({ label }: { label: string }) {
  return (
    <span className="grid h-6 min-w-6 place-items-center rounded-md border-b-2 border-[#c9d3da] bg-white px-1 text-xs font-bold text-[#5b6a72] shadow-sm">
      {label}
    </span>
  )
}

/**
 * The "you can walk!" hint — a single compact horizontal PILL (was a tall
 * stacked card): `W A S D  Move  ·  🖱 Look around`. Pops in once the
 * avatar finishes its hello, floats gently, and slips away on the first
 * step.
 */
export function ControlsHint() {
  const phase = useWorldStore((s) => s.phase)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: [0, -4, 0] }}
            exit={{ opacity: 0, y: 12 }}
            transition={{
              opacity: { duration: MOTION.uiEnterMs / 1000, ease: MOTION.ease },
              y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="flex items-center gap-2.5 rounded-full bg-[rgba(255,255,255,0.82)] px-4 py-2 text-[#5b6a72] shadow-md backdrop-blur-sm"
          >
            <span className="flex items-center gap-1">
              <Key label="W" />
              <Key label="A" />
              <Key label="S" />
              <Key label="D" />
            </span>
            <span className="text-xs font-semibold text-[#7a8890]">Move</span>
            <span className="text-[#cdd6dd]">·</span>
            <span className="text-sm">🖱️</span>
            <span className="text-xs font-semibold text-[#7a8890]">Look around</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
