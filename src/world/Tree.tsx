import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'

const CANOPY = {
  green: [PALETTE.grassDark, PALETTE.grass, PALETTE.grassLight],
  pink: [PALETTE.blossomDark, PALETTE.blossom, PALETTE.blossomLight],
} as const

/**
 * A landmark-pod tree: a short trunk under three overlapping puffs of
 * canopy (same "cartoon cloud" construction as Clouds — one big
 * center puff, two smaller flanking it), in either the plaza's grass
 * greens or a soft blossom-pink variant for visual variety pod to pod.
 */
export function Tree({
  variant = 'green',
  scale = 1,
}: {
  variant?: 'green' | 'pink'
  scale?: number
}) {
  const materials = useMemo(() => {
    const [dark, mid, light] = CANOPY[variant]
    return {
      trunk: new MeshStandardMaterial({ color: PALETTE.trunk, roughness: ROUGHNESS.foliage }),
      dark: new MeshStandardMaterial({ color: dark, roughness: ROUGHNESS.foliage }),
      mid: new MeshStandardMaterial({ color: mid, roughness: ROUGHNESS.foliage }),
      light: new MeshStandardMaterial({ color: light, roughness: ROUGHNESS.foliage }),
    }
  }, [variant])

  return (
    <group scale={scale}>
      <mesh material={materials.trunk} position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.065, 0.44, 8]} />
      </mesh>
      <mesh material={materials.mid} position={[0, 0.64, 0]} castShadow>
        <sphereGeometry args={[0.34, 16, 12]} />
      </mesh>
      <mesh material={materials.dark} position={[-0.2, 0.52, 0.1]} castShadow>
        <sphereGeometry args={[0.24, 14, 10]} />
      </mesh>
      <mesh material={materials.light} position={[0.22, 0.5, -0.12]} castShadow>
        <sphereGeometry args={[0.22, 14, 10]} />
      </mesh>
    </group>
  )
}
