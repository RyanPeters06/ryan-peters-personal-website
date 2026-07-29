import { LOCATIONS } from '@/content/locations'
import { LANDMARK } from '@/lib/designSystem'
import { expDamp } from '@/lib/math/damp'
import { avatarPose } from '@/systems/movement/avatarPose'
import { useWorldStore } from '@/store/useWorldStore'

/**
 * Who owns "the visitor is standing at a landmark".
 *
 * This used to be decided six times over — every `LocationPod` ran its
 * own latch and every `Beacon` ran another — which produced three bugs,
 * because the pods sit 4.75u apart while the enter radius is 3.4: the
 * midpoint between any two neighbours is inside BOTH circles.
 *
 *  1. Two beacons lit at once. The beacon measured its own distance and
 *     never consulted the store, so in the overlap both columns latched
 *     on at full brightness. That is what read as "residue of the last
 *     light" — it was not a slow fade, it was two lights.
 *  2. The card followed render order, not distance. Both pods called
 *     `setActiveLocation` in the same frame and the later one in
 *     `LOCATIONS` order won, however far away it was.
 *  3. `activeLocation` could strand at `null` while you stood at a pod:
 *     walk A -> B -> back to A and A's latch had never dropped, so its
 *     enter branch (which requires `!near`) could never fire again.
 *
 * One winner is now chosen here, once per frame, by distance.
 */
export const proximity = {
  /** The pod being visited — drives the card and the pod's own glow.
   *  Switches immediately, so walking up to a panel feels responsive. */
  active: null as string | null,
  /** The pod whose beacon is lit, and how far up it has faded.
   *  Deliberately LAGS `active`: see the sequencing note below. */
  lit: null as string | null,
  level: 0,
}

/** Fade rate for the beacon column. */
const LAMBDA = 4
/** Below this the outgoing column counts as fully out. */
const DARK = 0.01

let winner: string | null = null

/** Advance the director. Call once per frame, from one place. */
export function updateProximity(dt: number): void {
  const store = useWorldStore.getState()
  const roaming = store.phase === 'idle' || store.phase === 'exploring'

  // ---- pick exactly one winner: the NEAREST pod ----------------------
  let bestId: string | null = null
  let bestD = Infinity
  if (roaming) {
    for (const l of LOCATIONS) {
      const dx = avatarPose.position.x - l.x
      const dz = avatarPose.position.z - l.z
      const d = Math.hypot(dx, dz)
      if (d < bestD) {
        bestD = d
        bestId = l.id
      }
    }
  }

  // Hysteresis applied to the WINNER rather than per pod: you claim the
  // nearest pod once inside its enter radius, and keep it until you pass
  // its exit radius. Because only one pod can hold the title, the
  // overlap between neighbours can no longer light two of anything.
  if (!roaming) {
    winner = null
  } else if (bestD < LANDMARK.enterDistance) {
    winner = bestId
  } else if (winner !== bestId || bestD > LANDMARK.exitDistance) {
    winner = null
  }

  if (proximity.active !== winner) {
    proximity.active = winner
    store.setActiveLocation(winner)
  }

  // ---- sequence the light: OUT fully, then IN ------------------------
  // Peter's requirement is that the old column finishes fading before
  // the next one opens — never a cross-fade. So `lit` only changes hands
  // once `level` has reached zero, which is why the beacon lags `active`
  // rather than tracking it. When nothing was lit, `level` is already 0
  // and the swap happens on the same frame, so arriving still feels
  // immediate; only pod-to-pod hand-offs take the extra beat.
  if (proximity.lit !== winner) {
    proximity.level = expDamp(proximity.level, 0, LAMBDA, dt)
    if (proximity.level < DARK) {
      proximity.level = 0
      proximity.lit = winner
    }
  } else {
    proximity.level = expDamp(proximity.level, winner ? 1 : 0, LAMBDA, dt)
  }
}
