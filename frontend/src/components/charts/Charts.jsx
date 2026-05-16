import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const fmt = {
  date:    (d) => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}` },
  usd:     (v) => `$${(v/1000).toFixed(0)}k`,
  pct:     (v) => `${v}%`,
  vol:     (v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v,
}

const TooltipStyle = {
  contentStyle: {
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  labelStyle: { color: 'var(--text2)', marginBottom: 4 },
  cursor: { stroke: 'var(--border2)', strokeWidth: 1 },
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
export function RevenueChart({ data }) {
  const series = data.map(d => ({
    date: fmt.date(d.timestamp),
    revenue: parseFloat(d.revenue) || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={series} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#00e5a0" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#00e5a0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tickFormatter={fmt.usd} tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          tickLine={false} axisLine={false} width={46} />
        <Tooltip {...TooltipStyle} formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
        <Area type="monotone" dataKey="revenue" stroke="#00e5a0" strokeWidth={2}
          fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#00e5a0', strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Volume Chart ─────────────────────────────────────────────────────────────
export function VolumeChart({ data }) {
  const series = data.map(d => ({
    date: fmt.date(d.timestamp),
    volume: d.volume || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={series} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barSize={6}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tickFormatter={fmt.vol} tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          tickLine={false} axisLine={false} width={36} />
        <Tooltip {...TooltipStyle} formatter={v => [v.toLocaleString(), 'Transactions']} />
        <Bar dataKey="volume" fill="#4d9eff" radius={[3, 3, 0, 0]}
          activeBar={{ fill: '#7ab8ff' }} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Fraud Rate Chart ─────────────────────────────────────────────────────────
export function FraudRateChart({ data }) {
  const series = data.map(d => ({
    date: fmt.date(d.timestamp),
    rate: parseFloat(d.fraudRate) || 0,
  }))

  const avg = series.length
    ? series.reduce((s, d) => s + d.rate, 0) / series.length
    : 0

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={series} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tickFormatter={v => `${v.toFixed(1)}%`}
          tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          tickLine={false} axisLine={false} width={40} />
        <Tooltip {...TooltipStyle} formatter={v => [`${v.toFixed(2)}%`, 'Fraud Rate']} />
        <ReferenceLine y={avg} stroke="var(--border2)" strokeDasharray="4 4"
          label={{ value: 'avg', position: 'right', fill: 'var(--text3)', fontSize: 10 }} />
        <Line type="monotone" dataKey="rate" stroke="#ff4d6a" strokeWidth={2}
          dot={false} activeDot={{ r: 4, fill: '#ff4d6a', strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
