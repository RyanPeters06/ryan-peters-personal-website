import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Color, MeshStandardMaterial } from 'three'
import type { WorldLocation } from '@/content/locations'
import { useSphericalPosition } from '@/hooks/useSphericalPosition'
import { useWorldStore } from '@/store/useWorldStore'
import { avatarPose } from '@/systems/movement/avatarPose'
import { expDamp } from '@/lib/math/spherical'
import { PALETTE } from '@/lib/constants'

/** Walk inside this distance to "arrive" (with hysteresis so the card
 *  never flickers at the boundary). */
const ENTER_DISTANCE = 3.0
const EXIT_DISTANCE = 3.6

/**
 * A landmark monument — architecture, not a prop.
 *
 * One continuous molded form: a soft rounded monolith that grows out
 * of the plaza (its base is sunk into a gentle swell of the floor
 * itself), like a giant app icon that became a building. The
 * location's symbol is molded flush into its front face by the
 * matching Symbol component; the accent breathes softly through the
 * body and brightens when the visitor approaches. Nothing is
 * assembled; everything was manufactured together.
 */
export function LocationPod({
  location,
  children,
}: {
  location: WorldLocation
  /** The location's symbol, rendered flush against the front face. */
  children?: React.ReactNode
}) {
  const { position, quaternion } = useSphericalPosition(location.lat, location.lon)
  const near = useRef(false)
  const glow = useRef(0.04)

  const materials = useMemo(() => {
    const accent = new Color(location.accent)
    return {
      // The monument body: premium soft-touch plastic with the accent
      // breathing faintly from within.
      body: new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.16,
        emissive: accent,
        emissiveIntensity: 0.04,
      }),
      // The floor swelling up to meet the monument — same finish as
      // the ground, so it reads as the world, not as a pedestal.
      swell: new MeshStandardMaterial({ color: PALETTE.ground, roughness: 0.5 }),
    }
  }, [location.accent])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
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

    // --- the accent breathes brighter as you approach -----------------
    glow.current = expDamp(glow.current, near.current ? 0.1 : 0.04, 4, dt)
    materials.body.emissiveIntensity = glow.current
  })

  return (
    <group position={position} quaternion={quaternion}>
      {/* The floor rising gently to meet the monument */}
      <RoundedBox
        args={[2.7, 0.14, 2.7]}
        radius={0.07}
        smoothness={4}
        position={[0, 0.03, 0]}
        material={materials.swell}
        receiveShadow
      />
      {/* The monument: one continuous molded form, base sunk into the world */}
      <RoundedBox
        args={[1.7, 2.2, 0.66]}
        radius={0.26}
        smoothness={6}
        position={[0, 0.85, 0]}
        material={materials.body}
        castShadow
        receiveShadow
      />
      {/* The symbol, molded flush into the upper front face */}
      <group position={[0, 1.25, 0.31]}>{children}</group>
    </group>
  )
}
