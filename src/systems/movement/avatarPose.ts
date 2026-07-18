import { Vector3 } from 'three'
import { AVATAR_SPAWN_Z } from '@/lib/constants'

/**
 * The avatar's live pose — a mutable, allocation-free channel between
 * the movement system (writer) and the rest of the world (readers:
 * the personal-sun light, landmark proximity). Kept outside React and
 * Zustand on purpose: it changes every frame and must never trigger
 * re-renders.
 */
export const avatarPose = {
  /** Feet position on the flat plaza floor (world space, y = 0). */
  position: new Vector3(0, 0, AVATAR_SPAWN_Z),
  /** Unit facing direction, always flat (y = 0). */
  forward: new Vector3(0, 0, -1),
  /** The ground has no curvature — always world up. */
  up: new Vector3(0, 1, 0),
  /** Smoothed 0..1 "how much we are walking right now". */
  moving: 0,
}
