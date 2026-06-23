const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: '▦' },
  { id: 'markets',       label: 'Markets',        icon: '⟋' },
  { id: 'exchange',      label: 'Exchange',       icon: '⇄' },
  { id: 'blockchain',    label: 'Blockchain',     icon: '⬡' },
  { id: 'transactions',  label: 'Transactions',   icon: '≡' },
]

const FOOTER_ITEMS = [
  { id: 'support', label: 'Support', icon: '?' },
  { id: 'signout', label: 'Sign Out', icon: '↩' },
]

export default function Sidebar({ active, onNavigate, onSignOut }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-label">Nexus</div>
        <div className="brand-name">INSTITUTIONAL</div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {FOOTER_ITEMS.map(item => (
          <button
            key={item.id}
            className="nav-item"
            onClick={() => (item.id === 'signout' ? onSignOut?.() : onNavigate(item.id))}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}
