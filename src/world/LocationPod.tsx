import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { Color, MeshStandardMaterial } from 'three'
import type { WorldLocation } from '@/content/locations'
import { useFlatPosition } from '@/hooks/useFlatPosition'
import { useWorldStore } from '@/store/useWorldStore'
import { avatarPose } from '@/systems/movement/avatarPose'
import { expDamp } from '@/lib/math/damp'
import { clay } from '@/lib/clay'
import { PALETTE } from '@/lib/constants'
import { GLOW, LANDMARK, POD, ROUGHNESS } from '@/lib/designSystem'
import { Tree } from '@/world/Tree'
import { FlowerTuft } from '@/world/FlowerTuft'
import { GrassTuft } from '@/world/GrassTuft'
import { Bush } from '@/world/Bush'
import fontUrl from '@fontsource/quicksand/files/quicksand-latin-700-normal.woff?url'

/**
 * A landmark pod — the design language every location inherits.
 *
 * A giant app icon that became architecture, standing on a low,
 * subtle platform (two shallow steps, the shared white tile material)
 * so it reads as part of ONE continuous plaza floor, never a separate
 * floating island:
 *
 *   1. PLATFORM — barely raised, white tile, two steps down to the
 *      plaza; a thin grass trim behind is the only planting on the
 *      platform itself.
 *   2. BODY — one continuous pillowy monolith, saturated in the
 *      location's own accent (a solid color card, not white).
 *   3. INSET FACE — a subtly lighter panel molded into the front
 *      (two-shot molding), still the same color family as the body.
 *   4. SYMBOL + LABEL — a white/cream glyph and name, readable against
 *      the saturated card.
 *   5. DRESSING — one flanking tree, a flower tuft. (Lampposts, the
 *      bench, and extra flowers live in world/PlazaDressing.tsx,
 *      scattered across the open plaza instead of clustered here.)
 *
 * Nothing is assembled; everything reads as manufactured in one pour.
 * The accent breathes as light inside the body and brightens on
 * approach — architecture's life is light, not motion.
 */
