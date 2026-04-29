import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { auth } from '../api'
import styles from './Navbar.module.css'

const SOUNDS = ['/sound/barkkk.mp3', '/sound/cat.mp3', '/sound/bird.wav']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(auth.getUser())
  const location = useLocation()
  const navigate = useNavigate()
  const audioRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Refresh user state on every route change (handles login/logout)
  useEffect(() => {
    setMenuOpen(false)
    setUser(auth.getUser())
  }, [location])

  function playRandomSound() {
    const src = SOUNDS[Math.floor(Math.random() * SOUNDS.length)]
    if (audioRef.current) {
      audioRef.current.src = src
      audioRef.current.play().catch(() => {})
    }
  }

  function handleLogout() {
    auth.clear()
    setUser(null)
    navigate('/')
  }

  const navLinks = [
    { to: '/add-pet', label: 'Add Pet' },
    { to: '/adopt', label: 'Adopt Pet' },
  ]

  return (
    <>
      <audio ref={audioRef} />
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <button
              className={styles.pawBtn}
              onClick={playRandomSound}
              aria-label="Play pet sound"
              title="Click for a surprise!"
            >
              <img
                src="https://em-content.zobj.net/source/softbank/145/paw-prints_1f43e.png"
                alt="🐾"
                className={styles.pawImg}
              />
            </button>
            <Link to="/" className={styles.brand}>FurrEver Homes</Link>
          </div>

          <div className={styles.desktopLinks}>
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`${styles.navLink} ${location.pathname === l.to ? styles.active : ''}`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <span className={styles.navLink} style={{ opacity: 0.75, cursor: 'default' }}>
                  👤 {user.name?.split(' ')[0]}
                </span>
                <button className={`${styles.navLink} ${styles.signupLink}`} onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/signup"
                className={`${styles.navLink} ${styles.signupLink} ${location.pathname === '/signup' ? styles.active : ''}`}
              >
                Sign Up
              </Link>
            )}
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className={styles.mobileMenu}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {navLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`${styles.mobileLink} ${location.pathname === l.to ? styles.active : ''}`}
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <button className={styles.mobileLink} onClick={handleLogout}>Logout</button>
              ) : (
                <Link to="/signup" className={`${styles.mobileLink} ${location.pathname === '/signup' ? styles.active : ''}`}>
                  Sign Up
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
