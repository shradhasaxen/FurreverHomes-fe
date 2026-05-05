import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import styles from './Home.module.css'

const CAROUSEL_IMAGES = [
  'https://wallpapers.com/images/featured-small/dog-wj7msvc5kj9v6cyy.webp',
  'https://wallpapers.com/images/high/cute-tabby-cat-eyes-818wlnpoe0l1dnoi.webp',
  'https://wallpapers.com/images/high/cute-hamster-pictures-aubi50zskkmq7n25.webp',
  'https://wallpapers.com/images/hd/lovely-blue-bird-zo3853h1fx99ktpy.webp',
  'https://wallpapers.com/images/hd/golden-dog-chasing-bubbles-yhj9wu70jj7j4mwj.webp',
  'https://wallpapers.com/images/high/cute-funny-cat-pictures-iaymsb7z4q5i4g9t.webp',
  'https://wallpapers.com/images/high/cute-hamster-pictures-h15yvvyrvg3sshr8.webp',
  'https://wallpapers.com/images/hd/cute-yellow-bird-aypbiol2abdzg5ns.webp',
  'https://wallpapers.com/images/high/sleeping-dog-covered-with-a-nice-blanket-u5ae0kfuv51kpoi1.webp',
  'https://wallpapers.com/images/high/cute-funny-cat-pictures-bmx91yeuqfstso99.webp',
]

// Professional outline SVG icons
const SERVICES = [
  {
    label: 'Shopping', path: '/shopping',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    label: 'Available Pets', path: '/adopt',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
  },
  {
    label: 'Blogging', path: '/blog',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    label: 'Grooming', path: '/grooming',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    label: 'Pet Houses', path: '/pet-house',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'Report Injury', path: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
      </svg>
    ),
  },
]

const WHY_CARDS = [
  { title: 'Healthy Pet', desc: "Being pet lovers ourselves, we understand the importance of a pet's health. All our puppies are at least eight weeks old when they are sent to you. Before your bundle of joy reaches you, he is required to undergo an extensive health checkup by a licensed veterinarian." },
  { title: 'Vaccinated & Insured Pet', desc: "To make the initial experience with your furry family member smooth and trouble-free, we make sure that all our puppies are up-to-date on their vaccinations and are insured." },
  { title: 'Responsible Breeders', desc: "All of our puppies are raised by responsible breeders who consider their pet's health their foremost priority. We have zero tolerance for puppy mills and all our breeders are pet lovers just like us." },
  { title: 'Easy and Hassle-free Process', desc: "Your journey with a pet starts with no difficulties. You have access to adorable pets looking for furever homes nationwide. You can receive guidance regarding any pet-related aspect in the comfort of your home." },
  { title: 'Expert Pet Guidance', desc: "Our pet experts will guide you throughout your journey as a pet parent and will always be at your beck and call there to help you." },
  { title: 'Happy Pet Parenting', desc: "We don't stop at providing you with a furry family member and guidance related to it. We are also connected with service providers such as veterinarians, trainers, groomers, and hostels." },
]

export default function Home() {
  const [imgIndex, setImgIndex] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const id = setInterval(() => setImgIndex(i => (i + 1) % CAROUSEL_IMAGES.length), 3000)
    return () => clearInterval(id)
  }, [])

  function handleService(svc) {
    if (svc.path) navigate(svc.path)
    else setShowAlert(true)
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIndex}
            src={CAROUSEL_IMAGES[imgIndex]}
            alt="Pet"
            className={styles.heroImg}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          />
        </AnimatePresence>
        <div className={styles.heroOverlay} />

        {/* Perfectly centered content */}
        <div className={styles.heroCenter}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className={styles.heroTitle}>Find Your FurrEver Friend</h1>
            <p className={styles.heroSub}>Give a loving home to a pet who needs you</p>
            <div className={styles.heroBtns}>
              <motion.button
                className={styles.heroBtn}
                onClick={() => navigate('/adopt')}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
              >
                🐾 Be My Family
              </motion.button>
              {user && (
                <motion.button
                  className={styles.heroBtnSecondary}
                  onClick={() => navigate('/dashboard')}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                >
                  👤 My Dashboard
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        <div className={styles.heroDots}>
          {CAROUSEL_IMAGES.slice(0, 8).map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === imgIndex % 8 ? styles.dotActive : ''}`}
              onClick={() => setImgIndex(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Services */}
      <section className={styles.services}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Exciting Services For Your Pets
        </motion.h2>
        <div className={styles.servicesGrid}>
          {SERVICES.map((svc, i) => (
            <motion.button
              key={svc.label}
              className={styles.serviceBtn}
              onClick={() => handleService(svc)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              whileHover={{ scale: 1.07, boxShadow: '0 12px 32px rgba(173,106,108,0.35)' }}
              whileTap={{ scale: 0.96 }}
            >
              <span className={styles.serviceIcon}>{svc.icon}</span>
              <span className={styles.serviceLabel}>{svc.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Why FurrEver Homes */}
      <section className={styles.why}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Why FurrEver Homes?
        </motion.h2>
        <div className={styles.whyGrid}>
          {WHY_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              className={styles.whyCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(173,106,108,0.18)' }}
            >
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />

      {/* Injury Alert Modal */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAlert(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <p className={styles.modalText}>
                🚨 Call us at <strong>+91-XXXXX XXXXX</strong> — our rescue team will be reaching soon!
              </p>
              <button className={styles.modalBtn} onClick={() => setShowAlert(false)}>OK</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
