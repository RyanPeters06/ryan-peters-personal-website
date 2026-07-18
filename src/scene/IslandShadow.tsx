import { useMemo } from 'react'
import { CanvasTexture } from 'three'
import { ISLAND_EDGE_HEIGHT, ISLAND_RADIUS, PALETTE } from '@/lib/constants'

/**
 * A soft radial-gradient disc floating below the island — the gentle
 * shadow that grounds the floating plaza in its white sky.
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

export function IslandShadow() {
  const texture = useMemo(createShadowTexture, [])

  return (
    <mesh
      position={[0, -ISLAND_EDGE_HEIGHT - 3, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={ISLAND_RADIUS * 1.1}
    >
      <circleGeometry args={[1, 48]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} fog={false} />
    </mesh>
  )
}
