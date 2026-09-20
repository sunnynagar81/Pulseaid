import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { SocketProvider } from './contexts/SocketContext.jsx'
import './index.css'

/**
 * StrictMode intentionally double-mounts components in dev to surface
 * side-effect bugs. Leaflet's map library isn't built to tolerate being
 * initialized twice on the same DOM container and throws "Map container
 * is already initialized" when that happens — which crashes the whole
 * render tree to a blank page. Since react-leaflet is a real, load-
 * bearing part of this app (not something we're debugging further),
 * StrictMode is dropped here rather than worked around per-component.
 */
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SocketProvider>
      <App />
    </SocketProvider>
  </BrowserRouter>,
)