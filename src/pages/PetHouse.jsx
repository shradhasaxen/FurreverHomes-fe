import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { houseApi, auth } from '../api'
import styles from './FormPage.module.css'

const INITIAL = {
  petName: '', ownerName: '', petType: '', mobileNumber: '',
  duration: '', petAddress: '', otherSuggestions: '',
}

export default function PetHouse() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.petName.trim()) e.petName = 'Required'
    if (!form.ownerName.trim()) e.ownerName = 'Required'
    if (!form.petType) e.petType = 'Required'
    if (!/^\d{10}$/.test(form.mobileNumber)) e.mobileNumber = 'Enter valid 10-digit number'
    if (!form.duration || form.duration <= 0) e.duration = 'Required'
    if (!form.petAddress.trim()) e.petAddress = 'Required'
    if (!form.otherSuggestions.trim()) e.otherSuggestions = 'Required'
    return e
  }

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!auth.isLoggedIn()) { navigate('/signup'); return }
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await houseApi.submit(form)
      setSuccess(true)
    } catch (err) {
      alert(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.formCard}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className={styles.formTitle}>
            Travel worry-free knowing your pet's in good hands 🏠
          </h2>
          <p className={styles.formSub}>Fill in the details and we'll confirm availability</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.section}>
              <div className={styles.row}>
                <Field label="Pet's Name" error={errors.petName}>
                  <input className={styles.input} placeholder="Pet's name" value={form.petName} onChange={e => set('petName', e.target.value)} />
                </Field>
                <Field label="Owner's Name" error={errors.ownerName}>
                  <input className={styles.input} placeholder="Your name" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
                </Field>
              </div>
              <div className={styles.row}>
                <Field label="Pet Type" error={errors.petType}>
                  <select className={styles.input} value={form.petType} onChange={e => set('petType', e.target.value)}>
                    <option value="">Select type</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Mobile Number" error={errors.mobileNumber}>
                  <input className={styles.input} placeholder="10-digit number" value={form.mobileNumber} onChange={e => set('mobileNumber', e.target.value)} maxLength={10} />
                </Field>
              </div>
              <Field label="Duration (days)" error={errors.duration}>
                <input className={styles.input} type="number" placeholder="Number of days" value={form.duration} onChange={e => set('duration', e.target.value)} min={1} />
              </Field>
              <Field label="Pet's Address" error={errors.petAddress}>
                <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Full address for pickup" value={form.petAddress} onChange={e => set('petAddress', e.target.value)} rows={3} />
              </Field>
              <Field label="Reason & Notes" error={errors.otherSuggestions}>
                <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Reason for boarding and any special requirements..." value={form.otherSuggestions} onChange={e => set('otherSuggestions', e.target.value)} rows={3} />
              </Field>
            </div>

            <motion.button type="submit" className={styles.submitBtn} disabled={submitting} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {submitting ? 'Submitting...' : 'Book Pet House'}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.successModal} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div className={styles.successIcon}>🏠</div>
              <h3>Request Received!</h3>
              <p>Thank you! We will contact you soon regarding availability of shelter.</p>
              <button className={styles.successBtn} onClick={() => { setSuccess(false); setForm(INITIAL) }}>Done</button>
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
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
