import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Quicksand for DOM text. The project had NO @font-face at all: the
// font stack in index.css lists Quicksand, but @fontsource only puts
// files in node_modules — it doesn't install anything to the OS — so
// that entry never resolved. On macOS the earlier `ui-rounded` /
// Hiragino entries caught it and the UI looked rounded as designed; on
// Windows every rounded option missed and it fell all the way through
// to Calibri, a flat humanist sans. Registering the face is what makes
// the UI actually look the way it was drawn, and matches the 3D panel
// labels, which have always rendered this exact woff through troika.
// Latin subsets only (smaller than the `700.css` entrypoint, which also
// carries latin-ext). `font-display: swap`, and it resolves well within
// the loading screen, so there is no visible swap.
import '@fontsource/quicksand/latin-500.css'
import '@fontsource/quicksand/latin-700.css'
import '@/styles/index.css'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
