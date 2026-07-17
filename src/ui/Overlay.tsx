import { ControlsHint } from '@/ui/ControlsHint'
import { LocationCard } from '@/ui/LocationCard'
import { MuteButton } from '@/ui/MuteButton'
import { TitleSequence } from '@/ui/TitleSequence'

/**
 * The 2D layer floating above the world.
 * `pointer-events-none` on the layer, re-enabled per element, so the
 * world stays fully clickable between UI elements.
 */
export function Overlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <TitleSequence />
      <ControlsHint />
      <LocationCard />
      <div className="absolute bottom-5 right-5">
        <MuteButton />
      </div>
    </div>
  )
}
