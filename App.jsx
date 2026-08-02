import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MainLayout from './components/layouts/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Lazy-loaded route components (per spec: lazy loading for routes)
const PropertyList = lazy(() => import('./pages/property/PropertyList'))
const PropertyForm = lazy(() => import('./pages/property/PropertyForm'))

function RouteFallback() {
  return <div className="text-muted p-4">Loading...</div>
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected app routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<PropertyList />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="properties/:id/edit" element={<PropertyForm />} />
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" autoClose={3000} />
    </ErrorBoundary>
  )
}
