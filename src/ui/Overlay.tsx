import { ControlsHint } from '@/ui/ControlsHint'
import { HeaderBadge } from '@/ui/HeaderBadge'
import { LocationCard } from '@/ui/LocationCard'
import { MuteButton } from '@/ui/MuteButton'
import { TitleSequence } from '@/ui/TitleSequence'
import { TopRightTools } from '@/ui/TopRightTools'
import { TouchHint } from '@/ui/TouchHint'
import { TouchJoystick } from '@/ui/TouchJoystick'
import { WelcomeCard } from '@/ui/WelcomeCard'

/**
 * The 2D layer floating above the world.
 * `pointer-events-none` on the layer, re-enabled per element, so the
 * world stays fully clickable between UI elements.
 *
 * The layer's own box is inset by the phone's safe areas rather than
 * filling the viewport, so every `absolute` child inside it clears the
 * notch and the home indicator for free. This has to be done on the
 * insets, NOT with padding: an absolutely positioned child resolves
 * against its ancestor's PADDING BOX, so padding here would be
 * invisible to `left-6` and the header would slide under the notch in
 * landscape. (The sky still runs edge to edge — this only moves chrome.)
 */
export function Overlay() {
  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        top: 'env(safe-area-inset-top, 0px)',
        right: 'env(safe-area-inset-right, 0px)',
        bottom: 'env(safe-area-inset-bottom, 0px)',
        left: 'env(safe-area-inset-left, 0px)',
      }}
    >
      {/* First, so every card and button below paints above the stick's
          activation zone and keeps its own taps. */}
      <TouchJoystick />
      <TitleSequence />
      <HeaderBadge />
      <TopRightTools />
      <WelcomeCard />
      <ControlsHint />
      <TouchHint />
      <LocationCard />
      <div className="absolute bottom-5 right-5">
        <MuteButton />
      </div>
    </div>
  )
}
