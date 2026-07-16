import { PALETTE, PLANET_RADIUS } from '@/lib/constants'

/**
 * Soft, rounded light: high ambient + warm key + cool fill.
 * The key light casts gentle shadows (clouds onto grass); contrast is
 * kept low so every form reads friendly, never dramatic.
 */
export function Lighting() {
  return (
    <>
      {/* Even base illumination — keeps shadows from ever going dark. */}
      <ambientLight intensity={0.95} color="#ffffff" />

      {/* Warm key from high above-left. */}
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.4}
        color={PALETTE.keyLight}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-PLANET_RADIUS * 2}
        shadow-camera-right={PLANET_RADIUS * 2}
        shadow-camera-top={PLANET_RADIUS * 2}
        shadow-camera-bottom={-PLANET_RADIUS * 2}
        shadow-bias={-0.0005}
      />

      {/* Cool fill from the opposite side, no shadows. */}
      <directionalLight position={[-6, -2, -8]} intensity={0.35} color={PALETTE.fillLight} />

      {/* Sky/ground bounce: white from above, cool floor tone below. */}
      <hemisphereLight args={['#ffffff', PALETTE.groundLine, 0.4]} />
    </>
  )
}
