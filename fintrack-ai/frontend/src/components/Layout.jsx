import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Overview', end: true, glyph: '◈' },
  { to: '/transactions', label: 'Ledger', glyph: '☰' },
  { to: '/chat', label: 'Ask FinBot', glyph: '✦' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>F</div>
          <div>
            <div style={styles.brandName}>FinTrack</div>
            <div style={styles.brandSub}>AI for students</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <span style={styles.navGlyph}>{item.glyph}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userRow}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--paper)',
  },
  sidebar: {
    width: '240px',
    flexShrink: 0,
    background: 'var(--ink-800)',
    color: 'var(--paper)',
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 18px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px 28px',
    borderBottom: '1px solid var(--ink-600)',
    marginBottom: '20px',
  },
  brandMark: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--emerald)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '18px',
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontSize: '17px',
    fontWeight: 600,
    letterSpacing: '0.2px',
  },
  brandSub: {
    fontSize: '11px',
    color: '#9AA5B8',
    letterSpacing: '0.4px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: '8px',
    color: '#C7CEDB',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background 0.15s ease, color 0.15s ease',
  },
  navLinkActive: {
    background: 'var(--ink-600)',
    color: '#fff',
  },
  navGlyph: {
    fontSize: '14px',
    width: '18px',
    textAlign: 'center',
    color: 'var(--gold)',
  },
  sidebarFooter: {
    borderTop: '1px solid var(--ink-600)',
    paddingTop: '16px',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--gold)',
    color: 'var(--ink-900)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
    flexShrink: 0,
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '11px',
    color: '#9AA5B8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    width: '100%',
    padding: '9px',
    background: 'transparent',
    border: '1px solid var(--ink-600)',
    borderRadius: '8px',
    color: '#C7CEDB',
    fontSize: '13px',
    fontWeight: 500,
  },
  main: {
    flex: 1,
    padding: '36px 44px',
    maxWidth: '1100px',
  },
};
