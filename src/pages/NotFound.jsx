import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './NotFound.module.css'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.icon}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#3D405B"/>
            <path d="M32 48 C32 48 14 36 14 24 C14 18 18.5 14 24 14 C27.5 14 30.5 15.8 32 18.5 C33.5 15.8 36.5 14 40 14 C45.5 14 50 18 50 24 C50 36 32 48 32 48Z" fill="#AD6A6C"/>
            <ellipse cx="32" cy="33" rx="5.5" ry="4.5" fill="#fff" opacity="0.95"/>
            <ellipse cx="24.5" cy="26" rx="3" ry="2.5" fill="#fff" opacity="0.95"/>
            <ellipse cx="29" cy="23.5" rx="3" ry="2.5" fill="#fff" opacity="0.95"/>
            <ellipse cx="35" cy="23.5" rx="3" ry="2.5" fill="#fff" opacity="0.95"/>
            <ellipse cx="39.5" cy="26" rx="3" ry="2.5" fill="#fff" opacity="0.95"/>
          </svg>
        </div>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Oops! This paw went astray 🐾</h2>
        <p className={styles.sub}>The page you're looking for doesn't exist or has been moved.</p>
        <div className={styles.btnRow}>
          <motion.button
            className={styles.homeBtn}
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            🏠 Go Home
          </motion.button>
          <motion.button
            className={styles.adoptBtn}
            onClick={() => navigate('/adopt')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            🐶 Adopt a Pet
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
