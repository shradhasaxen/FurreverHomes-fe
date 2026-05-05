import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adoptionApi } from '../../api'
import styles from './Bookings.module.css'

export default function Adoptions() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adoptionApi.getMyRequests(0, 20)
      .then(res => setRequests(res?.content ?? []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Adoptions ❤️</h1>
          <p className={styles.sub}>Track your adoption requests</p>
        </div>
        <Link to="/adopt" className={styles.actionBtn}>Browse Pets</Link>
      </div>

      {loading ? <p className={styles.loading}>Loading...</p> :
        requests.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>❤️</p>
            <h3>No adoption requests yet</h3>
            <p>Browse available pets and submit an adoption request.</p>
            <Link to="/adopt" className={styles.actionBtn}>Browse Pets →</Link>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {requests.map(r => (
              <div key={r.id} className={styles.bookingCard}>
                <div className={styles.bookingIcon}>🐾</div>
                <div className={styles.bookingInfo}>
                  <div className={styles.bookingTop}>
                    <h3 className={styles.bookingTitle}>Adoption Request #{r.id}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className={styles.bookingMeta}>
                    {r.petName && <span>🐶 {r.petName}</span>}
                    {r.createdAt && <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>}
                  </div>
                  {r.applicantMessage && <p className={styles.bookingNotes}>"{r.applicantMessage}"</p>}
                </div>
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
    PENDING: ['#fff3cd', '#856404'], APPROVED: ['#d4edda', '#155724'], REJECTED: ['#f8d7da', '#721c24'],
  }
  const [bg, color] = map[status] || ['#f0f0f0', '#555']
  return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{status}</span>
}
