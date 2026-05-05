import { useState, useEffect } from 'react'
import { adminApi } from '../../api'
import styles from './AdminTable.module.css'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => { loadUsers() }, [page])

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await adminApi.getAllUsers(page, 20)
      setUsers(res?.content ?? [])
      setTotalPages(res?.totalPages ?? 0)
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }

  const filtered = search
    ? users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    : users

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users 👥</h1>
        <p className={styles.sub}>All registered platform users</p>
      </div>

      <div className={styles.tableWrap} style={{ maxWidth: '100%' }}>
        <div style={{ padding: '16px 16px 0' }}>
          <input
            className={styles.input}
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 320 }}
          />
        </div>

        {loading ? <p className={styles.loading}>Loading users...</p> : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: '#aaa' }}>{(page * 20) + i + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ color: '#888' }}>{u.email}</td>
                    <td style={{ color: '#888' }}>{u.phoneNumber || '—'}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${u.role === 'ADMIN' ? styles.roleAdmin : styles.roleUser}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={u.active ? styles.statusActive : styles.statusInactive}>
                        {u.active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={{ color: '#aaa', fontSize: 12 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
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
    </div>
  )
}
