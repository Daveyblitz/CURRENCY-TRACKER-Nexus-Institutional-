import { useFetch } from '../hooks/useFetch'

const MOCK_ACTIVITIES = [
  {
    id: 1, type: 'confirmed',
    title: 'Transfer Confirmed',
    desc: '0.52 ETH sent to 0xA4...e12',
    time: '2s ago'
  },
  {
    id: 2, type: 'confirmed',
    title: 'Smart Contract Executed',
    desc: 'Liquidity provided to USDC/WETH pool',
    time: '15s ago'
  },
  {
    id: 3, type: 'pending',
    title: 'Stake Request',
    desc: '0.10 BTC pending confirmation',
    time: '1m ago'
  },
  {
    id: 4, type: 'confirmed',
    title: 'Block #848,512 Mined',
    desc: '3,412 transactions included',
    time: '2m ago'
  },
]

export default function WalletAndActivity({ marketData }) {
  const { data: mempool, loading: mLoading } = useFetch('/api/mempool', { interval: 60000 })

  // Derive BTC value from market data
  const btcPrice = marketData?.bitcoin?.price || 67250

  return (
    <>
      {/* ---- NEXUS Wallet Card ---- */}
      <div className="wallet-card">
        <div className="wallet-header">
          <span className="wallet-label">Nexus Wallet</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.7 }}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div className="wallet-body">
          <div className="wallet-crypto-amount">4.821 ETH</div>
          <div className="wallet-fiat-amount">≈ ${(4.821 * (marketData?.ethereum?.price || 3480)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
          <div className="wallet-actions">
            <button className="wallet-btn primary">Deposit</button>
            <button className="wallet-btn outline">Withdraw</button>
          </div>
        </div>
        <div className="staked-row">
          <span className="staked-label">Staked Assets</span>
          <span className="staked-value">$412,000</span>
        </div>
      </div>

      {/* ---- Blockchain Activity ---- */}
      <div className="card blockchain-card">
        <div className="card-header">
          <span className="card-title">Blockchain Activity</span>
          {mempool && (
            <span className={`congestion-badge ${mempool.congestion}`}>
              {mempool.congestion} Traffic
            </span>
          )}
        </div>
        <div className="activity-list">
          {MOCK_ACTIVITIES.map(act => (
            <div key={act.id} className="activity-item">
              <div className="activity-title">{act.title}</div>
              <div className="activity-desc">{act.desc}</div>
              <div className="activity-meta">
                <span className="activity-time">{act.time}</span>
                <span className={`activity-type ${act.type}`}>{act.type}</span>
              </div>
            </div>
          ))}
        </div>
        <a href="#" className="view-all-link">View All Explorer Activity →</a>
      </div>

      {/* ---- Bitcoin Network Fees ---- */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">BTC Network Fees</span>
          {mempool && (
            <span className="text-mono text-sm text-muted">Block #{mempool.blockHeight?.toLocaleString()}</span>
          )}
        </div>
        <div className="card-body">
          {mLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0,1,2].map(i => (
                <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8 }} />
              ))}
            </div>
          ) : mempool ? (
            <>
              <div className="fee-row">
                <div>
                  <div className="fee-label">⚡ Fast</div>
                  <div className="fee-sublabel">~10 minutes</div>
                </div>
                <div className="fee-value">{mempool.recommendedFees?.fastestFee} sat/vB</div>
              </div>
              <div className="fee-row">
                <div>
                  <div className="fee-label">⏳ Medium</div>
                  <div className="fee-sublabel">~30 minutes</div>
                </div>
                <div className="fee-value">{mempool.recommendedFees?.halfHourFee} sat/vB</div>
              </div>
              <div className="fee-row">
                <div>
                  <div className="fee-label">🐢 Economy</div>
                  <div className="fee-sublabel">~1 hour+</div>
                </div>
                <div className="fee-value">{mempool.recommendedFees?.hourFee} sat/vB</div>
              </div>
            </>
          ) : (
            <div className="error-state">
              <span className="error-icon">⚡</span>
              <span className="error-text">Network data unavailable</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
