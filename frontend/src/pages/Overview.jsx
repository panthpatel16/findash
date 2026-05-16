import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { kpiApi } from '../api/client'
import { KpiCard, LiveBadge } from '../components/RoleGuard'
import useWebSocket from '../hooks/useWebSocket'

const FALLBACK_SUMMARY = {
  totalRevenue: 1764892.50,
  revenueChangePct: 5.8,
  transactionVolume: 11943,
  transactionVolumeChange: 843,
  fraudRate: 2.87,
  fraudRateChange: -0.284,
  avgTransactionValue: 4312,
}

export default function Overview() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  // WebSocket — live KPI tick every 5 seconds from backend
  const { data: liveTick, connected } = useWebSocket('/topic/kpi')

  useEffect(() => {
    kpiApi.summary()
      .then(r => setSummary(r.data))
      .catch(() => setSummary(FALLBACK_SUMMARY))
      .finally(() => setLoading(false))
  }, [])

  // Merge live WebSocket updates into displayed summary
  useEffect(() => {
    if (liveTick) setSummary(liveTick)
  }, [liveTick])

  const data = summary || FALLBACK_SUMMARY

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div className="anim-fade-up" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
            letterSpacing: '-0.03em', color: 'var(--text)',
          }}>
            Overview
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            Financial KPIs · Last 30 days
          </p>
        </div>
        <LiveBadge connected={connected} />
      </div>

      {/* Welcome banner */}
      <div className="anim-fade-up anim-d1 card" style={{
        padding: '20px 24px', marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(0,229,160,0.05) 0%, var(--surface) 60%)',
        borderColor: 'rgba(0,229,160,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 3 }}>
            Signed in as <span style={{ color: 'var(--text)', fontWeight: 600 }}>{user?.username}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Role-based access active · {connected ? 'Receiving live updates' : 'Connecting to live feed...'}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
          color: 'var(--green)', background: 'var(--green-dim)',
          padding: '5px 12px', borderRadius: 6,
        }}>
          42% reporting effort reduced
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              flex: '1 1 220px', height: 120, borderRadius: 'var(--radius)',
              background: `linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%)`,
              backgroundSize: '600px 100%', animation: 'shimmer 1.4s infinite',
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 14 }}>
          <KpiCard
            label="TOTAL REVENUE"
            prefix="$"
            value={Number(data.totalRevenue).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            change={data.revenueChangePct}
            subtext="vs prev 30d"
            accent delay={0.08}
          />
          <KpiCard
            label="TRANSACTION VOLUME"
            value={Number(data.transactionVolume)}
            change={((data.transactionVolumeChange / (data.transactionVolume - data.transactionVolumeChange)) * 100).toFixed(1)}
            subtext={`${data.transactionVolumeChange > 0 ? '+' : ''}${data.transactionVolumeChange} txns`}
            accent delay={0.14}
          />
          <KpiCard
            label="FRAUD RATE"
            value={Number(data.fraudRate).toFixed(2)}
            unit="%"
            change={data.fraudRateChange}
            subtext="vs prev 30d"
            accent={false} delay={0.20}
          />
          <KpiCard
            label="AVG TRANSACTION VALUE"
            prefix="$"
            value={Number(data.avgTransactionValue).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            delay={0.26}
          />
        </div>
      )}

      {/* Live feed indicator */}
      <div className="anim-fade-up anim-d5 card" style={{
        marginTop: 24, padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {connected && <span className="live-dot" />}
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
            {connected
              ? 'Live KPI feed active — dashboard updates every 5 seconds via WebSocket'
              : 'Connecting to WebSocket live feed...'}
          </span>
        </div>
        {summary?.asOf && (
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            Updated {new Date(summary.asOf).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}
