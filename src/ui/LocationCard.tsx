import { AnimatePresence } from 'framer-motion'
import { LOCATIONS } from '@/content/locations'
import { useWorldStore } from '@/store/useWorldStore'
import { useIsTouch } from '@/hooks/useInputMode'
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
  const touch = useIsTouch()

  return (
    // On touch the card rides higher, leaving the bottom band clear for
    // the thumb — otherwise a 92vw card in portrait covers most of the
    // space you need to drag in, and you'd have to walk away blind.
    <div
      className={`pointer-events-none absolute inset-x-0 flex justify-center ${
        touch ? 'bottom-40 landscape:bottom-24' : 'bottom-8'
      }`}
    >
      <AnimatePresence>
        {location && (
          <PlazaCard
            key={location.id}
            accent={location.accent}
            // Always height-capped, because the content decides the
            // height and the frame doesn't grow to match. Touch gets the
            // tighter cap: an iPhone in landscape is only ~390px tall, so
            // a card with three items runs off the top entirely. Desktop
            // caps against the viewport minus the card's own bottom
            // offset and a matching gap at the top — Projects and
            // Experience are tall enough to reach it on a laptop.
            className={`pointer-events-auto w-[min(92vw,26rem)] overflow-y-auto ${
              touch ? 'max-h-[52vh]' : 'max-h-[calc(100vh-6rem)]'
            }`}
          >
            {/* Icon centered at the top — a miniature pillow tile */}
            <div className="mb-2 flex justify-center">
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-xl font-extrabold text-[#54636e]"
                style={{
                  boxShadow: `0 0 14px ${location.accent}88, 0 4px 10px rgba(150,170,195,0.25), inset 0 1px 0 rgba(255,255,255,1)`,
                }}
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
                  className="rounded-2xl bg-[rgba(255,255,255,0.8)] px-4 py-3 shadow-[0_2px_8px_rgba(150,170,195,0.14),inset_0_1px_0_rgba(255,255,255,1)]"
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
