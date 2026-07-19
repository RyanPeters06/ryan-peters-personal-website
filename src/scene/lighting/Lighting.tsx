import { Vector3 } from 'three'
import { ISLAND_RADIUS, PALETTE } from '@/lib/constants'

/**
 * Soft, rounded light: high ambient + warm key + cool fill.
 *
 * The key light is a fixed world-space sun — NOT "personal light that
 * follows the avatar" like it was under the old chase-camera model.
 * That design tracked the avatar with a tight +/-8 shadow frustum,
 * which was correct when only the avatar's immediate surroundings were
 * ever in frame. Under the fixed tableau camera the WHOLE plaza is
 * always in frame, so a small avatar-centered frustum left every
 * landmark, tree, and bench outside the shadow camera — they cast and
 * received no shadow at all, however correctly `castShadow`/
 * `receiveShadow` were set on their meshes. The shadow camera now
 * covers the whole island from a fixed direction instead.
 */
// Screen-right for the tableau camera is world +X (viewDir x up), so a
// light meant to read as upper-LEFT needs a NEGATIVE x — the previous
// +0.8 put the sun upper-right, shadows falling lower-left, the mirror
// of the reference's upper-left sun / lower-right shadows.
const SUN_DIR = new Vector3(-0.85, 2.2, 0.55).normalize()
const SUN_DISTANCE = 28
const SUN_POSITION: [number, number, number] = [
  SUN_DIR.x * SUN_DISTANCE,
  SUN_DIR.y * SUN_DISTANCE,
  SUN_DIR.z * SUN_DISTANCE,
]
/** Shadow frustum half-extent — must clear the island's full radius
 *  (platforms/steps push slightly past ISLAND_RADIUS at their
 *  footprint) or the rim of the plaza silently loses its shadow. */
const SHADOW_EXTENT = ISLAND_RADIUS + 2

export function Lighting() {
  return (
    <>
      {/* Generous, faintly blue base light: sunny spring morning. High
          ambient keeps shadows gentle and blue-gray, but not so high
          it flattens the key light's directional falloff — the
          "single-tone card" look was ambient (1.3) nearly matching the
          key (1.15); the ratio is now more directional. */}
      <ambientLight intensity={1.05} color={PALETTE.ambient} />

      {/* Warm key: the plaza's sun, fixed, sized to shadow the whole
          island at once. */}
      <directionalLight
        position={SUN_POSITION}
        intensity={1.35}
        color={PALETTE.keyLight}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={10}
        shadow-camera-far={55}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-bias={-0.0004}
        /* VSM (see Experience.tsx's `shadows="variance"`) blurs via
           radius/blurSamples, not a bias trick — this is what actually
           gives soft, feathered shadow edges instead of a hard PCF line. */
        shadow-radius={3.5}
        shadow-blurSamples={16}
      />

      {/* Cool fill from the opposite side, no shadows. */}
      <directionalLight position={[-6, -2, -8]} intensity={0.3} color={PALETTE.fillLight} />

      {/* Sky/ground bounce: genuine blue sky above, cool floor below. */}
      <hemisphereLight args={['#dcefff', '#e3ecf2', 0.42]} />
    </>
  )
}
