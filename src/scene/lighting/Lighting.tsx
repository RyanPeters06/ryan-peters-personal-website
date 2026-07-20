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
// light meant to read as upper-LEFT needs a NEGATIVE x. It also needs
// a NEGATIVE z: the camera sits on +Z, so "pushed back behind the
// scene" is the -Z side — shadows then cast forward-right toward the
// foreground and the player, like the reference. (The previous +0.55 z
// had the sun on the camera's side, throwing shadows toward the back.)
// ELEVATION (revised 2026-07-20): was ~69 degrees, nearly overhead.
// That is why shadows read as blobs no matter how the shadow map is
// tuned — a near-vertical sun projects the character straight DOWN,
// and this character's head is ~58% of its height, so the head's
// disc simply covers the torso and legs. No silhouette exists to
// resolve. ~55 degrees stretches the shadow to ~0.7x the object's
// height: enough for head/torso/legs to separate, still short and
// soft rather than a long dramatic streak.
const SUN_DIR = new Vector3(-0.8, 1.39, -0.55).normalize()
const SUN_DISTANCE = 30
const SUN_POSITION: [number, number, number] = [
  SUN_DIR.x * SUN_DISTANCE,
  SUN_DIR.y * SUN_DISTANCE,
  SUN_DIR.z * SUN_DISTANCE,
]
/** Shadow frustum half-extent — must clear the island's full radius
 *  (platforms/steps push slightly past ISLAND_RADIUS at their
 *  footprint) or the rim of the plaza silently loses its shadow.
 *  Kept as tight as the sun angle allows: at ~55 degrees elevation the
 *  tallest object (~3u) throws its shadow ~2.1u past its base, so that
 *  much slack is required — but no more. Every extra unit here is
 *  wasted shadow-map resolution (~80 texels/unit at 2048). */
const SHADOW_EXTENT = ISLAND_RADIUS + 2.4

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
           gives soft, feathered shadow edges instead of a hard PCF line.
           The kernel spans +/-radius TEXELS (three's vsm_frag offsets by
           i*radius, i in [-1,1]), so 3.5 was a 7-texel gaussian — enough
           to smear a correct silhouette into a formless smudge. At ~82
           texels per world unit, 1.5 keeps edges soft while leaving the
           avatar's head/torso/legs readable. */
        shadow-radius={1.5}
        shadow-blurSamples={16}
      />

      {/* Cool fill from the opposite side, no shadows. */}
      <directionalLight position={[-6, -2, -8]} intensity={0.3} color={PALETTE.fillLight} />

      {/* Sky/ground bounce: genuine blue sky above, cool floor below. */}
      <hemisphereLight args={['#dcefff', '#e3ecf2', 0.42]} />
    </>
  )
}
