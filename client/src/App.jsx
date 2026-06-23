import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './components/Dashboard'
import Exchange from './components/Exchange'
import './index.css'

function ComingSoon({ title }) {
  return (
    <div className="page-area" style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <div style={{ textAlign: 'center', padding: 64 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔭</div>
        <div className="page-title" style={{ marginBottom: 8 }}>{title}</div>
        <div className="page-subtitle">This section is coming soon.</div>
      </div>
    </div>
  )
}

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [currentUser, setCurrentUser] = useState(null)
  const [countries, setCountries] = useState([])
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [authError, setAuthError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', country_code: 'NG' })

  useEffect(() => {
    const loadBootData = async () => {
      try {
        const storedEmail = localStorage.getItem('nexus.authEmail')
        const countriesRes = await fetch('/api/countries')
        const countriesJson = await countriesRes.json()
        setCountries(Array.isArray(countriesJson) ? countriesJson : [])

        if (storedEmail) {
          const userRes = await fetch(`/api/auth/user/${encodeURIComponent(storedEmail)}`)
          if (userRes.ok) {
            const userJson = await userRes.json()
            setCurrentUser(userJson.user)
            setForm((prev) => ({ ...prev, country_code: userJson.user?.country_code || 'NG' }))
            return
          }
          localStorage.removeItem('nexus.authEmail')
        }
      } catch (err) {
        console.error('Failed loading startup data:', err)
      } finally {
        setLoadingAuth(false)
      }
    }

    loadBootData()
  }, [])

  const countryMap = useMemo(() => {
    const map = {}
    for (const country of countries) map[country.code] = country
    return map
  }, [countries])

  const enrichedCurrentUser = useMemo(() => {
    if (!currentUser) return null
    const countryMeta = countryMap[currentUser.country_code] || {}
    return {
      ...currentUser,
      ...countryMeta,
      flag: countryMeta.flag || currentUser.flag || '🏳️',
      flagUrl: countryMeta.flagUrl || currentUser.flagUrl || '',
      country: countryMeta.name || currentUser.country || 'Unknown'
    }
  }, [currentUser, countryMap])

  const signedInCountry = enrichedCurrentUser || {
    flag: '🏳️',
    code: currentUser?.country_code || '--',
    name: currentUser?.country || 'Unknown'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')

    const email = form.email.trim().toLowerCase()
    const password = form.password
    const payload = authMode === 'signup'
      ? { name: form.name.trim(), email, password, country_code: form.country_code }
      : { email, password }

    try {
      setSubmitting(true)
      const endpoint = authMode === 'signup' ? '/api/auth/register' : '/api/auth/login'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json?.error || 'Authentication failed')

      localStorage.setItem('nexus.authEmail', json.user.email)
      setCurrentUser(json.user)
      setActiveView('dashboard')
      setForm((prev) => ({ ...prev, password: '' }))
    } catch (err) {
      setAuthError(err.message || 'Could not sign in')
    } finally {
      setSubmitting(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem('nexus.authEmail')
    setCurrentUser(null)
    setAuthMode('signin')
    setActiveView('dashboard')
    setForm({ name: '', email: '', password: '', country_code: 'NG' })
  }

  if (loadingAuth) {
    return (
      <div className="profile-gate-wrap">
        <div className="profile-gate-card">
          <div className="page-title">Loading Dashboard</div>
          <div className="page-subtitle">Preparing your account, countries, and market data...</div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="profile-gate-wrap">
        <form className="profile-gate-card auth-card" onSubmit={handleSubmit}>
          <div className="page-title" style={{ marginBottom: 6 }}>Nexus Financial Intelligence</div>
          <div className="page-subtitle" style={{ marginBottom: 20 }}>
            Sign in or create an account to load your country flag, crypto data, and exchange rates.
          </div>

          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${authMode === 'signin' ? 'active' : ''}`} onClick={() => setAuthMode('signin')}>Sign In</button>
            <button type="button" className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`} onClick={() => setAuthMode('signup')}>Sign Up</button>
          </div>

          {authError && <div className="auth-error">{authError}</div>}

          {authMode === 'signup' && (
            <>
              <label className="profile-label" htmlFor="name">Name</label>
              <input
                id="name"
                className="profile-input"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. David"
                required
              />
            </>
          )}

          <label className="profile-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="profile-input"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com"
            required
          />

          <label className="profile-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="profile-input"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
            required
          />

          {authMode === 'signup' && (
            <>
              <label className="profile-label" htmlFor="country">Country</label>
              <select
                id="country"
                className="profile-input"
                value={form.country_code}
                onChange={(e) => setForm((prev) => ({ ...prev, country_code: e.target.value }))}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </>
          )}

          <button type="submit" className="profile-btn" disabled={submitting}>
            {submitting ? 'Working...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>

          <div className="auth-footnote">
            Data is stored in SQLite locally on your machine. Your country selection is saved with your account.
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar active={activeView} onNavigate={setActiveView} onSignOut={signOut} />
      <div className="main-content">
        <Topbar
          activeView={activeView}
          userName={enrichedCurrentUser?.name}
          userCountryCode={enrichedCurrentUser?.country_code}
          userCountryFlag={signedInCountry.flag}
          userCountryFlagUrl={enrichedCurrentUser?.flagUrl}
        />
        {activeView === 'dashboard' && <Dashboard user={enrichedCurrentUser} />}
        {activeView === 'markets' && <ComingSoon title="Markets" />}
        {activeView === 'exchange' && <Exchange />}
        {activeView === 'blockchain' && <ComingSoon title="Blockchain Explorer" />}
        {activeView === 'transactions' && <ComingSoon title="Transactions" />}
      </div>
    </div>
  )
}
