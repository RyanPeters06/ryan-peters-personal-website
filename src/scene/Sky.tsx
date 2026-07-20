import { useMemo } from 'react'
import { BackSide, Color, ShaderMaterial } from 'three'
import { PALETTE, SKY_DOME_RADIUS, TABLEAU_FOG } from '@/lib/constants'

/**
 * The sunny spring-morning sky: a genuine-blue-to-white gradient dome,
 * plus near-white sky-tinted fog so the world melts into light.
 *
 * The gradient is keyed to WORLD up with steep stops. The tableau
 * camera is fixed and pitched well down, so only a narrow band of sky
 * (roughly 0°–25° of elevation) is ever in frame — the blue has to
 * arrive within a few degrees of the horizon or the whole visible sky
 * reads as blank white background. (The previous camera-up keying was
 * a holdover from the orbiting camera; combined with the down-pitch it
 * rotated the gradient's white zone across the entire visible band —
 * that was the "sky looks like empty background" bug.)
 */

const SKY_VERTEX = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const SKY_FRAGMENT = /* glsl */ `
varying vec3 vDir;
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uHorizon;
void main() {
  // World-space elevation, calibrated to the TABLEAU camera: it sits
  // ~10.8u up pitched 40 degrees down at fov 48, so every ray in frame
  // points BELOW world-horizontal — the visible sky band behind the
  // island's edge spans h = -0.43 (at the far rim) .. -0.28 (top of
  // frame). The stops below are centred on THAT band; they must be
  // re-derived whenever the camera pitch or fov changes, or the
  // visible sky renders as a flat white void.
  // The stops live inside that band: glowing white right where the
  // island meets the sky, light blue within a few degrees above it,
  // the deeper top blue fully in by the top of the frame. (Stops at
  // h >= 0 look correct on paper and render as a flat white void.)
  float h = clamp(normalize(vDir).y, -1.0, 1.0);
  vec3 col = mix(uHorizon, uMid, smoothstep(-0.44, -0.37, h));
  col = mix(col, uTop, smoothstep(-0.38, -0.27, h));
  gl_FragColor = vec4(col, 1.0);
}
`

export function Sky() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: SKY_VERTEX,
        fragmentShader: SKY_FRAGMENT,
        uniforms: {
          uTop: { value: new Color(PALETTE.skyTop) },
          uMid: { value: new Color(PALETTE.skyMid) },
          uHorizon: { value: new Color(PALETTE.skyHorizon) },
        },
        side: BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  )

  return (
    <>
      {/* The dome fully encloses the camera (radius 200 < far plane,
          frustumCulled off), so this clear color is never visible in a
          settled frame — but it IS what shows for any frame rendered
          before the dome, so it must be sky, never white. */}
      <color attach="background" args={[PALETTE.skyMid]} />
      <fog attach="fog" args={[PALETTE.fog, TABLEAU_FOG[0], TABLEAU_FOG[1]]} />
      <mesh material={material} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[SKY_DOME_RADIUS, 32, 24]} />
      </mesh>
    </>
  )
}
