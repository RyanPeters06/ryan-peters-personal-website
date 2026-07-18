import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Fog, Vector3 } from 'three'
import {
  TABLEAU_CAMERA_POS,
  TABLEAU_CAMERA_TARGET,
  TABLEAU_FOG,
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
    const px = state.pointer.x
    const py = state.pointer.y
    const k = 1 - Math.exp(-3 * dt)
    look.current.x += (BASE_TARGET.x + px * LOOK_PAN_X - look.current.x) * k
    look.current.y += (BASE_TARGET.y + py * LOOK_PAN_Y - look.current.y) * k
    look.current.z = BASE_TARGET.z
    pos.current.x += (BASE_POS.x + px * DOLLY_X - pos.current.x) * k
    pos.current.y += (BASE_POS.y + py * DOLLY_Y - pos.current.y) * k
    pos.current.z = BASE_POS.z

    camera.position.copy(pos.current)
    camera.up.copy(WORLD_UP)
    camera.lookAt(look.current)
  })

  return null
}
