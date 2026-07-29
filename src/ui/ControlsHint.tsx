import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'
import { useIsTouch } from '@/hooks/useInputMode'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { MOTION } from '@/lib/designSystem'
import { PlazaCard } from '@/ui/PlazaCard'

/** One small rounded keycap, game-console style. */
function Key({ label }: { label: string }) {
  return (
    <span className="grid h-8 min-w-8 place-items-center rounded-lg border-b-2 border-[#c9d3da] bg-white px-1 text-sm font-bold text-[#5b6a72] shadow-sm">
      {label}
    </span>
  )
}

/** WASD laid out as the cross your hand actually makes. */
function KeysDemo() {
  return (
    <div className="flex flex-col items-center gap-1">
      <Key label="W" />
      <div className="flex gap-1">
        <Key label="A" />
        <Key label="S" />
        <Key label="D" />
      </div>
    </div>
  )
}

/** The gesture, demonstrated: a knob easing out of its ring and home. */
function StickDemo({ still }: { still: boolean }) {
  return (
    <div
      className="grid h-16 w-16 place-items-center rounded-full"
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
        animate={still ? { x: 0, y: 0 } : { x: [0, 13, 0, -11, 0], y: [0, -9, 0, 7, 0] }}
        transition={
          still ? undefined : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
        }
      />
    </div>
  )
}

/**
 * The "you can walk!" card — one card, centred, whichever way you're
 * driving. It SHOWS the control rather than describing it: the WASD
 * cross for a cursor, a knob easing out of its ring for a thumb.
 *
 * Dead centre on purpose (Peter, 2026-07-28): it used to be a pill
 * tucked along the bottom edge, where it read as chrome and got missed.
 * It is up only during the idle beat and slips away on the first step,
 * so the plaza is covered for a few seconds at most.
 */
export function ControlsHint() {
  const phase = useWorldStore((s) => s.phase)
  const touch = useIsTouch()
  const reduced = usePrefersReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: MOTION.uiEnterMs / 1000, ease: MOTION.ease }}
          >
            <PlazaCard>
              <div className="flex flex-col items-center gap-3">
                {touch ? <StickDemo still={reduced} /> : <KeysDemo />}
                <p className="text-sm font-bold text-[#54636e]">
                  {touch ? 'Drag anywhere to walk' : 'Use WASD to walk'}
                </p>
                {!touch && (
                  <p className="-mt-1 text-xs font-semibold text-[#8a97a0]">
                    🖱️ Move your mouse to look around
                  </p>
                )}
              </div>
            </PlazaCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
