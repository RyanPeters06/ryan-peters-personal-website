import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { NoToneMapping } from 'three'
import { Sky } from '@/scene/Sky'
import { Planet } from '@/scene/Planet'
import { PlanetShadow } from '@/scene/PlanetShadow'
import { Clouds } from '@/scene/Clouds'
import { Lighting } from '@/scene/lighting/Lighting'
import { Avatar } from '@/avatar/Avatar'
import { Locations } from '@/world/Locations'
import { Crowd } from '@/world/Crowd'
import { TitleWorld } from '@/scene/TitleWorld'
import { CinematicCamera } from '@/camera/CinematicCamera'
import { setAmbientScale, useAmbientDriver } from '@/hooks/useAmbientLoop'
import { useMovementKeys } from '@/systems/movement/useMovementInput'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { CAMERA_ORBIT_RADIUS, REDUCED_MOTION_SCALE } from '@/lib/constants'

/** Advances the world's shared heartbeat and syncs it with the
 *  visitor's reduced-motion preference. Mounted once, inside Canvas. */
function AmbientLoopDriver() {
  useAmbientDriver()
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    setAmbientScale(reduced ? REDUCED_MOTION_SCALE : 1)
  }, [reduced])
  return null
}

/**
 * The world. Composes every 3D system inside the Canvas.
 * Overlay UI lives *outside* (see App) — the canvas is only the world.
 */
export function Experience() {
  useMovementKeys()
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: [0, 6, CAMERA_ORBIT_RADIUS],
        fov: 42,
        near: 0.1,
        far: CAMERA_ORBIT_RADIUS * 2.5,
      }}
      // Flat tone mapping keeps the whites bright and airy — the pastel
      // palette needs no filmic compression.
      gl={{ toneMapping: NoToneMapping }}
      className="h-full w-full"
    >
      <Suspense fallback={null}>
        <AmbientLoopDriver />
        <Sky />
        <Lighting />
        <Planet />
        <PlanetShadow />
        <Clouds />
        <Locations />
        <Crowd />
        <Avatar />
        <TitleWorld />
        <CinematicCamera />
      </Suspense>
    </Canvas>
  )
}
