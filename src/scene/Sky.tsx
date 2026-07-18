import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BackSide, Color, ShaderMaterial, Vector3 } from 'three'
import { PALETTE, TABLEAU_FOG } from '@/lib/constants'

/**
 * The sunny spring-morning sky: a genuine-blue-to-white gradient dome,
 * plus near-white sky-tinted fog so the world melts into light.
 *
 * The gradient is keyed to the CAMERA's frame — blue always fills the
 * top of the view, easing to a glowing white band behind the world —
 * so every shot composes like the concept art: intro (looking down at
 * the planet against white, blue climbing above) and chase (blue
 * overhead, white at the walking horizon) alike. Steep stops put real
 * blue in frame within ~20° above the view center. (Keying to the
 * avatar's up looked right on paper but left the whole intro
 * background below the gradient's horizon — all white, overcast.)
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
uniform vec3 uUp;
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uHorizon;
void main() {
  float h = clamp(dot(normalize(vDir), normalize(uUp)), -1.0, 1.0);
  vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.14, h));
  col = mix(col, uTop, smoothstep(0.12, 0.38, h));
  gl_FragColor = vec4(col, 1.0);
}
`

const _camUp = new Vector3()

export function Sky() {
  const camera = useThree((s) => s.camera)
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: SKY_VERTEX,
        fragmentShader: SKY_FRAGMENT,
        uniforms: {
          uUp: { value: new Vector3(0, 1, 0) },
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

  useFrame(() => {
    // The camera's true up axis in world space (column 1 of its
    // world matrix) — already eased by the rig, so the gradient
    // re-orients as smoothly as the camera itself.
    _camUp.setFromMatrixColumn(camera.matrixWorld, 1)
    ;(material.uniforms.uUp.value as Vector3).copy(_camUp)
  })

  return (
    <>
      <color attach="background" args={[PALETTE.skyHorizon]} />
      <fog attach="fog" args={[PALETTE.fog, TABLEAU_FOG[0], TABLEAU_FOG[1]]} />
      <mesh material={material} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[200, 32, 24]} />
      </mesh>
    </>
  )
}
