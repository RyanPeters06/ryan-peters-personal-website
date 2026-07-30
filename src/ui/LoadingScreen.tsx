import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'

/**
 * A cute plaza-style loading card that covers the first moments so the
 * visitor never sees the scene assemble: shaders compile, the HDRI wakes
 * up, and — the choppy bit — the panels render a beat before their Troika
 * text labels pop in. The gradient matches the sky so the reveal is a
 * wash, not a cut.
 *
 * IT WAITS FOR THE WORLD, NOT FOR A CLOCK. This used to hold a flat 2.5s
 * `setTimeout` no matter what, which meant a warm cache still sat behind
 * the loader doing nothing (Peter, 2026-07-30: "you are purposefully
 * delaying the loading even if it doesn't need to" — he was right, and a
 * previous pass had made it worse by bumping the timer to 3.2s to paper
 * over a flicker). It now releases on `sceneReady`, which
 * `scene/SceneReady.tsx` sets once Suspense has resolved, `<Preload all />`
 * has compiled the shaders, and a real frame or two has presented.
 *
 * MIN_MS is NOT padding — it only stops the card from flashing past in a
 * couple of frames on an instant load, which reads as a glitch rather
 * than as a loading screen. It is deliberately short enough not to be
 * the thing you are waiting on.
 *
 * MAX_MS is a safety net: if readiness never arrives (a WebGL context
 * that fails, a device that can't compile something), the visitor gets
 * the world rather than an infinite loader.
 *
 * An earlier attempt gated on `useProgress` (drei's `THREE.LoadingManager`
 * hook) instead. Measured before shipping and rejected: it pushed the
 * hold to ~8s even on localhost, because the manager also tracks
 * `troika-three-text`'s blob-worker font-atlas setup for the six panel
 * labels — work that has nothing to do with the world being visible.
 */
const MIN_MS = 450
const MAX_MS = 12000

export function LoadingScreen() {
  const [done, setDone] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)
  const setBooted = useWorldStore((s) => s.setBooted)
  const sceneReady = useWorldStore((s) => s.sceneReady)

  useEffect(() => {
    const floor = setTimeout(() => setMinElapsed(true), MIN_MS)
    const ceiling = setTimeout(() => setDone(true), MAX_MS)
    return () => {
      clearTimeout(floor)
      clearTimeout(ceiling)
    }
  }, [])

  // Whichever of the two lands last is the one that opens the world.
  useEffect(() => {
    if (minElapsed && sceneReady) setDone(true)
  }, [minElapsed, sceneReady])

  // Tell the title it may reveal now (onto a fully-formed world).
  useEffect(() => {
    if (done) setBooted()
  }, [done, setBooted])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="pointer-events-auto fixed inset-0 z-[60] flex select-none flex-col items-center justify-center gap-8"
          style={{
            background: 'radial-gradient(130% 120% at 50% 32%, #c7e8fa 0%, #ddf1fc 58%, #ebf6fd 100%)',
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
        >
          {/* Bobbing planet mascot over a soft breathing shadow */}
          <div className="flex flex-col items-center">
            <motion.div
              className="text-[5.5rem] leading-none [filter:drop-shadow(0_12px_16px_rgba(120,150,180,0.3))]"
              animate={{ y: [0, -16, 0], rotate: [-7, 7, -7] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            >
              🪐
            </motion.div>
            <motion.div
              className="mt-1 h-2.5 w-14 rounded-[50%] bg-[#8ba7bd]/40 blur-[2px]"
              animate={{ scaleX: [1, 0.78, 1], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="flex flex-col items-center gap-3.5">
            <span className="text-xl font-bold tracking-wide text-[#5b7286]">Ryan Land</span>
            {/* Rounded pastel progress pill (time-based — reads smooth
                regardless of how fast the bundled assets resolve). */}
            {/* Indeterminate: a bead sliding through the track, not a
                percentage. The old bar filled over exactly MIN_MS, which
                only ever meant "the timer is running" — now that the
                release waits on the real scene, a fake fill would either
                finish long before the world does or snap away half-drawn.
                A cycling bead is honest about not knowing how long. */}
            <div className="h-2 w-44 overflow-hidden rounded-full bg-white/70 shadow-inner">
              <motion.div
                className="h-full w-1/3 rounded-full bg-[#89bfe2]"
                animate={{ x: ['-110%', '330%'] }}
                transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
