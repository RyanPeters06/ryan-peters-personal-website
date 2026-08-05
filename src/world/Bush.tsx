import { SphereGeometry, MeshStandardMaterial } from 'three'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'

// A small rounded shrub — a mini canopy without a trunk. Shared geometry
// + three pooled greens, like the tree canopy.
const PUFF = new SphereGeometry(1, 14, 12)
const MATS = [PALETTE.grassDark, PALETTE.grass, PALETTE.grassLight].map(
  (c) => new MeshStandardMaterial({ color: c, roughness: ROUGHNESS.foliage }),
)

/** Puff layout: [x, y, z, radius]. Three overlapping lobes,
 *  bottom-aligned so the bush reads as one rounded mound. */
const PUFFS: [number, number, number, number][] = [
  [0, 0.16, 0, 0.2],
  [-0.15, 0.11, 0.05, 0.14],
  [0.15, 0.1, -0.04, 0.13],
]

/**
 * A little rounded bush planted on a landmark island's grass — cheap
 * foliage volume that makes the islands read lush and full, echoing the
 * reference's shrubs between the trees.
 *
 * ONE TONE PER BUSH, picked by `seed` (2026-08-05). Each bush used to
 * wear all THREE greens at once, one per lobe — the same per-puff
 * patchwork that was removed from the tree canopies, on shrubs sitting
 * right beside them. The three greens are still the palette; a bush now
 * picks one of them instead of all three, so nothing on screen changes
 * colour and only the blotchiness goes. Tree.tsx has the reasoning:
 * per-lobe tinting fights the scene lighting that is already shading
 * those same spheres.
 */
export function Bush({ seed = 0 }: { seed?: number }) {
  const mat = MATS[Math.abs(seed) % MATS.length]
  return (
    <group>
      {PUFFS.map(([x, y, z, r], i) => (
        <mesh
          key={i}
          geometry={PUFF}
          material={mat}
          position={[x, y, z]}
          scale={[r, r * 0.9, r]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}
