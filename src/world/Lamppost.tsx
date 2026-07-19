import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { PALETTE } from '@/lib/constants'

/**
 * A small plaza lamppost dressing each pod: a white pole on a stub
 * base, topped with a warm glowing lantern. Emissive only — no real
 * light source, matching the "light is life" glow language used for
 * accents rather than adding per-pod point lights.
 */
export function Lamppost() {
  const materials = useMemo(
    () => ({
      pole: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.35 }),
      lantern: new MeshStandardMaterial({
        color: '#fff6e2',
        roughness: 0.25,
        emissive: PALETTE.keyLight,
        emissiveIntensity: 0.5,
      }),
    }),
    [],
  )

  return (
    <group>
      <mesh material={materials.pole} position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.08, 10]} />
      </mesh>
      <mesh material={materials.pole} position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.034, 0.9, 8]} />
      </mesh>
      <mesh material={materials.lantern} position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.09, 12, 10]} />
      </mesh>
    </group>
  )
}