export function LocationPod({
  location,
  children,
}: {
  location: WorldLocation
  /** The location's symbol, rendered flush against the inset face. */
  children?: React.ReactNode
}) {
  const { position, quaternion } = useFlatPosition(location.x, location.z)
  const near = useRef(false)
  const glow = useRef<number>(GLOW.bodyIdle)

  // Turn the monument to face the plaza center (the fountain) — the
  // tableau's horseshoe. Flat ground, so this is a plain yaw.
  const yaw = useMemo(
    () => Math.atan2(-location.x, -location.z),
    [location.x, location.z],
  )

  const B = LANDMARK.body
  // Surface height of the grass DOME at a local (x, z) — an ellipsoid
  // cap, so dressing sits ON the mound instead of floating above a flat
  // disc. Peak at center (POD_TOP_Y), falling to the rim at the edge.
  const domeY = (x: number, z: number): number => {
    const { rx, rz, cap } = POD.grass
    const t = 1 - (x * x) / (rx * rx) - (z * z) / (rz * rz)
    return POD.base.height + cap * Math.sqrt(Math.max(0, t))
  }
  // The monument stands on the mound at its offset, sunk slightly in.
  const monBaseY = domeY(0, POD.monumentZ)
  const bodyY = monBaseY + B.height / 2 - B.sink

  // The icon/label ink: the accent pushed deeper and more saturated so
  // it's confidently legible on the white card at viewing distance —
  // the raw pastel accents (tuned for tinting surfaces) read washed
  // out as text. Same hue, just more ink.
  const inkAccent = useMemo(
    () => `#${new Color(location.accent).offsetHSL(0, 0.26, -0.13).getHexString()}`,
    [location.accent],
  )

  const materials = useMemo(() => {
    const accent = new Color(location.accent)
    // The inset face: soft-clay white carrying a RADIAL ACCENT GLOW that
    // matches the icon's colour (Peter's call, 2026-07-21, reversing the
    // earlier flat-white face). A flat accent tint read "greenish" — a
    // radial glow, brightest behind the icon and fading to white at the
    // rim, reads as soft *lighting* instead, which is what the reference
    // has. Plus a uniform accent emissive so the face gently lights up.
    const face = clay({
      color: '#ffffff',
      roughness: 0.4,
      sheen: 0.3,
      emissive: location.accent,
      emissiveIntensity: 0.12,
    })
    const W = (LANDMARK.body.faceWidth * 0.5).toFixed(4)
    const H = (LANDMARK.body.faceHeight * 0.5).toFixed(4)
    const [ar, ag, ab] = [accent.r.toFixed(4), accent.g.toFixed(4), accent.b.toFixed(4)]
    face.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
varying vec3 vFaceLocal;`,
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
vFaceLocal = position;`,
        )
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
varying vec3 vFaceLocal;`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
{
  // Radial distance from the face center, normalized to its half-size.
  vec2 fp = vec2(vFaceLocal.x / ${W}, vFaceLocal.y / ${H});
  float glow = smoothstep(1.15, 0.05, length(fp));   // 1 center .. 0 rim
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(${ar}, ${ag}, ${ab}), glow * 0.26);
}`,
        )
    }
    return {
      // Soft-clay white body with the accent breathing from within.
      body: clay({
        color: '#ffffff',
        roughness: 0.5,
        sheen: 0.4,
        emissive: location.accent,
        emissiveIntensity: GLOW.bodyIdle,
      }),
      face,
      // The island's white rim base + steps: soft-clay white.
      base: clay({ color: '#ffffff', roughness: 0.5, sheen: 0.35 }),
      step: clay({ color: '#ffffff', roughness: 0.5, sheen: 0.35 }),
      // The grass top the monument and dressing stand on.
      grass: new MeshStandardMaterial({ color: PALETTE.grass, roughness: ROUGHNESS.foliage }),
    }
  }, [location.accent])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const store = useWorldStore.getState()

    // --- proximity (only while the visitor is in control) -------------
    const roaming = store.phase === 'idle' || store.phase === 'exploring'
    const d = avatarPose.position.distanceTo(position)
    if (roaming && !near.current && d < LANDMARK.enterDistance) {
      near.current = true
      store.setActiveLocation(location.id)
    } else if (near.current && (d > LANDMARK.exitDistance || !roaming)) {
      near.current = false
      if (store.activeLocation === location.id) store.setActiveLocation(null)
    }

    // --- the accent breathes brighter as you approach -----------------
    glow.current = expDamp(
      glow.current,
      near.current ? GLOW.bodyNear : GLOW.bodyIdle,
      GLOW.lambda,
      dt,
    )
    materials.body.emissiveIntensity = glow.current
    materials.face.emissiveIntensity = glow.current + 0.1
  })

  return (
    <group position={position} quaternion={quaternion}>
      <group rotation-y={yaw}>
        {/* The island: a low OVAL grass disc inside a white rim
            (elliptical scaled cylinders), matching the reference's
            rounded blob islands — not a rounded rectangle. */}
        <mesh
          material={materials.base}
          position={[0, POD.base.height / 2, 0]}
          scale={[POD.base.rx, POD.base.height, POD.base.rz]}
          receiveShadow
          castShadow
        >
          <cylinderGeometry args={[1, 1, 1, 48]} />
        </mesh>
        {/* The grass MOUND: a low convex dome (top-hemisphere ellipsoid)
            so the island reads as a rounded grassy knoll, not a coin. */}
        <mesh
          material={materials.grass}
          position={[0, POD.base.height, 0]}
          scale={[POD.grass.rx, POD.grass.cap, POD.grass.rz]}
          receiveShadow
          castShadow
        >
          <sphereGeometry args={[1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        {/* Two low steps down to the plaza (+Z front). */}
        {POD.steps.map((s, i) => (
          <RoundedBox
            key={i}
            args={[s.width, s.height, s.depth]}
            radius={0.05}
            smoothness={3}
            position={[0, s.y, s.z]}
            material={materials.step}
            receiveShadow
            castShadow
          />
        ))}
        {/* Trees, bushes, flowers, and grass tufts planted ON the dome. */}
        {POD.trees.map((t, i) => (
          <group key={i} position={[t.x, domeY(t.x, t.z) - 0.05, t.z]}>
            <Tree variant={location.treeVariant} scale={2.0} />
          </group>
        ))}
        {POD.bushes.map((b, i) => (
          <group key={i} position={[b.x, domeY(b.x, b.z) - 0.04, b.z]}>
            <Bush />
          </group>
        ))}
        {POD.flowers.map((fl, i) => (
          <group key={i} position={[fl.x, domeY(fl.x, fl.z) - 0.02, fl.z]}>
            <FlowerTuft />
          </group>
        ))}
        {POD.grassTufts.map((g, i) => (
          <group key={i} position={[g.x, domeY(g.x, g.z) - 0.1, g.z]}>
            <GrassTuft />
          </group>
        ))}

        {/* The monument, toward the back of the grass so the visitor
            reads its face across the greenery. */}
        <group position={[0, 0, POD.monumentZ]}>
          {/* 1 — the body: one continuous pillowy monolith */}
          <RoundedBox
            args={[B.width, B.height, B.depth]}
            radius={B.radius}
            smoothness={8}
            position={[0, bodyY, 0]}
            material={materials.body}
            castShadow
            receiveShadow
          />
          {/* 2 — the inset face: a touch lighter, gently sun-graded */}
          <RoundedBox
            args={[B.faceWidth, B.faceHeight, 0.12]}
            radius={B.faceRadius}
            smoothness={6}
            position={[0, bodyY + 0.06, B.depth / 2 - 0.05]}
            material={materials.face}
          />
          {/* 3a — the symbol, molded into the face's upper half */}
          <group position={[0, monBaseY + LANDMARK.symbol.centerY, B.depth / 2 + 0.03]}>
            {children}
          </group>
          {/* 3b — the label: beneath the icon, well inside the face,
              width-capped so long names ("Experience") never bleed past
              the face onto the body's bevels. */}
          <Text
            font={fontUrl}
            fontSize={0.34}
            maxWidth={B.faceWidth * 0.9}
            letterSpacing={0.03}
            color={inkAccent}
            anchorX="center"
            anchorY="middle"
            position={[0, bodyY - 0.18, B.depth / 2 + 0.02]}
          >
            {location.name}
          </Text>
        </group>
      </group>
    </group>
  )
}
