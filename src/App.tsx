import { Experience } from '@/scene/Experience'
import { Overlay } from '@/ui/Overlay'

export default function App() {
  return (
    // bg matches PALETTE.skyMid: no white frame while the canvas mounts.
    <div className="relative h-full w-full overflow-hidden bg-[#d6ecfa]">
      <Experience />
      <Overlay />
    </div>
  )
}
