import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FaBuilding, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

export default function MainLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    toast.info('Signed out')
    navigate('/login')
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <aside
        className="d-none d-md-flex flex-column p-3 text-white"
        style={{ width: 220, background: '#1e3a5f' }}
      >
        <h5 className="mb-4">RPMS</h5>
        <nav className="nav nav-pills flex-column gap-1">
          <NavLink to="/" end className="nav-link text-white d-flex align-items-center gap-2">
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink to="/properties" className="nav-link text-white d-flex align-items-center gap-2">
            <FaBuilding /> Properties
          </NavLink>
        </nav>
      </aside>

      <div className="flex-grow-1 d-flex flex-column" style={{ background: '#f4f6f9' }}>
        <header
          className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white"
        >
          <span className="fw-semibold text-primary">Rental Property Management System</span>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small">{user?.email}</span>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>
        <main className="p-3 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
