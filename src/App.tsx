import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AuthDialog } from './components/auth/AuthDialog'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { AuthDialogProvider } from './contexts/AuthDialogContext'
import { AuthProvider } from './contexts/AuthProvider'
import { ThemeProvider } from './contexts/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthDialogProvider>
          <BrowserRouter>
            <AuthDialog />
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/profiles/:id" element={<ProfilePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthDialogProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
