import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Dev-only: exposes the WebGL renderer on `window` so draw calls,
 * triangle counts, and memory can be read from the console / an
 * automation harness (`window.__rlGL.info.render`). Renders nothing
 * and is compiled out of production builds entirely.
 */
export function PerfProbe() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__rlGL = gl
    }
  }, [gl])
  return null
}
