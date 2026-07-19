import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'

/** A small plaza bench: white slatted seat + backrest on two legs,
 *  scattered across the open plaza rather than tied to any one pod. */
export function Bench() {
  const materials = useMemo(
    () => ({
      wood: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.35 }),
      leg: new MeshStandardMaterial({ color: '#e5eaee', roughness: 0.4 }),
    }),
    [],
  )

  return (
    <group>
      <mesh material={materials.wood} position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.75, 0.06, 0.32]} />
      </mesh>
      <mesh material={materials.wood} position={[0, 0.42, -0.13]} castShadow>
        <boxGeometry args={[0.75, 0.28, 0.05]} />
      </mesh>
      <mesh material={materials.leg} position={[-0.3, 0.12, 0.08]} castShadow>
        <boxGeometry args={[0.06, 0.24, 0.24]} />
      </mesh>
      <mesh material={materials.leg} position={[0.3, 0.12, 0.08]} castShadow>
        <boxGeometry args={[0.06, 0.24, 0.24]} />
      </mesh>
    </group>
  )
}
