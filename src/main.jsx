import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BundleProvider } from './context/BundleContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BundleProvider>
      <App />
    </BundleProvider>
  </StrictMode>,
)