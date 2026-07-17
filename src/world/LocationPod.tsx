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

  const materials = useMemo(() => {
    const accent = new Color(location.accent)
    return {
      pedestal: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.18 }),
      accent: new MeshStandardMaterial({ color: accent, roughness: 0.3 }),
      // The sign's outer shell: translucent molded plastic, faintly
      // tinted by the accent, which also glows from within (emissive)
      // — color radiates from inside the object, like the reference.
      signFrame: new MeshStandardMaterial({
        color: new Color('#ffffff').lerp(accent, 0.3),
        roughness: 0.12,
        transparent: true,
        opacity: 0.55,
        emissive: accent,
        emissiveIntensity: 0.14,
      }),
      // The inner white face inset within the shell.
      signFace: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 }),
    }
  }, [location.accent])

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

      {/* Floating sign: a molded "pillow" icon — thick translucent
          shell around an inset white face, accent glowing through. */}
      <group ref={sign} position={[0, 1.35, 0]}>
        <RoundedBox
          args={[1.05, 1.05, 0.16]}
          radius={0.15}
          smoothness={5}
          material={materials.signFrame}
          castShadow
        />
        <RoundedBox
          args={[0.8, 0.8, 0.12]}
          radius={0.11}
          smoothness={4}
          position={[0, 0, 0.035]}
          material={materials.signFace}
        />
        {/* Glyph floats on the inner face */}
        <group position={[0, 0, 0.12]}>{children}</group>
      </group>
    </group>
  )
}
