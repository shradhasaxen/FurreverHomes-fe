import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { myPetsApi } from '../../api'
import styles from './MyPets.module.css'

const EMPTY_FORM = {
  petName: '', petType: '', petBreed: '', petGender: '',
  petAgeMonths: '', vaccinationStatus: '', medicalNotes: '',
}

export default function MyPets() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadPets() }, [])

  async function loadPets() {
    setLoading(true)
    try { setPets(await myPetsApi.getAll()) }
    catch { setPets([]) }
    finally { setLoading(false) }
  }

  function openAdd() { setForm(EMPTY_FORM); setEditingPet(null); setShowForm(true); setError('') }
  function openEdit(pet) {
    setForm({
      petName: pet.petName, petType: pet.petType, petBreed: pet.petBreed || '',
      petGender: pet.petGender || '', petAgeMonths: pet.petAgeMonths || '',
      vaccinationStatus: pet.vaccinationStatus || '', medicalNotes: pet.medicalNotes || '',
    })
    setEditingPet(pet)
    setShowForm(true)
    setError('')
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.petName.trim() || !form.petType) { setError('Pet name and type are required'); return }
    setSaving(true)
    try {
      const payload = { ...form, petAgeMonths: form.petAgeMonths ? parseInt(form.petAgeMonths) : null }
      if (editingPet) await myPetsApi.update(editingPet.id, payload)
      else await myPetsApi.add(payload)
      setShowForm(false)
      loadPets()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save pet')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this pet from your profile?')) return
    await myPetsApi.remove(id)
    loadPets()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Pets 🐾</h1>
          <p className={styles.sub}>Save your pet profiles once — use them for all bookings</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Pet</button>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading your pets...</p>
      ) : pets.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>🐶</p>
          <h3>No pets added yet</h3>
          <p>Add your pet's profile to quickly book grooming, boarding, and more.</p>
          <button className={styles.addBtn} onClick={openAdd}>Add Your First Pet</button>
        </div>
      ) : (
        <div className={styles.petsGrid}>
          {pets.map((pet, i) => (
            <motion.div
              key={pet.id}
              className={styles.petCard}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className={styles.petAvatar}>
                {pet.petType === 'DOG' ? '🐕' : pet.petType === 'CAT' ? '🐈' : pet.petType === 'BIRD' ? '🦜' : '🐾'}
              </div>
              <div className={styles.petInfo}>
                <h3 className={styles.petName}>{pet.petName}</h3>
                <p className={styles.petMeta}>{pet.petType} {pet.petBreed ? `· ${pet.petBreed}` : ''}</p>
                {pet.petAgeMonths && <p className={styles.petMeta}>{Math.floor(pet.petAgeMonths / 12)}y {pet.petAgeMonths % 12}m old</p>}
                {pet.vaccinationStatus && <p className={styles.petVax}>💉 {pet.vaccinationStatus}</p>}
              </div>
              <div className={styles.petActions}>
                <button className={styles.editBtn} onClick={() => openEdit(pet)}>Edit</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(pet.id)}>Remove</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.modal} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className={styles.modalHeader}>
                <h2>{editingPet ? 'Edit Pet' : 'Add New Pet'}</h2>
                <button className={styles.closeBtn} onClick={() => setShowForm(false)}>×</button>
              </div>
              <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.row}>
                  <Field label="Pet Name *">
                    <input className={styles.input} value={form.petName} onChange={e => setForm(f => ({ ...f, petName: e.target.value }))} placeholder="e.g. Bruno" />
                  </Field>
                  <Field label="Pet Type *">
                    <select className={styles.input} value={form.petType} onChange={e => setForm(f => ({ ...f, petType: e.target.value }))}>
                      <option value="">Select type</option>
                      <option value="DOG">Dog</option>
                      <option value="CAT">Cat</option>
                      <option value="BIRD">Bird</option>
                      <option value="RABBIT">Rabbit</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </Field>
                </div>
                <div className={styles.row}>
                  <Field label="Breed">
                    <input className={styles.input} value={form.petBreed} onChange={e => setForm(f => ({ ...f, petBreed: e.target.value }))} placeholder="e.g. Labrador" />
                  </Field>
                  <Field label="Gender">
                    <select className={styles.input} value={form.petGender} onChange={e => setForm(f => ({ ...f, petGender: e.target.value }))}>
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </Field>
                </div>
                <div className={styles.row}>
                  <Field label="Age (months)">
                    <input className={styles.input} type="number" min={1} value={form.petAgeMonths} onChange={e => setForm(f => ({ ...f, petAgeMonths: e.target.value }))} placeholder="e.g. 24" />
                  </Field>
                  <Field label="Vaccination Status">
                    <input className={styles.input} value={form.vaccinationStatus} onChange={e => setForm(f => ({ ...f, vaccinationStatus: e.target.value }))} placeholder="e.g. Fully vaccinated" />
                  </Field>
                </div>
                <Field label="Medical Notes">
                  <textarea className={`${styles.input} ${styles.textarea}`} value={form.medicalNotes} onChange={e => setForm(f => ({ ...f, medicalNotes: e.target.value }))} placeholder="Any allergies, conditions, or special care notes..." rows={3} />
                </Field>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Pet'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  )
}
