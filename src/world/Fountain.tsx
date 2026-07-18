import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshStandardMaterial } from 'three'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { PALETTE } from '@/lib/constants'

/**
 * The plaza centerpiece: a simple white basin with a ring of grass and
 * a low pillowy dome plinth at the exact center of the tableau. Its
 * only motion is the world's kind: the dome's glow breathes gently —
 * "architecture's life is light, not motion" (see DESIGN_SYSTEM).
 */
export function Fountain() {
  const domeMat = useRef<MeshStandardMaterial>(null)

  const materials = useMemo(
    () => ({
      basin: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.16 }),
      grass: new MeshStandardMaterial({ color: PALETTE.grass, roughness: 0.75 }),
    }),
    [],
  )

  useFrame(() => {
    if (!domeMat.current) return
    domeMat.current.emissiveIntensity = 0.06 + Math.sin(getAmbientTime() * 0.9) * 0.03
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Basin: two soft white steps rising from the floor */}
      <mesh material={materials.basin} position={[0, 0.09, 0]} receiveShadow>
        <cylinderGeometry args={[1.35, 1.45, 0.18, 36]} />
      </mesh>
      <mesh material={materials.basin} position={[0, 0.24, 0]} receiveShadow>
        <cylinderGeometry args={[1.05, 1.15, 0.14, 36]} />
      </mesh>
      {/* Grass ring nested in the basin */}
      <mesh material={materials.grass} position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.95, 1.0, 0.1, 36]} />
      </mesh>
      {/* The plinth: a low pillowy dome, breathing softly */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.62, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          ref={domeMat}
          color="#ffffff"
          roughness={0.2}
          emissive={PALETTE.skyTop}
          emissiveIntensity={0.06}
        />
      </mesh>
    </group>
  )
}
