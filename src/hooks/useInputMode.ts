import { useSyncExternalStore } from 'react'

/**
 * How the visitor is actually driving the world — a finger, or a cursor.
 *
 * This is decided from the events they GENERATE, not from what the
 * browser claims the device is, because that claim is wrong on common
 * hardware. Measured on a Windows touchscreen laptop (2026-07-28):
 *
 *   pointer: coarse   true      pointer: fine    false
 *   hover: none       true      hover: hover     false
 *   any-pointer: fine false     any-hover: hover false
 *
 * Chrome classified a laptop with two mice attached as a TOUCH-ONLY
 * device, so every media query — including `(hover: none) and
 * (pointer: coarse)`, the usual robust one — put a desktop visitor on
 * the mobile path. `navigator.userAgentData` was unsupported there too.
 *
 * Per-EVENT `pointerType` is reliable on the same machine (a real
 * trackpad move reports `pointerType: 'mouse'`, `isTrusted: true`), so
 * that is what decides. The media query is kept only as the opening
 * guess, which matters solely for the first moments of a phone visit —
 * and by the time any of this is on screen (the controls card waits for
 * the `idle` phase, ~8s in) a real event has long since settled it.
 */
export type InputMode = 'touch' | 'pointer'

const MOVE_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
])

function firstGuess(): InputMode {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches
    ? 'touch'
    : 'pointer'
}

let mode: InputMode = firstGuess()
const listeners = new Set<() => void>()
let wired = false

function set(next: InputMode): void {
  if (next === mode) return
  mode = next
  for (const l of listeners) l()
}

function onPointer(e: PointerEvent): void {
  if (e.pointerType === 'touch') set('touch')
  else if (e.pointerType === 'mouse' || e.pointerType === 'pen') set('pointer')
}

function onKey(e: KeyboardEvent): void {
  // Reaching for WASD is as clear a statement as moving a mouse.
  if (MOVE_KEYS.has(e.code)) set('pointer')
}

/** Wired once for the app's lifetime — the answer is global, and these
 *  three passive capture listeners cost nothing. */
function wire(): void {
  if (wired) return
  wired = true
  window.addEventListener('pointerdown', onPointer, true)
  window.addEventListener('pointermove', onPointer, true)
  window.addEventListener('keydown', onKey, true)
}

function subscribe(onChange: () => void): () => void {
  wire()
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

function getSnapshot(): InputMode {
  return mode
}

/** 'touch' or 'pointer', live-updating the moment the visitor switches. */
export function useInputMode(): InputMode {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'pointer')
}

/** Convenience for the many places that only care whether it's a thumb. */
export function useIsTouch(): boolean {
  return useInputMode() === 'touch'
}
