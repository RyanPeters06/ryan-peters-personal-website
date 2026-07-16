import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DirectionalLight, Object3D, Vector3 } from 'three'
import { avatarPose } from '@/systems/movement/avatarPose'
import { PALETTE } from '@/lib/constants'

/** Fixed world-space tilt of the sun, so shadow direction drifts
 *  gently as you travel but never swings when you merely turn. */
const SUN_TILT = new Vector3(0.8, 0.55, 0.4)

const _sunDir = new Vector3()

/**
 * Soft, rounded light: high ambient + warm key + cool fill.
 *
 * The key light is a "personal sun": it rides above wherever the
 * avatar is, so the player always walks in daylight no matter where
 * on the sphere they roam — and its shadow frustum stays tight around
 * the avatar for crisp little shadows.
 */
export function Lighting() {
  const key = useRef<DirectionalLight>(null)
  const target = useRef<Object3D>(null)

  useFrame(() => {
    const light = key.current
    const tgt = target.current
    if (!light || !tgt) return
    _sunDir.copy(avatarPose.up).multiplyScalar(1.8).add(SUN_TILT).normalize()
    light.position.copy(avatarPose.position).addScaledVector(_sunDir, 28)
    tgt.position.copy(avatarPose.position)
    light.target = tgt
    tgt.updateMatrixWorld()
  })

  return (
    <>
      {/* Generous, faintly blue base light: bright spring morning.
          High ambient + soft key keeps shadows gentle and blue-gray. */}
      <ambientLight intensity={1.35} color={PALETTE.ambient} />

      {/* Warm key: the personal sun, softened. */}
      <object3D ref={target} />
      <directionalLight
        ref={key}
        intensity={1.05}
        color={PALETTE.keyLight}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />

      {/* Cool fill from the opposite side, no shadows. */}
      <directionalLight position={[-6, -2, -8]} intensity={0.4} color={PALETTE.fillLight} />

      {/* Sky/ground bounce: pale blue from above, cool floor below. */}
      <hemisphereLight args={['#e8f4ff', '#dfe9f0', 0.55]} />
    </>
  )
}
