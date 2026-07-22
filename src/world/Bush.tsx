import { SphereGeometry, MeshStandardMaterial } from 'three'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'

// A small rounded shrub — a mini canopy without a trunk. Shared geometry
// + three pooled greens, like the tree canopy.
const PUFF = new SphereGeometry(1, 14, 12)
const MATS = [PALETTE.grassDark, PALETTE.grass, PALETTE.grassLight].map(
  (c) => new MeshStandardMaterial({ color: c, roughness: ROUGHNESS.foliage }),
)

/** Puff layout: [x, y, z, radius, greenIndex]. Three overlapping lobes,
 *  bottom-aligned so the bush reads as one rounded mound. */
const PUFFS: [number, number, number, number, number][] = [
  [0, 0.16, 0, 0.2, 1],
  [-0.15, 0.11, 0.05, 0.14, 0],
  [0.15, 0.1, -0.04, 0.13, 2],
]

/**
 * A little rounded bush planted on a landmark island's grass — cheap
 * foliage volume that makes the islands read lush and full, echoing the
 * reference's shrubs between the trees.
 */
export function Bush() {
  return (
    <group>
      {PUFFS.map(([x, y, z, r, g], i) => (
        <mesh
          key={i}
          geometry={PUFF}
          material={MATS[g]}
          position={[x, y, z]}
          scale={[r, r * 0.9, r]}
          castShadow
          receiveShadow
        >
        </mesh>
      ))}
    </group>
  )
}
