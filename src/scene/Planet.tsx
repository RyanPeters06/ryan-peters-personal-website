import { useMemo } from 'react'
import { Color, MeshStandardMaterial } from 'three'
import { PALETTE, PLANET_RADIUS, TILE_SIZE } from '@/lib/constants'

/**
 * The plaza planet: a smooth white sphere whose surface is drawn as
 * rounded-square tiles with soft gray seams — a toy plaza floor
 * wrapped around a tiny world.
 *
 * The grid is a *quad-sphere* pattern: the surface direction is
 * projected onto the surrounding cube with equal-angle spacing, and
 * each cube face carries an integer number of tiles. Seams therefore
 * line up exactly along face edges — no pole pinching, no texture
 * seams, and none of the ghost lines a triplanar blend produces.
 */
function createTiledMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(PALETTE.ground),
    roughness: 0.5,
    metalness: 0,
  })

  // Tiles per cube-face edge, rounded so seams align across faces.
  const faceTiles = Math.max(2, Math.round((Math.PI * PLANET_RADIUS) / 2 / TILE_SIZE))

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLineColor = { value: new Color(PALETTE.groundLine) }
    shader.uniforms.uFaceTiles = { value: faceTiles }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vTileWorldPos;
varying vec3 vTileWorldNormal;`,
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
vTileWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
vTileWorldNormal = normalize(mat3(modelMatrix) * normal);`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vTileWorldPos;
varying vec3 vTileWorldNormal;
uniform vec3 uLineColor;
uniform float uFaceTiles;

// Rounded corner radius and seam half-width, in tile-cell units.
#define TILE_CORNER 0.09
#define LINE_HALF 0.022
#define QUARTER_PI 0.7853981634

// Quad-sphere tile seams: project the surface direction onto its
// dominant cube face, spread tiles by *angle* so they stay evenly
// sized, then draw the antialiased border of a rounded square in each
// cell. Neighboring cells each draw half a seam, so seams read as
// continuous lines with softly rounded corners.
float tileLine(vec3 dir) {
  vec3 a = abs(dir);
  vec2 t;
  if (a.x >= a.y && a.x >= a.z)      t = vec2(dir.z, dir.y) / a.x;
  else if (a.y >= a.x && a.y >= a.z) t = vec2(dir.x, dir.z) / a.y;
  else                               t = vec2(dir.x, dir.y) / a.z;
  vec2 cell = (atan(t) / QUARTER_PI * 0.5 + 0.5) * uFaceTiles;
  vec2 uv = fract(cell) - 0.5;
  vec2 q = abs(uv) - vec2(0.5 - TILE_CORNER);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - TILE_CORNER;
  float aa = fwidth(d) * 1.2;
  return 1.0 - smoothstep(LINE_HALF - aa, LINE_HALF + aa, abs(d));
}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{
  float grid = tileLine(normalize(vTileWorldPos));
  diffuseColor.rgb = mix(diffuseColor.rgb, uLineColor, clamp(grid, 0.0, 1.0));
}`,
      )
  }

  return material
}

export function Planet() {
  const material = useMemo(createTiledMaterial, [])

  return (
    <mesh material={material} receiveShadow>
      <sphereGeometry args={[PLANET_RADIUS, 96, 64]} />
    </mesh>
  )
}
