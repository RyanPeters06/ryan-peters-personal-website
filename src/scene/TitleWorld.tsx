import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { Group, Mesh } from 'three'
import { useWorldStore } from '@/store/useWorldStore'
import fontUrl from '@fontsource/quicksand/files/quicksand-latin-700-normal.woff?url'

/**
 * The name of the place, existing INSIDE the world — not an overlay.
 *
 * Real 3D text floating in the atmosphere above the planet's crown,
 * facing the visitor. Because it is scene geometry at real depth, it
 * inherits everything that makes the world feel alive: the camera's
 * slow drift moves it with true parallax, clouds pass in front of and
 * behind it, and its soft white outline-glow reads as the sky's own
 * light catching it.
 *
 * Reveal: after the opening shot settles, it condenses out of the
 * bright atmosphere — fading in while easing gently upward, with the
 * slightest scale bloom. Dissolve: on the visitor's click it releases
 * back into the light (opacity out, glow widening, drifting upward)
 * while the camera is already beginning its descent. Calm, confident,
 * never a hard cut.
 */

/** Where the title hangs: just above the landmark row, at roughly
 *  their depth — real atmosphere between the camera and the letters.
 *  The fixed tableau camera has a narrow, steeply-downward frustum
 *  (see TABLEAU_CAMERA_POS/TARGET), so there is very little headroom
 *  above the plaza; these values are tuned to sit inside it without
 *  clipping. Compact: it crowns the scene, it never overlaps the
 *  monuments or leaves the frame. */
const ANCHOR_Y = 0
const ANCHOR_Z = -9

const ease = (p: number) => {
  const t = Math.min(1, Math.max(0, p))
  return t * t * (3 - 2 * t)
}

/** Troika text mesh with the animatable material-driven properties. */
type TitleText = Mesh & {
  fillOpacity: number
  outlineOpacity: number
  outlineBlur: number | string
}

export function TitleWorld() {
  const phase = useWorldStore((s) => s.phase)
  const group = useRef<Group>(null)
  const title = useRef<TitleText>(null)
  const sub = useRef<TitleText>(null)
  const cta = useRef<TitleText>(null)
  const tl = useRef({ t: 0, dissolveT: -1, done: false })

  useFrame((_, rawDt) => {
    const s = tl.current
    if (s.done) return
    const dt = Math.min(rawDt, 0.1)
    const inTitle = useWorldStore.getState().phase === 'title'
    if (inTitle) s.t += dt
    else if (s.dissolveT < 0) s.dissolveT = 0
    if (s.dissolveT >= 0) s.dissolveT += dt

    // Reveal envelopes (staggered) and the dissolve envelope.
    const rTitle = ease((s.t - 0.9) / 1.7)
    const rSub = ease((s.t - 1.9) / 1.4)
    const rCta = ease((s.t - 2.9) / 1.2)
    const dis = s.dissolveT >= 0 ? ease(s.dissolveT / 1.35) : 0

    if (group.current) {
      // Slow upward easing on reveal; a gentle release upward on dissolve.
      group.current.position.set(0, ANCHOR_Y - (1 - rTitle) * 1.1 + dis * 2.6, ANCHOR_Z)
      group.current.scale.setScalar((0.965 + rTitle * 0.035) * (1 + dis * 0.05))
    }

    const apply = (
      ref: React.RefObject<TitleText | null>,
      opacity: number,
      blur: number,
    ) => {
      const m = ref.current
      if (!m) return
      m.fillOpacity = opacity
      m.outlineOpacity = opacity * 0.9
      // The glow widens as the text dissolves back into the light.
      m.outlineBlur = blur * (1 + dis * 2.4)
    }
    apply(title, rTitle * (1 - dis) * 0.96, 0.09)
    apply(sub, rSub * (1 - dis) * 0.85, 0.06)
    const pulse = 0.68 + 0.32 * Math.sin(s.t * 1.5)
    apply(cta, rCta * (1 - dis) * 0.75 * pulse, 0.06)

    if (s.dissolveT > 1.5) s.done = true
  })

  if (tl.current.done || (phase !== 'title' && tl.current.dissolveT > 1.4)) {
    return null
  }

  return (
    <Billboard ref={group} position={[0, ANCHOR_Y, ANCHOR_Z]} follow>
      <Text
        ref={title}
        font={fontUrl}
        fontSize={3.1}
        letterSpacing={-0.015}
        color="#6d8494"
        anchorX="center"
        anchorY="middle"
        position={[0, 1.5, 0]}
        outlineWidth={0}
        outlineBlur={0.09}
        outlineColor="#ffffff"
        fillOpacity={0}
        outlineOpacity={0}
      >
        {'Ryan Land'}
      </Text>
      <Text
        ref={sub}
        font={fontUrl}
        fontSize={0.92}
        letterSpacing={0.22}
        color="#93a5b1"
        anchorX="center"
        anchorY="middle"
        position={[0, -0.75, 0]}
        outlineWidth={0}
        outlineBlur={0.06}
        outlineColor="#ffffff"
        fillOpacity={0}
        outlineOpacity={0}
      >
        An Interactive Software Engineering Portfolio
      </Text>
      <Text
        ref={cta}
        font={fontUrl}
        fontSize={0.68}
        letterSpacing={0.28}
        color="#a8b6c0"
        anchorX="center"
        anchorY="middle"
        position={[0, -2.1, 0]}
        outlineWidth={0}
        outlineBlur={0.06}
        outlineColor="#ffffff"
        fillOpacity={0}
        outlineOpacity={0}
      >
        Click Anywhere to Explore
      </Text>
    </Billboard>
  )
}
