import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { orderApi } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Payment.module.css'

const INITIAL = {
  cardName: '', cardNumber: '', expiry: '', cvv: '',
  street: '', city: '', state: '', zip: '',
}

export default function Payment() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [orderNum, setOrderNum] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Cart items passed via navigation state from Shopping page
  const cartItems = location.state?.cartItems ?? []

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.cardName.trim()) e.cardName = 'Required'
    if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) e.cardNumber = 'Enter valid 16-digit card number'
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Format: MM/YY'
    if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = '3-4 digits'
    if (!form.street.trim()) e.street = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.state.trim()) e.state = 'Required'
    if (!form.zip.trim()) e.zip = 'Required'
    return e
  }

  async function handlePay(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (!user) { navigate('/login'); return }

    setPlacing(true)
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productName: item.name,
          productCategory: item.category || 'General',
          productImageUrl: item.img || null,
          unitPrice: item.price,
          quantity: item.quantity || 1,
        })),
        deliveryAddress: `${form.street}, ${form.city}, ${form.state} - ${form.zip}`,
        contactPhone: user.phoneNumber || '',
        notes: null,
      }
      const order = await orderApi.place(orderPayload)
      setOrderNum(order.orderNumber)
      setSuccess(true)
    } catch (err) {
      alert(err.response?.data?.message || 'Order placement failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  function formatCard(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Confirm Order & Pay</h2>
          <p className={styles.sub}>Please make the payment — then enjoy moments with your furry friend! 🐾</p>
        </div>

        <form onSubmit={handlePay} noValidate>
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Payment Details</h3>
            <Field label="Name on Card" error={errors.cardName}>
              <input className={`${styles.input} ${errors.cardName ? styles.inputErr : ''}`} placeholder="Full name on card" value={form.cardName} onChange={e => set('cardName', e.target.value)} />
            </Field>
            <Field label="Card Number" error={errors.cardNumber}>
              <input className={`${styles.input} ${errors.cardNumber ? styles.inputErr : ''}`} placeholder="1234 5678 9012 3456" value={form.cardNumber} onChange={e => set('cardNumber', formatCard(e.target.value))} maxLength={19} />
            </Field>
            <div className={styles.row}>
              <Field label="Expiry" error={errors.expiry}>
                <input className={`${styles.input} ${errors.expiry ? styles.inputErr : ''}`} placeholder="MM/YY" value={form.expiry} onChange={e => set('expiry', formatExpiry(e.target.value))} maxLength={5} />
              </Field>
              <Field label="CVV" error={errors.cvv}>
                <input className={`${styles.input} ${errors.cvv ? styles.inputErr : ''}`} placeholder="•••" type="password" value={form.cvv} onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} />
              </Field>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Billing Address</h3>
            <Field label="Street Address" error={errors.street}>
              <input className={`${styles.input} ${errors.street ? styles.inputErr : ''}`} placeholder="Street address" value={form.street} onChange={e => set('street', e.target.value)} />
            </Field>
            <div className={styles.row}>
              <Field label="City" error={errors.city}>
                <input className={`${styles.input} ${errors.city ? styles.inputErr : ''}`} placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
              </Field>
              <Field label="State" error={errors.state}>
                <input className={`${styles.input} ${errors.state ? styles.inputErr : ''}`} placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} />
              </Field>
            </div>
            <Field label="ZIP Code" error={errors.zip}>
              <input className={`${styles.input} ${errors.zip ? styles.inputErr : ''}`} placeholder="ZIP / Postal code" value={form.zip} onChange={e => set('zip', e.target.value)} />
            </Field>
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.prevBtn} onClick={() => navigate('/shopping')}>
              ← Previous
            </button>
            <motion.button type="submit" className={styles.payBtn} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} disabled={placing}>
              {placing ? 'Placing Order...' : 'Pay Now 🔒'}
            </motion.button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {success && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.successModal} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div className={styles.successIcon}>🎉</div>
              <h3>Order Placed! 🎉</h3>
              <p>Order #{orderNum} confirmed. You'll receive a confirmation email shortly.</p>
              <button className={styles.okBtn} onClick={() => navigate('/dashboard/orders')}>Track My Order →</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <span className={styles.err}>{error}</span>}
    </div>
  )
}
