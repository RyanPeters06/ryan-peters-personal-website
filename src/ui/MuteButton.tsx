import { motion } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'

/** Simple friendly speaker glyphs — no icon library needed yet. */
function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 9.5v5a1 1 0 0 0 1 1h2.6l4.2 3.3a.8.8 0 0 0 1.3-.63V5.83a.8.8 0 0 0-1.3-.63L7.6 8.5H5a1 1 0 0 0-1 1Z"
        fill="#6b7f76"
      />
      {muted ? (
        <path
          d="m16.2 9.3 5 5.4M21.2 9.3l-5 5.4"
          stroke="#6b7f76"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M15.8 9.6a3.4 3.4 0 0 1 0 4.8"
            stroke="#6b7f76"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M18.2 7.4a6.6 6.6 0 0 1 0 9.2"
            stroke="#6b7f76"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.55"
          />
        </>
      )}
    </svg>
  )
}

/**
 * The first overlay citizen: a floating mute toggle.
 * Rounded, soft-shadowed, springy on touch — the pattern every future
 * overlay element (cards, prompts) follows.
 */
export function MuteButton() {
  const muted = useWorldStore((s) => s.muted)
  const toggleMuted = useWorldStore((s) => s.toggleMuted)

  return (
    <motion.button
      type="button"
      onClick={toggleMuted}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      aria-pressed={muted}
      className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-[0_4px_16px_rgba(120,140,130,0.25)] outline-offset-4"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <SpeakerIcon muted={muted} />
    </motion.button>
  )
}
