import { useState } from 'react'
import CountryFlag from './CountryFlag'

const TOP_LINKS = ['Dashboard', 'Markets', 'Exchange']

export default function Topbar({ activeView, userName, userCountryCode, userCountryFlag, userCountryFlagUrl }) {
  const [query, setQuery] = useState('')
  const avatarText = (userName || 'GD').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="topbar">
      {/* Top nav links */}
      <nav className="topbar-nav">
        {TOP_LINKS.map(link => (
          <span
            key={link}
            className={`topbar-link ${activeView === link.toLowerCase() ? 'active' : ''}`}
          >
            {link}
          </span>
        ))}
      </nav>

      <div className="topbar-spacer" />

      {/* Search */}
      <div className="topbar-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--outline)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search markets..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        <div className="user-country-chip" title="Your country profile">
          <CountryFlag src={userCountryFlagUrl} alt={userCountryCode || 'Country flag'} fallbackText={userCountryFlag || userCountryCode || '--'} size={20} className="country-flag-chip" />
          <span>{userCountryCode || '--'}</span>
        </div>
        {/* Bell */}
        <button className="icon-btn" title="Notifications" aria-label="Notifications">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        {/* Settings */}
        <button className="icon-btn" title="Settings" aria-label="Settings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0"/>
          </svg>
        </button>
        {/* Avatar */}
        <div className="avatar" title={userName || 'Profile'} role="img" aria-label="User profile">{avatarText}</div>
      </div>
    </header>
  )
}
