import { PALETTE } from '@/lib/constants'

/**
 * The white sky: a soft near-white background plus gentle fog so the
 * planet's far edge melts into the sky — the world floats in light,
 * not in a void.
 */
export function Sky() {
  return (
    <>
      <color attach="background" args={[PALETTE.sky]} />
      <fog attach="fog" args={[PALETTE.sky, 18, 42]} />
    </>
  )
}
