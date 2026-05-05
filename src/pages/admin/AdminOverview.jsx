import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { adminApi } from '../../api'
import styles from './AdminOverview.module.css'

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, orders: 0, bookings: 0, adoptions: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getAllUsers(0, 1).catch(() => ({ totalElements: 0 })),
      adminApi.getAllOrders(0, 5).catch(() => ({ content: [], totalElements: 0 })),
      adminApi.getAllBookings(0, 5).catch(() => ({ content: [], totalElements: 0 })),
      adminApi.getAllAdoptions(0, 1).catch(() => ({ totalElements: 0 })),
    ]).then(([users, orders, bookings, adoptions]) => {
      setStats({
        users: users?.totalElements ?? 0,
        orders: orders?.totalElements ?? 0,
        bookings: bookings?.totalElements ?? 0,
        adoptions: adoptions?.totalElements ?? 0,
      })
      setRecentOrders(orders?.content ?? [])
      setRecentBookings(bookings?.content ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const CARDS = [
    { label: 'Total Users', value: stats.users, icon: '👥', color: '#5b8dee', to: '/admin/users' },
    { label: 'Total Orders', value: stats.orders, icon: '📦', color: '#c97b4b', to: '/admin/orders' },
    { label: 'Total Bookings', value: stats.bookings, icon: '📅', color: '#3ecf8e', to: '/admin/bookings' },
    { label: 'Adoptions', value: stats.adoptions, icon: '❤️', color: '#e05252', to: '/admin/adoptions' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Platform Overview</h1>
        <p className={styles.sub}>Real-time snapshot of FurrEver Homes activity</p>
      </div>

      <div className={styles.statsGrid}>
        {CARDS.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link to={card.to} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: card.color + '18', color: card.color }}>{card.icon}</div>
              <div>
                <p className={styles.statValue}>{loading ? '—' : card.value}</p>
                <p className={styles.statLabel}>{card.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className={styles.twoCol}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <Link to="/admin/orders" className={styles.viewAll}>View all →</Link>
          </div>
          {loading ? <p className={styles.empty}>Loading...</p> :
            recentOrders.length === 0 ? <p className={styles.empty}>No orders yet</p> :
            recentOrders.map(o => (
              <div key={o.id} className={styles.listItem}>
                <div>
                  <p className={styles.listTitle}>#{o.orderNumber}</p>
                  <p className={styles.listSub}>₹{o.totalAmount} · {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))
          }
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Bookings</h2>
            <Link to="/admin/bookings" className={styles.viewAll}>View all →</Link>
          </div>
          {loading ? <p className={styles.empty}>Loading...</p> :
            recentBookings.length === 0 ? <p className={styles.empty}>No bookings yet</p> :
            recentBookings.map(b => (
              <div key={b.id} className={styles.listItem}>
                <div>
                  <p className={styles.listTitle}>{b.serviceType} — {b.petName}</p>
                  <p className={styles.listSub}>{b.bookingDate || 'Date TBD'}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    PLACED: ['#fff3cd','#856404'], CONFIRMED: ['#d4edda','#155724'],
    PROCESSING: ['#cce5ff','#004085'], SHIPPED: ['#cce5ff','#004085'],
    OUT_FOR_DELIVERY: ['#d1ecf1','#0c5460'], COMPLETED: ['#d4edda','#155724'],
    CANCELLED: ['#f8d7da','#721c24'], PENDING: ['#fff3cd','#856404'],
    APPROVED: ['#d4edda','#155724'], REJECTED: ['#f8d7da','#721c24'],
  }
  const [bg, color] = map[status] || ['#f0f0f0','#555']
  return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>
}
