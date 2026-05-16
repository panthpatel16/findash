import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { reportsApi } from '../api/client'

const MOCK_WEEKLY = {
  period: 'WEEKLY', totalRevenue: 284500, totalTransactions: 1923,
  avgDailyRevenue: 40643, peakDayRevenue: 52810, flaggedCount: 7, fraudRate: 0.36,
}
const MOCK_MONTHLY = {
  period: 'MONTHLY', totalRevenue: 1842300, totalTransactions: 12847,
  avgDailyRevenue: 61410, peakDayRevenue: 98240, flaggedCount: 38, fraudRate: 2.87,
}
const MOCK_FRAUD = [
  { id: 1, referenceId: 'a1b2c3d4-0001', type: 'WITHDRAWAL', amount: 14200, currency: 'USD', description: 'Wire transfer — institutional', flagReason: 'LARGE_AMOUNT', createdAt: '2024-11-20T09:14:00' },
  { id: 2, referenceId: 'a1b2c3d4-0002', type: 'TRANSFER',   amount: 11800, currency: 'USD', description: 'SWIFT inbound',                flagReason: 'LARGE_AMOUNT', createdAt: '2024-11-19T14:28:00' },
  { id: 3, referenceId: 'a1b2c3d4-0003', type: 'WITHDRAWAL', amount: 18500, currency: 'USD', description: 'Investment portfolio rebalance', flagReason: 'LARGE_AMOUNT', createdAt: '2024-11-18T11:05:00' },
  { id: 4, referenceId: 'a1b2c3d4-0004', type: 'TRANSFER',   amount: 12000, currency: 'USD', description: 'Correspondent bank transfer',   flagReason: 'LARGE_AMOUNT', createdAt: '2024-11-17T16:44:00' },
]

function Stat({ label, value, accent }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 5 }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
        letterSpacing: '-0.02em', color: accent ? 'var(--green)' : 'var(--text)',
      }}>{value}</div>
    </div>
  )
}

function PeriodCard({ title, data, delay }) {
  if (!data) return null
  return (
    <div className={`card anim-fade-up`} style={{ padding: '22px 24px', animationDelay: `${delay}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
          {data.period}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        <Stat label="TOTAL REVENUE"   value={`$${(data.totalRevenue/1000).toFixed(0)}k`} accent />
        <Stat label="TRANSACTIONS"    value={data.totalTransactions.toLocaleString()} />
        <Stat label="FRAUD RATE"      value={`${data.fraudRate}%`} />
        <Stat label="AVG DAILY REV"   value={`$${(data.avgDailyRevenue/1000).toFixed(1)}k`} />
        <Stat label="PEAK DAY"        value={`$${(data.peakDayRevenue/1000).toFixed(1)}k`} />
        <Stat label="FLAGGED TXN"     value={data.flaggedCount} />
      </div>
    </div>
  )
}

export default function Reports() {
  const { hasRole } = useAuth()
  const isAdmin = hasRole('ADMIN')

  const [weekly,  setWeekly]  = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [fraud,   setFraud]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetches = [
      reportsApi.weekly().then(r => setWeekly(r.data)).catch(() => setWeekly(MOCK_WEEKLY)),
      reportsApi.monthly().then(r => setMonthly(r.data)).catch(() => setMonthly(MOCK_MONTHLY)),
    ]
    if (isAdmin) {
      fetches.push(reportsApi.fraud().then(r => setFraud(r.data)).catch(() => setFraud(MOCK_FRAUD)))
    }
    Promise.allSettled(fetches).finally(() => setLoading(false))
  }, [isAdmin])

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
          letterSpacing: '-0.03em', color: 'var(--text)',
        }}>Reports</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
          Period summaries · {isAdmin ? 'Full access including fraud audit queue' : 'Analyst view'}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <span className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Period summaries */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <PeriodCard title="Weekly Summary"  data={weekly}  delay={0.06} />
            <PeriodCard title="Monthly Summary" data={monthly} delay={0.12} />
          </div>

          {/* Fraud queue — ADMIN only */}
          {isAdmin && (
            <div className="anim-fade-up anim-d3 card" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '18px 22px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Fraud Audit Queue</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>Admin-only · All flagged transactions</div>
                </div>
                <span className="badge badge-red">{fraud.length} flagged</span>
              </div>

              {/* Table header */}
              <div className="table-row" style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                background: 'var(--surface2)',
              }}>
                {['DESCRIPTION', 'TYPE', 'AMOUNT', 'FLAG REASON', 'DATE'].map(h => (
                  <span key={h} className="label">{h}</span>
                ))}
              </div>

              {fraud.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                  No flagged transactions
                </div>
              ) : (
                fraud.map(txn => (
                  <div key={txn.id} className="table-row"
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{txn.description || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                        {txn.referenceId.substring(0, 12)}...
                      </div>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>{txn.type}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>
                      ${Number(txn.amount).toLocaleString()}
                    </span>
                    <span className="badge badge-red" style={{ fontSize: 10 }}>
                      {txn.flagReason?.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
