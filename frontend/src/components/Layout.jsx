import { useContext } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <FolderKanban size={28} color="var(--accent-color)" />
          <span>ProjectFlow</span>
        </div>
        
        <nav style={{ flex: 1 }}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            to="/projects" 
            className={`nav-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}
          >
            <FolderKanban size={20} />
            Projects
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
            <div style={{ fontWeight: 600 }}>{user.full_name}</div>
            <div style={{ color: 'var(--text-muted)' }}>{user.role}</div>
          </div>
          <button onClick={logout} className="nav-link" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-color)' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
