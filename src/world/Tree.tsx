import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import { getAmbientTime } from '@/hooks/useAmbientLoop'
import { PALETTE } from '@/lib/constants'
import { ROUGHNESS } from '@/lib/designSystem'

const CANOPY = {
  green: [PALETTE.grassDark, PALETTE.grass, PALETTE.grassLight],
  pink: [PALETTE.blossomDark, PALETTE.blossom, PALETTE.blossomLight],
} as const

/** How far a tinted canopy is pulled toward its landmark's accent.
 *  Partway, not all the way (Peter, 2026-07-29): at 1.0 the Projects and
 *  Resume trees turn literally blue and teal. */
const TINT_STRENGTH = 0.45

/** Leaf clusters per canopy. Enough that the shell reads as continuous
 *  foliage — too few and you see between them and it looks spiky. */
const LOBES = 20

/** Shared across every tree: the lobes differ by their INSTANCE matrix,
 *  never by geometry, so twelve varied trees cost two geometries total. */
const LEAF_GEO = new SphereGeometry(1, 8, 6)
const TRUNK_GEO = new CylinderGeometry(0.05, 0.07, 0.46, 8)

const _q = new Quaternion()
const _pos = new Vector3()
const _scl = new Vector3()
const _dir = new Vector3()
const _up = new Vector3(0, 0, 1)
const _col = new Color()

function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/**
 * A landmark-pod tree.
 *
 * The canopy is a SHELL OF LEAF LOBES, not a pile of spheres. Each lobe
 * is the shared unit sphere squashed into a soft almond and turned to
 * point outward from the canopy's centre, so the silhouette is scalloped
 * and clustered — it reads as foliage rather than as one round blob,
 * without introducing a single sharp edge (ART_BIBLE §4). A few fatter
 * lobes sit in the core so you can never see through the shell.
 *
 * Every tree is an INDIVIDUAL: `seed` drives lobe placement, lean, height
 * and fullness, so no two of the twelve match while they all stay one
 * species. `tint` pulls the foliage toward the landmark's accent.
 *
 * It also FLOWS. The sway is done in the vertex shader off the shared
 * ambient clock, keyed to each lobe's own position, so the canopy ripples
 * from the inside out instead of swinging as one rigid mass — and it
 * costs nothing per frame on the CPU. Instancing means the whole canopy
 * is ONE draw call: a leafier tree than the old six-sphere version, for
 * a third of the draw calls.
 */
export function Tree({
  variant = 'green',
  scale = 1,
  tint,
  seed = 1,
}: {
  variant?: 'green' | 'pink'
  scale?: number
  tint?: string
  seed?: number
}) {
  const leaves = useRef<InstancedMesh>(null)

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({ roughness: ROUGHNESS.foliage })
    const uTime = { value: 0 }
    const uSway = { value: 0.05 }
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uTime
      shader.uniforms.uSway = uSway
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uSway;')
        // Sway AFTER the instance transform, so the offset is in the
        // tree's own space and isn't scaled/rotated by the lobe's matrix.
        .replace(
          'mvPosition = instanceMatrix * mvPosition;',
          `mvPosition = instanceMatrix * mvPosition;
           float ph = instanceMatrix[3].x * 6.1 + instanceMatrix[3].z * 4.3;
           float amp = uSway * max(instanceMatrix[3].y - 0.25, 0.0);
           mvPosition.x += sin(uTime * 1.15 + ph) * amp;
           mvPosition.z += cos(uTime * 0.92 + ph * 1.4) * amp * 0.7;`,
        )
    }
    m.userData.uTime = uTime
    return m
  }, [])

  const trunkMat = useMemo(
    () => new MeshStandardMaterial({ color: PALETTE.trunk, roughness: ROUGHNESS.foliage }),
    [],
  )

  /** Lobe layout + per-lobe colour, generated once per seed. */
  const layout = useMemo(() => {
    const rng = makeRng(seed * 2654435761 + 12345)
    const [dark, mid, light] = CANOPY[variant].map((hex) => {
      const c = new Color(hex)
      if (tint) c.lerp(new Color(tint), TINT_STRENGTH)
      return c
    })

    // Per-tree character: some are taller and narrower, some broader.
    const stretch = 0.85 + rng() * 0.4
    const girth = 0.92 + rng() * 0.26
    const cy = 0.62 + rng() * 0.1
    const rx = 0.34 * girth
    const ry = 0.3 * stretch
    const rz = 0.34 * girth

    const matrices: Matrix4[] = []
    const colors: Color[] = []
    for (let i = 0; i < LOBES; i++) {
      // First few are fat core lobes; the rest form the outer shell.
      const core = i < 4
      const u = rng() * Math.PI * 2
      const v = Math.acos(2 * rng() - 1)
      _dir.set(Math.sin(v) * Math.cos(u), Math.cos(v) * 0.85 + 0.15, Math.sin(v) * Math.sin(u))
      _dir.normalize()

      const reach = core ? 0.18 + rng() * 0.1 : 0.72 + rng() * 0.34
      _pos.set(_dir.x * rx * reach, cy + _dir.y * ry * reach, _dir.z * rz * reach)

      // Almond pointing outward: long along its local +Z, thin across.
      _q.setFromUnitVectors(_up, _dir)
      const s = (core ? 1.5 : 1) * (0.82 + rng() * 0.45)
      _scl.set(0.15 * s * girth, 0.115 * s, 0.25 * s)

      matrices.push(new Matrix4().compose(_pos.clone(), _q.clone(), _scl.clone()))

      // Upward-facing lobes catch more light; a little jitter besides.
      const lift = Math.max(0, _dir.y)
      _col.copy(dark).lerp(mid, Math.min(1, lift * 1.3 + rng() * 0.5))
      if (lift > 0.55 && rng() > 0.45) _col.lerp(light, 0.55)
      colors.push(_col.clone())
    }
    // A whisper of lean, so a row of them never lines up like fenceposts.
    const lean = (rng() - 0.5) * 0.13
    return { matrices, colors, lean, trunkTilt: (rng() - 0.5) * 0.08 }
  }, [seed, variant, tint])

  useEffect(() => {
    const mesh = leaves.current
    if (!mesh) return
    for (let i = 0; i < layout.matrices.length; i++) {
      mesh.setMatrixAt(i, layout.matrices[i])
      mesh.setColorAt(i, layout.colors[i])
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [layout])

  useFrame(() => {
    // Reduced motion calms the world rather than freezing it, so the
    // sway rides the shared ambient clock like everything else.
    material.userData.uTime.value = getAmbientTime()
  })

  return (
    <group scale={scale} rotation={[layout.trunkTilt, 0, layout.lean]}>
      <mesh geometry={TRUNK_GEO} material={trunkMat} position={[0, 0.22, 0]} castShadow />
      <instancedMesh
        ref={leaves}
        args={[LEAF_GEO, material, LOBES]}
        castShadow
        receiveShadow
      />
    </group>
  )
}
