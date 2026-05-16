import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'

const DEMO_CREDS = [
  { label: 'Admin',   username: 'admin',   password: 'Admin@123',   role: 'ADMIN',   badge: 'badge-red' },
  { label: 'Analyst', username: 'analyst', password: 'Analyst@123', role: 'ANALYST', badge: 'badge-blue' },
  { label: 'Viewer',  username: 'viewer',  password: 'Viewer@123',  role: 'VIEWER',  badge: 'badge-neutral' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const submit = async (u = username, p = password) => {
    if (!u || !p) { setError('Please enter username and password'); return }
    setLoading(true); setError('')
    try {
      const res = await authApi.login({ username: u, password: p })
      login(res.data)
      navigate('/overview')
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (cred) => {
    setUsername(cred.username)
    setPassword(cred.password)
    submit(cred.username, cred.password)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 700, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 65%)',
      }} />

      <div className="anim-fade-up" style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
            letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1,
          }}>
            Fin<span style={{ color: 'var(--green)' }}>Dash</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>
            Real-Time Financial KPI Platform
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px 28px' }}>
          <div style={{ marginBottom: 22 }}>
            <label className="label" style={{ display: 'block', marginBottom: 8 }}>USERNAME</label>
            <input className="input" type="text" placeholder="username"
              value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label" style={{ display: 'block', marginBottom: 8 }}>PASSWORD</label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>

          {error && (
            <div style={{
              padding: '9px 13px', marginBottom: 16,
              background: 'var(--red-dim)', border: '1px solid rgba(255,77,106,.2)',
              borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--red)',
            }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px 0' }}
            onClick={() => submit()}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: 20 }}>
          <div className="label" style={{ textAlign: 'center', marginBottom: 12 }}>
            DEMO ACCOUNTS
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {DEMO_CREDS.map(c => (
              <button
                key={c.label}
                onClick={() => quickLogin(c)}
                disabled={loading}
                style={{
                  flex: 1, padding: '10px 8px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  transition: 'border-color .15s, background .15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span className={`badge ${c.badge}`} style={{ fontSize: 10 }}>{c.role}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>
                  {c.username}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
