import { AnimatePresence } from 'framer-motion'
import { LOCATIONS } from '@/content/locations'
import { useWorldStore } from '@/store/useWorldStore'
import { PlazaCard } from '@/ui/PlazaCard'

/**
 * The card that greets you beside a pod — a Wii U application icon
 * coming to life: frosted rounded square, icon centered at the top,
 * rounded text below. Walking away dismisses it; the world stays
 * fully playable underneath.
 */
export function LocationCard() {
  const activeId = useWorldStore((s) => s.activeLocation)
  const location = LOCATIONS.find((l) => l.id === activeId)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
      <AnimatePresence>
        {location && (
          <PlazaCard
            key={location.id}
            className="pointer-events-auto w-[min(92vw,26rem)] px-6 py-6"
          >
            {/* Icon centered at the top, app-tile style */}
            <div className="mb-2 flex justify-center">
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl text-3xl"
                style={{ backgroundColor: `${location.accent}55` }}
              >
                {location.icon}
              </span>
            </div>
            <h2 className="text-center text-lg font-bold text-[#54636e]">
              {location.name}
            </h2>
            <p className="mb-4 text-center text-sm text-[#8a97a0]">
              {location.tagline}
            </p>
            <ul className="flex flex-col gap-2.5">
              {location.items.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl bg-[rgba(255,255,255,0.65)] px-4 py-3"
                >
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
                    <span className="text-sm font-semibold text-[#54636e]">
                      {item.title}
                    </span>
                  )}
                  <p className="mt-0.5 text-xs leading-relaxed text-[#93a1ab]">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </PlazaCard>
        )}
      </AnimatePresence>
    </div>
  )
}
