import { useSyncExternalStore } from 'react'

/** Phones and tablets — a finger, not a mouse. Deliberately NOT an
 *  `ontouchstart` sniff: touch-capable laptops report touch support but
 *  are driven by a trackpad, and would wrongly get the thumb controls. */
const QUERY = '(pointer: coarse)'

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

/** True when the visitor's primary pointer is a finger. Live-updating. */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
