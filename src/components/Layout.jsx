import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, CreditCard, ShoppingCart, LogOut, PanelLeftClose, PanelLeftOpen, Menu, FileBarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_STORAGE = 'fit-sidebar-collapsed';

const navItems = [
  { to: '/', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', end: false, icon: Users, label: 'Customers' },
  { to: '/usuarios', end: false, icon: UserCog, label: 'Usuarios' },
  { to: '/membresias', end: false, icon: CreditCard, label: 'Membresías' },
  { to: '/ventas', end: false, icon: ShoppingCart, label: 'Ventas' },
  { to: '/informes', end: false, icon: FileBarChart, label: 'Informes' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const m = window.matchMedia('(max-width: 768px)').matches;
      setIsMobile(m);
      if (m) {
        setCollapsed(true);
      } else {
        try {
          const stored = localStorage.getItem(SIDEBAR_STORAGE);
          if (stored !== null) setCollapsed(stored === 'true');
        } catch (_) {}
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => {
        const next = !c;
        try {
          localStorage.setItem(SIDEBAR_STORAGE, String(next));
        } catch (_) {}
        return next;
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileSidebar = () => setMobileOpen(false);
  const sidebarCollapsed = isMobile ? !mobileOpen : collapsed;

  const sidebarContent = (
    <>
      <div className="sidebar-logo">
        <h2 className="sidebar-logo-text">
          <span>FIT</span> <span>HOUSE</span>
        </h2>
        <span className="sidebar-logo-short" aria-hidden>F</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={isMobile ? closeMobileSidebar : undefined}
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon size={20} strokeWidth={2} />
            <span className="sidebar-nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-footer">
          <p className="sidebar-user-email">{user?.email}</p>
          <button type="button" className="secondary sidebar-logout" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={18} />
            <span className="sidebar-logout-label">Salir</span>
          </button>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expandir menú' : 'Recoger menú'}
          aria-label={sidebarCollapsed ? 'Expandir menú' : 'Recoger menú'}
        >
          {isMobile ? (
            mobileOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />
          ) : sidebarCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {isMobile && mobileOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileSidebar} aria-hidden />
      )}
      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isMobile ? 'sidebar-mobile' : ''} ${isMobile && mobileOpen ? 'sidebar-mobile-open' : ''}`}
      >
        {sidebarContent}
      </aside>
      <main className="main-content">
        {isMobile && (
          <button
            type="button"
            className="main-content-menu-btn"
            onClick={toggleSidebar}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
}
