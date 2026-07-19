import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshStandardMaterial } from 'three'
import { LOCATIONS } from '@/content/locations'
import type { WorldLocation } from '@/content/locations'
import { LocationPod } from '@/world/LocationPod'
import { useWorldStore } from '@/store/useWorldStore'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { expDamp } from '@/lib/math/damp'
import { GLOW, LANDMARK } from '@/lib/designSystem'

/**
 * Location symbols — molded flush into each monument's face like a
 * two-shot injection: rounded white/cream forms half-sunk into the
 * (now saturated, accent-colored) body so they read as manufactured-in
 * app-icon glyphs, high-contrast against the card the way the
 * reference's icons are — never accent-on-accent. Each symbol breathes
 * a soft accent-tinted glow from underneath and brightens on approach.
 */

/** Off-white the symbols are molded in — reads crisply against every
 *  accent card, unlike the earlier accent-on-white treatment. */
const SYMBOL_COLOR = '#fdfaf5'

/** Shared breathing-glow material + animation for every symbol. */
function useSymbolMaterial(location: WorldLocation): MeshStandardMaterial {
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: SYMBOL_COLOR,
        roughness: 0.3,
        emissive: location.accent,
        emissiveIntensity: 0.14,
      }),
    [location.accent],
  )

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const active = useWorldStore.getState().activeLocation === location.id
    const target =
      (active ? GLOW.symbolNear : GLOW.symbolIdle) +
      Math.sin(getAmbientTime() * 1.2) * GLOW.symbolBreath
    material.emissiveIntensity = expDamp(material.emissiveIntensity, target, GLOW.lambda, dt)
  })

  return material
}

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
      <capsuleGeometry args={[LANDMARK.symbol.barRadius, length, 6, 12]} />
    </mesh>
  )
}

/** Projects: an original rounded, friendly </> mark. */
function CodeSymbol({ location }: { location: WorldLocation }) {
  const material = useSymbolMaterial(location)
  return (
    <group>
      {/* < */}
      <Bar material={material} x={-0.3} y={0.105} tilt={-1.05} length={0.27} />
      <Bar material={material} x={-0.3} y={-0.105} tilt={1.05} length={0.27} />
      {/* / */}
      <Bar material={material} x={0} y={0} tilt={-0.32} length={0.42} />
      {/* > */}
      <Bar material={material} x={0.3} y={0.105} tilt={1.05} length={0.27} />
      <Bar material={material} x={0.3} y={-0.105} tilt={-1.05} length={0.27} />
    </group>
  )
}

/** Experience: a rounded briefcase — body, handle, divider line. */
function BriefcaseSymbol({ location }: { location: WorldLocation }) {
  const material = useSymbolMaterial(location)
  return (
    <group>
      <mesh material={material} position={[0, -0.03, 0]}>
        <boxGeometry args={[0.52, 0.36, 0.05]} />
      </mesh>
      <mesh material={material} position={[0, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.032, 8, 16, Math.PI]} />
      </mesh>
      <Bar material={material} x={0} y={-0.03} tilt={Math.PI / 2} length={0.4} />
    </group>
  )
}

/** Skills: a rounded gear — ring, six teeth, center hub. */
function GearSymbol({ location }: { location: WorldLocation }) {
  const material = useSymbolMaterial(location)
  const teeth = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2)
  return (
    <group>
      <mesh material={material}>
        <torusGeometry args={[0.16, 0.045, 10, 24]} />
      </mesh>
      <mesh material={material}>
        <sphereGeometry args={[0.075, 14, 12]} />
      </mesh>
      {teeth.map((a, i) => (
        <mesh
          key={i}
          material={material}
          position={[Math.cos(a) * 0.23, Math.sin(a) * 0.23, 0]}
          rotation={[0, 0, a]}
        >
          <boxGeometry args={[0.09, 0.07, 0.05]} />
        </mesh>
      ))}
    </group>
  )
}

/** Contact: a rounded chat bubble with a small tail and ellipsis. */
function ChatSymbol({ location }: { location: WorldLocation }) {
  const material = useSymbolMaterial(location)
  return (
    <group>
      <mesh material={material} position={[0, 0.03, 0]}>
        <boxGeometry args={[0.5, 0.34, 0.05]} />
      </mesh>
      <mesh material={material} position={[-0.16, -0.18, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.07, 0.11, 3]} />
      </mesh>
      <Bar material={material} x={-0.12} y={0.03} tilt={Math.PI / 2} length={0.04} />
      <Bar material={material} x={0} y={0.03} tilt={Math.PI / 2} length={0.04} />
      <Bar material={material} x={0.12} y={0.03} tilt={Math.PI / 2} length={0.04} />
    </group>
  )
}

/** Resume: a rounded document — page, folded corner, three text lines. */
function DocumentSymbol({ location }: { location: WorldLocation }) {
  const material = useSymbolMaterial(location)
  return (
    <group>
      <mesh material={material}>
        <boxGeometry args={[0.36, 0.48, 0.05]} />
      </mesh>
      <mesh material={material} position={[0.12, 0.19, 0.01]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.1, 0.1, 0.04]} />
      </mesh>
      <Bar material={material} x={0} y={0.05} tilt={Math.PI / 2} length={0.22} />
      <Bar material={material} x={0} y={-0.06} tilt={Math.PI / 2} length={0.22} />
      <Bar material={material} x={-0.03} y={-0.17} tilt={Math.PI / 2} length={0.16} />
    </group>
  )
}

/** About: a rounded person mark — head over shoulders. */
function PersonSymbol({ location }: { location: WorldLocation }) {
  const material = useSymbolMaterial(location)
  return (
    <group>
      <mesh material={material} position={[0, 0.17, 0]}>
        <sphereGeometry args={[0.115, 18, 14]} />
      </mesh>
      <mesh material={material} position={[0, -0.13, 0]}>
        <coneGeometry args={[0.21, 0.3, 20]} />
      </mesh>
    </group>
  )
}

const SYMBOLS: Record<string, (loc: WorldLocation) => ReactNode> = {
  about: (loc) => <PersonSymbol location={loc} />,
  projects: (loc) => <CodeSymbol location={loc} />,
  experience: (loc) => <BriefcaseSymbol location={loc} />,
  skills: (loc) => <GearSymbol location={loc} />,
  contact: (loc) => <ChatSymbol location={loc} />,
  resume: (loc) => <DocumentSymbol location={loc} />,
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
