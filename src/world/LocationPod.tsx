import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Color, Group, MeshStandardMaterial } from 'three'
import type { WorldLocation } from '@/content/locations'
import { useSphericalPosition } from '@/hooks/useSphericalPosition'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { useWorldStore } from '@/store/useWorldStore'
import { avatarPose } from '@/systems/movement/avatarPose'
import { expDamp } from '@/lib/math/spherical'

/** Walk inside this distance to "arrive" at a pod (with hysteresis so
 *  the card never flickers at the boundary). */
const ENTER_DISTANCE = 2.6
const EXIT_DISTANCE = 3.1

/**
 * A plaza kiosk: the in-world doorway to one portfolio section.
 *
 * Speaks the plaza dialect — a glossy white rounded-square pedestal,
 * a pastel accent ring, and a gently bobbing, slowly turning,
 * slightly translucent rounded-square sign carrying a primitive glyph.
 * Walk up to it and it perks up; the overlay card does the reading.
 */
export function LocationPod({
  location,
  children,
}: {
  location: WorldLocation
  /** Primitive glyph meshes, rendered on the front of the sign. */
  children?: React.ReactNode
}) {
  const { position, quaternion } = useSphericalPosition(location.lat, location.lon)
  const sign = useRef<Group>(null)
  const near = useRef(false)
  const lift = useRef(0)

  const materials = useMemo(
    () => ({
      pedestal: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.25 }),
      accent: new MeshStandardMaterial({
        color: new Color(location.accent),
        roughness: 0.35,
      }),
      sign: new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.15,
        transparent: true,
        opacity: 0.92,
      }),
    }),
    [location.accent],
  )

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const t = getAmbientTime()
    const store = useWorldStore.getState()

    // --- proximity (only while the visitor is in control) -------------
    const roaming = store.phase === 'idle' || store.phase === 'exploring'
    const d = avatarPose.position.distanceTo(position)
    if (roaming && !near.current && d < ENTER_DISTANCE) {
      near.current = true
      store.setActiveLocation(location.id)
    } else if (near.current && (d > EXIT_DISTANCE || !roaming)) {
      near.current = false
      if (store.activeLocation === location.id) store.setActiveLocation(null)
    }

    // --- gentle life ----------------------------------------------------
    if (sign.current) {
      lift.current = expDamp(lift.current, near.current ? 0.22 : 0, 5, dt)
      sign.current.position.y =
        1.35 + lift.current + Math.sin(t * 1.1 + location.lon) * 0.06
      sign.current.rotation.y = t * 0.35
      const s = 1 + lift.current * 0.35
      sign.current.scale.set(s, s, s)
    }
  })

  return (
    <group position={position} quaternion={quaternion}>
      {/* Pedestal: a glossy plaza tile riser */}
      <RoundedBox
        args={[1.5, 0.3, 1.5]}
        radius={0.09}
        smoothness={4}
        position={[0, 0.15, 0]}
        material={materials.pedestal}
        castShadow
        receiveShadow
      />
      {/* Accent step: pastel rounded-square inset */}
      <RoundedBox
        args={[1.14, 0.12, 1.14]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.33, 0]}
        material={materials.accent}
        castShadow
      />

      {/* Floating sign: translucent rounded square, bobbing + turning */}
      <group ref={sign} position={[0, 1.35, 0]}>
        <RoundedBox
          args={[0.95, 0.95, 0.14]}
          radius={0.1}
          smoothness={4}
          material={materials.sign}
          castShadow
        />
        {/* Glyph sits just proud of the sign's front face */}
        <group position={[0, 0, 0.1]}>{children}</group>
      </group>
    </group>
  )
}
