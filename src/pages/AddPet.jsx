import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { petApi } from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './FormPage.module.css'

const INITIAL = {
  ownerName: '', mobileNumber: '', state: '', city: '',
  petName: '', petAge: '', petType: '', petBreed: '',
  petGender: '', vaccinationStatus: '', petDescription: '',
  reason: '', adoptionOrSale: 'adoption', petPrice: '',
}

export default function AddPet() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [previews, setPreviews] = useState([])
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.ownerName.trim()) e.ownerName = 'Required'
    if (!/^\d{10}$/.test(form.mobileNumber)) e.mobileNumber = 'Enter valid 10-digit number'
    if (!form.state.trim()) e.state = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.petAge || form.petAge <= 0) e.petAge = 'Required'
    if (!form.petType) e.petType = 'Required'
    if (!form.petBreed.trim()) e.petBreed = 'Required'
    if (!form.petGender) e.petGender = 'Required'
    if (!form.vaccinationStatus) e.vaccinationStatus = 'Required'
    if (!form.petDescription.trim()) e.petDescription = 'Required'
    if (!form.reason.trim()) e.reason = 'Required'
    if (form.adoptionOrSale === 'sale' && !form.petPrice) e.petPrice = 'Required for sale'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await petApi.submit(form, imageFile)
      setSuccess(true)
    } catch (err) {
      alert(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleFiles(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreviews([URL.createObjectURL(file)])
  }

  return (
    <div className={styles.page}>
      <div className={styles.formCard}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.formTitle}>
            Finding a loving home for your cherished pet?
          </h2>
          <p className={styles.formSub}>Fill out the information about your pet</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Owner Details</h3>
              <div className={styles.row}>
                <Field label="Owner's Name" error={errors.ownerName}>
                  <input className={styles.input} placeholder="Your full name" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
                </Field>
                <Field label="Mobile Number" error={errors.mobileNumber}>
                  <input className={styles.input} placeholder="10-digit number" value={form.mobileNumber} onChange={e => set('mobileNumber', e.target.value)} maxLength={10} />
                </Field>
              </div>
              <div className={styles.row}>
                <Field label="State" error={errors.state}>
                  <input className={styles.input} placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} />
                </Field>
                <Field label="City" error={errors.city}>
                  <input className={styles.input} placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
                </Field>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Pet Details</h3>
              <div className={styles.row}>
                <Field label="Pet's Name (optional)">
                  <input className={styles.input} placeholder="Pet's name" value={form.petName} onChange={e => set('petName', e.target.value)} />
                </Field>
                <Field label="Age (months)" error={errors.petAge}>
                  <input className={styles.input} type="number" placeholder="Age in months" value={form.petAge} onChange={e => set('petAge', e.target.value)} min={1} />
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
                <Field label="Breed" error={errors.petBreed}>
                  <input className={styles.input} placeholder="Breed" value={form.petBreed} onChange={e => set('petBreed', e.target.value)} />
                </Field>
              </div>
              <div className={styles.row}>
                <Field label="Gender" error={errors.petGender}>
                  <select className={styles.input} value={form.petGender} onChange={e => set('petGender', e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
                <Field label="Vaccination Status" error={errors.vaccinationStatus}>
                  <select className={styles.input} value={form.vaccinationStatus} onChange={e => set('vaccinationStatus', e.target.value)}>
                    <option value="">Select status</option>
                    <option value="yes">Vaccinated</option>
                    <option value="no">Not Vaccinated</option>
                  </select>
                </Field>
              </div>
              <Field label="Pet Description" error={errors.petDescription}>
                <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Describe your pet's personality, habits..." value={form.petDescription} onChange={e => set('petDescription', e.target.value)} rows={3} />
              </Field>
              <Field label="Reason for Giving" error={errors.reason}>
                <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Why are you rehoming your pet?" value={form.reason} onChange={e => set('reason', e.target.value)} rows={3} />
              </Field>
              <div className={styles.row}>
                <Field label="Listing Type">
                  <select className={styles.input} value={form.adoptionOrSale} onChange={e => set('adoptionOrSale', e.target.value)}>
                    <option value="adoption">For Adoption</option>
                    <option value="sale">For Sale</option>
                  </select>
                </Field>
                {form.adoptionOrSale === 'sale' && (
                  <Field label="Price (₹)" error={errors.petPrice}>
                    <input className={styles.input} type="number" placeholder="Price in ₹" value={form.petPrice} onChange={e => set('petPrice', e.target.value)} min={0} />
                  </Field>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Upload Pictures</h3>
              <p className={styles.uploadHint}>Accepted: .jpg, .png · Max 5MB each · Clear photos preferred</p>
              <label className={styles.uploadBtn}>
                <i className="fas fa-camera" /> Choose Photos
                <input type="file" accept=".jpg,.jpeg,.png" multiple onChange={handleFiles} style={{ display: 'none' }} />
              </label>
              {previews.length > 0 && (
                <div className={styles.previews}>
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt="preview" className={styles.preview} />
                  ))}
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {submitting ? 'Submitting...' : 'Submit Pet'}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.successModal}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className={styles.successIcon}>🐾</div>
              <h3>Pet Added Successfully!</h3>
              <p>Your pet has been listed. We'll review and publish it shortly.</p>
              <button className={styles.successBtn} onClick={() => { setSuccess(false); setForm(INITIAL); setPreviews([]); setImageFile(null) }}>
                Add Another Pet
              </button>
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
