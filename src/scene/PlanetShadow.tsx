import { useMemo } from 'react'
import { CanvasTexture } from 'three'
import { PALETTE, PLANET_RADIUS } from '@/lib/constants'

/**
 * A soft radial-gradient disc floating below the planet — the gentle
 * contact shadow that grounds the toy world in its white sky.
 */
function createShadowTexture(): CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  )
  gradient.addColorStop(0, `${PALETTE.shadow}80`)
  gradient.addColorStop(0.55, `${PALETTE.shadow}38`)
  gradient.addColorStop(1, `${PALETTE.shadow}00`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new CanvasTexture(canvas)
}

export function PlanetShadow() {
  const texture = useMemo(createShadowTexture, [])

  return (
    <mesh
      position={[0, -PLANET_RADIUS * 1.32, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={PLANET_RADIUS * 1.05}
    >
      <circleGeometry args={[1, 48]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} fog={false} />
    </mesh>
  )
}
