import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import { TimerProvider } from './hooks/useTimer.jsx'
import { ToastProvider } from './context/ToastContext'
import { DirectChatProvider } from './context/DirectChatContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <TimerProvider>
          <ToastProvider>
            <DirectChatProvider>
              <App />
            </DirectChatProvider>
          </ToastProvider>
        </TimerProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
