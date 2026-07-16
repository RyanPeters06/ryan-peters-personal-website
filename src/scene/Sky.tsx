import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Color, ShaderMaterial, Vector3 } from 'three'
import { avatarPose } from '@/systems/movement/avatarPose'
import { CAMERA_ORBIT_RADIUS, PALETTE } from '@/lib/constants'

/**
 * The spring-morning sky: a soft white-to-blue gradient dome, plus
 * near-white cyan-tinted fog so the world melts into light.
 *
 * The gradient's "up" follows the avatar's surface normal — wherever
 * you walk on the planet, the fresh blue stays overhead and the
 * horizon glows white, like a bright menu screen rather than a
 * physical atmosphere. (CinematicCamera retunes the fog's near/far
 * smoothly per shot; the colors live here.)
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
  vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.45, h));
  col = mix(col, uTop, smoothstep(0.45, 1.0, h));
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
    ;(material.uniforms.uUp.value as Vector3).copy(avatarPose.up)
  })

  return (
    <>
      <color attach="background" args={[PALETTE.skyHorizon]} />
      <fog
        attach="fog"
        args={[PALETTE.fog, CAMERA_ORBIT_RADIUS * 0.78, CAMERA_ORBIT_RADIUS * 1.28]}
      />
      <mesh material={material} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[200, 32, 24]} />
      </mesh>
    </>
  )
}
