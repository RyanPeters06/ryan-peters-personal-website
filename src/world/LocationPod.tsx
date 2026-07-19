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
    // White/frosted card (Peter's call, 2026-07-19, matching the
    // reference): the body is soft white plastic like every other
    // neutral surface — the accent lives ONLY in the icon glyph and
    // the label text, plus a whisper of emissive breathing from
    // within.
    // The face carries a very gentle diagonal gradient (brighter
    // top-left, softly shaded bottom-right, echoing the sun) baked in
    // via onBeforeCompile — NO accent tint (the earlier 14% wash still
    // read as "greenish/pinkish body" at a glance).
    const face = new MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.22,
      emissive: accent,
      emissiveIntensity: 0.05,
    })
    const W = LANDMARK.body.faceWidth.toFixed(4)
    const H = LANDMARK.body.faceHeight.toFixed(4)
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
  // 1.0 at the top-left corner, 0.0 at the bottom-right.
  float tl = clamp(((0.5 - vFaceLocal.x / ${W}) + (vFaceLocal.y / ${H} + 0.5)) * 0.5, 0.0, 1.0);
  diffuseColor.rgb *= 0.966 + tl * 0.068;
}`,
        )
    }
    return {
      body: new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.26,
        emissive: accent,
        emissiveIntensity: GLOW.bodyIdle,
      }),
      face,
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
      {/* 3b — the label: directly beneath the icon, well inside the
          face (never near the bottom edge), ~13% of the panel's height,
          in the deepened accent ink. */}
      <Text
        font={fontUrl}
        fontSize={0.33}
        letterSpacing={0.04}
        color={inkAccent}
        anchorX="center"
        anchorY="middle"
        position={[0, bodyY - 0.1, B.depth / 2 + 0.02]}
      >
        {location.name}
      </Text>
      </group>
    </group>
  )
}
