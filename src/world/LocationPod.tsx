import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { Color, MeshStandardMaterial, Vector3 } from 'three'
import type { WorldLocation } from '@/content/locations'
import { useSphericalPosition } from '@/hooks/useSphericalPosition'
import { useWorldStore } from '@/store/useWorldStore'
import { avatarPose } from '@/systems/movement/avatarPose'
import { expDamp } from '@/lib/math/spherical'
import { PALETTE, PLANET_RADIUS } from '@/lib/constants'
import { GLOW, LANDMARK } from '@/lib/designSystem'
import fontUrl from '@fontsource/quicksand/files/quicksand-latin-700-normal.woff?url'

/**
 * A landmark monument — the design language every location inherits.
 *
 * A giant app icon that became architecture, built exactly like the
 * UI's pillow shell so building and interface are one system:
 *
 *   1. BODY — one continuous pillowy white monolith (extremely soft
 *      bevels), its base sunk into a swell of the floor itself.
 *   2. INSET FACE — a flush, accent-washed panel molded into the
 *      front, barely proud of the surface (two-shot molding).
 *   3. SYMBOL + LABEL — the location's rounded glyph and its name in
 *      the accent color, molded onto the face.
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
  const { position, quaternion } = useSphericalPosition(location.lat, location.lon)
  const near = useRef(false)
  const glow = useRef<number>(GLOW.bodyIdle)

  // Turn the monument on its local up axis so its face points at the
  // plaza center (the fountain at the crown) — the tableau's horseshoe.
  const yaw = useMemo(() => {
    const up = position.clone().normalize()
    const forward = new Vector3(0, 0, 1).applyQuaternion(quaternion)
    const toCenter = new Vector3(0, PLANET_RADIUS, 0).sub(position)
    toCenter.addScaledVector(up, -toCenter.dot(up))
    if (toCenter.lengthSq() < 1e-8) return 0
    toCenter.normalize()
    const cross = new Vector3().crossVectors(forward, toCenter)
    return Math.atan2(cross.dot(up), forward.dot(toCenter))
  }, [position, quaternion])

  const { body: B, swell: S } = LANDMARK
  const bodyY = B.height / 2 - B.sink

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
      // The floor swelling up to meet the monument — ground material,
      // so it reads as the world rising, never a pedestal.
      swell: new MeshStandardMaterial({ color: PALETTE.ground, roughness: 0.5 }),
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
      {/* The floor rising gently to meet the monument */}
      <RoundedBox
        args={[S.width, S.height, S.depth]}
        radius={S.radius}
        smoothness={4}
        position={[0, S.height / 2 - S.sink, 0]}
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
      <group position={[0, LANDMARK.symbol.centerY, B.depth / 2 + 0.028]}>
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
