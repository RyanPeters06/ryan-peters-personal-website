import { useEffect } from 'react'

/**
 * Keyboard movement input: WASD or arrow keys.
 * State lives at module level so the frame loop can read it without
 * React involvement; `useMovementKeys` (mounted once) owns the DOM
 * listeners.
 */
const pressed = new Set<string>()

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

/** Current input as a vector: x = strafe right, z = walk forward. */
export function getMoveInput(): { x: number; z: number } {
  let x = 0
  let z = 0
  if (pressed.has('forward')) z += 1
  if (pressed.has('back')) z -= 1
  if (pressed.has('right')) x += 1
  if (pressed.has('left')) x -= 1
  // Normalize diagonals so walking diagonally isn't faster.
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
