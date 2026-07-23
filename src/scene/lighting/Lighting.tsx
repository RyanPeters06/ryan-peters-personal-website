import { Environment } from '@react-three/drei'
import { Vector3 } from 'three'
import skyHdri from '@pmndrs/assets/hdri/sky.exr'
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
      {/* IMAGE-BASED LIGHT — the foundation of the whole look.
          Bundled sky HDRI (base64 from @pmndrs/assets: no network, no
          extra request), used ONLY as an environment map — our own
          gradient dome stays the visible backdrop (`background={false}`).

          Why this matters more than anything else here: without an
          environment, a curved surface gets a near-uniform response and
          the eye reads it as a flat disc — "a circle". IBL varies the
          reflection across the surface, which is what actually reads as
          three-dimensional form. Every other material tweak in this
          project was compensating for its absence. */}
      <Environment files={skyHdri as string} background={false} environmentIntensity={0.38} />

      {/* A soft ambient fill — low (the IBL does most of the wrap), just
          enough that shadowed sides stay gently lit and the scene reads
          soft, not harsh. Kept modest: too much washes the white panels. */}
      <ambientLight intensity={0.1} color={PALETTE.ambient} />

      {/* Warm key: the plaza's sun, fixed, sized to shadow the whole
          island at once. */}
      <directionalLight
        position={SUN_POSITION}
        intensity={1.05}
        color={PALETTE.keyLight}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={10}
        shadow-camera-far={55}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        /* PCSS now (see Experience.tsx's <SoftShadows>): sharp at the
           contact point, softening with distance — the grounded look.
           normalBias fights PCF self-shadow acne on the curved
           characters; a small negative bias handles the flat floor. */
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />

      {/* Cool fill from the opposite side, no shadows. Kept, but low:
          the environment map now does most of the wrap-around fill this
          light used to provide alone. */}
      <directionalLight position={[-6, -2, -8]} intensity={0.08} color={PALETTE.fillLight} />

      {/* Ground bounce only. The sky half of this is now redundant (the
          HDRI is a sky), so it is dialled right down — its remaining job
          is the warm-ish kick coming back UP off the pale plaza floor. */}
      <hemisphereLight args={['#dcefff', '#e8eef3', 0.1]} />
    </>
  )
}
