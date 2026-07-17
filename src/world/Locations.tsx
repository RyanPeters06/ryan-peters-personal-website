import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { LOCATIONS } from '@/content/locations'
import { LocationPod } from '@/world/LocationPod'
import { PALETTE } from '@/lib/constants'

/** Primitive glyph: a tiny friendly computer for the Projects pod. */
function ProjectsGlyph() {
  const materials = useMemo(
    () => ({
      screen: new MeshStandardMaterial({ color: PALETTE.face, roughness: 0.3 }),
      body: new MeshStandardMaterial({ color: PALETTE.shirt, roughness: 0.4 }),
    }),
    [],
  )
  return (
    <group scale={0.9}>
      {/* monitor */}
      <mesh material={materials.body} position={[0, 0.06, 0]}>
        <boxGeometry args={[0.44, 0.3, 0.06]} />
      </mesh>
      <mesh material={materials.screen} position={[0, 0.06, 0.033]}>
        <boxGeometry args={[0.36, 0.22, 0.01]} />
      </mesh>
      {/* stand + base */}
      <mesh material={materials.body} position={[0, -0.13, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 10]} />
      </mesh>
      <mesh material={materials.body} position={[0, -0.185, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.03, 14]} />
      </mesh>
    </group>
  )
}

const GLYPHS: Record<string, React.ReactNode> = {
  projects: <ProjectsGlyph />,
}

/** Every portfolio destination standing on the planet. */
export function Locations() {
  return (
    <>
      {LOCATIONS.map((loc) => (
        <LocationPod key={loc.id} location={loc}>
          {GLYPHS[loc.id]}
        </LocationPod>
      ))}
    </>
  )
}
