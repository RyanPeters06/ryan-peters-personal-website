import { useMemo } from 'react'
import { Color, MeshStandardMaterial } from 'three'
import { ISLAND_EDGE_HEIGHT, ISLAND_RADIUS, PALETTE, TILE_SIZE } from '@/lib/constants'

/**
 * The plaza floor: a flat disc drawn as soft rounded-square tiles — a
 * giant friendly menu screen, not a 3D-modeling grid. No curvature
 * anywhere; the disc simply ends at a rounded edge and drops into the
 * sky, floating-island style (see Ground's cliff wall below).
 *
 * Each tile is shaded like a slightly raised toy button: generously
 * rounded corners, blurred low-contrast seams, a faint inner shadow,
 * and a subtle highlight along its top edge.
 */
function createTiledMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(PALETTE.ground),
    roughness: 0.5,
    metalness: 0,
  })

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLineColor = { value: new Color(PALETTE.groundLine) }
    shader.uniforms.uTileSize = { value: TILE_SIZE }

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vTileWorldPos;`,
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
vTileWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vTileWorldPos;
uniform vec3 uLineColor;
uniform float uTileSize;

// Rounded corner radius (~22% of tile width) and seam half-width,
// in tile-cell units.
#define TILE_CORNER 0.22
#define LINE_HALF 0.018

// Flat tiling: the floor has no curvature, so cells are just the
// world XZ position divided by the tile size — no projection needed.
// Returns (d, uv.x, uv.y, vary): signed distance to the rounded-square
// border, in-cell coordinates for bevel shading, and a per-tile
// pseudo-random value for quiet brightness variation.
vec4 tileCell(vec2 worldXZ) {
  vec2 cell = worldXZ / uTileSize;
  vec2 uv = fract(cell) - 0.5;
  float vary = fract(sin(dot(floor(cell), vec2(127.1, 311.7))) * 43758.5453);
  // Hand-laid cobble feel: each tile jitters its center a whisper and
  // wears its own corner radius (17–27%), so the grid reads organic —
  // laid by hand, not plotted — while seams still meet cleanly.
  uv -= (vec2(vary, fract(vary * 7.31)) - 0.5) * 0.05;
  float corner = TILE_CORNER + (vary - 0.5) * 0.10;
  vec2 q = abs(uv) - vec2(0.5 - corner);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;
  return vec4(d, uv, vary);
}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{
  vec4 cellInfo = tileCell(vTileWorldPos.xz);
  float d = cellInfo.x;
  vec2 cuv = cellInfo.yz;
  float aa = fwidth(d);
  // Whisper-soft seams: blurred, minimal contrast — the pattern
  // quietly supports the world instead of describing pavement.
  float seam = 1.0 - smoothstep(LINE_HALF - aa, LINE_HALF + aa * 3.0, abs(d));
  // A very gentle bevel band just inside each tile's border.
  float band = smoothstep(-0.12, -0.015, d) * (1.0 - step(0.0, d));
  float bevel = band * cuv.y * 2.0;
  diffuseColor.rgb = mix(diffuseColor.rgb, uLineColor, clamp(seam, 0.0, 1.0));
  diffuseColor.rgb *= 1.0 - band * 0.014 + bevel * 0.018;
  // Quiet per-tile brightness variation (±1.2%) — handcrafted, alive.
  diffuseColor.rgb *= 1.0 + (cellInfo.w - 0.5) * 0.024;
}`,
      )
  }

  return material
}

export function Ground() {
  const tileMaterial = useMemo(createTiledMaterial, [])
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
