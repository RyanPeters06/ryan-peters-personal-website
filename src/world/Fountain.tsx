import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MeshStandardMaterial } from 'three'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { PALETTE } from '@/lib/constants'
import { FlowerTuft } from '@/world/FlowerTuft'

/** Flower clusters ringing the fountain's grass, like the reference. */
const FOUNTAIN_FLOWERS = Array.from({ length: 7 }, (_, i) => {
  const a = (i / 7) * Math.PI * 2 + 0.4
  return [Math.cos(a) * 0.92, Math.sin(a) * 0.92] as const
})

/**
 * The plaza centerpiece: a white basin with a ring of grass, holding a
 * small ringed blue globe at the exact center of the tableau — the
 * world's own mascot, echoing the flat island it sits on. Its only
 * motion is the world's kind: a slow turn, a gentle bob, the ring
 * precessing like a lazy halo.
 */
export function Fountain() {
  const globe = useRef<Group>(null)

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
    if (!globe.current) return
    const t = getAmbientTime()
    globe.current.rotation.y = t * 0.25
    globe.current.position.y = 0.72 + Math.sin(t * 0.9) * 0.04
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Basin: two soft white steps rising from the floor */}
      <mesh material={materials.basin} position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.45, 0.18, 36]} />
      </mesh>
      <mesh material={materials.basin} position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.15, 0.14, 36]} />
      </mesh>
      {/* Grass ring nested in the basin */}
      <mesh material={materials.grass} position={[0, 0.32, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.0, 0.1, 36]} />
      </mesh>
      {/* Flowers ringing the grass */}
      {FOUNTAIN_FLOWERS.map(([x, z], i) => (
        <group key={i} position={[x, 0.37, z]}>
          <FlowerTuft />
        </group>
      ))}
      {/* The little ringed globe, floating just above the basin */}
      <group ref={globe} position={[0, 0.72, 0]}>
        <mesh material={materials.globe} castShadow>
          <sphereGeometry args={[0.36, 24, 18]} />
        </mesh>
        <mesh material={materials.ring} rotation={[0.35, 0, 0.1]}>
          <torusGeometry args={[0.54, 0.038, 10, 40]} />
        </mesh>
      </group>
    </group>
  )
}
