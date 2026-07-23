import { SphereGeometry, MeshStandardMaterial } from 'three'
import { PALETTE } from '@/lib/constants'

/**
 * Proper little clay blooms — the reference's daisies and forget-me-nots,
 * not the old three-ball candy clusters (`FlowerTuft`, now retired).
 * Each flower is a radial ring of soft petal ellipsoids around a warm
 * center; `leaf` is a small green sprig (the reference's low plants by
 * the planet's base). Everything shares one sphere geometry (scaled per
 * mesh) and module-level materials, so scattering dozens of them across
 * the plaza allocates nothing per instance.
 */

// One unit sphere, reused for every petal/center/leaf via mesh scale.
const BLOB = new SphereGeometry(1, 8, 6)

const M = {
  white: new MeshStandardMaterial({ color: '#fbfaf5', roughness: 0.5 }),
  yellow: new MeshStandardMaterial({ color: '#f6c651', roughness: 0.5 }),
  orange: new MeshStandardMaterial({ color: '#f0a63e', roughness: 0.5 }),
  blue: new MeshStandardMaterial({ color: '#9db8ec', roughness: 0.5 }),
  pink: new MeshStandardMaterial({ color: PALETTE.blossom, roughness: 0.5 }),
  leaf: new MeshStandardMaterial({ color: PALETTE.grass, roughness: 0.7 }),
} as const

export type FlowerKind = 'daisy' | 'forgetMeNot' | 'pink' | 'leaf'

/** Per-kind recipe: petal count, petal color, petal ellipsoid size,
 *  radius from center, upward tilt of each petal, and the center. */
const RECIPE: Record<
  Exclude<FlowerKind, 'leaf'>,
  {
    petals: number
    petalMat: MeshStandardMaterial
    petal: [number, number, number]
    rad: number
    tilt: number
    center: { mat: MeshStandardMaterial; r: number }
    y: number
  }
> = {
  // Broad white daisy lying almost flat on the grass, yellow eye.
  daisy: {
    petals: 6,
    petalMat: M.white,
    petal: [0.023, 0.01, 0.05],
    rad: 0.05,
    tilt: 0.16,
    center: { mat: M.yellow, r: 0.03 },
    y: 0.05,
  },
  // Small cupped blue forget-me-not with a bright orange eye.
  forgetMeNot: {
    petals: 5,
    petalMat: M.blue,
    petal: [0.019, 0.009, 0.03],
    rad: 0.032,
    tilt: 0.6,
    center: { mat: M.orange, r: 0.016 },
    y: 0.07,
  },
  // Tiny pink bloom, yellow eye.
  pink: {
    petals: 5,
    petalMat: M.pink,
    petal: [0.017, 0.008, 0.028],
    rad: 0.028,
    tilt: 0.45,
    center: { mat: M.yellow, r: 0.014 },
    y: 0.06,
  },
}

/** Three small leaves fanning up from the ground — a green sprig. */
function LeafSprig() {
  return (
    <group>
      {[-0.6, 0, 0.6].map((a, i) => (
        <group key={i} rotation={[0, a, 0]}>
          <mesh
            geometry={BLOB}
            material={M.leaf}
            position={[0, 0.03, 0.045]}
            rotation={[-0.7, 0, 0]}
            scale={[0.022, 0.012, 0.06]}
          />
        </group>
      ))}
    </group>
  )
}

export function Flower({ kind = 'daisy', scale = 1 }: { kind?: FlowerKind; scale?: number }) {
  if (kind === 'leaf') {
    return (
      <group scale={scale}>
        <LeafSprig />
      </group>
    )
  }

  const r = RECIPE[kind]
  return (
    <group scale={scale}>
      {/* Petals radiate outward; each is tilted up so the bloom cups. */}
      {Array.from({ length: r.petals }, (_, i) => {
        const a = (i / r.petals) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]} position={[0, r.y, 0]}>
            <mesh
              geometry={BLOB}
              material={r.petalMat}
              position={[0, 0, r.rad]}
              rotation={[-r.tilt, 0, 0]}
              scale={r.petal}
            />
          </group>
        )
      })}
      {/* Center eye. */}
      <mesh
        geometry={BLOB}
        material={r.center.mat}
        position={[0, r.y + 0.005, 0]}
        scale={[r.center.r, r.center.r * 0.7, r.center.r]}
      />
    </group>
  )
}
