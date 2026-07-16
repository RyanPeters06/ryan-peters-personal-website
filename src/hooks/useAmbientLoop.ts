import { useFrame } from '@react-three/fiber'

/**
 * The world's shared heartbeat.
 *
 * One clock drives every ambient motion (clouds drifting, future grass
 * sway, tree wobble, lamp flicker) so the whole world breathes together
 * — and so reduced-motion can calm *everything* by scaling one number.
 */
const ambient = {
  time: 0,
  scale: 1,
}

/** Scale all ambient world motion (1 = full, ~0.25 = reduced motion). */
export function setAmbientScale(scale: number): void {
  ambient.scale = scale
}

/**
 * Mount exactly once inside the Canvas (see <AmbientLoopDriver/> in
 * Experience) — advances the shared clock every frame.
 */
export function useAmbientDriver(): void {
  useFrame((_, delta) => {
    // Clamp delta so a background tab doesn't cause a time jump on return.
    ambient.time += Math.min(delta, 0.1) * ambient.scale
  })
}

/** Current ambient time in (scaled) seconds. Read inside useFrame. */
export function getAmbientTime(): number {
  return ambient.time
}

/** Current ambient motion scale. */
export function getAmbientScale(): number {
  return ambient.scale
}
