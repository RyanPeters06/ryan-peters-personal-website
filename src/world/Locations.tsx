import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MeshStandardMaterial } from 'three'
import { LOCATIONS } from '@/content/locations'
import type { WorldLocation } from '@/content/locations'
import { LocationPod } from '@/world/LocationPod'
import { useWorldStore } from '@/store/useWorldStore'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { expDamp } from '@/lib/math/spherical'

/**
 * Location symbols — molded flush into each monument's face like a
 * two-shot injection: rounded accent forms half-sunk into the body so
 * they read as manufactured-in, never attached. Each symbol breathes
 * a soft glow and brightens when the visitor arrives.
 */

/** One rounded bar of a symbol (a capsule lying in the face plane). */
function Bar({
  material,
  x,
  y,
  tilt,
  length,
}: {
  material: MeshStandardMaterial
  x: number
  y: number
  tilt: number
  length: number
}) {
  return (
    <mesh material={material} position={[x, y, 0]} rotation={[0, 0, tilt]}>
      <capsuleGeometry args={[0.05, length, 6, 12]} />
    </mesh>
  )
}

/** The Projects identity: an original rounded, friendly </> mark. */
function CodeSymbol({ location }: { location: WorldLocation }) {
  const material = useMemo(() => {
    const accent = new Color(location.accent)
    return new MeshStandardMaterial({
      color: accent,
      roughness: 0.3,
      emissive: accent,
      emissiveIntensity: 0.22,
    })
  }, [location.accent])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const active = useWorldStore.getState().activeLocation === location.id
    const target = (active ? 0.55 : 0.22) + Math.sin(getAmbientTime() * 1.2) * 0.04
    material.emissiveIntensity = expDamp(material.emissiveIntensity, target, 4, dt)
  })

  return (
    <group>
      {/* < */}
      <Bar material={material} x={-0.33} y={0.115} tilt={-1.05} length={0.3} />
      <Bar material={material} x={-0.33} y={-0.115} tilt={1.05} length={0.3} />
      {/* / */}
      <Bar material={material} x={0} y={0} tilt={-0.32} length={0.46} />
      {/* > */}
      <Bar material={material} x={0.33} y={0.115} tilt={1.05} length={0.3} />
      <Bar material={material} x={0.33} y={-0.115} tilt={-1.05} length={0.3} />
    </group>
  )
}

const SYMBOLS: Record<string, (loc: WorldLocation) => ReactNode> = {
  projects: (loc) => <CodeSymbol location={loc} />,
}

/** Every portfolio landmark standing on the planet. */
export function Locations() {
  return (
    <>
      {LOCATIONS.map((loc) => (
        <LocationPod key={loc.id} location={loc}>
          {SYMBOLS[loc.id]?.(loc)}
        </LocationPod>
      ))}
    </>
  )
}
