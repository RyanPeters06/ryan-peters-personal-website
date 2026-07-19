import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { Color, MeshStandardMaterial } from 'three'
import type { WorldLocation } from '@/content/locations'
import { useFlatPosition } from '@/hooks/useFlatPosition'
import { useWorldStore } from '@/store/useWorldStore'
import { avatarPose } from '@/systems/movement/avatarPose'
import { expDamp } from '@/lib/math/damp'
import { PALETTE } from '@/lib/constants'
import { GLOW, LANDMARK, POD, ROUGHNESS } from '@/lib/designSystem'
import { Tree } from '@/world/Tree'
import { FlowerTuft } from '@/world/FlowerTuft'
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

  const { body: B, swell: S } = LANDMARK
  const { platform: P } = POD
  // The monument now stands on the platform's top, not the bare floor.
  const bodyY = P.height + B.height / 2 - B.sink

  const materials = useMemo(() => {
    const accent = new Color(location.accent)
    // Saturated pastel card — the body itself carries the color, not
    // just a faint wash on an inset panel (the earlier white-body
    // treatment was the main source of the "washed out" look).
    const bodyColor = new Color('#ffffff').lerp(accent, 0.68)
    const faceColor = new Color('#ffffff').lerp(accent, 0.52)
    return {
      body: new MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.26,
        emissive: accent,
        emissiveIntensity: GLOW.bodyIdle,
      }),
      // The inset face: a touch lighter than the body — the two-shot
      // molding cue — but the same color family, never white-on-color.
      face: new MeshStandardMaterial({
        color: faceColor,
        roughness: 0.22,
        emissive: accent,
        emissiveIntensity: 0.05,
      }),
      // The swell atop the platform, meeting the monument — ground
      // material, so it reads as the platform rising, never a pedestal.
      swell: new MeshStandardMaterial({ color: PALETTE.ground, roughness: 0.5 }),
      // The platform: same white tile family as the shared plaza floor.
      platform: new MeshStandardMaterial({ color: PALETTE.ground, roughness: 0.5 }),
      step: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 }),
      grassTrim: new MeshStandardMaterial({ color: PALETTE.grass, roughness: ROUGHNESS.foliage }),
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
    materials.face.emissiveIntensity = glow.current + 0.02
  })

  return (
    <group position={position} quaternion={quaternion}>
      <group rotation-y={yaw}>
      {/* The platform: barely raised, same white tile family as the
          shared plaza floor — reads as ONE continuous ground, not a
          separate island. */}
      <RoundedBox
        args={[P.width, P.height, P.depth]}
        radius={P.radius}
        smoothness={4}
        position={[0, P.height / 2, 0]}
        material={materials.platform}
        receiveShadow
        castShadow
      />
      {/* A thin grass trim behind the platform — a hint of planting,
          not a hill. */}
      <mesh
        material={materials.grassTrim}
        position={[0, POD.grassTrim.height / 2, POD.grassTrim.z]}
        receiveShadow
      >
        <boxGeometry args={[POD.grassTrim.width, POD.grassTrim.height, POD.grassTrim.depth]} />
      </mesh>
      {/* Two shallow steps down to the plaza (+Z, the direction the
          pod faces). */}
      {POD.steps.map((s, i) => (
        <RoundedBox
          key={i}
          args={[s.width, s.height, s.depth]}
          radius={0.04}
          smoothness={3}
          position={[0, s.y, s.z]}
          material={materials.step}
          receiveShadow
          castShadow
        />
      ))}
      {/* Dressing tied to the pod itself: one flanking tree, a flower
          tuft at the base of the steps. */}
      <group position={[POD.tree.x, P.height, POD.tree.z]}>
        <Tree variant={location.treeVariant} scale={1.8} />
      </group>
      <group position={[POD.flowers.x, 0, POD.flowers.z]}>
        <FlowerTuft />
      </group>
      {/* The platform top rising gently to meet the monument */}
      <RoundedBox
        args={[S.width, S.height, S.depth]}
        radius={S.radius}
        smoothness={4}
        position={[0, P.height + S.height / 2 - S.sink, 0]}
        material={materials.swell}
        receiveShadow
      />
      {/* 1 — the body: one continuous pillowy monolith, saturated in
          the location's accent */}
      <RoundedBox
        args={[B.width, B.height, B.depth]}
        radius={B.radius}
        smoothness={8}
        position={[0, bodyY, 0]}
        material={materials.body}
        castShadow
        receiveShadow
      />
      {/* 2 — the inset face: a touch lighter, same color family */}
      <RoundedBox
        args={[B.faceWidth, B.faceHeight, 0.1]}
        radius={B.faceRadius}
        smoothness={6}
        position={[0, bodyY + 0.05, B.depth / 2 - 0.042]}
        material={materials.face}
      />
      {/* 3a — the symbol, molded into the face's upper half */}
      <group position={[0, P.height + LANDMARK.symbol.centerY, B.depth / 2 + 0.028]}>
        {children}
      </group>
      {/* 3b — the label: white/cream, readable against the saturated card */}
      <Text
        font={fontUrl}
        fontSize={0.24}
        letterSpacing={0.08}
        color="#fffdf9"
        anchorX="center"
        anchorY="middle"
        position={[0, bodyY - 0.62, B.depth / 2 + 0.02]}
      >
        {location.name}
      </Text>
      </group>
    </group>
  )
}
