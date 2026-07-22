import { useMemo } from 'react'
import { ConeGeometry, MeshStandardMaterial } from 'three'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'

// Shared across every tuft — a few thin tapered blades in the plaza's
// three greens. One geometry, three pooled materials.
const BLADE = new ConeGeometry(0.035, 0.26, 5)
const GREENS = [PALETTE.grass, PALETTE.grassLight, PALETTE.grassDark]
const MATS = GREENS.map((c) => new MeshStandardMaterial({ color: c, roughness: ROUGHNESS.foliage }))

/** Blade layout within a tuft: [x, z, lean, greenIndex]. */
const BLADES: [number, number, number, number][] = [
  [0, 0, 0, 1],
  [0.06, 0.03, 0.25, 0],
  [-0.05, 0.02, -0.22, 2],
  [0.02, -0.05, 0.1, 1],
  [-0.03, -0.03, -0.12, 0],
]

/**
 * A tiny clump of grass blades — cheap ground-level detail scattered
 * across each landmark island's grass top so it reads as tufted turf,
 * not a flat green disc (the reference's grass has visible texture).
 */
export function GrassTuft() {
  const blades = useMemo(() => BLADES, [])
  return (
    <group>
      {blades.map(([x, z, lean, g], i) => (
        <mesh
          key={i}
          geometry={BLADE}
          material={MATS[g]}
          position={[x, 0.11, z]}
          rotation={[lean * 0.6, 0, lean]}
          castShadow
        />
      ))}
    </group>
  )
}
