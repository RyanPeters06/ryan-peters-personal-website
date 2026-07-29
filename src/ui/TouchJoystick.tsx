import { useCallback, useEffect, useRef } from 'react'
import { useWorldStore } from '@/store/useWorldStore'
import { useIsTouch } from '@/hooks/useInputMode'
import { clearStickInput, setStickInput } from '@/systems/movement/useMovementInput'

/**
 * The thumb stick — mobile's answer to WASD.
 *
 * It is INVISIBLE at rest, by design: a phone screen is small and the
 * plaza is the point, so nothing sits on top of it until a thumb
 * actually lands. Wherever that thumb touches down becomes the stick's
 * centre, so there is no target to hunt for and no wrong place to press.
 * Discoverability is carried entirely by `ControlsHint`, the centred
 * card that teaches the gesture during the idle beat.
 *
 * Nothing here re-renders: the ring and knob are moved by writing
 * transforms straight to their refs, because pointermove fires at
 * screen refresh rate and a React render per move would be absurd.
 */

/** How far the knob may travel from the touch origin, in CSS px. Also
 *  the distance that counts as "full tilt" for walking speed. */
const KNOB_RADIUS = 56
/** Travel below this fraction reads as a resting thumb, not a walk. */
const DEADZONE = 0.12
/** Speed just past the deadzone. Without a floor here the first sliver
 *  of tilt produces an imperceptible creep that reads as a stuck stick. */
const MIN_SPEED = 0.35

const RING = 132
const KNOB = 58

export function TouchJoystick() {
  const touch = useIsTouch()
  const phase = useWorldStore((s) => s.phase)
  const walkable = phase === 'idle' || phase === 'exploring'

  const ringRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  /** The pointer we are following, or null when no thumb is down. */
  const pointerId = useRef<number | null>(null)
  const originX = useRef(0)
  const originY = useRef(0)

  /** Park the stick: no finger, no input, nothing on screen. Also the
   *  recovery path for pointercancel / backgrounding / unmount — if this
   *  is ever missed, the avatar walks forever with no thumb touching. */
  const release = useCallback(() => {
    pointerId.current = null
    clearStickInput()
    const ring = ringRef.current
    const knob = knobRef.current
    if (ring) ring.style.opacity = '0'
    if (knob) knob.style.transform = 'translate3d(0px, 0px, 0)'
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // One thumb owns the stick; a second finger is ignored outright.
    if (pointerId.current !== null) return
    pointerId.current = e.pointerId
    originX.current = e.clientX
    originY.current = e.clientY

    const ring = ringRef.current
    const knob = knobRef.current
    if (ring) {
      ring.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      ring.style.opacity = '1'
    }
    if (knob) knob.style.transform = 'translate3d(0px, 0px, 0)'
  }, [])

  // Move/end live on WINDOW, not the pad: a thumb that slides off the
  // activation zone mid-walk must keep steering, not silently stop.
  useEffect(() => {
    if (!touch || !walkable) return

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId.current) return
      const rawX = e.clientX - originX.current
      const rawY = e.clientY - originY.current
      const dist = Math.hypot(rawX, rawY)

      // Knob follows the thumb but is leashed to the ring.
      const clamp = dist > KNOB_RADIUS ? KNOB_RADIUS / dist : 1
      const knob = knobRef.current
      if (knob) {
        knob.style.transform =
          `translate3d(${rawX * clamp}px, ${rawY * clamp}px, 0)`
      }

      const mag = Math.min(dist / KNOB_RADIUS, 1)
      if (dist === 0 || mag < DEADZONE) {
        setStickInput(0, 0)
        return
      }
      const t = (mag - DEADZONE) / (1 - DEADZONE)
      const speed = MIN_SPEED + (1 - MIN_SPEED) * t
      const inv = 1 / dist
      // SIGN CONVENTION: screen-up is NEGATIVE dy in DOM coordinates,
      // but z = +1 means "walk away from the camera" (Avatar scales
      // _camFlat, which points camera -> avatar). Hence the flip on y.
      // Getting this backwards inverts forward and back.
      setStickInput(rawX * inv * speed, -rawY * inv * speed)
    }

    const onEnd = (e: PointerEvent) => {
      if (e.pointerId !== pointerId.current) return
      release()
    }
    // A backgrounded tab, an incoming call, or the app switcher all cut
    // the gesture off without a pointerup.
    const onHide = () => {
      if (pointerId.current !== null) release()
    }

    // Rotating mid-drag invalidates the origin (it is in viewport
    // coordinates, and the viewport just swapped axes). Let go rather
    // than trying to remap it — the stick recentres on the next touch
    // anyway, so re-planting a thumb costs the visitor nothing.
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
    window.addEventListener('blur', onHide)
    window.addEventListener('resize', onHide)
    // iOS freezes pages into the bfcache without always firing
    // visibilitychange, so pagehide is the reliable backstop there.
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
      window.removeEventListener('blur', onHide)
      window.removeEventListener('resize', onHide)
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onHide)
      release()
    }
  }, [touch, walkable, release])

  if (!touch || !walkable) return null

  return (
    <>
      {/* The activation zone. Transparent, and mounted FIRST inside the
          overlay so every card and button paints above it and keeps its
          own taps. touch-action:none is load-bearing on iOS — without it
          Safari's scroll gesture steals the pointer mid-drag.

          It stops SHORT of the left/right screen edges on purpose: iOS
          reserves roughly 20px there for the back/forward swipe, and a
          drag starting inside that strip is taken by the system (you get
          an instant pointercancel instead of a walk). In portrait the
          safe-area inset is 0 on those edges, so this margin is the only
          thing keeping the stick out of the system's way. */}
      <div
        onPointerDown={onPointerDown}
        className="pointer-events-auto absolute inset-x-6 bottom-0 h-[70%] touch-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] landscape:h-[85%]"
      />

      {/* The stick itself. `fixed` and positioned from raw clientX/Y, so
          it lands exactly under the thumb regardless of how the overlay
          above is inset for safe areas. */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: RING,
          height: RING,
          marginLeft: -RING / 2,
          marginTop: -RING / 2,
          opacity: 0,
          willChange: 'transform, opacity',
          transition: 'opacity 140ms ease-out',
          // Flat translucent fill, NOT the house backdrop-blur. The
          // backdrop here is a live WebGL canvas repainting every frame,
          // so a blur would re-sample the whole plaza continuously for
          // the entire duration of every walk — a real GPU cost on the
          // phones this exists for.
          //
          // Tinted blue-grey rather than white: the plaza floor is
          // near-white, and a white-on-white ring genuinely vanished
          // against it when checked on device-sized frames. This is the
          // palette's own shadow family, so it still reads as a soft
          // pastel dish pressed into the scene, not as new chrome.
          background: 'rgba(203,220,233,0.5)',
          boxShadow: [
            '0 0 22px rgba(255,255,255,0.5)',
            '0 8px 22px rgba(150,170,195,0.22)',
            'inset 0 2px 4px rgba(255,255,255,0.9)',
            'inset 0 -2px 5px rgba(140,163,186,0.4)',
          ].join(', '),
        }}
        className="pointer-events-none z-20 grid place-items-center rounded-full"
      >
        <div
          ref={knobRef}
          style={{
            width: KNOB,
            height: KNOB,
            willChange: 'transform',
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(243,248,252,0.92))',
            boxShadow: [
              '0 0 16px rgba(255,255,255,0.6)',
              '0 6px 14px rgba(150,170,195,0.28)',
              'inset 0 1px 0 rgba(255,255,255,1)',
            ].join(', '),
          }}
          className="rounded-full"
        />
      </div>
    </>
  )
}
