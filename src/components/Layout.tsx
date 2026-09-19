import { NavLink, Outlet } from 'react-router-dom'

const links = [
  ['/orbit', '🌐 ORBIT Console'],
  ['/ops', '📊 Operations'],
  ['/incidents', '🚨 Incidents'],
  ['/services', '⚙️ Services'],
  ['/settings', '🔧 Settings'],
] as const

export function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" style={{ background: '#00f0ff', color: '#000', fontWeight: 800 }}>
          ORBIT
        </div>
        <strong>ORBIT Global Intelligence System</strong>
        <div className="top-actions">
          <span className="notification">
            ● <b>3</b>
          </span>
          <span>Alex Morgan ▾</span>
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <p className="eyebrow">NAVIGATION</p>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/orbit'}>
              {label}
            </NavLink>
          ))}
          <div className="sidebar-footer">
            <span className="status-dot" /> Live Intelligence Feed
          </div>
        </aside>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
