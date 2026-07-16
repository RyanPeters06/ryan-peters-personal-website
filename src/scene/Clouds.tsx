import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import { Group } from 'three'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { latLonToVec3, surfaceQuaternion } from '@/lib/math/spherical'
import {
  CLOUD_ALTITUDE_MAX,
  CLOUD_ALTITUDE_MIN,
  PALETTE,
  PLANET_RADIUS,
} from '@/lib/constants'

/** Deterministic [0,1) sequence so the sky looks the same every visit. */
function makeRng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 19487171) % 2147483647
    return (s & 0xffff) / 0x10000
  }
}

interface CloudSpec {
  lat: number
  lon0: number
  altitude: number
  /** degrees of longitude per ambient second */
  driftSpeed: number
  bobPhase: number
  puffs: { offset: [number, number, number]; scale: number }[]
}

const CLOUD_COUNT = 9

function createCloudSpecs(): CloudSpec[] {
  const rng = makeRng(20260715)
  return Array.from({ length: CLOUD_COUNT }, (_, i) => {
    const puffCount = 3 + Math.floor(rng() * 3)
    return {
      // Spread across both hemispheres, denser near the "temperate" bands.
      lat: (rng() * 2 - 1) * 62,
      lon0: (i / CLOUD_COUNT) * 360 + rng() * 30,
      altitude:
        CLOUD_ALTITUDE_MIN + rng() * (CLOUD_ALTITUDE_MAX - CLOUD_ALTITUDE_MIN),
      driftSpeed: 1.1 + rng() * 1.4,
      bobPhase: rng() * Math.PI * 2,
      puffs: (() => {
        // Classic cartoon cloud: plump center, chunky neighbors, all
        // heavily overlapped with their *bottoms* roughly aligned so the
        // silhouette reads as one friendly lumpy mass — never a chain.
        const scales = Array.from({ length: puffCount }, (_, p) => {
          const centered =
            1 - Math.abs(p - (puffCount - 1) / 2) / ((puffCount - 1) / 2 || 1)
          return 0.52 + centered * 0.3 + rng() * 0.06
        })
        const maxScale = Math.max(...scales)
        return scales.map((scale, p) => ({
          offset: [
            (p - (puffCount - 1) / 2) * 0.34 + (rng() - 0.5) * 0.05,
            (scale - maxScale) * 0.55,
            (rng() - 0.5) * 0.1,
          ] as [number, number, number],
          scale,
        }))
      })(),
    }
  })
}

/** One cloud: an animated group of puff instances drifting along a
 *  line of latitude, bobbing gently. */
function Cloud({ spec }: { spec: CloudSpec }) {
  const group = useRef<Group>(null)

  useFrame(() => {
    const g = group.current
    if (!g) return
    const t = getAmbientTime()
    const lon = spec.lon0 + t * spec.driftSpeed
    const bob = Math.sin(t * 0.4 + spec.bobPhase) * 0.12
    latLonToVec3(spec.lat, lon, PLANET_RADIUS + spec.altitude + bob, g.position)
    surfaceQuaternion(g.position, g.quaternion)
  })

  return (
    <group ref={group}>
      {spec.puffs.map((puff, i) => (
        // Slightly squashed puffs — friendlier than perfect spheres.
        <Instance
          key={i}
          position={puff.offset}
          scale={[puff.scale, puff.scale * 0.82, puff.scale]}
        />
      ))}
    </group>
  )
}

/**
 * All clouds share one sphere geometry + one material through drei's
 * <Instances> — the whole sky is a single draw call.
 */
export function Clouds() {
  const specs = useMemo(createCloudSpecs, [])
  const puffTotal = useMemo(
    () => specs.reduce((n, s) => n + s.puffs.length, 0),
    [specs],
  )

  return (
    <Instances limit={puffTotal} castShadow>
      <sphereGeometry args={[1, 12, 10]} />
      <meshStandardMaterial color={PALETTE.cloud} roughness={1} metalness={0} />
      {specs.map((spec, i) => (
        <Cloud key={i} spec={spec} />
      ))}
    </Instances>
  )
}
