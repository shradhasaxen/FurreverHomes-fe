import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../../api'
import api from '../../api'
import styles from './AdminTable.module.css'

export default function AdminAdoptions() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [updating, setUpdating] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => { loadRequests() }, [page])

  async function loadRequests() {
    setLoading(true)
    try {
      const res = await adminApi.getAllAdoptions(page, 15)
      setRequests(res?.content ?? [])
      setTotalPages(res?.totalPages ?? 0)
    } catch { setRequests([]) }
    finally { setLoading(false) }
  }

  async function handleAction(id, status) {
    setUpdating(id)
    try {
      const params = new URLSearchParams({ status })
      if (adminNotes) params.set('adminNotes', adminNotes)
      const res = await api.patch(`/adoptions/${id}/status?${params}`)
      const updated = res.data.data
      setRequests(r => r.map(x => x.id === id ? updated : x))
      if (selected?.id === id) setSelected(updated)
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    } finally { setUpdating(null) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Adoption Requests ❤️</h1>
        <p className={styles.sub}>Review and manage all adoption applications</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.tableWrap}>
          {loading ? <p className={styles.loading}>Loading...</p> : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Pet</th>
                    <th>Applicant</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} className={selected?.id === r.id ? styles.rowActive : ''} onClick={() => { setSelected(r); setAdminNotes(r.adminNotes || '') }}>
                      <td style={{ color: '#aaa' }}>#{r.id}</td>
                      <td><strong>{r.petName || `Pet #${r.petId}`}</strong></td>
                      <td style={{ color: '#888' }}>{r.applicantName || '—'}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td style={{ color: '#aaa', fontSize: 12 }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                      <td><button className={styles.detailBtn}>Review →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span>Page {page + 1} of {totalPages}</span>
                  <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>

        {selected && (
          <motion.div className={styles.detail} key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>Request #{selected.id}</h2>
              <button className={styles.closeDetail} onClick={() => setSelected(null)}>×</button>
            </div>

            <div className={styles.detailMeta}>
              <Row label="Pet" value={selected.petName || `Pet #${selected.petId}`} />
              <Row label="Applicant" value={selected.applicantName || '—'} />
              <Row label="Status" value={selected.status} />
              {selected.applicantMessage && <Row label="Message" value={selected.applicantMessage} />}
              {selected.adminNotes && <Row label="Admin Notes" value={selected.adminNotes} />}
            </div>

            {selected.status === 'PENDING' && (
              <div className={styles.updateSection}>
                <h3 className={styles.updateTitle}>Review Application</h3>
                <textarea
                  className={styles.input}
                  placeholder="Admin notes (optional)..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
                <div className={styles.actionRow}>
                  <button
                    className={styles.approveBtn}
                    onClick={() => handleAction(selected.id, 'APPROVED')}
                    disabled={updating === selected.id}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleAction(selected.id, 'REJECTED')}
                    disabled={updating === selected.id}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { PENDING:['#fff3cd','#856404'], APPROVED:['#d4edda','#155724'], REJECTED:['#f8d7da','#721c24'] }
  const [bg, color] = map[status] || ['#f0f0f0','#555']
  return <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{status}</span>
}
