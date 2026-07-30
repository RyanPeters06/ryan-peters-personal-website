import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'

/**
 * A cute plaza-style loading card that holds over the first moments so the
 * visitor never sees the scene assemble: shaders compile, the HDRI wakes
 * up, and — the choppy bit — the panels render a beat before their Troika
 * text labels pop in. We stay up for a minimum beat, then fade out onto a
 * fully-formed world. The gradient matches the sky so the reveal is a
 * wash, not a cut.
 *
 * Peter saw the title "flicker... you can't see it for a few seconds" on
 * the real deploy (not on localhost, where everything is already warm).
 * The natural fix — gate release on `useProgress` (drei), which tracks
 * the real `THREE.LoadingManager` — was tried and MEASURED, not shipped:
 * it pushed the hold from 2.5s to **7.9s, even on localhost**. The
 * loading manager is tracking ~13 `blob:` requests that aren't the HDRI
 * or the cloud sprites (those are inlined data URIs, no network/blob
 * involved) — almost certainly `troika-three-text`'s internal SDF worker
 * setup for the six panel labels, which spins up via a blob-URL worker
 * and does one-time font-atlas generation. Gating on it made the FAST
 * path much slower without any evidence the flicker was actually about
 * that work finishing late, so it would very plausibly turn a real
 * user's slow connection into a 15–20s+ stall — a worse bug than the one
 * being chased. Reverted; MIN_MS bumped for a bigger blind safety margin
 * instead. The `troika-three-text` timing is flagged, not fixed — needs
 * profiling on a real device/connection, not guessed at further.
 */
const MIN_MS = 3200

export function LoadingScreen() {
  const [done, setDone] = useState(false)
  const setBooted = useWorldStore((s) => s.setBooted)

  useEffect(() => {
    const t = setTimeout(() => setDone(true), MIN_MS)
    return () => clearTimeout(t)
  }, [])

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
            <div className="h-2 w-44 overflow-hidden rounded-full bg-white/70 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-[#89bfe2]"
                initial={{ width: '6%' }}
                animate={{ width: '100%' }}
                transition={{ duration: MIN_MS / 1000, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
