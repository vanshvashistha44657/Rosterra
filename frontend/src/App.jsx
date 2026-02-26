import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profiles from './pages/Profiles'
import Users from './pages/Users'
import PlatformProfiles from './pages/PlatformProfiles'
import FrameFaceRoaster from './pages/FrameFaceRoaster'
import RoasterResponse from './pages/RoasterResponse'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useState } from 'react'

function App() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout onSearch={setSearchTerm}>
                      <Profiles searchTerm={searchTerm} />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/platform/:platform"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PlatformProfiles />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roaster"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <FrameFaceRoaster />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roaster/response"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <RoasterResponse />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Users />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <SpeedInsights />
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
