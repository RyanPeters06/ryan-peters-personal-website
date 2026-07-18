import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MeshStandardMaterial } from 'three'
import { useSphericalPosition } from '@/hooks/useSphericalPosition'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { PALETTE } from '@/lib/constants'

/**
 * The plaza centerpiece: a little ringed planet — the world's own
 * mascot — floating over a white basin with a ring of grass, at the
 * exact center of the tableau. Its only motion is the world's kind:
 * a slow turn, a gentle bob, the ring precessing like a lazy halo.
 */
export function Fountain() {
  // The crown of the planet — the center of the staged plaza.
  const { position, quaternion } = useSphericalPosition(90, 0)
  const planet = useRef<Group>(null)

  const materials = useMemo(
    () => ({
      basin: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.16 }),
      grass: new MeshStandardMaterial({ color: PALETTE.grass, roughness: 0.75 }),
      globe: new MeshStandardMaterial({ color: PALETTE.skyTop, roughness: 0.3 }),
      ring: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.25 }),
    }),
    [],
  )

  useFrame(() => {
    if (!planet.current) return
    const t = getAmbientTime()
    planet.current.rotation.y = t * 0.25
    planet.current.position.y = 1.05 + Math.sin(t * 0.9) * 0.05
  })

  return (
    <group position={position} quaternion={quaternion}>
      {/* Basin: two soft white steps rising from the floor */}
      <mesh material={materials.basin} position={[0, 0.09, 0]} receiveShadow>
        <cylinderGeometry args={[1.35, 1.45, 0.18, 36]} />
      </mesh>
      <mesh material={materials.basin} position={[0, 0.24, 0]} receiveShadow>
        <cylinderGeometry args={[1.05, 1.15, 0.14, 36]} />
      </mesh>
      {/* Grass ring nested in the basin */}
      <mesh material={materials.grass} position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.95, 1.0, 0.1, 36]} />
      </mesh>
      {/* The little ringed planet */}
      <group ref={planet} position={[0, 1.05, 0]}>
        <mesh material={materials.globe} castShadow>
          <sphereGeometry args={[0.52, 24, 18]} />
        </mesh>
        <mesh material={materials.ring} rotation={[0.35, 0, 0.1]}>
          <torusGeometry args={[0.78, 0.055, 10, 40]} />
        </mesh>
      </group>
    </group>
  )
}
