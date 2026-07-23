import { Color, MeshPhysicalMaterial } from 'three'

/**
 * The clay look — the shared material language for Ryan Land's molded
 * surfaces. `MeshStandardMaterial` (roughness + metalness only) reads as
 * flat plastic; real soft clay has a faint SHEEN (a velvety fresnel rim)
 * and a whisper of CLEARCOAT (a soft top gloss). That variance across a
 * curved surface is what reads as "modeled, soft-touch" rather than
 * "flat".
 *
 * NOT transmission/glass — the reference panels are frosted-soft and
 * opaque, not see-through. Metalness stays 0 always.
 */
export function clay(opts: {
  color: string
  /** Base roughness — 0.45–0.6 for panels/props. */
  roughness?: number
  /** Sheen strength (the velvety rim). */
  sheen?: number
  /** Environment-map reflection. LOW (≈0.1) for opaque matte panels;
   *  higher looks glassy/see-through. */
  env?: number
  /** Emissive tint (accent glow); pair with emissiveIntensity. */
  emissive?: string
  emissiveIntensity?: number
}): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: new Color(opts.color),
    roughness: opts.roughness ?? 0.5,
    metalness: 0,
    sheen: opts.sheen ?? 0.4,
    sheenRoughness: 0.6,
    // Warm sheen: the soft-touch highlight leans to the key sun.
    sheenColor: new Color('#fff4e6'),
    // No clearcoat, and a LOW env reflection: at the default
    // envMapIntensity of 1 a smooth physical surface mirrors the bright
    // sky HDRI so strongly it reads as see-through frosted glass. The
    // reference's clay is opaque and matte-soft — keep only a hint of
    // environment so form still reads.
    clearcoat: 0,
    clearcoatRoughness: 1,
    envMapIntensity: opts.env ?? 0.35,
    transparent: false,
    opacity: 1,
    transmission: 0,
    emissive: new Color(opts.emissive ?? '#000000'),
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  })
}
