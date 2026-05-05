import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../../api'
import styles from './AdminTable.module.css'

const BOOKING_STATUSES = ['PENDING','CONFIRMED','COMPLETED','CANCELLED']

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => { loadBookings() }, [page])

  async function loadBookings() {
    setLoading(true)
    try {
      const res = await adminApi.getAllBookings(page, 15)
      setBookings(res?.content ?? [])
      setTotalPages(res?.totalPages ?? 0)
    } catch { setBookings([]) }
    finally { setLoading(false) }
  }

  function openDetail(b) { setSelected(b); setNewStatus(b.status) }

  async function handleUpdateStatus() {
    if (!newStatus || !selected) return
    setUpdating(true)
    try {
      const updated = await adminApi.updateBookingStatus(selected.id, newStatus)
      setBookings(b => b.map(x => x.id === selected.id ? updated : x))
      setSelected(updated)
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed')
    } finally { setUpdating(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bookings 📅</h1>
        <p className={styles.sub}>All grooming and boarding bookings</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.tableWrap}>
          {loading ? <p className={styles.loading}>Loading...</p> : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service</th>
                    <th>Pet</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className={selected?.id === b.id ? styles.rowActive : ''} onClick={() => openDetail(b)}>
                      <td style={{ color: '#aaa' }}>#BK{b.id}</td>
                      <td><strong>{b.serviceType}</strong></td>
                      <td>{b.petName} <span style={{ color: '#aaa', fontSize: 12 }}>({b.petType})</span></td>
                      <td style={{ color: '#888', fontSize: 13 }}>{b.bookingDate || 'TBD'}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td><button className={styles.detailBtn}>Manage →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span>Page {page + 1} of {totalPages}</span>
                  <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>

        {selected && (
          <motion.div className={styles.detail} key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>#BK{selected.id}</h2>
              <button className={styles.closeDetail} onClick={() => setSelected(null)}>×</button>
            </div>

            <div className={styles.detailMeta}>
              <Row label="Service" value={selected.serviceType} />
              <Row label="Pet" value={`${selected.petName} (${selected.petType})`} />
              <Row label="Mobile" value={selected.mobileNumber} />
              {selected.bookingDate && <Row label="Date" value={selected.bookingDate} />}
              {selected.bookingTime && <Row label="Time" value={selected.bookingTime} />}
              {selected.durationDays && <Row label="Duration" value={`${selected.durationDays} days`} />}
              {selected.petAddress && <Row label="Address" value={selected.petAddress} />}
              {selected.notes && <Row label="Notes" value={selected.notes} />}
            </div>

            <div className={styles.updateSection}>
              <h3 className={styles.updateTitle}>Update Status</h3>
              <select className={styles.select} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className={styles.updateBtn} onClick={handleUpdateStatus} disabled={updating}>
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { PENDING:['#fff3cd','#856404'], CONFIRMED:['#d4edda','#155724'], COMPLETED:['#d4edda','#155724'], CANCELLED:['#f8d7da','#721c24'] }
  const [bg, color] = map[status] || ['#f0f0f0','#555']
  return <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{status}</span>
}
