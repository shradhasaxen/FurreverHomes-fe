import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { userApi } from '../../api'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'
import styles from './Profile.module.css'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', phoneNumber: '', address: '', city: '', state: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  useEffect(() => {
    userApi.getProfile()
      .then(data => {
        setProfile(data)
        setForm({
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
        })
      })
      .catch(() => setMsg({ text: 'Failed to load profile', type: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setMsg({ text: '', type: '' })
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { setMsg({ text: 'Name is required', type: 'error' }); return }
    setSaving(true)
    try {
      await api.put('/users/me', form)
      setMsg({ text: 'Profile updated successfully!', type: 'success' })
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' })
    } finally { setSaving(false) }
  }

  if (loading) return <p className={styles.loading}>Loading profile...</p>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile 👤</h1>
        <p className={styles.sub}>Manage your account information</p>
      </div>

      <div className={styles.card}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>{profile?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className={styles.userName}>{profile?.name}</p>
            <p className={styles.userEmail}>{profile?.email}</p>
            <span className={styles.roleBadge}>{profile?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.row}>
            <Field label="Full Name *">
              <input className={styles.input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" />
            </Field>
            <Field label="Phone Number">
              <input className={styles.input} value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" />
            </Field>
          </div>
          <Field label="Address">
            <textarea className={`${styles.input} ${styles.textarea}`} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" rows={2} />
          </Field>
          <div className={styles.row}>
            <Field label="City">
              <input className={styles.input} value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
            </Field>
            <Field label="State">
              <input className={styles.input} value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" />
            </Field>
          </div>

          {msg.text && (
            <p className={msg.type === 'success' ? styles.success : styles.error}>{msg.text}</p>
          )}

          <div className={styles.formFooter}>
            <div className={styles.readonlyInfo}>
              <span>📧 {profile?.email}</span>
              <span>🗓 Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
            </div>
            <motion.button type="submit" className={styles.saveBtn} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      </div>
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
