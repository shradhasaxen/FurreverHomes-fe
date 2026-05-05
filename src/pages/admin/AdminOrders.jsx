import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../../api'
import styles from './AdminTable.module.css'

const STATUSES = ['PLACED','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','COMPLETED','CANCELLED']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [trackingId, setTrackingId] = useState('')
  const [updating, setUpdating] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => { loadOrders() }, [page])

  async function loadOrders() {
    setLoading(true)
    try {
      const res = await adminApi.getAllOrders(page, 15)
      setOrders(res?.content ?? [])
      setTotalPages(res?.totalPages ?? 0)
    } catch { setOrders([]) }
    finally { setLoading(false) }
  }

  function openDetail(order) {
    setSelected(order)
    setNewStatus(order.status)
    setTrackingId(order.trackingId || '')
  }

  async function handleUpdateStatus() {
    if (!newStatus || !selected) return
    setUpdating(true)
    try {
      const updated = await adminApi.updateOrderStatus(selected.id, newStatus, trackingId || undefined)
      setOrders(o => o.map(x => x.id === selected.id ? updated : x))
      setSelected(updated)
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed')
    } finally { setUpdating(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orders Management 📦</h1>
        <p className={styles.sub}>View and update all platform orders</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.tableWrap}>
          {loading ? <p className={styles.loading}>Loading...</p> : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className={selected?.id === o.id ? styles.rowActive : ''} onClick={() => openDetail(o)}>
                      <td><strong>#{o.orderNumber}</strong></td>
                      <td>₹{o.totalAmount}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
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
              <h2 className={styles.detailTitle}>#{selected.orderNumber}</h2>
              <button className={styles.closeDetail} onClick={() => setSelected(null)}>×</button>
            </div>

            <div className={styles.detailMeta}>
              <Row label="Total" value={`₹${selected.totalAmount}`} />
              <Row label="Items" value={`${selected.items?.length ?? 0} item(s)`} />
              <Row label="Delivery" value={selected.deliveryAddress} />
              <Row label="Contact" value={selected.contactPhone} />
              {selected.estimatedDelivery && <Row label="Est. Delivery" value={selected.estimatedDelivery} />}
            </div>

            <div className={styles.itemsList}>
              {selected.items?.map(item => (
                <div key={item.id} className={styles.orderItem}>
                  <span className={styles.itemName}>{item.productName}</span>
                  <span className={styles.itemMeta}>×{item.quantity} · ₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className={styles.updateSection}>
              <h3 className={styles.updateTitle}>Update Status</h3>
              <select className={styles.select} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                className={styles.input}
                placeholder="Tracking ID (optional)"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
              />
              <button className={styles.updateBtn} onClick={handleUpdateStatus} disabled={updating}>
                {updating ? 'Updating...' : 'Update & Notify Customer'}
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
  const map = {
    PLACED:['#fff3cd','#856404'], CONFIRMED:['#d4edda','#155724'],
    PROCESSING:['#cce5ff','#004085'], SHIPPED:['#cce5ff','#004085'],
    OUT_FOR_DELIVERY:['#d1ecf1','#0c5460'], COMPLETED:['#d4edda','#155724'],
    CANCELLED:['#f8d7da','#721c24'],
  }
  const [bg, color] = map[status] || ['#f0f0f0','#555']
  return <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{status}</span>
}
