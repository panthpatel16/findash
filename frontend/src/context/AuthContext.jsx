import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

// Minimal JWT payload decoder (no dependency needed)
function decodePayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function parseUser(token) {
  const payload = decodePayload(token)
  if (!payload) return null
  // roles claim is "ROLE_ADMIN" etc.
  const roleRaw = payload.roles || ''
  const role = roleRaw.replace('ROLE_', '')
  return { username: payload.sub, role }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fd_token') || null)
  const [user,  setUser]  = useState(() => {
    const t = localStorage.getItem('fd_token')
    return t ? parseUser(t) : null
  })

  const login = useCallback((authResponse) => {
    const { token } = authResponse
    localStorage.setItem('fd_token', token)
    const parsed = parseUser(token)
    setToken(token)
    setUser(parsed)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fd_token')
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback((...roles) => {
    return user ? roles.includes(user.role) : false
  }, [user])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
