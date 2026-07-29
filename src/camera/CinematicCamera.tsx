import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Fog, Vector3 } from 'three'
import { useIsTouch } from '@/hooks/useInputMode'
import { avatarPose } from '@/systems/movement/avatarPose'
import {
  GREET_CAM_IN,
  GREET_CAM_IN_DUR,
  GREET_CAM_OUT,
  GREET_CAM_OUT_DUR,
} from '@/avatar/Avatar'
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

/** ---- The arrival close-up ------------------------------------------
 * A scripted one-shot: the frame moves in on the character for his
 * hello, then settles back onto the solved tableau. This restores the
 * beat DESIGN.md's Visitor's Journey always described ("the camera
 * glides down to the character, who turns and waves hello"), which was
 * lost in the 2026-07-18 flat-island pivot.
 *
 * It is NOT a chase cam and does not weaken ART_BIBLE §8: it begins and
 * ends at TABLEAU_CAMERA_POS, runs only during `arriving`/`greeting`,
 * and never tracks the player once they have control.
 *
 * The rig dollies along its OWN view axis and keeps the authored pitch.
 * That matters: Sky.tsx's gradient stops are calibrated to the visible
 * elevation band, and pitching down harder here would push the blue out
 * of frame and render the sky flat white — a bug this project has
 * shipped twice. Moving along the view ray leaves the band alone. */
const ARRIVAL_CLOSE = 0.52 // fraction of the way from the rig to the avatar
const ARRIVAL_LIFT = 0.55 // aim at his head, not his feet
/** Cinematic λ for the hand-back after the greeting — slower than the
 *  usual follow, so the return reads as a release rather than a snap. */
const ARRIVAL_OUT_LAMBDA = 1.6

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const _aimPos = new Vector3()
const _aimLook = new Vector3()

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
  const touch = useIsTouch()

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1)

    // Static fog band, eased in once from whatever came before.
    if (scene.fog instanceof Fog) {
      const k = 1 - Math.exp(-1.2 * dt)
      scene.fog.near += (TABLEAU_FOG[0] - scene.fog.near) * k
      scene.fog.far += (TABLEAU_FOG[1] - scene.fog.far) * k
    }

    // The arrival close-up owns the camera outright while it runs — the
    // mouse pan and the touch look-follow both stand down, or they would
    // fight it for the same two vectors.
    //
    // The hello's beats live on one clock the avatar owns, so the camera
    // move can be ordered against his turn and his wave instead of all
    // three firing at once. Envelope, not a damper: the ORDER matters
    // more than the easing here, and an envelope can be read straight
    // off the timeline.
    const g = avatarPose.greetT
    const closeness =
      g < 0
        ? 0
        : smoothstep(GREET_CAM_IN, GREET_CAM_IN + GREET_CAM_IN_DUR, g) *
          (1 - smoothstep(GREET_CAM_OUT, GREET_CAM_OUT + GREET_CAM_OUT_DUR, g))

    if (closeness > 0.001) {
      // Dolly along the view ray toward the avatar's head, holding the
      // authored pitch (see the note on ARRIVAL_CLOSE).
      _aimLook.set(
        avatarPose.position.x,
        avatarPose.position.y + ARRIVAL_LIFT,
        avatarPose.position.z,
      )
      _aimPos.copy(BASE_POS).lerp(_aimLook, ARRIVAL_CLOSE)
      _aimPos.y = BASE_POS.y - (BASE_POS.y - (_aimLook.y + 1.6)) * ARRIVAL_CLOSE

      pos.current.copy(BASE_POS).lerp(_aimPos, closeness)
      look.current.copy(BASE_TARGET).lerp(_aimLook, closeness)
    } else {
      // Gentle mouse look-around: eased pan of the look target plus a
      // whisper of camera parallax. The frame never travels.
      const px = touch ? 0 : state.pointer.x
      const py = touch ? 0 : state.pointer.y
      // Coming out of the greeting the camera is far from home, so the
      // first seconds after `idle` are a slow release rather than the
      // usual tight follow — hence the softer λ until it has settled.
      const settled = pos.current.distanceToSquared(BASE_POS) < 0.02
      const k = 1 - Math.exp(-(settled ? 3 : ARRIVAL_OUT_LAMBDA) * dt)
      // Touch: aim at the avatar. Desktop: aim where the mouse suggests.
      const aimX = touch
        ? avatarPose.position.x * TABLEAU_LOOK_FOLLOW_TOUCH
        : BASE_TARGET.x + px * LOOK_PAN_X
      look.current.x += (aimX - look.current.x) * k
      look.current.y += (BASE_TARGET.y + py * LOOK_PAN_Y - look.current.y) * k
      look.current.z += (BASE_TARGET.z - look.current.z) * k
      // The mount itself never moves on touch — no parallax dolly, so the
      // frame turns without ever drifting off its solved position.
      pos.current.x += (BASE_POS.x + px * DOLLY_X - pos.current.x) * k
      pos.current.y += (BASE_POS.y + py * DOLLY_Y - pos.current.y) * k
      pos.current.z += (BASE_POS.z - pos.current.z) * k
    }

    camera.position.copy(pos.current)
    camera.up.copy(WORLD_UP)
    camera.lookAt(look.current)
  })

  return null
}
