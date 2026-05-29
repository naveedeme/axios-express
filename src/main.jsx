import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA
registerSW({
  onNeedRefresh() {
    if (confirm('New course content available. Reload to update?')) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    console.log('FS Mastery: App ready to work offline!')
  },
})

// Global styles
const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; }
  body { 
    font-family: 'DM Sans', sans-serif; 
    -webkit-font-smoothing: antialiased; 
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }
  #root { height: 100vh; overflow: hidden; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.5); }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  button { font-family: inherit; }
  * { -webkit-tap-highlight-color: transparent; }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
