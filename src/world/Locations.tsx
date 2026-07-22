import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, ExtrudeGeometry, MeshStandardMaterial, Path, Shape } from 'three'
import { LOCATIONS } from '@/content/locations'
import type { WorldLocation } from '@/content/locations'
import { LocationPod } from '@/world/LocationPod'
import { useWorldStore } from '@/store/useWorldStore'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { expDamp } from '@/lib/math/damp'
import { GLOW } from '@/lib/designSystem'

/**
 * Location symbols — molded flush into each monument's face like a
 * two-shot injection: rounded accent-colored forms half-sunk into the
 * white/frosted body so they read as manufactured-in app-icon glyphs.
 * The accent lives HERE (and in the label), not on the panel body —
 * Peter's call 2026-07-19, matching the reference's white cards with
 * colored icons. Each symbol breathes a soft glow and brightens on
 * approach.
 */

/** Shared breathing-glow material + animation for every symbol. The
 *  color is the accent pushed deeper/more saturated (matching the
 *  label ink in LocationPod) so glyphs read confidently against the
 *  white card; the emissive breathing stays on the raw accent. */
function useSymbolMaterial(location: WorldLocation): MeshStandardMaterial {
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(location.accent).offsetHSL(0, 0.26, -0.13),
        roughness: 0.3,
        emissive: location.accent,
        emissiveIntensity: 0.22,
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

// ---- Flat relief icon toolkit ---------------------------------------
// Every icon is built from 2D shapes extruded to ONE consistent depth,
// so the six glyphs read as clean flat relief embossed off the panel —
// no varied bumps, no round capsules (the earlier sphere+cone About
// person was the worst offender). Geometries are module-level (built
// once); the accent material is per-location.
const RELIEF = {
  depth: 0.08,
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.012,
  bevelSegments: 2,
}

function roundedRect(w: number, h: number, r: number): Shape {
  const s = new Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}
const barGeo = (len: number, thick = 0.12) =>
  new ExtrudeGeometry(roundedRect(len, thick, thick * 0.5), RELIEF)
const panelGeo = (w: number, h: number, r = 0.06) =>
  new ExtrudeGeometry(roundedRect(w, h, r), RELIEF)
const discGeo = (r: number) => {
  const s = new Shape()
  s.absarc(0, 0, r, 0, Math.PI * 2, false)
  return new ExtrudeGeometry(s, RELIEF)
}
const ringGeo = (ro: number, ri: number) => {
  const s = new Shape()
  s.absarc(0, 0, ro, 0, Math.PI * 2, false)
  const hole = new Path()
  hole.absarc(0, 0, ri, 0, Math.PI * 2, true)
  s.holes.push(hole)
  return new ExtrudeGeometry(s, RELIEF)
}
const triGeo = (halfW: number, drop: number) => {
  const s = new Shape()
  s.moveTo(-halfW, 0)
  s.lineTo(halfW, 0)
  s.lineTo(-halfW * 0.3, -drop)
  s.closePath()
  return new ExtrudeGeometry(s, RELIEF)
}

/** One extruded relief piece sharing the icon's accent material. */
function Part({
  material,
  geo,
  x = 0,
  y = 0,
  rot = 0,
}: {
  material: MeshStandardMaterial
  geo: ExtrudeGeometry
  x?: number
  y?: number
  rot?: number
}) {
  return <mesh material={material} geometry={geo} position={[x, y, 0]} rotation={[0, 0, rot]} />
}

// ---- The six glyphs, as flat relief ---------------------------------
const CODE = { bar: barGeo(0.3, 0.12), slash: barGeo(0.5, 0.12) }
function CodeSymbol({ location }: { location: WorldLocation }) {
  const m = useSymbolMaterial(location)
  return (
    <group>
      <Part material={m} geo={CODE.bar} x={-0.28} y={0.11} rot={-1.02} />
      <Part material={m} geo={CODE.bar} x={-0.28} y={-0.11} rot={1.02} />
      <Part material={m} geo={CODE.slash} rot={-0.34} />
      <Part material={m} geo={CODE.bar} x={0.28} y={0.11} rot={1.02} />
      <Part material={m} geo={CODE.bar} x={0.28} y={-0.11} rot={-1.02} />
    </group>
  )
}

const BRIEF = {
  body: panelGeo(0.5, 0.34, 0.08),
  handleTop: barGeo(0.22, 0.075),
  handleSide: barGeo(0.1, 0.075),
  clasp: barGeo(0.16, 0.06),
}
function BriefcaseSymbol({ location }: { location: WorldLocation }) {
  const m = useSymbolMaterial(location)
  return (
    <group>
      <Part material={m} geo={BRIEF.body} y={-0.03} />
      <Part material={m} geo={BRIEF.handleTop} y={0.19} />
      <Part material={m} geo={BRIEF.handleSide} x={-0.1} y={0.14} rot={Math.PI / 2} />
      <Part material={m} geo={BRIEF.handleSide} x={0.1} y={0.14} rot={Math.PI / 2} />
      <Part material={m} geo={BRIEF.clasp} y={-0.03} />
    </group>
  )
}

const GEAR = { ring: ringGeo(0.19, 0.1), pad: panelGeo(0.12, 0.12, 0.04) }
function GearSymbol({ location }: { location: WorldLocation }) {
  const m = useSymbolMaterial(location)
  const pads = [0, 1, 2, 3].map((i) => (i * Math.PI) / 2)
  return (
    <group>
      <Part material={m} geo={GEAR.ring} />
      {pads.map((a, i) => (
        <Part key={i} material={m} geo={GEAR.pad} x={Math.cos(a) * 0.19} y={Math.sin(a) * 0.19} rot={a} />
      ))}
    </group>
  )
}

const CHAT = { body: panelGeo(0.48, 0.34, 0.1), tail: triGeo(0.07, 0.14), dot: discGeo(0.035) }
function ChatSymbol({ location }: { location: WorldLocation }) {
  const m = useSymbolMaterial(location)
  return (
    <group>
      <Part material={m} geo={CHAT.body} y={0.04} />
      <Part material={m} geo={CHAT.tail} x={-0.12} y={-0.13} />
      <Part material={m} geo={CHAT.dot} x={-0.12} y={0.04} />
      <Part material={m} geo={CHAT.dot} x={0} y={0.04} />
      <Part material={m} geo={CHAT.dot} x={0.12} y={0.04} />
    </group>
  )
}

const DOC = { page: panelGeo(0.36, 0.5, 0.05), line: barGeo(0.22, 0.05), lineShort: barGeo(0.14, 0.05), fold: triGeo(0.08, 0.08) }
function DocumentSymbol({ location }: { location: WorldLocation }) {
  const m = useSymbolMaterial(location)
  return (
    <group>
      <Part material={m} geo={DOC.page} />
      <Part material={m} geo={DOC.line} y={0.09} rot={Math.PI / 2} />
      <Part material={m} geo={DOC.line} y={-0.02} rot={Math.PI / 2} />
      <Part material={m} geo={DOC.lineShort} x={-0.04} y={-0.13} rot={Math.PI / 2} />
    </group>
  )
}

const PERSON = (() => {
  const shoulder = new Shape()
  shoulder.absellipse(0, 0, 0.3, 0.24, 0, Math.PI, false)
  return { head: discGeo(0.14), shoulders: new ExtrudeGeometry(shoulder, RELIEF) }
})()
function PersonSymbol({ location }: { location: WorldLocation }) {
  const m = useSymbolMaterial(location)
  return (
    <group>
      <Part material={m} geo={PERSON.head} y={0.14} />
      <Part material={m} geo={PERSON.shoulders} y={-0.2} />
    </group>
  )
}

/** Per-symbol uniform scale so every glyph lands at ~35-40% of the
 *  panel's width — the raw primitive builds range from 0.36 to 0.9
 *  wide, far too uneven. Scaled up 1.41x with the enlarged 2.96-wide
 *  body (2026-07-20). */
const SYMBOL_SCALE: Record<string, number> = {
  about: 1.5,
  projects: 1.35,
  experience: 1.65,
  skills: 1.7,
  contact: 1.65,
  resume: 1.55,
}

const SYMBOLS: Record<string, (loc: WorldLocation) => ReactNode> = {
  about: (loc) => <PersonSymbol location={loc} />,
  projects: (loc) => <CodeSymbol location={loc} />,
  experience: (loc) => <BriefcaseSymbol location={loc} />,
  skills: (loc) => <GearSymbol location={loc} />,
  contact: (loc) => <ChatSymbol location={loc} />,
  resume: (loc) => <DocumentSymbol location={loc} />,
}

/** Every portfolio landmark standing on the plaza. */
export function Locations() {
  return (
    <>
      {LOCATIONS.map((loc) => (
        <LocationPod key={loc.id} location={loc}>
          <group scale={SYMBOL_SCALE[loc.id] ?? 1}>{SYMBOLS[loc.id]?.(loc)}</group>
        </LocationPod>
      ))}
    </>
  )
}
