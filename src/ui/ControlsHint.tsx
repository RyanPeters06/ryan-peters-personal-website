import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'

/** One rounded keycap, game-console style. */
function Key({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <span
      className={`grid h-9 ${wide ? 'w-12' : 'w-9'} place-items-center rounded-xl border-b-4 border-[#c6cfd4] bg-[#eef2f4] text-sm font-bold text-[#5b6a72] shadow-sm`}
    >
      {label}
    </span>
  )
}

/**
 * The "you can walk!" hint: pops up with a springy bounce once the
 * avatar finishes its hello, floats gently while waiting, and hops
 * away the moment the visitor takes their first step.
 */
export function ControlsHint() {
  const phase = useWorldStore((s) => s.phase)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center">
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            initial={{ y: 48, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 19, delay: 0.5 }}
          >
            {/* Idle float, riding on top of the spring entrance */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-3 rounded-3xl bg-white/95 px-8 py-5 shadow-[0_8px_28px_rgba(120,140,130,0.28)]"
            >
              <span className="text-sm font-semibold tracking-wide text-[#7a8890]">
                Take a walk!
              </span>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Key label="W" />
                  <div className="flex gap-1">
                    <Key label="A" />
                    <Key label="S" />
                    <Key label="D" />
                  </div>
                </div>
                <span className="text-xs font-medium text-[#a3aeb5]">or</span>
                <div className="flex flex-col items-center gap-1">
                  <Key label="↑" />
                  <div className="flex gap-1">
                    <Key label="←" />
                    <Key label="↓" />
                    <Key label="→" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
