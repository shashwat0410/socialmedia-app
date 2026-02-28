import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Icons } from '../common';

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Feed', icon: <Icons.Home /> },
    { to: '/explore', label: 'Explore', icon: <Icons.Compass /> },
    { to: user ? `/profile/${user.userName}` : '/login', label: 'Profile', icon: <Icons.User /> },
    { to: '/settings', label: 'Settings', icon: <Icons.Settings /> },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-text">Lumin<span>ary</span></div>
          <div style={{ fontSize: 12, color: 'var(--gray-2)', marginTop: 3 }}>Share your world</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Navigation</div>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              end={l.to === '/'}
            >
              {l.icon}
              <span>{l.label}</span>
            </NavLink>
          ))}

          <div className="nav-label" style={{ marginTop: 20 }}>Account</div>
          <button className="nav-link" onClick={handleLogout}>
            <Icons.LogOut />
            <span>Sign out</span>
          </button>
        </nav>

        {user && (
          <div className="sidebar-user">
            <NavLink to={`/profile/${user.userName}`} className="user-chip" style={{ textDecoration: 'none' }}>
              <Avatar user={user} size="sm" />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-2)' }}>@{user.userName}</div>
              </div>
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}

export function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="topbar">
          <button className="btn-icon" style={{ display: 'none' }} id="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Icons.Menu />
          </button>
          <style>{`@media(max-width:768px){#menu-btn{display:flex!important}}`}</style>

          <form className="search-bar" onSubmit={handleSearch}>
            <Icons.Search className="input-icon" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--gray-2)', pointerEvents: 'none' }} />
            <input
              className="search-input"
              placeholder="Search people & posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-icon" style={{ position: 'relative' }}>
              <Icons.Bell />
            </button>
            {user && (
              <NavLink to={`/profile/${user.userName}`}>
                <Avatar user={user} size="sm" />
              </NavLink>
            )}
          </div>
        </header>
        <div className="page-enter">{children}</div>
      </div>
    </div>
  );
}
