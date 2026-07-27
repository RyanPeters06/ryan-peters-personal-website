import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  PointsMaterial,
  ShaderMaterial,
} from 'three'
import { useWorldStore } from '@/store/useWorldStore'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { expDamp } from '@/lib/math/damp'

/**
 * A beacon of light that rises from a landmark while the visitor is
 * standing at it: a SOFT translucent white column (additive, not a solid
 * laser) that fades out near the top, gently pulses in brightness, and
 * has motes drifting up through it. It eases in on approach and out again
 * as soon as the visitor walks away (driven by `activeLocation`).
 */
const HEIGHT = 6
const RADIUS = 1.0
const BASE = 0.42 // peak additive intensity of the column
const PARTICLES = 34

export function Beacon({ locationId }: { locationId: string }) {
  const group = useRef<Group>(null)
  const prox = useRef(0)

  const column = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uOpacity: { value: 0 } },
        vertexShader: `
          varying float vY;
          void main() {
            vY = uv.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform float uOpacity;
          varying float vY;
          void main() {
            float top = smoothstep(1.0, 0.25, vY); // fade toward the top
            float bot = smoothstep(0.0, 0.06, vY); // soft at the ground
            float a = top * bot * uOpacity;
            gl_FragColor = vec4(vec3(1.0) * a, a);
          }`,
      }),
    [],
  )

  // Motes: random points inside the column, each with its own rise speed.
  const { motes, speeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLES * 3)
    const speeds = new Float32Array(PARTICLES)
    for (let i = 0; i < PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * RADIUS * 0.75
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = Math.random() * HEIGHT
      positions[i * 3 + 2] = Math.sin(a) * r
      speeds[i] = 0.5 + Math.random() * 0.7
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return { motes: g, speeds }
  }, [])

  const moteMat = useMemo(
    () =>
      new PointsMaterial({
        color: '#ffffff',
        size: 0.08,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: AdditiveBlending,
        sizeAttenuation: true,
      }),
    [],
  )

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const active = useWorldStore.getState().activeLocation === locationId
    prox.current = expDamp(prox.current, active ? 1 : 0, 4, dt)
    if (group.current) group.current.visible = prox.current > 0.005
    if (prox.current <= 0.005) return

    const pulse = 0.72 + 0.28 * Math.sin(getAmbientTime() * 2.2)
    column.uniforms.uOpacity.value = prox.current * pulse * BASE
    moteMat.opacity = prox.current * pulse * 0.9

    // Drift the motes upward, wrapping back to the base.
    const pos = motes.getAttribute('position') as Float32BufferAttribute
    for (let i = 0; i < PARTICLES; i++) {
      let y = pos.getY(i) + dt * speeds[i]
      if (y > HEIGHT) y -= HEIGHT
      pos.setY(i, y)
    }
    pos.needsUpdate = true
  })

  return (
    <group ref={group} visible={false}>
      <mesh material={column} position={[0, HEIGHT / 2 + 0.15, 0]}>
        <cylinderGeometry args={[RADIUS, RADIUS, HEIGHT, 24, 1, true]} />
      </mesh>
      <points geometry={motes} material={moteMat} position={[0, 0.15, 0]} />
    </group>
  )
}
