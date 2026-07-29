import { useMemo } from 'react'
import { Color, MeshStandardMaterial } from 'three'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'

const CANOPY = {
  green: [PALETTE.grassDark, PALETTE.grass, PALETTE.grassLight],
  pink: [PALETTE.blossomDark, PALETTE.blossom, PALETTE.blossomLight],
} as const

/** How far a tinted canopy is pulled toward its landmark's accent.
 *  Partway, not all the way (Peter, 2026-07-29): at 1.0 the Projects and
 *  Resume trees turn literally blue and teal. At this strength each pod's
 *  trees read as belonging to it while still reading as foliage. */
const TINT_STRENGTH = 0.45

/**
 * A landmark-pod tree: a short trunk under five overlapping puffs of
 * canopy (same "cartoon cloud" construction as Clouds — one big
 * center puff, smaller ones flanking it).
 *
 * `tint` pulls the three canopy tones toward a landmark's accent, so the
 * planting on each island belongs to its panel. The dark/mid/light
 * relationship is preserved through the lerp, so the crown keeps its
 * form — a flat single colour would read as a ball.
 */
export function Tree({
  variant = 'green',
  scale = 1,
  tint,
}: {
  variant?: 'green' | 'pink'
  scale?: number
  tint?: string
}) {
  const materials = useMemo(() => {
    const [dark, mid, light] = CANOPY[variant]
    const shade = (hex: string) => {
      const c = new Color(hex)
      if (tint) c.lerp(new Color(tint), TINT_STRENGTH)
      return c
    }
    return {
      trunk: new MeshStandardMaterial({ color: PALETTE.trunk, roughness: ROUGHNESS.foliage }),
      dark: new MeshStandardMaterial({ color: shade(dark), roughness: ROUGHNESS.foliage }),
      mid: new MeshStandardMaterial({ color: shade(mid), roughness: ROUGHNESS.foliage }),
      light: new MeshStandardMaterial({ color: shade(light), roughness: ROUGHNESS.foliage }),
    }
  }, [variant, tint])

  return (
    <group scale={scale}>
      <mesh material={materials.trunk} position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.46, 8]} />
      </mesh>
      {/* A fuller canopy — five overlapping puffs, rounder and lusher
          than the old three, so the tree reads as a leafy crown. */}
      <mesh material={materials.mid} position={[0, 0.68, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.38, 18, 14]} />
      </mesh>
      <mesh material={materials.dark} position={[-0.26, 0.54, 0.12]} castShadow receiveShadow>
        <sphereGeometry args={[0.27, 16, 12]} />
      </mesh>
      <mesh material={materials.light} position={[0.27, 0.52, -0.13]} castShadow receiveShadow>
        <sphereGeometry args={[0.26, 16, 12]} />
      </mesh>
      <mesh material={materials.light} position={[0.05, 0.86, 0.16]} castShadow receiveShadow>
        <sphereGeometry args={[0.22, 14, 10]} />
      </mesh>
      <mesh material={materials.dark} position={[-0.12, 0.7, -0.24]} castShadow receiveShadow>
        <sphereGeometry args={[0.21, 14, 10]} />
      </mesh>
    </group>
  )
}
