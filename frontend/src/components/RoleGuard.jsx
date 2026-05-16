// ─── KpiCard ──────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, change, unit = '', prefix = '', subtext, accent, delay = 0 }) {
  const isPositive = parseFloat(change) >= 0
  const changeColor = accent
    ? (isPositive ? 'var(--green)' : 'var(--red)')
    : 'var(--text3)'

  return (
    <div
      className={`card anim-fade-up`}
      style={{ padding: '22px 24px', animationDelay: `${delay}s` }}
    >
      <div className="label" style={{ marginBottom: 12 }}>{label}</div>

      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
        letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1,
        animation: 'numberUp .4s ease both',
      }}>
        {prefix}{typeof value === 'number'
          ? value.toLocaleString('en-US', { maximumFractionDigits: 2 })
          : value}
        {unit && <span style={{ fontSize: 16, color: 'var(--text3)', marginLeft: 4, fontWeight: 500 }}>{unit}</span>}
      </div>

      {change !== undefined && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 12, color: changeColor, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
            {isPositive ? '▲' : '▼'} {Math.abs(parseFloat(change)).toFixed(1)}%
          </span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>
            {subtext || 'vs prev period'}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── LiveBadge ────────────────────────────────────────────────────────────────
export function LiveBadge({ connected }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '5px 10px', borderRadius: 20,
      background: connected ? 'var(--green-dim)' : 'var(--surface2)',
      border: `1px solid ${connected ? 'rgba(0,229,160,0.2)' : 'var(--border)'}`,
      fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
      color: connected ? 'var(--green)' : 'var(--text3)',
    }}>
      {connected
        ? <><span className="live-dot" /> LIVE</>
        : <><span style={{ width:7,height:7,borderRadius:'50%',background:'var(--text3)',display:'inline-block' }} /> OFFLINE</>
      }
    </div>
  )
}

// ─── RoleGuard ────────────────────────────────────────────────────────────────
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function RoleGuard({ allowed, children }) {
  const { hasRole } = useAuth()
  return hasRole(...allowed) ? children : <Navigate to="/overview" replace />
}
