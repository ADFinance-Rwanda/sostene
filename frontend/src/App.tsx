import type { ReactNode } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import NavBar from './components/NavBar'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import TasksPage from './pages/TasksPage'

// Page layout used by every authenticated route: sticky NavBar on top, the
// page content centered below in a max-width container.
function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  )
}

// Loading screen shown while the Keycloak adapter is still initializing.
function ConnectingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-6">
      <div className="bg-white rounded-xl shadow-md p-10 w-full max-w-sm flex flex-col items-center gap-3">
        <div className="h-7 w-7 rounded-full border-[3px] border-slate-200 border-t-indigo-600 animate-spin" />
        <p className="text-slate-500">Connecting to Keycloak…</p>
      </div>
    </div>
  )
}

// Wraps a page in the auth check + layout. Unauthenticated visitors are sent
// to the landing page; the URL they tried to reach is preserved so a future
// "Get started" click can resume there.
function ProtectedPage({ children }: { children: ReactNode }) {
  const { keycloak, initialized } = useKeycloak()
  const location = useLocation()

  if (!initialized) return <ConnectingScreen />
  if (!keycloak.authenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }
  return <PageLayout>{children}</PageLayout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/tasks" element={<ProtectedPage><TasksPage /></ProtectedPage>} />
      <Route path="/dashboard" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
      <Route path="*" element={<ProtectedPage><TasksPage /></ProtectedPage>} />
    </Routes>
  )
}
