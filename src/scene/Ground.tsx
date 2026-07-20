import { useMemo } from 'react'
import { Color, MeshStandardMaterial } from 'three'
import { ISLAND_EDGE_HEIGHT, ISLAND_RADIUS, PALETTE, TILE_SIZE } from '@/lib/constants'

/**
 * The plaza floor: a flat disc drawn as organic near-white cobbles —
 * rounded, varied-size stones with no straight lines and whisper-soft
 * seams, like the reference's hand-laid pebble plaza. No curvature
 * anywhere; the disc simply ends at a rounded edge and drops into the
 * sky, floating-island style (see Ground's cliff wall below).
 *
 * Pattern: a Voronoi (Worley) tessellation — one pseudo-random feature
 * point scattered per grid cell with FULL jitter, so the resulting
 * cells are irregular rounded polygons of naturally varied size, never
 * a grid. "Seams" are not drawn lines at all: they're the smooth
 * F2−F1 distance falloff between neighboring stones, shaded as gentle
 * darkening. (The previous shader was a square grid of rounded-square
 * SDF tiles with explicit seam lines — it read as an engine-default
 * grid at a glance, however soft the lines.)
 */
function createCobbleMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(PALETTE.ground),
    roughness: 0.5,
    metalness: 0,
  })

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSeamColor = { value: new Color(PALETTE.groundLine) }
    shader.uniforms.uStoneSize = { value: TILE_SIZE * 1.1 }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vCobbleWorldPos;`,
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
vCobbleWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vCobbleWorldPos;
uniform vec3 uSeamColor;
uniform float uStoneSize;

vec2 cobbleHash(vec2 p) {
  return fract(
    sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) *
      43758.5453);
}

// Worley/Voronoi: distance to the nearest (f1) and second-nearest
// (f2) scattered stone centers, plus the nearest stone's id for
// per-stone variation. Full-strength jitter makes the stones read as
// hand-laid pebbles — irregular sizes, no straight lines anywhere.
vec4 cobble(vec2 x) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  float f1 = 8.0;
  float f2 = 8.0;
  vec2 id = vec2(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + cobbleHash(n + g) - f;
      float d = dot(r, r);
      if (d < f1) {
        f2 = f1;
        f1 = d;
        id = n + g;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }
  return vec4(sqrt(f1), sqrt(f2), id);
}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{
  vec4 c = cobble(vCobbleWorldPos.xz / uStoneSize);
  // 0 at the boundary between two stones, growing toward each center.
  float edgeDist = c.y - c.x;
  // Seams are soft shading, not lines: a WIDE smooth falloff mixing
  // only fractionally toward the (already near-white) seam color —
  // barely perceptible at viewing distance, per the reference.
  float seam = 1.0 - smoothstep(0.0, 0.14, edgeDist);
  diffuseColor.rgb = mix(diffuseColor.rgb, uSeamColor, seam * 0.28);
  // Gentle dome: each stone lifts a touch toward its center, so the
  // surface reads softly cushioned rather than one flat plane.
  diffuseColor.rgb *= 1.0 + smoothstep(0.04, 0.4, edgeDist) * 0.014;
  // Quiet per-stone brightness variation (±2%) — organic, hand-laid.
  float vary = fract(sin(dot(c.zw, vec2(127.1, 311.7))) * 43758.5453);
  diffuseColor.rgb *= 1.0 + (vary - 0.5) * 0.04;
}`,
      )
  }

  return material
}

export function Ground() {
  const tileMaterial = useMemo(createCobbleMaterial, [])
  const edgeMaterial = useMemo(
    () => new MeshStandardMaterial({ color: PALETTE.groundLine, roughness: 0.7 }),
    [],
  )

  return (
    <group>
      {/* The plaza floor: one flat tiled disc, no curvature. */}
      <mesh material={tileMaterial} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[ISLAND_RADIUS, 96]} />
      </mesh>
      {/* The island's edge: a short cliff wall dropping from the rim,
          tapering slightly so the underside reads as rock, not a
          machined cylinder. */}
      <mesh
        material={edgeMaterial}
        position={[0, -ISLAND_EDGE_HEIGHT / 2, 0]}
      >
        <cylinderGeometry
          args={[ISLAND_RADIUS, ISLAND_RADIUS * 0.9, ISLAND_EDGE_HEIGHT, 96, 1, true]}
        />
      </mesh>
    </group>
  )
}
