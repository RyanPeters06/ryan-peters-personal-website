import { useRef } from 'react'
import { expDamp } from '@/lib/math/damp'

export interface SmoothValue {
  /** The current smoothed value. */
  readonly value: number
  /** Advance toward `target` by `dt` seconds; returns the new value. */
  update(target: number, dt: number): number
  /** Jump immediately (e.g. on teleport-free initialization). */
  snap(v: number): void
}

/**
 * A frame-rate-independent eased value for use inside useFrame loops.
 * `lambda` controls responsiveness: ~1 is dreamy, ~5 is gentle, ~12 is
 * responsive. Nothing in this world should ever snap — so everything
 * numeric that moves goes through one of these.
 */
export function useSmoothValue(initial: number, lambda = 5): SmoothValue {
  const ref = useRef<SmoothValue | null>(null)
  if (ref.current === null) {
    let current = initial
    ref.current = {
      get value() {
        return current
      },
      update(target: number, dt: number) {
        current = expDamp(current, target, lambda, dt)
        return current
      },
      snap(v: number) {
        current = v
      },
    }
  }
  return ref.current
}
