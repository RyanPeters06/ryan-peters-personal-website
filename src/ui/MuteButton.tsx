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
      className="pointer-events-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[rgba(255,255,255,0.55)] p-[5px] backdrop-blur-[24px] outline-offset-4"
      style={{
        boxShadow: [
          '0 0 18px rgba(255,255,255,0.6)',
          '0 8px 22px rgba(150,170,195,0.22)',
          'inset 0 1.5px 3px rgba(255,255,255,0.95)',
          'inset 0 -1.5px 3px rgba(160,180,200,0.28)',
        ].join(', '),
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span
        className="grid h-full w-full place-items-center rounded-[13px]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.96), rgba(243,248,252,0.9))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        <SpeakerIcon muted={muted} />
      </span>
    </motion.button>
  )
}
