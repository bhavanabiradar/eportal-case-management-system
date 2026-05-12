import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['admin', 'judge'] },
  { to: '/cases',     icon: '⚖️', label: 'Cases',     roles: ['admin', 'judge', 'lawyer', 'litigant'] },
  { to: '/hearings',  icon: '🗓️', label: 'Hearings',  roles: ['admin', 'judge', 'lawyer', 'litigant'] },
  { to: '/users',     icon: '👥', label: 'Users',     roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const titles = {
    '/dashboard': 'Dashboard',
    '/cases': 'Case Management',
    '/hearings': 'Hearing Schedule',
    '/users': 'User Management',
  };
  const title = Object.entries(titles).find(([k]) => location.pathname.startsWith(k))?.[1] || 'e-Portal';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚖️</div>
          <div>
            <div className="logo-text">e-Portal</div>
            <div className="logo-sub">Case Management</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Navigation</div>
          {NAV.filter(n => n.roles.includes(user?.role)).map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <span className="topbar-spacer" />
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
