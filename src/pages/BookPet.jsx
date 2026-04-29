import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingApi, auth } from '../api'
import styles from './FormPage.module.css'

const INITIAL = {
  ownerName: '', contactNumber: '', petName: '',
  petType: '', gender: '', state: '', city: '', petParent: '',
}

export default function BookPet() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.ownerName.trim()) e.ownerName = 'Required'
    if (!/^\d{10}$/.test(form.contactNumber)) e.contactNumber = 'Enter valid 10-digit number'
    if (!form.petName.trim()) e.petName = 'Required'
    if (!form.petType) e.petType = 'Required'
    if (!form.gender) e.gender = 'Required'
    if (!form.state.trim()) e.state = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.petParent) e.petParent = 'Required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!auth.isLoggedIn()) { navigate('/signup'); return }
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await bookingApi.submit({
        petName: form.petName,
        petType: form.petType.toUpperCase(),
        mobileNumber: form.contactNumber,
        serviceType: 'VETERINARY',
        petAddress: `${form.city}, ${form.state}`,
        notes: `Owner: ${form.ownerName} | Gender: ${form.gender} | Already a pet parent: ${form.petParent}`,
      })
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
          <h2 className={styles.formTitle}>Pet Parent's Details 🐾</h2>
          <p className={styles.formSub}>Please fill this information. It will help us to know about you.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.section}>
              <div className={styles.row}>
                <Field label="Owner Name" error={errors.ownerName}>
                  <input className={styles.input} placeholder="Your full name" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
                </Field>
                <Field label="Contact Number" error={errors.contactNumber}>
                  <input className={styles.input} placeholder="10-digit number" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} maxLength={10} />
                </Field>
              </div>
              <div className={styles.row}>
                <Field label="Pet's Name" error={errors.petName}>
                  <input className={styles.input} placeholder="Pet's name" value={form.petName} onChange={e => set('petName', e.target.value)} />
                </Field>
                <Field label="Pet Type" error={errors.petType}>
                  <select className={styles.input} value={form.petType} onChange={e => set('petType', e.target.value)}>
                    <option value="">Select type</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>
              <div className={styles.row}>
                <Field label="Gender" error={errors.gender}>
                  <select className={styles.input} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="State" error={errors.state}>
                  <input className={styles.input} placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} />
                </Field>
              </div>
              <Field label="City" error={errors.city}>
                <input className={styles.input} placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
              </Field>
              <Field label="Are you already a Pet Parent?" error={errors.petParent}>
                <div className={styles.radioGroup}>
                  {['yes', 'no'].map(v => (
                    <label key={v} className={styles.radioLabel}>
                      <input type="radio" name="petParent" value={v} checked={form.petParent === v} onChange={() => set('petParent', v)} />
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            <motion.button type="submit" className={styles.submitBtn} disabled={submitting} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {submitting ? 'Submitting...' : 'Book Now'}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.successModal} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div className={styles.successIcon}>🐾</div>
              <h3>Request Submitted!</h3>
              <p>Your request has been submitted successfully. We will contact you soon!</p>
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
