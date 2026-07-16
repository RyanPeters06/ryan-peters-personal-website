import { Vector3 } from 'three'
import { latLonToVec3 } from '@/lib/math/spherical'
import { AVATAR_LAT, AVATAR_LON, PLANET_RADIUS } from '@/lib/constants'

/**
 * The avatar's live pose — a mutable, allocation-free channel between
 * the movement system (writer) and the chase camera (reader). Kept
 * outside React and Zustand on purpose: it changes every frame and
 * must never trigger re-renders.
 */
export const avatarPose = {
  /** Feet position on the sphere surface (world space). */
  position: latLonToVec3(AVATAR_LAT, AVATAR_LON, PLANET_RADIUS),
  /** Unit tangent the avatar faces along. */
  forward: new Vector3(0, 0, 1),
  /** Outward surface normal at `position`. */
  up: new Vector3(0, 1, 0),
  /** Smoothed 0..1 "how much we are walking right now". */
  moving: 0,
}

// Initialize a coherent tangent frame at the spawn point, facing
// "south" (toward the equator, where the intro camera arrives from) —
// the avatar greets the visitor without a big turn first.
avatarPose.up.copy(avatarPose.position).normalize()
avatarPose.forward
  .set(0, -1, 0)
  .addScaledVector(avatarPose.up, avatarPose.up.y)
  .normalize()
