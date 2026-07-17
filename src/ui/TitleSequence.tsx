import { useWorldStore } from '@/store/useWorldStore'

/**
 * The title itself lives INSIDE the world (scene/TitleWorld.tsx).
 * This is only the invisible invitation: while the title phase holds,
 * a click anywhere lets the visitor in.
 */
export function TitleSequence() {
  const phase = useWorldStore((s) => s.phase)
  const setPhase = useWorldStore((s) => s.setPhase)

  if (phase !== 'title') return null
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-20 cursor-pointer"
      onClick={() => setPhase('arriving')}
    />
  )
}
