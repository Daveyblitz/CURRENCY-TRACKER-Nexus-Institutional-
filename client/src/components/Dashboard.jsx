import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import MarketTable from './MarketTable'
import CurrencyPanel from './CurrencyPanel'
import CountryFlag from './CountryFlag'

const PERIODS = ['1D', '1W', '1M']

// Simple SVG Portfolio Chart — renders a smooth area curve
function PortfolioChart({ period }) {
  // Static illustrative data per period (matches Stitch design aesthetic)
  const DATA = {
    '1D': [2.12, 2.21, 2.18, 2.35, 2.28, 2.44, 2.38, 2.51, 2.47, 2.58, 2.53, 2.64, 2.72, 2.68, 2.84],
    '1W': [2.01, 2.10, 2.24, 2.18, 2.41, 2.35, 2.55, 2.48, 2.62, 2.70, 2.65, 2.75, 2.69, 2.80, 2.84],
    '1M': [1.82, 1.95, 2.05, 1.98, 2.18, 2.12, 2.30, 2.24, 2.40, 2.55, 2.50, 2.62, 2.70, 2.75, 2.84],
  }

  const values = DATA[period]
  const W = 600
  const H = 160
  const min = Math.min(...values) * 0.98
  const max = Math.max(...values) * 1.02
  const range = max - min

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - ((v - min) / range) * H
    return [x, y]
  })

  // Smooth bezier path
  const linePath = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`
    const [px, py] = pts[i - 1]
    const cx1 = px + (x - px) / 3
    const cx2 = x - (x - px) / 3
    return `${acc} C ${cx1} ${py} ${cx2} ${y} ${x} ${y}`
  }, '')

  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`

  // Y-axis labels
  const yLabels = [max, (max + min) / 2, min].map(v => `$${(v).toFixed(2)}M`)

  return (
    <div className="chart-container">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2d5bff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2d5bff" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac, i) => (
          <line
            key={i}
            x1="0" y1={H * frac}
            x2={W} y2={H * frac}
            stroke="var(--outline-variant)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGrad)" />
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--primary-bright)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Last point dot */}
        {pts[pts.length - 1] && (
          <circle
            cx={pts[pts.length - 1][0]}
            cy={pts[pts.length - 1][1]}
            r="4"
            fill="var(--primary-bright)"
          />
        )}
      </svg>
    </div>
  )
}

export default function Dashboard({ user }) {
  const [period, setPeriod] = useState('1D')
  const { data: market } = useFetch('/api/market', { interval: 30000 })
  const { data: mempool } = useFetch('/api/mempool', { interval: 60000 })

  const btcPrice = market?.bitcoin?.price
  const btcChange = market?.bitcoin?.change24h ?? 0

  return (
    <div className="page-area">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Financial Intelligence Overview</div>
        </div>
        <div className="status-badge">
          <span className="status-dot" />
          All Systems Live
        </div>
      </div>

      {/* Main 2-column grid */}
      <div className="dashboard-grid">

        {/* LEFT COLUMN */}
        <div className="dashboard-main">

          {/* Portfolio Value Chart */}
          <div className="card portfolio-card">
            <div className="portfolio-header">
              <div>
                <div className="portfolio-value-label">Portfolio Value</div>
                <div className="portfolio-value">$2,842,018.54</div>
                <div className={`portfolio-change ${btcChange >= 0 ? 'up' : 'down'}`}>
                  {btcChange >= 0 ? '▲' : '▼'} +6.2% this {period === '1D' ? 'day' : period === '1W' ? 'week' : 'month'}
                </div>
              </div>
              <div className="period-tabs">
                {PERIODS.map(p => (
                  <button
                    key={p}
                    className={`period-tab ${period === p ? 'active' : ''}`}
                    onClick={() => setPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-area">
              <PortfolioChart period={period} />
            </div>
          </div>

          {/* Market Overview Table */}
          <MarketTable />

          {/* Bitnob Payout Routes */}
          <CurrencyPanel highlightCountryCode={user?.country_code} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="dashboard-side">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Signed-in Profile</span>
              <span className="text-mono text-sm text-muted" style={{ fontSize: 12 }}>Active user</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  <CountryFlag src={user?.flagUrl} alt={user?.country || 'Country flag'} fallbackText={user?.flag || user?.country_code || '—'} size={30} className="dashboard-flag" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.name || 'Guest'}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--on-surface-variant)' }}>
                    {user?.country_code || '--'} · {user?.country || 'Unknown'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{user?.email}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Market Summary</span>
              {market && <span className="text-mono text-sm text-muted" style={{ fontSize: 12 }}>Source: {market.source}</span>}
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>${btcPrice ? btcPrice.toLocaleString() : '—'}</div>
                  <div style={{ color: btcChange >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: 12 }}>
                    {btcChange >= 0 ? '▲' : '▼'} {btcChange?.toFixed(2)}% (24h)
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Block Height</div>
                  <div style={{ fontWeight: 600 }}>{mempool?.blockHeight?.toLocaleString() || '—'}</div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Network Fees (sat/vB)</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <div style={{ flex: 1, padding: 8, background: 'var(--surface-container)', borderRadius: 8 }}>
                    <div style={{ fontSize: 12 }}>Fast</div>
                    <div style={{ fontWeight: 600 }}>{mempool?.recommendedFees?.fastestFee ?? '—'}</div>
                  </div>
                  <div style={{ flex: 1, padding: 8, background: 'var(--surface-container)', borderRadius: 8 }}>
                    <div style={{ fontSize: 12 }}>Medium</div>
                    <div style={{ fontWeight: 600 }}>{mempool?.recommendedFees?.halfHourFee ?? '—'}</div>
                  </div>
                  <div style={{ flex: 1, padding: 8, background: 'var(--surface-container)', borderRadius: 8 }}>
                    <div style={{ fontSize: 12 }}>Economy</div>
                    <div style={{ fontWeight: 600 }}>{mempool?.recommendedFees?.hourFee ?? '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
