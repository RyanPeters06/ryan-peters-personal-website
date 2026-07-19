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
import { Lamppost } from '@/world/Lamppost'
import { FlowerTuft } from '@/world/FlowerTuft'
import fontUrl from '@fontsource/quicksand/files/quicksand-latin-700-normal.woff?url'

/**
 * A landmark pod — the design language every location inherits.
 *
 * A giant app icon that became architecture, standing on its own
 * small grassy mound (a truncated cone: flat top, sloped sides,
 * steps embedded in the front) so each landmark reads as its own
 * little place, not just a sign stuck in the shared plaza:
 *
 *   1. MOUND — grass-topped hill, three steps down to the plaza.
 *   2. BODY — one continuous pillowy white monolith (extremely soft
 *      bevels), its base sunk into a swell atop the mound.
 *   3. INSET FACE — a flush, accent-washed panel molded into the
 *      front, barely proud of the surface (two-shot molding).
 *   4. SYMBOL + LABEL — the location's rounded glyph and its name in
 *      the accent color, molded onto the face.
 *   5. DRESSING — two flanking trees, a lamppost, a flower tuft.
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
  const { mound: M } = POD
  // The monument now stands on the mound's flat top, not the plaza floor.
  const bodyY = M.height + B.height / 2 - B.sink

  const materials = useMemo(() => {
    const accent = new Color(location.accent)
    return {
      // The monument body: premium soft-touch plastic, accent
      // breathing faintly from within.
      body: new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.16,
        emissive: accent,
        emissiveIntensity: GLOW.bodyIdle,
      }),
      // The inset face: white washed lightly with the accent — the
      // landmark's "inner panel", flush-molded like the UI cards.
      face: new MeshStandardMaterial({
        color: new Color('#ffffff').lerp(accent, 0.16),
        roughness: 0.2,
        emissive: accent,
        emissiveIntensity: 0.05,
      }),
      // The swell atop the mound, meeting the monument — ground
      // material, so it reads as the mound rising, never a pedestal.
      swell: new MeshStandardMaterial({ color: PALETTE.ground, roughness: 0.5 }),
      // The mound: a grassy hill the pod stands on.
      moundTop: new MeshStandardMaterial({ color: PALETTE.grass, roughness: ROUGHNESS.foliage }),
      step: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 }),
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
      {/* The mound: a grassy hill, flat on top, sloped sides meeting
          the plaza flush at its base — the pod's own little place. */}
      <mesh
        material={materials.moundTop}
        position={[0, M.height / 2, 0]}
        receiveShadow
        castShadow
      >
        <cylinderGeometry args={[M.topRadius, M.baseRadius, M.height, 28]} />
      </mesh>
      {/* Three steps embedded in the mound's front slope, descending
          toward the plaza (+Z, the direction the pod faces). */}
      {POD.steps.map((s, i) => (
        <RoundedBox
          key={i}
          args={[s.width, 0.16, s.depth]}
          radius={0.05}
          smoothness={3}
          position={[0, s.y, s.z]}
          material={materials.step}
          receiveShadow
          castShadow
        />
      ))}
      {/* Dressing: two flanking trees, a lamppost, a flower tuft —
          all riding on the mound's flat top. */}
      <group position={[-POD.trees.x, M.height, POD.trees.z]}>
        <Tree variant={location.treeVariant} scale={1.7} />
      </group>
      <group position={[POD.trees.x, M.height, POD.trees.z]}>
        <Tree variant={location.treeVariant} scale={1.85} />
      </group>
      <group position={[POD.lamp.x, M.height, POD.lamp.z]}>
        <Lamppost />
      </group>
      <group position={[POD.flowers.x, M.height, POD.flowers.z]}>
        <FlowerTuft />
      </group>
      {/* The mound top rising gently to meet the monument */}
      <RoundedBox
        args={[S.width, S.height, S.depth]}
        radius={S.radius}
        smoothness={4}
        position={[0, M.height + S.height / 2 - S.sink, 0]}
        material={materials.swell}
        receiveShadow
      />
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
      {/* 2 — the inset face: flush accent-washed panel */}
      <RoundedBox
        args={[B.faceWidth, B.faceHeight, 0.1]}
        radius={B.faceRadius}
        smoothness={6}
        position={[0, bodyY + 0.05, B.depth / 2 - 0.042]}
        material={materials.face}
      />
      {/* 3a — the symbol, molded into the face's upper half */}
      <group position={[0, M.height + LANDMARK.symbol.centerY, B.depth / 2 + 0.028]}>
        {children}
      </group>
      {/* 3b — the label: the location's name in its accent */}
      <Text
        font={fontUrl}
        fontSize={0.24}
        letterSpacing={0.08}
        color={location.accent}
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
