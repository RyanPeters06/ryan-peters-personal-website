import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'

/**
 * A plaza lamppost dressing the gaps between pods: a soft LAVENDER post
 * on a stub base, topped with a round, warm, gently glowing globe lamp —
 * the reference's storybook lamppost, not a bare white stick. Emissive
 * only (no real light source), matching the "light is life" glow
 * language used for accents rather than adding per-post point lights.
 */
export function Lamppost() {
  const materials = useMemo(
    () => ({
      // Soft lavender clay post + collar.
      post: new MeshStandardMaterial({ color: '#c3b4e0', roughness: 0.5 }),
      // The globe: warm cream that reads as lit — a soft glow, catches a
      // touch of bloom without a hard light.
      globe: new MeshStandardMaterial({
        color: '#fff3d4',
        roughness: 0.22,
        emissive: '#ffd9a0',
        emissiveIntensity: 0.7,
      }),
    }),
    [],
  )

  return (
    <group>
      {/* Stub base */}
      <mesh material={materials.post} position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 0.12, 12]} />
      </mesh>
      {/* Slim post */}
      <mesh material={materials.post} position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.042, 1.05, 10]} />
      </mesh>
      {/* Collar/fixture under the globe */}
      <mesh material={materials.post} position={[0, 1.16, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.07, 12]} />
      </mesh>
      {/* Round warm-glowing globe */}
      <mesh material={materials.globe} position={[0, 1.28, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 12]} />
      </mesh>
    </group>
  )
}
