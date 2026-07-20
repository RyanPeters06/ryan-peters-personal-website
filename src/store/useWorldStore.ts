import { create } from 'zustand'

/**
 * Shared world state.
 *
 * The 3D frame loop reads from this store imperatively via
 * `useWorldStore.getState()` (no React re-renders), while overlay UI
 * subscribes reactively with the hook form.
 */
/** The experience's high-level moment: the title over the living
 *  world, drifting in from the sky, the avatar's hello, standing
 *  ready (controls hint up), then walking. */
export type WorldPhase = 'title' | 'arriving' | 'greeting' | 'idle' | 'exploring'

interface WorldState {
  phase: WorldPhase
  setPhase: (phase: WorldPhase) => void

  /** Global audio mute. Audio itself arrives in a later milestone, but
   *  the contract exists from day one. */
  muted: boolean
  toggleMuted: () => void

  /** Which location's pod the avatar is standing beside, if any. */
  activeLocation: string | null
  setActiveLocation: (id: string | null) => void
}

export const useWorldStore = create<WorldState>()((set) => ({
  phase: 'title',
  setPhase: (phase) => set({ phase }),

  muted: false,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  activeLocation: null,
  setActiveLocation: (activeLocation) => set({ activeLocation }),
}))
