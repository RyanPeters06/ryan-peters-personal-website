import { AnimatePresence } from 'framer-motion'
import { useWorldStore } from '@/store/useWorldStore'
import { PlazaCard } from '@/ui/PlazaCard'

/**
 * The bottom-left greeting card from the reference: a short welcome
 * once the visitor has control, sitting alongside the controls hint
 * rather than replacing it.
 */
export function WelcomeCard() {
  const phase = useWorldStore((s) => s.phase)
  const visible = phase === 'idle' || phase === 'exploring'

  return (
    <div className="pointer-events-none absolute bottom-8 left-8">
      <AnimatePresence>
        {visible && (
          <PlazaCard className="w-[min(72vw,15rem)]">
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none">👋</span>
              <div>
                <h2 className="text-sm font-bold text-[#54636e]">Welcome!</h2>
                <p className="mt-0.5 text-xs leading-snug text-[#8a97a0]">
                  Explore around to learn more about me and my work.
                </p>
              </div>
            </div>
          </PlazaCard>
        )}
      </AnimatePresence>
    </div>
  )
}
