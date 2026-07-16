import { CAMERA_ORBIT_RADIUS, PALETTE } from '@/lib/constants'

/**
 * The white sky: a soft near-white background plus gentle fog so the
 * world melts into the sky — never a hard edge against the void.
 * Initial values match the far intro shot; CinematicCamera retunes
 * near/far smoothly as the shot changes.
 */
export function Sky() {
  return (
    <>
      <color attach="background" args={[PALETTE.sky]} />
      <fog
        attach="fog"
        args={[PALETTE.sky, CAMERA_ORBIT_RADIUS * 0.78, CAMERA_ORBIT_RADIUS * 1.28]}
      />
    </>
  )
}
