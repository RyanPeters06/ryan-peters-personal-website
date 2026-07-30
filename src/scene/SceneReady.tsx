import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useWorldStore } from '@/store/useWorldStore'

/** Real frames to let pass before calling the world "assembled". Two is
 *  enough to get past the first presented frame (the expensive one) while
 *  staying imperceptible. */
const SETTLE_FRAMES = 2

/**
 * Reports that the 3D scene has genuinely finished assembling.
 *
 * Mounted as the LAST child inside `Experience`'s `<Suspense>`, directly
 * after `<Preload all />`. That position is the whole point:
 *
 *   - being inside `<Suspense>` means it cannot mount until every
 *     suspending resource in the scene has resolved (the HDRI, fonts —
 *     anything `useLoader`-shaped),
 *   - being AFTER `<Preload all />` means drei's `gl.compile()` effect
 *     has already run by the time this one does, since sibling effects
 *     fire in tree order,
 *   - and the frame counter then lets a real frame or two actually
 *     present before we call it done.
 *
 * The loading screen waits on this instead of a fixed timer, so a warm
 * cache releases in a few hundred milliseconds rather than sitting on an
 * arbitrary delay (Peter, 2026-07-30: "you are purposefully delaying the
 * loading even if it doesn't need to").
 */
export function SceneReady() {
  const setSceneReady = useWorldStore((s) => s.setSceneReady)
  const frames = useRef(0)
  const done = useRef(false)

  // If the frame loop somehow never ticks (a lost context, a tab that
  // was backgrounded through the whole boot), don't strand the loader —
  // report ready on the next macrotask instead.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!done.current) {
        done.current = true
        setSceneReady()
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [setSceneReady])

  useFrame(() => {
    if (done.current) return
    frames.current += 1
    if (frames.current >= SETTLE_FRAMES) {
      done.current = true
      setSceneReady()
    }
  })

  return null
}
