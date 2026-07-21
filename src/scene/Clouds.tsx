import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import {
  Group,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { CLOUD_SPRITES } from '@/scene/cloudTextures'
import { TABLEAU_CAMERA_POS } from '@/lib/constants'

/**
 * The sky's soft cumulus — painted cloud sprites (see cloudTextures.ts)
 * billboarded across the upper sky band and behind the landmark arc, to
 * match the reference's crisp cotton clouds. Replaces the old hard
 * sphere-mesh puffs, which read as lumpy spheres, not clouds.
 *
 * Deterministic seed → the same sky greets every visitor. Each cloud
 * drifts slowly along its lane and wraps, and bobs a touch; the whole
 * set rides the shared ambient clock so reduced-motion calms it.
 */

/** Deterministic [0,1) sequence (same recipe used across the world). */
function makeRng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 19487171) % 2147483647
    return (s & 0xffff) / 0x10000
  }
}

interface CloudSpec {
  tex: number
  x0: number
  y: number
  z: number
  scale: number
  drift: number // world units per ambient second
  bobPhase: number
  span: number // travel distance before wrapping
}

const CLOUD_COUNT = 16

function createSpecs(): CloudSpec[] {
  const rng = makeRng(80510)
  const [, camY, camZ] = TABLEAU_CAMERA_POS
  return Array.from({ length: CLOUD_COUNT }, () => {
    // Place by ELEVATION ANGLE, not raw height. This low camera looks
    // ~22 degrees DOWN, so the visible sky is a thin band from the far
    // rim (~-16 deg) up to the frame's top edge (~-1 deg). A cloud's y
    // is derived from a chosen elevation in that band so it always lands
    // ON screen — placing by height alone (the first attempt) put the
    // clouds far above the top edge, invisible.
    const depth = rng() // 0 near .. 1 far
    const z = -14 - depth * 30 // -14 .. -44, all behind the arc
    const span = 48 + depth * 44
    const x0 = (rng() * 2 - 1) * span * 0.5
    const horiz = Math.hypot(x0, camZ - z)
    const elevDeg = -3 - rng() * 8 // -3 .. -11: upper-mid sky, above the rim
    const y = camY + horiz * Math.tan((elevDeg * Math.PI) / 180)
    const scale = 3.5 + depth * 6 + rng() * 2
    return {
      tex: Math.floor(rng() * CLOUD_SPRITES.length),
      x0,
      y,
      z,
      scale,
      drift: 0.25 + rng() * 0.5,
      bobPhase: rng() * Math.PI * 2,
      span,
    }
  })
}

function One({ spec, material }: { spec: CloudSpec; material: MeshBasicMaterial }) {
  const ref = useRef<Group>(null)
  const geo = useMemo(() => new PlaneGeometry(1.6, 1), [])
  useFrame(() => {
    if (!ref.current) return
    const t = getAmbientTime()
    // Drift + wrap across the lane; a gentle vertical bob.
    let x = spec.x0 + t * spec.drift
    x = ((((x + spec.span / 2) % spec.span) + spec.span) % spec.span) - spec.span / 2
    ref.current.position.set(x, spec.y + Math.sin(t * 0.15 + spec.bobPhase) * 0.4, spec.z)
  })
  return (
    <Billboard ref={ref}>
      <mesh geometry={geo} material={material} scale={[spec.scale, spec.scale, 1]} />
    </Billboard>
  )
}

export function Clouds() {
  const specs = useMemo(createSpecs, [])
  const materials = useMemo(() => {
    const loader = new TextureLoader()
    return CLOUD_SPRITES.map((uri) => {
      const tex: Texture = loader.load(uri)
      tex.colorSpace = SRGBColorSpace
      return new MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        // Crisp against the blue sky — clouds are distant sky elements,
        // not affected by the plaza's ground haze.
        fog: false,
        opacity: 0.96,
      })
    })
  }, [])

  return (
    <group>
      {specs.map((spec, i) => (
        <One key={i} spec={spec} material={materials[spec.tex]} />
      ))}
    </group>
  )
}
