import { useFetch } from '../hooks/useFetch'

const PERIODS = ['1D', '1W', '1M']

// Generate SVG sparkline path from an array of values
function sparklinePath(values, width = 64, height = 28) {
  if (!values || values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  })
  return `M ${pts.join(' L ')}`
}

// Format large numbers
function fmtPrice(n) {
  if (!n && n !== 0) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtMcap(n) {
  if (!n) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`
  return `$${n.toFixed(0)}`
}

// Fake sparkline seeds per asset (visual only — not real historical)
const SPARKLINES = {
  bitcoin:  [60000,62000,61000,64000,63000,67000,65000,68000,67250],
  ethereum: [3200,3350,3100,3300,3400,3480,3420,3490,3480],
  tether:   [1,1,1,1,1,1,1,1,1],
  usdc:     [1,1,1,1,1,1,1,1,1],
}

const ASSET_CONFIGS = [
  { key: 'bitcoin', label: 'Bitcoin', pair: 'BTC/USD', icon: 'BTC', cls: 'btc' },
  { key: 'ethereum', label: 'Ethereum', pair: 'ETH/USD', icon: 'ETH', cls: 'eth' },
  { key: 'tether', label: 'Tether', pair: 'USDT/USD', icon: 'USDT', cls: 'usdt' },
  { key: 'usdc', label: 'USD Coin', pair: 'USDC/USD', icon: 'USDC', cls: 'usdc' },
]

function SkeletonRow() {
  return (
    <tr>
      <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div>
          <div className="skeleton" style={{ width: 70, height: 12, marginBottom: 4 }} />
          <div className="skeleton" style={{ width: 50, height: 10 }} />
        </div>
      </div></td>
      <td><div className="skeleton" style={{ width: 80, height: 12, marginLeft: 'auto' }} /></td>
      <td><div className="skeleton" style={{ width: 50, height: 12, marginLeft: 'auto' }} /></td>
      <td><div className="skeleton" style={{ width: 55, height: 12, marginLeft: 'auto' }} /></td>
      <td><div className="skeleton" style={{ width: 64, height: 28, marginLeft: 'auto' }} /></td>
    </tr>
  )
}

export default function MarketTable() {
  const { data, loading, error, isStale } = useFetch('/api/market', { interval: 30000 })

  return (
    <div className="card market-table-card">
      <div className="market-header">
        <span className="card-title">Market Overview</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isStale && <span className="offline-badge">Cached Data</span>}
          <div className="live-indicator">
            <span className="live-dot" />
            Live Feeds
          </div>
        </div>
      </div>

      <table className="market-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Price</th>
            <th>24h Change</th>
            <th>Market Cap</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <>{[0,1,2,3].map(i => <SkeletonRow key={i} />)}</>
          ) : error ? (
            <tr><td colSpan={5}>
              <div className="error-state">
                <span className="error-icon">⚡</span>
                <span className="error-text">Market data unavailable</span>
              </div>
            </td></tr>
          ) : (
            ASSET_CONFIGS.map(cfg => {
              const asset = data?.[cfg.key]
              if (!asset) return null
              const changeUp = asset.change24h >= 0
              const sparkPts = SPARKLINES[cfg.key]

              return (
                <tr key={cfg.key}>
                  <td>
                    <div className="asset-cell">
                      <div className={`asset-icon ${cfg.cls}`}>{cfg.icon}</div>
                      <div>
                        <div className="asset-name">{cfg.label}</div>
                        <div className="asset-pair">{cfg.pair}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="price-cell">{fmtPrice(asset.price)}</span></td>
                  <td>
                    <span className={`change-cell ${changeUp ? 'up' : 'down'}`}>
                      {changeUp ? '+' : ''}{asset.change24h?.toFixed(2)}%
                    </span>
                  </td>
                  <td><span className="mcap-cell">—</span></td>
                  <td>
                    <svg className="sparkline" viewBox={`0 0 64 28`}>
                      <path
                        d={sparklinePath(sparkPts)}
                        fill="none"
                        stroke={changeUp ? 'var(--success)' : 'var(--danger)'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
