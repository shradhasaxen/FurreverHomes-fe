import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import styles from './Signup.module.css'

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, signup: signupCtx } = useAuth()
  const from = location.state?.from?.pathname || null
  const [panel, setPanel] = useState('signin')
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone_num: '' })
  const [signinForm, setSigninForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  function setS(field, val) { setSignupForm(f => ({ ...f, [field]: val })); setErrors(e => ({ ...e, [field]: '' })) }
  function setI(field, val) { setSigninForm(f => ({ ...f, [field]: val })); setErrors(e => ({ ...e, [field]: '' })) }

  function validateSignup() {
    const e = {}
    if (!signupForm.name.trim()) e.name = 'Name is required'
    if (!/\S+@\S+\.\S+/.test(signupForm.email)) e.email = 'Valid email required'
    if (signupForm.password.length < 8) e.password = 'Minimum 8 characters'
    if (signupForm.confirmPassword !== signupForm.password) e.confirmPassword = 'Passwords do not match'
    if (!/^\d{10}$/.test(signupForm.phone_num)) e.phone_num = '10-digit number required'
    return e
  }

  function validateSignin() {
    const e = {}
    if (!signinForm.email) e.email = 'Email is required'
    if (!signinForm.password) e.password = 'Password is required'
    return e
  }

  async function handleSignup(e) {
    e.preventDefault()
    const errs = validateSignup()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await signupCtx(signupForm)
      setMsg({ text: 'Account created successfully! 🎉', type: 'success' })
      setTimeout(() => navigate(from || '/dashboard'), 1200)
    } catch (err) {
      setMsg({ text: err.response?.data?.message || err.message || 'Signup failed.', type: 'error' })
    } finally { setLoading(false) }
  }

  async function handleSignin(e) {
    e.preventDefault()
    const errs = validateSignin()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const data = await login(signinForm)
      setMsg({ text: 'Signed in successfully! 🐾', type: 'success' })
      setTimeout(() => navigate(from || (data.role === 'ADMIN' ? '/admin' : '/dashboard')), 1200)
    } catch (err) {
      setMsg({ text: err.response?.data?.message || err.message || 'Invalid credentials.', type: 'error' })
    } finally { setLoading(false) }
  }

  function switchPanel(p) { setPanel(p); setMsg({ text: '', type: '' }); setErrors({}) }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${panel === 'signin' ? styles.tabActive : ''}`}
            onClick={() => switchPanel('signin')}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${panel === 'signup' ? styles.tabActive : ''}`}
            onClick={() => switchPanel('signup')}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          {panel === 'signin' ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.28 }}
            >
              <div className={styles.formHeader}>
                <span className={styles.pawIcon}>🐾</span>
                <h2 className={styles.formTitle}>Welcome Back!</h2>
                <p className={styles.formSub}>Sign in to continue your journey</p>
              </div>
              <form onSubmit={handleSignin} noValidate className={styles.form}>
                <InputField
                  icon="fa-envelope"
                  type="email"
                  placeholder="Email address"
                  value={signinForm.email}
                  onChange={e => setI('email', e.target.value)}
                  error={errors.email}
                />
                <InputField
                  icon="fa-lock"
                  type="password"
                  placeholder="Password"
                  value={signinForm.password}
                  onChange={e => setI('password', e.target.value)}
                  error={errors.password}
                />
                {msg.text && <p className={`${styles.msg} ${styles[msg.type]}`}>{msg.text}</p>}
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <p className={styles.switchText}>
                  Don't have an account?{' '}
                  <button type="button" className={styles.switchLink} onClick={() => switchPanel('signup')}>
                    Create one
                  </button>
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
            >
              <div className={styles.formHeader}>
                <span className={styles.pawIcon}>🐾</span>
                <h2 className={styles.formTitle}>Create Account</h2>
                <p className={styles.formSub}>Join the FurrEver Homes family</p>
              </div>
              <form onSubmit={handleSignup} noValidate className={styles.form}>
                <InputField
                  icon="fa-user"
                  type="text"
                  placeholder="Your full name"
                  value={signupForm.name}
                  onChange={e => setS('name', e.target.value)}
                  error={errors.name}
                />
                <InputField
                  icon="fa-envelope"
                  type="email"
                  placeholder="Email address"
                  value={signupForm.email}
                  onChange={e => setS('email', e.target.value)}
                  error={errors.email}
                />
                <div className={styles.row}>
                  <InputField
                    icon="fa-lock"
                    type="password"
                    placeholder="Password"
                    value={signupForm.password}
                    onChange={e => setS('password', e.target.value)}
                    error={errors.password}
                  />
                  <InputField
                    icon="fa-lock"
                    type="password"
                    placeholder="Confirm Password"
                    value={signupForm.confirmPassword}
                    onChange={e => setS('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>
                <InputField
                  icon="fa-phone"
                  type="tel"
                  placeholder="Contact number"
                  value={signupForm.phone_num}
                  onChange={e => setS('phone_num', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  error={errors.phone_num}
                />
                {msg.text && <p className={`${styles.msg} ${styles[msg.type]}`}>{msg.text}</p>}
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </button>
                <p className={styles.switchText}>
                  Already have an account?{' '}
                  <button type="button" className={styles.switchLink} onClick={() => switchPanel('signin')}>
                    Sign in
                  </button>
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function InputField({ icon, type, placeholder, value, onChange, error }) {
  return (
    <div className={styles.fieldWrap}>
      <div className={`${styles.inputWrap} ${error ? styles.inputWrapErr : ''}`}>
        <i className={`fas ${icon} ${styles.inputIcon}`} />
        <input
          className={styles.input}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
      </div>
      {error && <span className={styles.err}>{error}</span>}
    </div>
  )
}
