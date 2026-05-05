import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { session, authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(session.getUser())
  const [loading, setLoading] = useState(false)

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    session.clear()
    setUser(null)
  }, [])

  // Auto-logout when access token expires and no refresh token exists
  useEffect(() => {
    if (!user) return
    const expiresAt = session.getExpiresAt()
    if (!expiresAt) return
    const msUntilExpiry = expiresAt - Date.now()
    if (msUntilExpiry <= 0) {
      // Token already expired — axios interceptor will handle refresh on next request
      return
    }
    // Schedule a check slightly after expiry; interceptor handles the actual refresh
    const timer = setTimeout(() => {
      if (!session.getRefreshToken()) logout()
    }, msUntilExpiry + 1000)
    return () => clearTimeout(timer)
  }, [user, logout])

  async function login(credentials) {
    setLoading(true)
    try {
      const data = await authApi.login(credentials)
      session.saveAuthResponse(data)
      setUser({ userId: data.userId, name: data.name, email: data.email, role: data.role })
      return data
    } finally {
      setLoading(false)
    }
  }

  async function signup(formData) {
    setLoading(true)
    try {
      const data = await authApi.signup(formData)
      session.saveAuthResponse(data)
      setUser({ userId: data.userId, name: data.name, email: data.email, role: data.role })
      return data
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
