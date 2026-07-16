import { create } from 'zustand'
import type { LatLon } from '@/lib/math/spherical'

/**
 * Shared world state.
 *
 * The 3D frame loop reads from this store imperatively via
 * `useWorldStore.getState()` (no React re-renders), while overlay UI
 * subscribes reactively with the hook form.
 */
/** The experience's high-level moment: drifting in from the sky,
 *  the avatar's hello, then everyday life on the planet. */
export type WorldPhase = 'arriving' | 'greeting' | 'idle'

interface WorldState {
  phase: WorldPhase
  setPhase: (phase: WorldPhase) => void

  /** Global audio mute. Audio itself arrives in a later milestone, but
   *  the contract exists from day one. */
  muted: boolean
  toggleMuted: () => void

  /**
   * Where the camera should focus. `null` means "idle cinematic drift".
   * Later milestones point this at the avatar or at a location.
   */
  cameraFocus: LatLon | null
  setCameraFocus: (focus: LatLon | null) => void
}

export const useWorldStore = create<WorldState>()((set) => ({
  phase: 'arriving',
  setPhase: (phase) => set({ phase }),

  muted: false,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  cameraFocus: null,
  setCameraFocus: (cameraFocus) => set({ cameraFocus }),
}))
