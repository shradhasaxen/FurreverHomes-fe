import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Admin.module.css'

const NAV = [
  { to: '/admin', label: 'Overview', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/bookings', label: 'Bookings', icon: '📅' },
  { to: '/admin/adoptions', label: 'Adoptions', icon: '❤️' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div>
            <span className={styles.brand}>🐾 FurrEver</span>
            <span className={styles.adminBadge}>ADMIN</span>
          </div>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <div className={styles.userCard}>
          <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userRole}>Administrator</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.navItem} onClick={() => navigate('/dashboard')}>
            <span className={styles.navIcon}>👤</span> User Dashboard
          </button>
          <button className={styles.navItem} onClick={() => navigate('/')}>
            <span className={styles.navIcon}>🌐</span> Back to Site
          </button>
          <button className={`${styles.navItem} ${styles.logoutBtn}`} onClick={handleLogout}>
            <span className={styles.navIcon}>🚪</span> Logout
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <span className={styles.pageTitle}>Admin Panel</span>
          <div className={styles.topbarRight}>
            <span className={styles.adminTag}>⚡ Admin Mode</span>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>

      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}
