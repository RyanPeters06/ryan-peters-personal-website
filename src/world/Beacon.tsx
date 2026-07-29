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
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { proximity } from '@/systems/proximity'

/**
 * A beacon of light that rises from a landmark while the visitor stands
 * at it: a SOFT translucent white column (additive, not a solid laser)
 * that fades near the top, gently pulses, and has motes drifting up.
 *
 * This measures NOTHING. It reads the shared director in
 * `systems/proximity.ts`, which picks a single nearest-pod winner and
 * sequences the fade so the outgoing column is fully dark before the
 * next opens. Each beacon owning its own proximity latch is exactly what
 * used to light two columns at once — the pods are 4.75u apart and the
 * enter radius is 3.4, so both latched in the overlap.
 *
 * The footprint is an ELLIPSE matching the pod's oval curb: `rx`/`rz`
 * come straight from `POD.base`, so resizing the island in code resizes
 * the beacon with it.
 */
const HEIGHT = 6
const BASE = 0.34 // peak additive intensity of the column
const PARTICLES = 40

export function Beacon({ id, rx, rz }: { id: string; rx: number; rz: number }) {
  const group = useRef<Group>(null)

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
            float bot = smoothstep(0.0, 0.05, vY); // soft at the ground
            float a = top * bot * uOpacity;
            gl_FragColor = vec4(vec3(1.0) * a, a);
          }`,
      }),
    [],
  )

  // Motes inside a UNIT disc (the parent group scales them to the ellipse).
  const { motes, speeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLES * 3)
    const speeds = new Float32Array(PARTICLES)
    for (let i = 0; i < PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * 0.85
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
    // The director owns both WHICH pod is lit and the fade, so this is
    // simply "am I the one, and how far up am I".
    const prox = proximity.lit === id ? proximity.level : 0
    if (group.current) group.current.visible = prox > 0.005
    if (prox <= 0.005) return

    const pulse = 0.72 + 0.28 * Math.sin(getAmbientTime() * 2.2)
    column.uniforms.uOpacity.value = prox * pulse * BASE
    moteMat.opacity = prox * pulse * 0.9

    const pos = motes.getAttribute('position') as Float32BufferAttribute
    for (let i = 0; i < PARTICLES; i++) {
      let y = pos.getY(i) + dt * speeds[i]
      if (y > HEIGHT) y -= HEIGHT
      pos.setY(i, y)
    }
    pos.needsUpdate = true
  })

  // The inner group stretches the unit column into the pod's oval (rx/rz),
  // so the light's base sits exactly on the curb and tracks its size.
  return (
    <group ref={group} visible={false}>
      <group scale={[rx, 1, rz]}>
        <mesh material={column} position={[0, HEIGHT / 2 + 0.14, 0]}>
          <cylinderGeometry args={[1, 1, HEIGHT, 40, 1, true]} />
        </mesh>
        <points geometry={motes} material={moteMat} position={[0, 0.14, 0]} />
      </group>
    </group>
  )
}
