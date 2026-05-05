import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { houseApi, myPetsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './FormPage.module.css'

const INITIAL = {
  petName: '', petType: '', mobileNumber: '',
  duration: '', petAddress: '', notes: '',
}

export default function PetHouse() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [savedPets, setSavedPets] = useState([])
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      myPetsApi.getAll()
        .then(pets => setSavedPets(pets || []))
        .catch(() => {})
    }
  }, [user])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function selectSavedPet(pet) {
    setForm(f => ({
      ...f,
      petName: pet.petName,
      petType: pet.petType,
    }))
  }

  function validate() {
    const e = {}
    if (!form.petName.trim()) e.petName = 'Required'
    if (!form.petType) e.petType = 'Required'
    if (!/^\d{10}$/.test(form.mobileNumber)) e.mobileNumber = 'Enter valid 10-digit number'
    if (!form.duration || form.duration <= 0) e.duration = 'Required'
    if (!form.petAddress.trim()) e.petAddress = 'Required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await houseApi.submit(form)
      setSuccess(true)
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.formCard}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className={styles.formTitle}>
            Travel worry-free — your pet's in good hands 🏠
          </h2>
          <p className={styles.formSub}>Fill in the details and we'll confirm availability</p>

          {savedPets.length > 0 && (
            <div className={styles.savedPetsRow}>
              <p className={styles.savedPetsLabel}>Quick select from your pets:</p>
              <div className={styles.petChips}>
                {savedPets.map(pet => (
                  <button
                    key={pet.id}
                    type="button"
                    className={styles.petChip}
                    onClick={() => selectSavedPet(pet)}
                  >
                    {pet.petType === 'DOG' ? '🐕' : pet.petType === 'CAT' ? '🐈' : '🐾'} {pet.petName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.section}>
              <div className={styles.row}>
                <Field label="Pet's Name" error={errors.petName}>
                  <input className={styles.input} placeholder="Pet's name" value={form.petName} onChange={e => set('petName', e.target.value)} />
                </Field>
                <Field label="Pet Type" error={errors.petType}>
                  <select className={styles.input} value={form.petType} onChange={e => set('petType', e.target.value)}>
                    <option value="">Select type</option>
                    <option value="DOG">Dog</option>
                    <option value="CAT">Cat</option>
                    <option value="BIRD">Bird</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
              </div>
              <div className={styles.row}>
                <Field label="Mobile Number" error={errors.mobileNumber}>
                  <input className={styles.input} placeholder="10-digit number" value={form.mobileNumber} onChange={e => set('mobileNumber', e.target.value)} maxLength={10} />
                </Field>
                <Field label="Duration (days)" error={errors.duration}>
                  <input className={styles.input} type="number" placeholder="Number of days" value={form.duration} onChange={e => set('duration', e.target.value)} min={1} />
                </Field>
              </div>
              <Field label="Pickup Address" error={errors.petAddress}>
                <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Full address for pickup" value={form.petAddress} onChange={e => set('petAddress', e.target.value)} rows={3} />
              </Field>
              <Field label="Reason & Notes (optional)">
                <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Reason for boarding and any special requirements..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
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
              <p>We'll contact you soon regarding availability. A confirmation email has been sent!</p>
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
