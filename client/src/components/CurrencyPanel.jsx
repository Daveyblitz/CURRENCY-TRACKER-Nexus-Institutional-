import { useEffect, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import CountryFlag from './CountryFlag'

const FLAG_MAP = { NGN: '🇳🇬', KES: '🇰🇪', GHS: '🇬🇭', RWF: '🇷🇼', UGX: '🇺🇬', EUR: '🇪🇺', GBP: '🇬🇧' }
const LABEL_MAP = { NGN: 'Naira', KES: 'Shilling', GHS: 'Cedi', RWF: 'Franc', UGX: 'Shilling', EUR: 'Euro', GBP: 'Pound' }

function fmtRate(code, value) {
  if (!value) return '—'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

export default function CurrencyPanel({ highlightCountryCode }) {
  const { data: rates, loading: rLoading, isStale: rStale } = useFetch('/api/rates', { interval: 300000 })
  const { data: countries, loading: cLoading } = useFetch('/api/countries', { interval: 3600000 })
  const [activeCountry, setActiveCountry] = useState(highlightCountryCode || 'NG')
  const { data: bitnobRules, loading: bLoading } = useFetch(`/api/bitnob/payout-rules/${activeCountry}`, { interval: 600000 })

  useEffect(() => {
    if (highlightCountryCode) {
      setActiveCountry(highlightCountryCode)
    }
  }, [highlightCountryCode])

  const rateEntries = rates?.rates
    ? Object.entries(rates.rates).filter(([k]) => Object.keys(FLAG_MAP).includes(k))
    : []

  return (
    <>
      {/* ---- Currency Exchange Rates ---- */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Exchange Rates (USD basis)</span>
          {rStale && <span className="offline-badge">Cached</span>}
          {rates?.updated && (
            <span className="text-mono text-sm text-muted" style={{ fontSize: 10 }}>
              Updated: {new Date(rates.updated).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="card-body">
          {rLoading ? (
            <div className="rates-grid">
              {[0,1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton" style={{ height: 64, borderRadius: 8 }} />
              ))}
            </div>
          ) : (
            <div className="rates-grid">
              {rateEntries.map(([code, value]) => (
                <div key={code} className="rate-chip">
                  <div className="rate-flag-pair">
                    <span className="rate-flag">{FLAG_MAP[code]}</span>
                    <span className="rate-code">{code}</span>
                  </div>
                  <div className="rate-value">{fmtRate(code, value)}</div>
                  <div className="rate-label">{LABEL_MAP[code]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- Supported Countries ---- */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Supported Countries</span>
        </div>

        <div className="card-body">
          {cLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
            </div>
          ) : Array.isArray(countries) && countries.length > 0 ? (
            <div className="capability-grid">
              {countries.map((country) => (
                <div
                  key={country.code}
                  className="capability-row"
                  style={{
                    justifyContent: 'space-between',
                    border: country.code === highlightCountryCode ? '1px solid var(--primary-bright)' : '1px solid var(--outline-variant)',
                    borderRadius: 10,
                    padding: 10,
                    background: country.code === highlightCountryCode ? 'var(--primary-container)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CountryFlag src={country.flagUrl} alt={country.name} fallbackText={country.flag || country.code} size={22} className="country-flag-row" />
                    <div>
                      <div className="capability-value" style={{ fontWeight: 700 }}>{country.name}</div>
                      <div className="capability-label" style={{ marginBottom: 0 }}>{country.code} • {country.currency || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="capability-label" style={{ marginBottom: 0 }}>Calling code</div>
                    <div className="capability-value">{country.dialCode || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="error-state">
              <span className="error-icon">🌍</span>
              <span className="error-text">Country data unavailable</span>
            </div>
          )}
        </div>
      </div>

      {/* ---- Bitnob payout routes ---- */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Bitnob Payout Routes</span>
          {bitnobRules?.mode && (
            <span className="offline-badge" style={{ background: 'var(--surface-container)', color: 'var(--on-surface-variant)' }}>
              {bitnobRules.mode}
            </span>
          )}
        </div>

        <div className="card-body">
          <div className="country-selector" style={{ marginBottom: 16 }}>
            {(Array.isArray(countries) ? countries : []).map((country) => (
              <button
                key={country.code}
                type="button"
                className={`country-btn ${activeCountry === country.code ? 'active' : ''}`}
                onClick={() => setActiveCountry(country.code)}
              >
                {country.flag || '🏳️'} {country.code}
              </button>
            ))}
          </div>

          {bLoading ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
            </div>
          ) : bitnobRules?.capability ? (
            <div className="capability-grid">
              <div className="capability-row">
                <div className="capability-icon">📍</div>
                <div>
                  <div className="capability-label">Country</div>
                  <div className="capability-value">{bitnobRules.capability.country}</div>
                </div>
              </div>
              <div className="capability-row">
                <div className="capability-icon">📡</div>
                <div>
                  <div className="capability-label">Channels</div>
                  <div>
                    {bitnobRules.capability.channels?.map((channel) => (
                      <span key={channel} className="channel-tag">{channel}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="capability-row">
                <div className="capability-icon">💸</div>
                <div>
                  <div className="capability-label">Service Fee</div>
                  <div className="capability-value">{bitnobRules.capability.fee}</div>
                </div>
              </div>
              <div className="capability-row">
                <div className="capability-icon">📊</div>
                <div>
                  <div className="capability-label">Limits</div>
                  <div className="capability-value">
                    {bitnobRules.capability.limits?.min} — {bitnobRules.capability.limits?.max}
                  </div>
                </div>
              </div>
              <div className="capability-row">
                <div className="capability-icon">⚡</div>
                <div>
                  <div className="capability-label">Settlement</div>
                  <div className="capability-value">{bitnobRules.capability.settlement}</div>
                </div>
              </div>
              {bitnobRules.capability.description && (
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', lineHeight: 1.6, paddingTop: 4, borderTop: '1px solid var(--outline-variant)' }}>
                  {bitnobRules.capability.description}
                </p>
              )}
            </div>
          ) : (
            <div className="error-state">
              <span className="error-icon">🌍</span>
              <span className="error-text">No Bitnob payout data for this region</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
