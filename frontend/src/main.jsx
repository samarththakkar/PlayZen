
import { registerSW } from 'virtual:pwa-register'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import './styles/index.css'
import App from './App.jsx'

// Register Service Worker
registerSW({
  immediate: true,
})

// Silence console logs in production
if (import.meta.env.PROD) {
  console.log = () => {}
  console.info = () => {}
  console.debug = () => {}
  console.warn = () => {}
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)