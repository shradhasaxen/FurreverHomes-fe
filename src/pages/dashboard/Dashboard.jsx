import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import styles from './Dashboard.module.css'

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: '🏠', end: true },
  { to: '/dashboard/my-pets', label: 'My Pets', icon: '🐾' },
  { to: '/dashboard/bookings', label: 'Bookings', icon: '📅' },
  { to: '/dashboard/orders', label: 'Orders', icon: '📦' },
  { to: '/dashboard/adoptions', label: 'Adoptions', icon: '❤️' },
  { to: '/dashboard/profile', label: 'My Profile', icon: '👤' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.brand}>🐾 FurrEver</span>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <div className={styles.userCard}>
          <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userEmail}>{user?.email}</p>
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
          <button className={styles.navItem} onClick={() => navigate('/')}>
            <span className={styles.navIcon}>🌐</span> Back to Site
          </button>
          <button className={`${styles.navItem} ${styles.logoutBtn}`} onClick={handleLogout}>
            <span className={styles.navIcon}>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <span className={styles.pageTitle}>Dashboard</span>
          <div className={styles.topbarRight}>
            <span className={styles.greeting}>Hi, {user?.name?.split(' ')[0]} 👋</span>
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>

      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
