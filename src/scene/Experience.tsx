import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { NoToneMapping } from 'three'
import { GLOW } from '@/lib/designSystem'
import { Sky } from '@/scene/Sky'
import { Ground } from '@/scene/Ground'
import { IslandShadow } from '@/scene/IslandShadow'
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
import {
  CAMERA_FAR,
  REDUCED_MOTION_SCALE,
  TABLEAU_CAMERA_POS,
  TABLEAU_FOV,
} from '@/lib/constants'
import { Fountain } from '@/world/Fountain'

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
        // The tableau lens: long focal length, fixed high vantage —
        // the plaza reads as a compressed diorama (see CinematicCamera).
        position: [...TABLEAU_CAMERA_POS],
        fov: TABLEAU_FOV,
        near: 0.1,
        far: CAMERA_FAR,
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
        <Ground />
        <IslandShadow />
        <Clouds />
        <Locations />
        <Fountain />
        <Crowd />
        <Avatar />
        <TitleWorld />
        <CinematicCamera />
        {/* The reference's "gently emits light" finish: a whisper of
            bloom on only the brightest whites and accent glows. */}
        <EffectComposer multisampling={4}>
          <Bloom
            mipmapBlur
            intensity={GLOW.bloom.intensity}
            luminanceThreshold={GLOW.bloom.threshold}
            luminanceSmoothing={GLOW.bloom.smoothing}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
