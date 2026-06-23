import { useFetch } from '../hooks/useFetch'
import CurrencyPanel from './CurrencyPanel'

export default function Exchange() {
  return (
    <div className="page-area">
      <div className="page-header">
        <div>
          <div className="page-title">Exchange</div>
          <div className="page-subtitle">Currency Rates & Regional Payout Routes</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <CurrencyPanel />
      </div>
    </div>
  )
}
