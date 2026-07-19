import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'
import { PlazaCard } from '@/ui/PlazaCard'

/** One rounded keycap, game-console style. */
function Key({ label }: { label: string }) {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl border-b-4 border-[#c9d3da] bg-[rgba(255,255,255,0.85)] text-sm font-bold text-[#5b6a72] shadow-sm">
      {label}
    </span>
  )
}

/**
 * The "you can walk!" hint: pops up in the plaza-card shell once the
 * avatar finishes its hello, floats gently while waiting, and slips
 * away on the visitor's first step.
 */
export function ControlsHint() {
  const phase = useWorldStore((s) => s.phase)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
      <AnimatePresence>
        {phase === 'idle' && (
          <PlazaCard>
            {/* Idle float, riding on top of the plaza entrance */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-3"
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
          </PlazaCard>
        )}
      </AnimatePresence>
    </div>
  )
}
