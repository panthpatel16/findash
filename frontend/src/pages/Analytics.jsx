import { useState } from 'react'
import useKpiData from '../hooks/useKpiData'
import { RevenueChart, VolumeChart, FraudRateChart } from '../components/charts/Charts'

const PERIODS = [
  { label: '7D',  days: 7 },
  { label: '30D', days: 30 },
  { label: '60D', days: 60 },
  { label: '90D', days: 90 },
]

function ChartCard({ title, subtitle, children, delay = 0 }) {
  return (
    <div className={`card anim-fade-up`} style={{ padding: '20px 22px', animationDelay: `${delay}s` }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

export default function Analytics() {
  const [days, setDays] = useState(30)
  const { history, loading, error, lastUpdated, refresh } = useKpiData(days)

  const MOCK_HISTORY = Array.from({ length: days }, (_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (days - 1 - i))
    const base = 40000 + Math.sin(i * 0.4) * 15000 + Math.random() * 8000
    return {
      timestamp: dt.toISOString(),
      revenue: base.toFixed(2),
      volume: Math.floor(80 + Math.sin(i * 0.3) * 40 + Math.random() * 30),
      fraudRate: (2.5 + Math.sin(i * 0.6) * 1.2 + Math.random() * 0.5).toFixed(2),
    }
  })

  const data = (history && history.length > 0) ? history : MOCK_HISTORY

  // Compute summary stats
  const totalRevenue = data.reduce((s, d) => s + parseFloat(d.revenue || 0), 0)
  const avgVolume    = data.length ? Math.round(data.reduce((s, d) => s + (d.volume || 0), 0) / data.length) : 0
  const avgFraud     = data.length
    ? (data.reduce((s, d) => s + parseFloat(d.fraudRate || 0), 0) / data.length).toFixed(2)
    : '0'
  const peakRevDay   = data.reduce((max, d) => parseFloat(d.revenue) > parseFloat(max.revenue || 0) ? d : max, data[0] || {})

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div className="anim-fade-up" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
            letterSpacing: '-0.03em', color: 'var(--text)',
          }}>Analytics</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            Historical KPI trends and financial performance
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }} onClick={refresh}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="anim-fade-up anim-d1" style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
        {PERIODS.map(p => (
          <button
            key={p.days}
            onClick={() => setDays(p.days)}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid',
              borderColor: days === p.days ? 'var(--green)' : 'var(--border)',
              background:  days === p.days ? 'var(--green-dim)' : 'transparent',
              color:       days === p.days ? 'var(--green)'     : 'var(--text3)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', transition: 'all .15s',
            }}
          >{p.label}</button>
        ))}
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', marginBottom: 16,
          background: 'var(--amber-dim)', border: '1px solid rgba(245,185,66,.2)',
          borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--amber)',
        }}>
          ⚠ API unavailable — showing demo data. {error}
        </div>
      )}

      {/* Stats strip */}
      <div className="anim-fade-up anim-d2" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20,
      }}>
        {[
          { label: 'PERIOD REVENUE',    value: `$${(totalRevenue/1000).toFixed(0)}k` },
          { label: 'AVG DAILY VOLUME',  value: avgVolume.toLocaleString() },
          { label: 'AVG FRAUD RATE',    value: `${avgFraud}%` },
          { label: 'PEAK REVENUE DAY',  value: `$${(parseFloat(peakRevDay?.revenue||0)/1000).toFixed(1)}k` },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px' }}>
            <div className="label" style={{ marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <span className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ChartCard
            title="Revenue Over Time"
            subtitle={`Cumulative revenue across ${days}-day window`}
            delay={0.12}
          >
            <RevenueChart data={data} />
          </ChartCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ChartCard title="Transaction Volume" subtitle="Daily count" delay={0.18}>
              <VolumeChart data={data} />
            </ChartCard>
            <ChartCard title="Fraud Rate %" subtitle="Flagged transactions as % of total" delay={0.24}>
              <FraudRateChart data={data} />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  )
}
