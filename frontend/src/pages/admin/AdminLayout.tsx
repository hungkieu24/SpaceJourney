import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../store/journeyStore'
import { AdminDashboard } from './AdminDashboard'
import { SceneManager } from './SceneManager'
import { PhotoManager } from './PhotoManager'

export function AdminLayout() {
  const { logout } = useAdminStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const navItems = [
    { to: '/admin', label: '🌌 Dashboard', end: true },
    { to: '/admin/scenes', label: '🎬 Quản lý cảnh', end: false },
    { to: '/admin/photos', label: '📸 Quản lý ảnh', end: false },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="logo">MISSION CONTROL</div>

        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <a
            href="/"
            target="_blank"
            className="admin-nav-item"
            style={{ marginBottom: '8px', display: 'flex' }}
          >
            🚀 Xem trang web
          </a>
          <button className="admin-nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
            🔓 Đăng xuất
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="scenes" element={<SceneManager />} />
          <Route path="photos" element={<PhotoManager />} />
        </Routes>
      </main>
    </div>
  )
}
