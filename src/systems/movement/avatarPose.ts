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
  /** Seconds into the hello, or −1 when it isn't running.
   *
   *  The greeting is a little cutscene whose beats have to land in a set
   *  order — he turns to face you, THEN the camera moves in, THEN he
   *  waves, and the camera pulls back out just before he turns away. The
   *  avatar owns that clock and the camera reads it, so neither has to
   *  guess what the other is doing. See GREET_* in Avatar.tsx. */
  greetT: -1,
}
