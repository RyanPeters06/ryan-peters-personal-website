import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Fog, Vector3 } from 'three'
import { useCoarsePointer } from '@/hooks/useCoarsePointer'
import { avatarPose } from '@/systems/movement/avatarPose'
import {
  TABLEAU_CAMERA_POS,
  TABLEAU_CAMERA_TARGET,
  TABLEAU_FOG,
  TABLEAU_LOOK_FOLLOW_TOUCH,
} from '@/lib/constants'

/**
 * The tableau camera: one fixed, art-directed frame.
 *
 * The camera lives high and pulled back on the plaza's south side,
 * looking down at the staged composition with a long lens — a
 * compressed diorama, framed once, like the reference. It never
 * follows the character; the character moves within the frame.
 *
 * The only motion is a gentle eased look-around driven by the mouse
 * (a few degrees of pan and a whisper of parallax), so the diorama
 * feels held by a hand, not bolted to a tripod. Fog is static: the
 * plaza stays crisp while the planet's limb melts into the sky.
 */
const BASE_POS = new Vector3(...TABLEAU_CAMERA_POS)
const BASE_TARGET = new Vector3(...TABLEAU_CAMERA_TARGET)
const WORLD_UP = new Vector3(0, 1, 0)

/** Mouse look-around authority, in world units at the target plane. */
const LOOK_PAN_X = 2.2
const LOOK_PAN_Y = 1.1
/** Tiny positional parallax so the pan has depth. */
const DOLLY_X = 0.6
const DOLLY_Y = 0.3

export function CinematicCamera() {
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)
  const look = useRef(BASE_TARGET.clone())
  const pos = useRef(BASE_POS.clone())
  // On touch the mouse look-around is replaced by a look-FOLLOW.
  //
  // Two reasons. The pan is a hover affordance and a finger cannot
  // hover: R3F's `state.pointer` keeps the last position forever, so one
  // stray tap would swing the tableau off-centre with no touch event
  // that could ever bring it back. And a phone's frame is far narrower
  // than the aspect this rig was solved for, so the avatar walks clean
  // out of shot (measured: ndcX 3.84 at 390x844 — see constants).
  //
  // So the target tracks the avatar instead. The camera itself does NOT
  // follow: position and fov stay exactly as solved, and only the aim
  // moves — a security camera on a fixed mount, not a chase cam. That
  // keeps ART_BIBLE §8's "the camera never follows" intact in the sense
  // it was written (the frame never travels).
  const coarse = useCoarsePointer()

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1)

    // Static fog band, eased in once from whatever came before.
    if (scene.fog instanceof Fog) {
      const k = 1 - Math.exp(-1.2 * dt)
      scene.fog.near += (TABLEAU_FOG[0] - scene.fog.near) * k
      scene.fog.far += (TABLEAU_FOG[1] - scene.fog.far) * k
    }

    // Gentle mouse look-around: eased pan of the look target plus a
    // whisper of camera parallax. The frame never travels.
    const px = coarse ? 0 : state.pointer.x
    const py = coarse ? 0 : state.pointer.y
    const k = 1 - Math.exp(-3 * dt)
    // Touch: aim at the avatar. Desktop: aim where the mouse suggests.
    const aimX = coarse
      ? avatarPose.position.x * TABLEAU_LOOK_FOLLOW_TOUCH
      : BASE_TARGET.x + px * LOOK_PAN_X
    look.current.x += (aimX - look.current.x) * k
    look.current.y += (BASE_TARGET.y + py * LOOK_PAN_Y - look.current.y) * k
    look.current.z = BASE_TARGET.z
    // The mount itself never moves on touch — no parallax dolly, so the
    // frame turns without ever drifting off its solved position.
    pos.current.x += (BASE_POS.x + px * DOLLY_X - pos.current.x) * k
    pos.current.y += (BASE_POS.y + py * DOLLY_Y - pos.current.y) * k
    pos.current.z = BASE_POS.z

    camera.position.copy(pos.current)
    camera.up.copy(WORLD_UP)
    camera.lookAt(look.current)
  })

  return null
}
