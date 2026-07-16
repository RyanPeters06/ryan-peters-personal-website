import { Experience } from '@/scene/Experience'
import { Overlay } from '@/ui/Overlay'

export default function App() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5f8f9]">
      <Experience />
      <Overlay />
    </div>
  )
}
