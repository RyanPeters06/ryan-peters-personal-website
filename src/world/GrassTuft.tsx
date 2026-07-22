import { ConeGeometry, MeshStandardMaterial } from 'three'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'

// Shared across every tuft — chunky little blades in the plaza's three
// greens. One geometry, three pooled materials.
const BLADE = new ConeGeometry(0.05, 0.34, 5)
const GREENS = [PALETTE.grass, PALETTE.grassLight, PALETTE.grassDark]
const MATS = GREENS.map((c) => new MeshStandardMaterial({ color: c, roughness: ROUGHNESS.foliage }))

/** Blade layout within a tuft: [x, z, lean, greenIndex, scale]. Denser
 *  and taller than before so the islands read as lush turf. */
const BLADES: [number, number, number, number, number][] = [
  [0, 0, 0, 1, 1.1],
  [0.08, 0.04, 0.28, 0, 0.95],
  [-0.07, 0.03, -0.26, 2, 1.0],
  [0.03, -0.07, 0.12, 1, 0.85],
  [-0.05, -0.05, -0.14, 0, 0.9],
  [0.1, -0.02, 0.34, 2, 0.8],
  [-0.1, 0.0, -0.32, 1, 0.85],
  [0.0, 0.09, 0.05, 0, 1.05],
]

/**
 * A clump of grass blades — dense ground detail scattered thickly across
 * each landmark island's grass mound so it reads as lush turf, not a
 * flat green disc (the reference's grass is rich and textured).
 */
export function GrassTuft() {
  return (
    <group>
      {BLADES.map(([x, z, lean, g, s], i) => (
        <mesh
          key={i}
          geometry={BLADE}
          material={MATS[g]}
          position={[x, 0.14 * s, z]}
          rotation={[lean * 0.6, 0, lean]}
          scale={[s, s, s]}
          castShadow
        />
      ))}
    </group>
  )
}
