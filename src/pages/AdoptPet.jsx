import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer'
import { petApi, adoptionApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { getNextImage } from '../data/petImages'
import styles from './AdoptPet.module.css'

export default function AdoptPet() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactModal, setContactModal] = useState(null)
  const [detailsModal, setDetailsModal] = useState(null)
  const [adoptModal, setAdoptModal] = useState(null)
  const [adoptMsg, setAdoptMsg] = useState('')
  const [adoptLoading, setAdoptLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  useEffect(() => {
    petApi.fetchAll()
      .then(res => {
        const list = res?.content ?? res?.data?.content ?? res?.data ?? []
        setPets(list.map(p => ({
          ...p,
          image: p.imageUrl || getNextImage(p.petType?.toLowerCase()),
        })))
      })
      .catch(() => setPets([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdopt(pet) {
    if (!user) { navigate('/login'); return }
    setAdoptMsg('')
    setAdoptModal(pet)
  }

  async function submitAdoption(pet, message) {
    setAdoptLoading(true)
    try {
      await adoptionApi.submit(pet.id, message)
      setAdoptModal(null)
      alert(`Adoption request submitted for ${pet.petName || pet.petType}! We'll contact you within 24–48 hours.`)
    } catch (err) {
      alert(err.message || 'Failed to submit adoption request.')
    } finally {
      setAdoptLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroBanner}>
        <img
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400&auto=format&fit=crop&q=80"
          alt="Adopt a pet"
          className={styles.bannerImg}
        />
        <div className={styles.bannerOverlay} />
        <motion.div
          className={styles.bannerTitleWrap}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className={styles.bannerTitle}>Available Pets</h1>
          <div className={styles.bannerDivider}><span>🐾</span></div>
        </motion.div>
      </div>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : pets.length === 0 ? (
          <motion.div className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className={styles.emptyIcon}>🐾</span>
            <p>No pets listed yet. Be the first to{' '}
              <button className={styles.emptyLink} onClick={() => navigate('/add-pet')}>add a pet</button>!
            </p>
          </motion.div>
        ) : (
          <div className={styles.grid}>
            {pets.map((pet, i) => (
              <motion.div
                key={pet.id ?? i}
                className={styles.card}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(61,64,91,0.18)' }}
              >
                <div className={styles.imgWrap}>
                  <img src={pet.image} alt={pet.petName || pet.petType} className={styles.petImg} />
                  <span className={styles.badge}>
                    {pet.listingType === 'SALE' ? '🛒 Buy' : '🐾 Adopt'}
                  </span>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.petName}>{pet.petName || '—'}</h3>
                  <p className={styles.petMeta}>{pet.petType} · {pet.petBreed} · {pet.petGender}</p>
                  <p className={styles.petLocation}>📌 {pet.city}, {pet.state}</p>
                  {pet.price && pet.listingType === 'SALE' && (
                    <p className={styles.petPrice}>₹{pet.price}</p>
                  )}
                  <div className={styles.btnRow}>
                    <button className={styles.btnSecondary} onClick={() => setContactModal(pet)}>Contact</button>
                    <button className={styles.btnSecondary} onClick={() => setDetailsModal(pet)}>Details</button>
                  </div>
                  <button className={styles.btnPrimary} onClick={() => handleAdopt(pet)}>
                    {pet.listingType === 'SALE' ? 'Buy Pet' : 'Adopt Me'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <AnimatePresence>
        {contactModal && (
          <Modal onClose={() => setContactModal(null)} title="Owner Contact">
            <p><strong>Owner:</strong> {contactModal.ownerName}</p>
            <p><strong>Contact:</strong> {contactModal.ownerPhone}</p>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailsModal && (
          <Modal onClose={() => setDetailsModal(null)} title="Pet Details">
            <p><strong>Age:</strong> {detailsModal.petAgeMonths} months</p>
            <p><strong>Vaccination:</strong> {detailsModal.vaccinationStatus}</p>
            <p><strong>Description:</strong> {detailsModal.petDescription}</p>
            <p><strong>Reason:</strong> {detailsModal.reason}</p>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {adoptModal && (
          <Modal onClose={() => setAdoptModal(null)} title={`Adopt ${adoptModal.petName || adoptModal.petType}`}>
            <p>Tell the owner a little about yourself (optional):</p>
            <textarea
              style={{ width: '100%', marginTop: 8, padding: 8, borderRadius: 8, border: '1px solid #ddd', minHeight: 80, resize: 'vertical' }}
              placeholder="Why would you be a great pet parent?"
              value={adoptMsg}
              onChange={e => setAdoptMsg(e.target.value)}
            />
            <button
              className={styles.modalBtn}
              style={{ marginTop: 12 }}
              disabled={adoptLoading}
              onClick={() => submitAdoption(adoptModal, adoptMsg)}
            >
              {adoptLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ onClose, title, children }) {
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className={styles.modalTitle}>{title}</h3>
        <div className={styles.modalBody}>{children}</div>
        <button className={styles.modalBtn} onClick={onClose}>OK</button>
      </motion.div>
    </motion.div>
  )
}
