import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'

const COLORS = ['#f2b8c6', '#f2d38f', '#cdb9ea'] as const
const OFFSETS: [number, number, number][] = [
  [0, 0.05, 0],
  [0.09, 0.045, 0.05],
  [-0.08, 0.04, -0.04],
]

/** A tiny cluster of colored blooms — cheap ground-level detail at the
 *  foot of a pod's steps, echoing the plaza's pastel accent palette. */
export function FlowerTuft() {
  const materials = useMemo(
    () => COLORS.map((c) => new MeshStandardMaterial({ color: c, roughness: 0.4 })),
    [],
  )

  return (
    <group>
      {OFFSETS.map((offset, i) => (
        <mesh key={i} material={materials[i]} position={offset}>
          <sphereGeometry args={[0.045, 8, 6]} />
        </mesh>
      ))}
    </group>
  )
}
