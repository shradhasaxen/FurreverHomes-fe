import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { orderApi } from '../../api'
import styles from './Orders.module.css'

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'COMPLETED']
const STATUS_LABELS = {
  PLACED: 'Order Placed', CONFIRMED: 'Confirmed', PROCESSING: 'Processing',
  SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for Delivery', COMPLETED: 'Delivered',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const res = await orderApi.getAll(0, 20)
      setOrders(res?.content ?? [])
    } catch { setOrders([]) }
    finally { setLoading(false) }
  }

  async function handleCancel(orderId) {
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      const updated = await orderApi.cancel(orderId)
      setOrders(o => o.map(x => x.id === orderId ? updated : x))
      if (selected?.id === orderId) setSelected(updated)
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel this order')
    } finally { setCancelling(false) }
  }

  const canCancel = (status) => !['SHIPPED', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'].includes(status)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Orders 📦</h1>
        <p className={styles.sub}>Track and manage your purchases</p>
      </div>

      {loading ? <p className={styles.loading}>Loading orders...</p> :
        orders.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🛒</p>
            <h3>No orders yet</h3>
            <p>Your order history will appear here.</p>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Order list */}
            <div className={styles.list}>
              {orders.map(order => (
                <div
                  key={order.id}
                  className={`${styles.orderCard} ${selected?.id === order.id ? styles.orderCardActive : ''}`}
                  onClick={() => setSelected(order)}
                >
                  <div className={styles.orderTop}>
                    <span className={styles.orderNum}>#{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className={styles.orderAmount}>₹{order.totalAmount}</p>
                  <p className={styles.orderDate}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</p>
                  <p className={styles.orderItems}>{order.items?.length ?? 0} item(s)</p>
                </div>
              ))}
            </div>

            {/* Order detail */}
            <div className={styles.detail}>
              {!selected ? (
                <div className={styles.selectPrompt}>
                  <p>👈 Select an order to view details</p>
                </div>
              ) : (
                <motion.div key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                  <div className={styles.detailHeader}>
                    <div>
                      <h2 className={styles.detailTitle}>Order #{selected.orderNumber}</h2>
                      <p className={styles.detailDate}>{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ''}</p>
                    </div>
                    {canCancel(selected.status) && (
                      <button className={styles.cancelBtn} onClick={() => handleCancel(selected.id)} disabled={cancelling}>
                        {cancelling ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>

                  {/* Status Timeline */}
                  {selected.status !== 'CANCELLED' && (
                    <div className={styles.timeline}>
                      {STATUS_STEPS.map((step, i) => {
                        const currentIdx = STATUS_STEPS.indexOf(selected.status)
                        const done = i <= currentIdx
                        const active = i === currentIdx
                        return (
                          <div key={step} className={styles.timelineStep}>
                            <div className={`${styles.timelineDot} ${done ? styles.dotDone : ''} ${active ? styles.dotActive : ''}`}>
                              {done && !active ? '✓' : i + 1}
                            </div>
                            <p className={`${styles.timelineLabel} ${active ? styles.labelActive : ''}`}>
                              {STATUS_LABELS[step]}
                            </p>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`${styles.timelineLine} ${i < currentIdx ? styles.lineDone : ''}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {selected.status === 'CANCELLED' && (
                    <div className={styles.cancelledBanner}>❌ This order has been cancelled</div>
                  )}

                  {/* Items */}
                  <div className={styles.itemsSection}>
                    <h3 className={styles.sectionTitle}>Items</h3>
                    {selected.items?.map(item => (
                      <div key={item.id} className={styles.item}>
                        <div className={styles.itemInfo}>
                          <p className={styles.itemName}>{item.productName}</p>
                          <p className={styles.itemCat}>{item.productCategory}</p>
                        </div>
                        <div className={styles.itemRight}>
                          <span className={styles.itemQty}>×{item.quantity}</span>
                          <span className={styles.itemPrice}>₹{item.subtotal}</span>
                        </div>
                      </div>
                    ))}
                    <div className={styles.totalRow}>
                      <span>Total</span>
                      <strong>₹{selected.totalAmount}</strong>
                    </div>
                  </div>

                  {/* Delivery info */}
                  <div className={styles.deliverySection}>
                    <h3 className={styles.sectionTitle}>Delivery Details</h3>
                    <p className={styles.deliveryAddr}>{selected.deliveryAddress}</p>
                    {selected.trackingId && <p className={styles.trackingId}>Tracking: <strong>{selected.trackingId}</strong></p>}
                    {selected.estimatedDelivery && <p className={styles.estDelivery}>Est. Delivery: <strong>{selected.estimatedDelivery}</strong></p>}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )
      }
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    PLACED: ['#fff3cd', '#856404'], CONFIRMED: ['#d4edda', '#155724'],
    PROCESSING: ['#cce5ff', '#004085'], SHIPPED: ['#cce5ff', '#004085'],
    OUT_FOR_DELIVERY: ['#d1ecf1', '#0c5460'], COMPLETED: ['#d4edda', '#155724'],
    CANCELLED: ['#f8d7da', '#721c24'],
  }
  const [bg, color] = map[status] || ['#f0f0f0', '#555']
  return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{status}</span>
}
