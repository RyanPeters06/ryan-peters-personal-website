import { useEffect } from 'react'

/**
 * Movement input from either hand: WASD/arrow keys, or the mobile touch
 * stick. State lives at module level so the frame loop can read it
 * without React involvement; `useMovementKeys` (mounted once) owns the
 * keyboard listeners, `TouchJoystick` owns the stick's.
 */
const pressed = new Set<string>()

/** The touch stick's live analog vector, same axes as `getMoveInput`.
 *  A plain mutable object so the joystick's pointermove handler can
 *  write it without allocating (it fires at screen refresh rate). The
 *  deadzone and speed curve are applied by the joystick before it gets
 *  here — this module just sums whatever it is given. */
const stick = { x: 0, z: 0 }

const KEYMAP: Record<string, keyof MoveInput | undefined> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

interface MoveInput {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
}

/** Set the touch stick's contribution. Values are already conditioned
 *  (deadzone applied, magnitude ≤ 1) by the joystick. */
export function setStickInput(x: number, z: number): void {
  stick.x = x
  stick.z = z
}

/** Let go of the stick — also the safety net for `pointercancel`, an
 *  unmount, or the tab going away mid-drag. Without this the avatar
 *  would keep walking with no finger on the screen. */
export function clearStickInput(): void {
  stick.x = 0
  stick.z = 0
}

/** Current input as a vector: x = strafe right, z = walk forward.
 *  Keyboard and stick sum, so neither locks the other out. */
export function getMoveInput(): { x: number; z: number } {
  let x = stick.x
  let z = stick.z
  if (pressed.has('forward')) z += 1
  if (pressed.has('back')) z -= 1
  if (pressed.has('right')) x += 1
  if (pressed.has('left')) x -= 1
  // Clamp to unit length so a diagonal — or a stick and a key pushed
  // the same way at once — never walks faster than straight ahead.
  // Magnitudes BELOW 1 pass through untouched: that is what carries the
  // stick's analog tilt through to the avatar's walk speed.
  const len = Math.hypot(x, z)
  return len > 1 ? { x: x / len, z: z / len } : { x, z }
}

/** Mount once (in Experience) to wire up the DOM listeners. */
export function useMovementKeys(): void {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const action = KEYMAP[e.code]
      if (!action) return
      // Arrow keys scroll the page by default — this is a game view.
      e.preventDefault()
      pressed.add(action)
    }
    const up = (e: KeyboardEvent) => {
      const action = KEYMAP[e.code]
      if (action) pressed.delete(action)
    }
    const clear = () => pressed.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
      pressed.clear()
    }
  }, [])
}
