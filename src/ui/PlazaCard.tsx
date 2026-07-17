import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** The Wii U app-icon easing: fast start, plush landing. */
export const PLAZA_EASE = [0.22, 1, 0.36, 1] as const

/**
 * The plaza overlay shell — every floating card in the world wears
 * this: a translucent frosted rounded square with a thin white border,
 * a whisper of outer glow, and a soft diffuse shadow. It enters like a
 * Wii U application icon coming to life: scale 0.92 → 1, fade 0 → 1,
 * 320ms. (Exact spec: docs/ART_DIRECTION.md → UI Philosophy.)
 */
export function PlazaCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ duration: 0.32, ease: [...PLAZA_EASE] }}
      className={`rounded-[28px] border-[1.5px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.72)] shadow-[0_0_24px_rgba(255,255,255,0.55),0_14px_40px_rgba(140,165,190,0.22)] backdrop-blur-[20px] ${className}`}
    >
      {children}
    </motion.div>
  )
}
