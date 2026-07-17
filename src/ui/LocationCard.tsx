import { AnimatePresence, motion } from 'framer-motion'
import { LOCATIONS } from '@/content/locations'
import { useWorldStore } from '@/store/useWorldStore'

/**
 * The floating card that greets you beside a pod: rounded, white,
 * soft-shadowed, springy — reads like a plaza notice, not a dashboard.
 * Walking away makes it hop off; the world stays fully playable.
 */
export function LocationCard() {
  const activeId = useWorldStore((s) => s.activeLocation)
  const location = LOCATIONS.find((l) => l.id === activeId)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
      <AnimatePresence>
        {location && (
          <motion.div
            key={location.id}
            initial={{ y: 56, opacity: 0, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="pointer-events-auto w-[min(92vw,26rem)] rounded-3xl bg-white/95 px-6 py-5 shadow-[0_10px_32px_rgba(120,140,160,0.3)]"
          >
            <div
              className="mb-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-wide text-white"
              style={{ backgroundColor: location.accent }}
            >
              {location.name}
            </div>
            <p className="mb-3 text-sm text-[#8a97a0]">{location.tagline}</p>
            <ul className="flex flex-col gap-2.5">
              {location.items.map((item) => (
                <li key={item.title} className="rounded-2xl bg-[#f4f8fb] px-4 py-3">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-[#4a6d8c] underline-offset-2 hover:underline"
                    >
                      {item.title} ↗
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-[#54636e]">{item.title}</span>
                  )}
                  <p className="mt-0.5 text-xs leading-relaxed text-[#93a1ab]">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
