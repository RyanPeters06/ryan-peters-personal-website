import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** The Wii U app-icon easing: fast start, plush landing. */
export const PLAZA_EASE = [0.22, 1, 0.36, 1] as const

/**
 * The plaza overlay shell, built like a molded-plastic "pillow" icon:
 *
 *   1. A thick TRANSLUCENT OUTER RIM (frosted, light passes through,
 *      edges described by highlights — never outlines). An optional
 *      accent color glows through it as a soft halo.
 *   2. An INNER WHITE FACE inset within the rim, with a gentle
 *      top-to-bottom light gradient.
 *   3. Content floats on the face with comfortable padding.
 *
 * Enters like an app icon coming to life: scale 0.92 → 1, fade,
 * 320ms, cubic-bezier(0.22,1,0.36,1). Spec: docs/ART_DIRECTION.md.
 */
export function PlazaCard({
  children,
  accent,
  className = '',
}: {
  children: ReactNode
  /** Optional accent that halos through the translucent rim. */
  accent?: string
  className?: string
}) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ duration: 0.32, ease: [...PLAZA_EASE] }}
      className={`rounded-[32px] bg-[rgba(255,255,255,0.55)] p-[10px] backdrop-blur-[24px] ${className}`}
      style={{
        boxShadow: [
          '0 0 30px rgba(255,255,255,0.65)', // soft white radiance
          '0 14px 36px rgba(150,170,195,0.24)', // close diffuse float
          'inset 0 1.5px 3px rgba(255,255,255,0.95)', // top rim light
          'inset 0 -1.5px 3px rgba(160,180,200,0.28)', // bottom rim shade
          ...(accent ? [`0 0 26px ${accent}66`] : []), // accent halo
        ].join(', '),
      }}
    >
      <div
        className="rounded-[24px] px-6 py-6"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.96), rgba(243,248,252,0.9))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}
