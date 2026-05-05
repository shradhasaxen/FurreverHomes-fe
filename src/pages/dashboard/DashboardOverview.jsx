import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { bookingApi, orderApi, myPetsApi } from '../../api'
import styles from './DashboardOverview.module.css'

export default function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ pets: 0, bookings: 0, orders: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      myPetsApi.getAll().catch(() => []),
      bookingApi.getMyBookings(0, 3).catch(() => ({ content: [] })),
      orderApi.getAll(0, 3).catch(() => ({ content: [] })),
    ]).then(([pets, bookings, orders]) => {
      setStats({
        pets: Array.isArray(pets) ? pets.length : 0,
        bookings: bookings?.totalElements ?? bookings?.content?.length ?? 0,
        orders: orders?.totalElements ?? orders?.content?.length ?? 0,
      })
      setRecentBookings(bookings?.content ?? [])
      setRecentOrders(orders?.content ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    { label: 'My Pets', value: stats.pets, icon: '🐾', to: '/dashboard/my-pets', color: '#c97b4b' },
    { label: 'Bookings', value: stats.bookings, icon: '📅', to: '/dashboard/bookings', color: '#5b8dee' },
    { label: 'Orders', value: stats.orders, icon: '📦', to: '/dashboard/orders', color: '#3ecf8e' },
  ]

  const QUICK_ACTIONS = [
    { label: 'Book Grooming', icon: '✂️', to: '/grooming' },
    { label: 'Book Pet House', icon: '🏠', to: '/pet-house' },
    { label: 'Shop Products', icon: '🛒', to: '/shopping' },
    { label: 'Adopt a Pet', icon: '❤️', to: '/adopt' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>Welcome back, {user?.name?.split(' ')[0]}! 🐾</h1>
        <p className={styles.welcomeSub}>Here's what's happening with your pets today.</p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={card.to} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: card.color + '18', color: card.color }}>
                {card.icon}
              </div>
              <div>
                <p className={styles.statValue}>{loading ? '—' : card.value}</p>
                <p className={styles.statLabel}>{card.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} to={action.to} className={styles.actionCard}>
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionLabel}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Recent Bookings */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Bookings</h2>
            <Link to="/dashboard/bookings" className={styles.viewAll}>View all →</Link>
          </div>
          {loading ? <p className={styles.empty}>Loading...</p> :
            recentBookings.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No bookings yet.</p>
                <Link to="/grooming" className={styles.emptyAction}>Book a grooming session →</Link>
              </div>
            ) : recentBookings.map(b => (
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

        {/* Recent Orders */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <Link to="/dashboard/orders" className={styles.viewAll}>View all →</Link>
          </div>
          {loading ? <p className={styles.empty}>Loading...</p> :
            recentOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No orders yet.</p>
                <Link to="/shopping" className={styles.emptyAction}>Browse the shop →</Link>
              </div>
            ) : recentOrders.map(o => (
              <div key={o.id} className={styles.listItem}>
                <div>
                  <p className={styles.listTitle}>#{o.orderNumber}</p>
                  <p className={styles.listSub}>₹{o.totalAmount}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    PENDING: '#fff3cd:#856404',
    CONFIRMED: '#d4edda:#155724',
    PROCESSING: '#cce5ff:#004085',
    SHIPPED: '#cce5ff:#004085',
    OUT_FOR_DELIVERY: '#d1ecf1:#0c5460',
    COMPLETED: '#d4edda:#155724',
    CANCELLED: '#f8d7da:#721c24',
    PLACED: '#fff3cd:#856404',
  }
  const [bg, color] = (colors[status] || '#f0f0f0:#555').split(':')
  return (
    <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}
