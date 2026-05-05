import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '../../api'
import styles from './Bookings.module.css'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => { loadBookings() }, [])

  async function loadBookings() {
    setLoading(true)
    try {
      const res = await bookingApi.getMyBookings(0, 20)
      setBookings(res?.content ?? [])
    } catch { setBookings([]) }
    finally { setLoading(false) }
  }

  async function handleCancel(id) {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      const updated = await bookingApi.cancel(id)
      setBookings(b => b.map(x => x.id === id ? updated : x))
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel this booking')
    } finally { setCancelling(null) }
  }

  const canCancel = (status) => !['COMPLETED', 'CANCELLED'].includes(status)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Bookings 📅</h1>
          <p className={styles.sub}>Grooming and boarding booking history</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/grooming" className={styles.actionBtn}>Book Grooming</Link>
          <Link to="/pet-house" className={styles.actionBtn}>Book Boarding</Link>
        </div>
      </div>

      {loading ? <p className={styles.loading}>Loading bookings...</p> :
        bookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>📅</p>
            <h3>No bookings yet</h3>
            <p>Book a grooming session or pet boarding to get started.</p>
            <div className={styles.emptyActions}>
              <Link to="/grooming" className={styles.actionBtn}>Book Grooming ✂️</Link>
              <Link to="/pet-house" className={styles.actionBtn}>Book Boarding 🏠</Link>
            </div>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {bookings.map(b => (
              <div key={b.id} className={styles.bookingCard}>
                <div className={styles.bookingIcon}>
                  {b.serviceType === 'GROOMING' ? '✂️' : '🏠'}
                </div>
                <div className={styles.bookingInfo}>
                  <div className={styles.bookingTop}>
                    <h3 className={styles.bookingTitle}>
                      {b.serviceType === 'GROOMING' ? 'Grooming' : 'Boarding'} — {b.petName}
                    </h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className={styles.bookingMeta}>
                    <span>🐾 {b.petType}</span>
                    {b.bookingDate && <span>📅 {b.bookingDate}</span>}
                    {b.bookingTime && <span>🕐 {b.bookingTime}</span>}
                    {b.durationDays && <span>⏱ {b.durationDays} days</span>}
                    <span>🆔 #BK{b.id}</span>
                  </div>
                  {b.notes && <p className={styles.bookingNotes}>{b.notes}</p>}
                </div>
                {canCancel(b.status) && (
                  <button
                    className={styles.cancelBtn}
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                  >
                    {cancelling === b.id ? '...' : 'Cancel'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    PENDING: ['#fff3cd', '#856404'], CONFIRMED: ['#d4edda', '#155724'],
    COMPLETED: ['#d4edda', '#155724'], CANCELLED: ['#f8d7da', '#721c24'],
  }
  const [bg, color] = map[status] || ['#f0f0f0', '#555']
  return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{status}</span>
}
